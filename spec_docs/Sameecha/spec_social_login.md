# Claude Code Spec — Social Login: Google + Apple (Kannada Beku)

status: reviewed (open questions resolved 2026-06-05; awaiting owner [LOCKED] tag)
owner: samee
related: spec_auth_onboarding.md, spec_password_reset.md, docs/foundation/NAVIGATION.md, docs/foundation/STATE.md

## Goal
Let users sign in / sign up with **Google** and **Apple** in addition to the
existing email + password flow, without disturbing the onboarding-persistence
contract already shipped in [spec_auth_onboarding.md](spec_auth_onboarding.md).
After this lands, a brand-new social account flows through the same `AppGate`
onboarding gate as an email account, and a social login whose verified email
matches an existing email/password account resolves to **one** account (no
duplicate progress).

## Context
- App: Kannada Beku (Expo / React Native, Zustand + AsyncStorage + Supabase).
- Auth today is Supabase email/password only ([app/(auth)/login.tsx](../../app/%28auth%29/login.tsx)).
  Session is persisted in a chunked SecureStore adapter; the client is created
  with `detectSessionInUrl: false` ([services/api/supabase.ts](../../services/api/supabase.ts)).
- [spec_auth_onboarding.md](spec_auth_onboarding.md) explicitly lists "OAuth
  providers (Google, Apple, etc)" as **out of scope**. This spec is the
  follow-up that brings them in scope. Everything that spec locked
  (DB-is-source-of-truth for onboarding, the `handle_new_user` trigger, RLS,
  the bind-on-user-switch reset) stays unchanged and is **relied upon** here.
- `AppGate` ([app/_layout.tsx](../../app/_layout.tsx)) already hydrates
  `public.users` on every `onAuthStateChange`. A new OAuth sign-in fires the
  same event, the trigger creates the `public.users` row, and the gate routes a
  new account into onboarding. **No gate redesign is needed for social login.**

## Decisions locked by owner (2026-06-05)
1. **Build model: EAS dev/prod builds** (custom dev client), not Expo Go.
   → Use **native** sign-in modules returning an OIDC id-token, fed to
   `supabase.auth.signInWithIdToken(...)`. This is the Supabase-recommended path
   for native and is required for a native Apple button. **No browser-based
   `signInWithOAuth` flow and no deep-link return is used for social login.**
2. **Ship Google + Apple together.** Apple Developer membership + "Sign in with
   Apple" capability + Supabase Apple provider are assumed ready.
3. **Auto-link by verified email** (Supabase default). One account per verified
   email regardless of method. See the Apple "Hide My Email" caveat below.

## Architecture rules (read first — non-negotiables)
1. **No new auth provider abstraction, no new state library.** Stay inside the
   existing Supabase + Zustand stack. Social sign-in is just another way to
   obtain a Supabase session; once the session exists, `AppGate` owns routing
   and hydration exactly as today.
2. **All Supabase auth calls move behind a single accessor.** Create
   [services/api/auth.ts](../../services/api/auth.ts) exposing
   `signInWithGoogle()` and `signInWithApple()`. Components never call
   `supabase.auth.signInWithIdToken` directly (mirrors the
   `services/api/users.ts` single-accessor rule).
3. **The client never inserts into `public.users`.** The `handle_new_user`
   trigger from [spec_auth_onboarding.md](spec_auth_onboarding.md) creates the
   row on the `auth.users` insert that Supabase performs during social signup.
   Client code only `select`s / `update`s, gated by RLS.
4. **Cancellation is not an error.** A user dismissing the Google/Apple sheet is
   a no-op: no toast, no error log at warn level. Only real failures
   (network, token rejection) surface `Toasts.socialSignInFailed()`.
5. **Apple button is iOS-only.** Render it only when
   `Platform.OS === 'ios'` **and** `AppleAuthentication.isAvailableAsync()`
   resolves true. Android shows Google only. Never render a non-functional
   Apple button.
6. **Onboarding contract is untouched.** Social accounts are subject to the
   same `onboarding_completed_at` gate. A new Google/Apple user sees onboarding;
   a returning one does not. Do not special-case social accounts in `AppGate`.

