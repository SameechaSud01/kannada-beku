# Claude Code Spec — Apple & Google Sign-In (Kannada Beku)

## Goal
Let a user create an account and sign in with **Sign in with Apple** and
**Sign in with Google**, in addition to the existing email/password flow.
OAuth users land in exactly the same place email users do: the
trigger-created `public.users` row, then onboarding (because
`onboarding_completed_at` starts null), then `/(tabs)`. After this lands,
provider choice is purely an identity detail — every downstream system
(onboarding persistence, AppGate routing, cross-account reset) behaves
identically regardless of how the user authenticated.

## Context
- App: Kannada Beku (Expo / React Native, Zustand + AsyncStorage, Supabase).
- Existing auth is Supabase email/password — see
  [spec_auth_onboarding.md](spec_auth_onboarding.md), which this spec extends.
  That spec listed OAuth as out of scope; **this spec supersedes that
  exclusion** for Apple and Google only.
- Supabase client is configured in [services/api/supabase.ts](../../services/api/supabase.ts)
  with `detectSessionInUrl: false` and a chunked SecureStore adapter. Sessions
  persist and auto-refresh.
- The single auth entry screen is [app/(auth)/login.tsx](../../app/(auth)/login.tsx),
  a segmented Log in / Sign up toggle over one email + password form.