## Dependencies to add
Installed via `npx expo install` (owner runs; requires a new EAS build —
these do **not** work in Expo Go):
- `@react-native-google-signin/google-signin` — native Google id-token.
- `expo-apple-authentication` — native Sign in with Apple.
- `expo-crypto` — SHA-256 hashing of the Apple nonce.

> **Verification note:** none of these are in `package.json` today (verified
> 2026-06-05). After install, the app must be rebuilt and smoke-tested before
> this spec can be marked done — native modules cannot be verified in Expo Go.

## Native + provider configuration (owner / console work — not app code)
These are **prerequisites**, documented here so the app code has something to
talk to. They are config, not code changes, and several live outside the repo.

### Supabase dashboard
- **Authentication → Providers → Google:** enable. Register the **Web** OAuth
  client ID/secret from Google Cloud as the provider's client ID/secret. This
  Web client ID is also the `webClientId` the app passes to
  `GoogleSignin.configure(...)` (Supabase validates the id-token's audience
  against it).
- **Authentication → Providers → Apple:** enable. Add the Apple **Services ID**
  (or app bundle ID for native) and the team/key info per Supabase's Apple
  guide.
- Confirm **"Confirm email"** stays **OFF** (matches the assumption in
  spec_auth_onboarding.md). Google/Apple emails arrive pre-verified, so this is
  moot for social, but keep the project setting consistent.

### Google Cloud console
- iOS OAuth client (bundle `com.samsud01.kannadabeku`) → yields the
  **iOS client ID** and its reversed-client-ID URL scheme.
- Android OAuth client → needs the release + debug **SHA-1** fingerprints from
  the EAS build credentials.
- Web OAuth client → used by Supabase as the provider client AND as
  `webClientId` in the app.

### Apple Developer
- Enable **Sign in with Apple** capability on the App ID
  `com.samsud01.kannadabeku`.
- Create the Services ID / key that Supabase's Apple provider requires.