- `useAuthStore.signOut()` ([stores/useAuthStore.ts](../../stores/useAuthStore.ts))
  is the sole sign-out path; it preserves persisted state (cross-account wipe
  is handled by AppGate's bind effect, not signOut).
- AppGate ([app/_layout.tsx](../../app/_layout.tsx)) already subscribes to
  `supabase.auth.onAuthStateChange`, calls `fetchUserRow` + `hydrateFromUserRow`,
  and runs `resetForUser(currentUserId)` on user bind. **None of this needs to
  change** — an OAuth session fires `onAuthStateChange` the same as a password
  session.
- The `handle_new_user` Postgres trigger (spec_auth_onboarding Migration 2)
  inserts the matching `public.users` row on **every** `auth.users` insert,
  OAuth included. It currently sets only `id`, `email`, `current_streak` — not
  `name` / `avatar_url`. See [OPEN-1].

## Decisions (LOCKED — confirmed by owner 2026-06-03)
- **[LOCKED-1] Provider profile data.** Do **not** backfill `name` /
  `avatar_url` from provider claims. OAuth users have null name like email
  users; onboarding/profile own those fields. Trigger stays unchanged.
- **[LOCKED-2] Account collision / linking.** Rely on Supabase's **default**
  automatic identity linking when emails match and are confirmed. No custom
  linking UI. The exact dashboard setting is documented in the provider-setup
  section.
- **[LOCKED-3] Android scope.** Google sign-in **includes Android**, keyed to
  the EAS + debug SHA-1 fingerprints. Apple remains iOS-only.
- **[LOCKED-4] Flow style.** **Native ID-token flow** —
  `expo-apple-authentication` + `@react-native-google-signin/google-signin`
  return a token handed to `supabase.auth.signInWithIdToken({ provider, token })`.
  No web redirect.

## Architecture rules (read first — non-negotiables)
1. **OAuth is an alternate `signIn`, nothing more.** Apple/Google sign-in must
   produce a Supabase session via `signInWithIdToken` and then do *nothing
   else*. All routing, hydration, onboarding, and reset stay owned by AppGate
   and the existing stores. No OAuth-specific routing branches.
2. **No new auth state.** Do not add provider fields to `useAuthStore`. The
   `Session.user` already carries `app_metadata.provider`. If a screen ever
   needs to know the provider, read it from there — do not cache it.
3. **The DB contract is unchanged.** No new columns, no new trigger, no client
   inserts into `public.users`. The existing trigger handles OAuth signups. The
   only possible DB change is a dashboard toggle for identity linking
   ([OPEN-2]), not schema.
4. **Buttons live only on the auth screen.** OAuth entry points are two buttons
   on `login.tsx`. They apply to both Log in and Sign up modes (OAuth doesn't
   distinguish — there is no separate "sign up with Google"). No OAuth UI
   anywhere else.
5. **Native build only.** Both providers require config plugins and custom
   native code; the app can no longer run in Expo Go. This is an accepted,
   explicit consequence — call it out in the README/onboarding for devs.
6. **App Store compliance.** Apple guideline 4.8 requires Sign in with Apple to
   be offered on iOS whenever a third-party social login (Google) is offered.
   Therefore on iOS both buttons ship together; shipping Google without Apple
   on iOS is not an option.

## Provider / dashboard setup (no code, but blocks the code)

### Supabase dashboard
- Auth → Providers → **Apple**: enable; supply Services ID, Team ID, Key ID,
  and the `.p8` private key (Apple Developer portal).
- Auth → Providers → **Google**: enable; supply the **Web** client ID + secret
  from Google Cloud Console. (The native iOS/Android client IDs are used by the
  native SDK, not pasted here, but Google requires the Web client be listed as
  an authorized audience.)
- Auth → confirm the identity-linking setting per [OPEN-2].

### Apple Developer portal
- App ID `com.samsud01.kannadabeku` → enable the **Sign in with Apple**
  capability.
- Create a Services ID + Sign in with Apple key (`.p8`) for the Supabase
  provider config above.

### Google Cloud Console (OAuth consent + credentials)
- iOS OAuth client ID, bundle `com.samsud01.kannadabeku`.
- Android OAuth client ID (if [OPEN-3] = include Android), package
  `com.samsud01.kannadabeku` + SHA-1 of both the EAS and local debug keystores.
- Web OAuth client ID (for Supabase + as the `webClientId` the native SDK needs
  to mint an ID token).

## App changes

### Dependencies (`package.json`)
- `expo-apple-authentication` (Apple, iOS).
- `@react-native-google-signin/google-signin` (Google, iOS + Android).
- Both are config-plugin packages; after install they require a native rebuild.

### `app.json`
- Add to `plugins`:
  - `"expo-apple-authentication"`
  - `["@react-native-google-signin/google-signin", { "iosUrlScheme": "<reversed iOS client ID>" }]`
- iOS: add the `usesAppleSignIn: true` entitlement under `ios`
  (the apple-authentication plugin sets the capability, but confirm the
  entitlement is present in the prebuild output).
- Do not edit `ios/` or `android/` by hand — let the config plugins manage
  native files via prebuild. (Per CLAUDE.md "never modify ios/android without
  being asked".)

### `.env` / `.env.example`
- Add the Google client IDs as `EXPO_PUBLIC_` vars consumed at runtime by the
  native SDK config:
  - `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
  - `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
  - `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` (if Android in scope)
- These are OAuth **client IDs**, not secrets — safe as `EXPO_PUBLIC_`. The
  Google **secret** lives only in the Supabase dashboard, never in the app.
- Mirror the keys (with placeholder values) into `.env.example`.

### `services/api/auth-oauth.ts` (new file)
The only place that talks to the provider SDKs + `signInWithIdToken`. Mirrors
the "single typed accessor" convention used by `services/api/users.ts`. No
component touches a provider SDK directly.

```ts
// Configure Google SDK once at module load from env client IDs.
// Each function: get provider ID token → supabase.auth.signInWithIdToken.
// Returns void on success (AppGate picks up the session via onAuthStateChange).
// Throws on provider error; the caller maps known cases (user-cancel vs. real
// failure) to toasts. User-cancel is NOT an error toast — it's a silent no-op.

export async function signInWithApple(): Promise<void>;
export async function signInWithGoogle(): Promise<void>;

// Helper so callers can distinguish a deliberate cancel from a failure:
export function isUserCancellation(error: unknown): boolean;
```

- `signInWithApple`: `AppleAuthentication.signInAsync({ requestedScopes:
  [FULL_NAME, EMAIL] })` → pass `credential.identityToken` to
  `signInWithIdToken({ provider: 'apple', token })`. Apple only returns name on
  the *first* authorization; per [OPEN-1] we ignore it.
- `signInWithGoogle`: `GoogleSignin.signIn()` → `idToken` →
  `signInWithIdToken({ provider: 'google', token })`.
- On Apple, `isAvailableAsync()` is true only on iOS 13+; the Apple button must
  hide on Android (Apple sign-in on Android would be a web flow, out of scope).

### `app/(auth)/login.tsx`
- Below the existing submit `Pressable` (line ~216), add a divider ("or") and:
  - **Continue with Apple** button — render only when
    `AppleAuthentication.isAvailableAsync()` resolves true (iOS). Prefer the
    native `<AppleAuthentication.AppleAuthenticationButton />` to satisfy
    Apple's HIG, styled to the app where allowed.
  - **Continue with Google** button — a `Pressable` matching the app's button
    idiom, drawing colors from `constants/colors.ts` (no hex literals),
    sizing via `moderateScale` / `Spacing` (per CLAUDE.md).
- Both buttons:
  - `disabled={loading}` and set the existing `loading` flag while in flight,
    so the email form and OAuth buttons can't run concurrently.
  - On success: do nothing UI-side — AppGate routes. (Same as the email path.)
  - On `isUserCancellation(err)`: silent return, no toast.
  - On real failure: `Toasts.signInFailed()` (reuse existing toast).
- Provide `accessibilityLabel` on the Google button (icon + text). 44×44 min
  touch target.
- No change to the segmented toggle or the email/password logic.

### `components/modals/instances/toastCatalog.ts`
- Reuse `signInFailed()` for OAuth failures. **No new toast** unless a
  provider-specific message is wanted — recommend not, to keep parity. (If
  desired later, add `oauthFailed(provider)`.)

### Files explicitly NOT changed
- `stores/useAuthStore.ts` — no new state or actions; `signOut()` already
  clears the Supabase session for any provider.
- `app/_layout.tsx` (AppGate) — `onAuthStateChange` already handles OAuth
  sessions identically.
- `services/api/users.ts` — DB contract unchanged.
- `stores/useUserStore.ts` / `progressStore.ts` — reset/hydration already
  provider-agnostic.

## Out of scope (explicitly do not add)
- Any provider beyond Apple and Google (Facebook, GitHub, phone, magic link).
- Populating `name` / `avatar_url` from provider claims ([OPEN-1] = no).
- Custom account-linking UI / merge flows ([OPEN-2] = rely on Supabase default).
- Apple sign-in on Android (web flow).
- Email confirmation, password reset — unchanged, still out of scope per the
  parent auth spec.
- Sign-in analytics / provider attribution reporting.
- Re-running onboarding or any profile editing.

## Acceptance criteria
- [ ] On iOS, the login screen shows **Continue with Apple** and **Continue
      with Google** below the email form, in both Log in and Sign up modes.
- [ ] On Android, the Apple button is hidden; Google button shows (if [OPEN-3]
      = include Android), else neither shows and only email is offered.
- [ ] Fresh Apple sign-in with a never-used Apple ID → Supabase creates the
      `auth.users` row, the trigger creates the `public.users` row with
      `onboarding_completed_at = null`, onboarding renders, completing it lands
      on `/(tabs)` and persists the three answer fields (verify in dashboard).
- [ ] Fresh Google sign-in with a never-used Google account → same as above.
- [ ] Returning OAuth user (onboarding already complete) → signs in and routes
      straight to `/(tabs)`, no onboarding, stores hydrated from the DB.
- [ ] Tapping an OAuth button then cancelling the system sheet → returns to the
      login screen with no error toast and no navigation.
- [ ] OAuth provider/network failure → `signInFailed` toast, user stays on the
      login screen, no partial session.
- [ ] Kill app after OAuth sign-in, reopen → still signed in (session persisted
      via the chunked SecureStore adapter), routed correctly.
- [ ] Sign out from an OAuth account, then email-sign-up a different account on
      the same device → onboarding shows (AppGate `resetForUser` fires). No
      cross-account state leak.
- [ ] No code path adds OAuth-specific routing, inserts into `public.users`, or
      adds fields to `useAuthStore`.
- [ ] App builds and runs in a dev/EAS build (not Expo Go); README notes the
      Expo Go drop.

## Manual test plan
1. **Setup verified.** Apple + Google enabled in Supabase; client IDs in
   `.env`; config plugins in `app.json`; `npx expo prebuild` clean; dev build
   installed on a real iOS device (Apple sign-in needs a real device or a
   simulator signed into an Apple ID).
2. **Apple, fresh.** Sign in with Apple using an Apple ID never used in this
   project. Confirm onboarding renders; complete it; verify `public.users` row
   in the Supabase dashboard (`onboarding_completed_at` set, three fields).
3. **Apple, returning.** Sign out, sign in with Apple again → straight to
   `/(tabs)`, no onboarding.
4. **Google, fresh + returning.** Repeat 2–3 with Google. If Android in scope,
   run on an Android device/emulator too.
5. **Cancel.** Tap each button, dismiss the system sheet → no toast, no nav.
6. **Failure.** Airplane mode, tap Google → `signInFailed` toast, stays on
   screen. Disable airplane mode, retry → succeeds.
7. **Collision ([OPEN-2]).** Email-sign-up `you@gmail.com`, sign out, "Continue
   with Google" on the same `you@gmail.com` → confirm the observed behavior
   matches the decision recorded for [OPEN-2].
8. **Session persistence.** Cold-kill after OAuth sign-in, reopen → still
   signed in, routed correctly.

## Where to wire it
- Provider SDK + token exchange: `services/api/auth-oauth.ts` (new) is the only
  file importing the provider SDKs or calling `signInWithIdToken`.
- UI entry points: two buttons in `app/(auth)/login.tsx`, nowhere else.
- Config: `app.json` plugins + `.env` client IDs.
- Everything else (routing, hydration, reset, onboarding, sign-out) is reused
  unchanged from the email/password implementation.

## Risks / open questions
All four prior decisions are LOCKED (see "Decisions" section). Remaining risks:
- `[RISK]` Expo Go is dropped the moment the config plugins land. Every dev/
  tester must move to a dev build. Sequence this so it doesn't surprise anyone
  mid-sprint.
- `[RISK]` Apple sign-in cannot be fully tested in a stock simulator without an
  Apple ID signed in; plan for at least one real iOS device.

## Reference
- Parent spec: [spec_auth_onboarding.md](spec_auth_onboarding.md) (DB
  migrations, trigger, AppGate hydration, store reset contract).
- Supabase `signInWithIdToken` docs (native social login).
- `expo-apple-authentication` and `@react-native-google-signin/google-signin`
  config-plugin docs.
- Apple App Store Review Guideline 4.8 (Sign in with Apple parity requirement).