### app.json (this IS in-repo config; allowed to edit — `app.json`, not `ios/`)
Add to `expo.plugins`:
```jsonc
"@react-native-google-signin/google-signin",
"expo-apple-authentication"
```
Add the Google iOS URL scheme (reversed iOS client ID) so the native SDK can
round-trip. Add under `expo.ios`:
```jsonc
"usesAppleSignIn": true
```
> Editing `app.json` is permitted (it's config). Do **not** hand-edit `ios/`
> or `android/` native projects — let the config plugins + EAS prebuild
> generate them.

## App changes

### `services/api/supabase.ts`
- No change required for social login (id-token flow needs no redirect /
  PKCE). Leave `detectSessionInUrl: false` as-is.
  *(Note: [spec_password_reset.md](spec_password_reset.md) will add
  `flowType: 'pkce'` to this same client — coordinate so both specs land a
  single consistent client config.)*

### `services/api/auth.ts` (new file)
The only module that calls `supabase.auth.signInWithIdToken`. Each function
returns a small discriminated result so callers can distinguish
**cancelled** from **failed** without try/catch sprawl.

```ts
export type SocialResult =
  | { status: 'signedIn' }
  | { status: 'cancelled' }
  | { status: 'error'; error: unknown };

export async function signInWithGoogle(): Promise<SocialResult>;
export async function signInWithApple(): Promise<SocialResult>;
```

- **Google** (`signInWithGoogle`):
  1. `GoogleSignin.configure({ webClientId, iosClientId })` once at module load
     (or lazily, guarded). `webClientId` and `iosClientId` come from
     `expo-constants` extra / env — **never hard-code**, per CLAUDE.md.
  2. `await GoogleSignin.hasPlayServices()` (Android).
  3. `const { idToken } = await GoogleSignin.signIn()`.
  4. If no `idToken`, return `{ status: 'error' }`.
  5. `await supabase.auth.signInWithIdToken({ provider: 'google', token: idToken })`.
  6. Map the SDK's "user cancelled" status code → `{ status: 'cancelled' }`.
- **Apple** (`signInWithApple`):
  1. Generate a raw nonce (random string); `hashedNonce = sha256(rawNonce)` via
     `expo-crypto`.
  2. `const credential = await AppleAuthentication.signInAsync({
       requestedScopes: [FULL_NAME, EMAIL], nonce: hashedNonce })`.
  3. `await supabase.auth.signInWithIdToken({ provider: 'apple',
       token: credential.identityToken, nonce: rawNonce })`.
  4. Apple returns the name **only on first authorization** — if
     `credential.fullName` is present and `public.users.name` is null, it MAY be
     forwarded (see open question below). Default: ignore name here; onboarding /
     profile owns the name field.
  5. Map `ERR_REQUEST_CANCELED` → `{ status: 'cancelled' }`.
- No navigation, no store writes here. `onAuthStateChange` in `AppGate` does the
  rest.

### `app/(auth)/login.tsx`
- Below the existing email/password submit, add a labeled divider ("or continue
  with") and the social buttons.
- **Google button:** always shown (iOS + Android). On press → `setLoading`,
  `signInWithGoogle()`, on `error` → `Toasts.socialSignInFailed()`, on
  `cancelled`/`signedIn` → nothing (gate routes on success).
- **Apple button:** rendered only when iOS + `isAvailableAsync()` true. Prefer
  the native `AppleAuthentication.AppleAuthenticationButton` for App Store
  compliance; if its styling can't match tokens, a custom `Pressable` is
  acceptable provided it follows Apple's HIG (black/white, Apple logo, correct
  label). Tokens-vs-HIG conflict noted as `[OPEN]` below.
- Both buttons: `Pressable`, min 44×44pt, `accessibilityLabel`, disabled while
  any auth call is in flight (shared `loading` state with email submit so two
  flows can't race).
- Sizing: all paddings/radii via `Spacing`/`Radius`, colors via `Colors`
  (except the Apple button's mandated black/white). No raw pixels.
- The `mode` segmented toggle (Log in / Sign up) stays. Social buttons are
  identical in both modes — one Google/Apple identity is both signup and login.
- The "Forgot password?" link is added by
  [spec_password_reset.md](spec_password_reset.md); coordinate placement so the
  two specs don't both edit the same block blindly.

### `components/modals/instances/toastCatalog.ts`
Add:
```ts
socialSignInFailed() {
  Toast.show({
    kind: 'error',
    id: 'signIn.socialFailed',
    title: "Couldn't sign you in",
    subtitle: 'Please try again, or use email and password',
  });
}
```
Reuse existing toasts where possible; do not duplicate `signInFailed`.

### `app/_layout.tsx` (AppGate)
- **No change.** Confirm by reading: the `onAuthStateChange` handler already
  calls `fetchUserRow` + `hydrateFromUserRow` + `hydrateCompletions` for any
  session, and the routing effect gates on `hasCompletedOnboarding`. A social
  session is just another session. (This is an explicit "verify, don't edit"
  item — if a change turns out to be needed, raise it before coding.)

## Account linking & the Hide-My-Email caveat
- With auto-link (Supabase default), a Google/Apple login whose **verified
  email equals** an existing account's email links into that one account →
  same `public.users.id`, same progress. No app code required; it's a Supabase
  setting/behavior.
- **Apple "Hide My Email"** issues a per-app relay address
  (`...@privaterelay.appleid.com`). That is a *different, still-verified* email,
  so it will create a **separate** account from the user's email/password
  account. This is expected Apple behavior, not a bug. Document it; do not try
  to defeat it. If a user complains about "lost progress," the cause is
  almost always this.

## Out of scope (explicitly do not add)
- Browser-based `signInWithOAuth` / deep-link OAuth (we chose native id-token).
- Additional providers (Facebook, GitHub, phone OTP).
- Account **unlinking** / managing multiple identities from Profile.
- Migrating the 4 pre-existing email accounts to social.
- Any onboarding or `AppGate` behavior change (owned by spec_auth_onboarding.md;
  reused as-is).
- Profile name/avatar population from provider metadata beyond the optional
  Apple-first-name forwarding flagged below.
- Password reset (owned by [spec_password_reset.md](spec_password_reset.md)).

## Acceptance criteria
- [ ] Fresh install, tap **Google**, pick a never-used Google account →
      onboarding shows immediately; completing it writes the three fields to
      `public.users`; lands on `/(tabs)`.
- [ ] Sign out, tap **Google** with the same Google account → routes straight
      to `/(tabs)`, no onboarding, progress intact.
- [ ] Fresh install on iOS, tap **Apple**, authorize → onboarding shows; second
      time → straight to `/(tabs)`.
- [ ] Apple button is **absent** on Android and absent on any iOS device where
      `isAvailableAsync()` is false.
- [ ] Cancelling the Google or Apple sheet returns to `login` with **no** error
      toast and no console warning.
- [ ] Real failure (airplane mode mid-flow) shows `socialSignInFailed` and
      leaves the user on `login`.
- [ ] A Google login whose verified email matches an existing email/password
      account resolves to the **same** `public.users.id` (verify in dashboard) —
      one account, one progress set.
- [ ] No client code path calls `supabase.from('users').insert(...)`.
- [ ] No client code calls `supabase.auth.signInWithIdToken` outside
      `services/api/auth.ts`.
- [ ] App still builds and runs after the three new deps (verified in an EAS
      dev build, not Expo Go).

## Manual test plan
1. **Prereqs:** providers enabled in Supabase; Google Cloud + Apple Developer
   configured; `app.json` plugins added; new EAS dev build installed on a real
   iOS device and an Android device/emulator.
2. **Google new account** (Android + iOS): wipe app, sign in with a fresh Google
   account, complete onboarding, verify `public.users` row in dashboard.
3. **Google returning:** sign out, sign in again → no onboarding, progress
   intact.
4. **Apple new account** (iOS only): wipe app, Sign in with Apple, complete
   onboarding, verify row.
5. **Apple returning** (iOS): sign out, sign in → no onboarding.
6. **Cancellation:** open each sheet and dismiss → confirm no toast/warning.
7. **Failure:** airplane mode, tap Google → confirm `socialSignInFailed`.
8. **Linking:** create email/password account with `you@gmail.com`, complete
   onboarding, sign out, then Google-login with the same Gmail → confirm same
   account id and onboarding is NOT shown again.
9. **Apple Hide-My-Email:** authorize Apple with "Hide My Email" → confirm it
   creates/uses a relay-email account (documented behavior, not a failure).
10. **Android has no Apple button**; iOS shows both.

## Resolved decisions (owner, 2026-06-05)
- `[LOCKED]` — **Apple button: native `AppleAuthentication.AppleAuthenticationButton`.**
  App Store-compliance wins over token-matching. It will not match
  `Colors`/`Radius`; that is accepted. Do not build a custom Apple button.
- `[LOCKED]` — **Do not forward Apple's first-authorization `fullName`** into
  `public.users.name`. Name stays owned by onboarding/profile;
  `services/api/auth.ts` ignores `credential.fullName`.
- `[LOCKED]` — **`webClientId` / `iosClientId` come from `expo-constants` extra**
  (sourced from env via `app.config`), never hard-coded and never read from
  `process.env` in components — consistent with CLAUDE.md.
- `[OPEN]` — Profile showing *which* method the account uses (and unlinking) is
  **deferred** — out of scope for this spec; raise a follow-up spec if wanted.

## Where to wire it
- Deps: `@react-native-google-signin/google-signin`, `expo-apple-authentication`,
  `expo-crypto` (owner installs; new EAS build required).
- Provider config: Supabase dashboard + Google Cloud + Apple Developer (owner).
- App config: `app.json` plugins + `usesAppleSignIn` (this spec).
- Auth accessor: `services/api/auth.ts` (new) is the sole `signInWithIdToken`
  caller.
- UI: `app/(auth)/login.tsx` social buttons.
- Toasts: `components/modals/instances/toastCatalog.ts` (`socialSignInFailed`).
- Routing/hydration: `AppGate` in `app/_layout.tsx` — **reused unchanged**.
