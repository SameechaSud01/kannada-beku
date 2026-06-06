# Claude Code Spec — Forgot / Reset Password (Kannada Beku)

status: reviewed (open questions resolved 2026-06-05; awaiting owner [LOCKED] tag)
owner: samee
related: spec_auth_onboarding.md, spec_social_login.md, docs/foundation/NAVIGATION.md

## Goal
Let a user who forgot their password recover access via an emailed reset link
that deep-links back into the app, where they set a new password. After this
lands, "Forgot password?" on the login screen is a complete, self-serve flow:
request → email → open app → set new password → signed in.

## Context
- Auth today is Supabase email/password ([app/(auth)/login.tsx](../../app/%28auth%29/login.tsx))
  with no recovery path; a forgotten password is unrecoverable in-app.
- [spec_auth_onboarding.md](spec_auth_onboarding.md) listed "Password reset
  flows" as **out of scope** and noted no deep-link handling exists
  (`detectSessionInUrl: false`, no email-confirmation deep links). This spec
  introduces the **first** deep-link handling in the app.
- App scheme is `kannada-beku` ([app.json](../../app.json)).
- `AppGate` ([app/_layout.tsx](../../app/_layout.tsx)) routes any authenticated
  session in the `(auth)` group straight to `/(tabs)` or `/onboarding`. **A
  recovery session is still a session**, so naïvely it would bounce the user
  off the reset screen before they type a new password. This is the one real
  gotcha; see "AppGate amendment" below.

## Decisions locked by owner (2026-06-05)
1. **Delivery: email link → deep link into app.** Use
   `supabase.auth.resetPasswordForEmail(email, { redirectTo })` with a
   `kannada-beku://` redirect, then complete via `updateUser({ password })`.
   (OTP-code alternative was rejected.)
2. **PKCE flow.** The email link carries a `?code=...`; the app exchanges it
   for a recovery session. Requires `flowType: 'pkce'` on the Supabase client.

## Architecture rules (read first)
1. **No new state library, no new auth provider.** Pure Supabase auth + Expo
   Router + `expo-linking` (already installed).
2. **Reset calls go behind `services/api/auth.ts`** (the same accessor created
   by [spec_social_login.md](spec_social_login.md); if that spec hasn't landed,
   create the file here). Functions: `requestPasswordReset(email)` and
   `setNewPassword(password)`. Components never call `supabase.auth.reset*`
   or `updateUser` directly.
3. **Do not weaken account security.** Never reveal whether an email exists:
   the "we sent a link" confirmation is shown for **any** syntactically valid
   email, regardless of whether Supabase found an account (Supabase's
   `resetPasswordForEmail` does not error on unknown emails; do not add a check
   that would leak existence).
4. **The recovery session is transient and scoped to one job.** It exists only
   to authorize `updateUser({ password })`. The app must not treat being on the
   reset screen as "logged in for real" — see the AppGate amendment.

## Supabase / config prerequisites (owner)
- **Authentication → URL Configuration → Redirect URLs:** add the app's reset
  deep link (the exact value produced by `Linking.createURL('reset-password')`,
  e.g. `kannada-beku://reset-password`). Supabase only redirects to allow-listed
  URLs.
- **Auth email templates → "Reset Password":** confirm the template's action
  link uses the recovery link macro (default is fine). Subject/copy can be
  branded later — out of scope here.
- "Confirm email" stays OFF (consistent with spec_auth_onboarding.md).

## App changes

### `services/api/supabase.ts`
- Add `flowType: 'pkce'` to the `auth` options. PKCE is the recommended mobile
  flow and is required to exchange the email link's `code` for a session.
- Keep `detectSessionInUrl: false` — we handle the URL manually in the reset
  screen (RN has no `window.location` for the SDK to auto-detect).
  *(Coordinate with [spec_social_login.md](spec_social_login.md): both specs
  touch this file; land one consistent client config.)*

### `services/api/auth.ts`
```ts
export async function requestPasswordReset(email: string): Promise<void>;
//   const redirectTo = Linking.createURL('reset-password');
//   await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo });
//   throws only on transport errors — NOT on unknown email.

export async function setNewPassword(password: string): Promise<void>;
//   await supabase.auth.updateUser({ password });  // uses the recovery session
//   throws on weak password / no session.
```
The code-exchange step lives in the reset screen (it needs the URL from the
deep link), not in this accessor.

### `app/(auth)/forgot-password.tsx` (new route)
- Single email field + "Send reset link" `Pressable` (44×44pt min, disabled +
  in-button spinner while submitting, per CLAUDE.md form rules).
- Client validation: same `EMAIL_RE` as `login.tsx`. Invalid → reuse a toast
  (e.g. `invalidCredentials` or a new `invalidEmail`), don't hit the network.
- On submit → `requestPasswordReset(email)`:
  - Success (or unknown email — indistinguishable by design) → show
    `Toasts.resetEmailSent()` and switch the screen to a persistent "Check your
    email" confirmation state with a **Resend** button (re-calls
    `requestPasswordReset`, subject to Supabase's throttle). The user does NOT
    auto-return to login; they leave via the back chip. (Owner decision below.)
  - Transport error → `Toasts.preferenceSaveFailed()`-style retry toast (or a
    new `resetRequestFailed`).
- Has an `ExitBackButton` (per NAVIGATION.md back-affordance rule — every screen
  except the listed roots shows one).
- Safe-area insets applied; tokens for all sizing/colors.

### `app/(auth)/reset-password.tsx` (new route)
The deep-link landing screen. Mounted when the email link opens the app.
1. On mount, read the inbound URL (`Linking.useURL()` / initial URL), parse the
   `code` query param.
2. `await supabase.auth.exchangeCodeForSession(code)` → establishes the
   recovery session. On failure (expired/used link) → show
   `Toasts.resetLinkInvalid()` and route back to `forgot-password`.
3. Render two password fields (new + confirm). Validation: length ≥ 8 (match
   the signup rule in `login.tsx`), fields equal. Submit disabled + spinner
   while in flight.
4. On submit → `setNewPassword(password)`:
   - Success → `Toasts.passwordUpdated()`; the user now holds a full session →
     let `AppGate` route them (onboarded → `/(tabs)`, not-onboarded →
     `/onboarding/welcome`). See gate amendment for why this is safe.
   - Failure → toast, stay on screen.
- Safe-area + tokens + back affordance as above.

### `app/_layout.tsx` (AppGate) — **amendment to a [LOCKED] section**
> NAVIGATION.md "Auth + onboarding gating" is `[LOCKED]` and matches this gate.
> This change therefore needs an explicit spec PR + owner sign-off, and
> NAVIGATION.md must be updated in the same PR. **Flagged, not silently done.**

Problem: after `exchangeCodeForSession`, `onAuthStateChange` fires with a
session while the user is on `(auth)/reset-password`. The current rule
"`session && inAuthGroup` → redirect to `/(tabs)`/onboarding" would bounce them
off the screen before they set a password.

Amendment: add a reset-password **early-return** to the routing effect, placed
*before* the redirect cascade. An `else if`-only guard is insufficient — the
existing cascade has a separate `session && !hasCompletedOnboarding &&
!inOnboarding` branch, so an un-onboarded recovery session would fall through
and still get bounced to onboarding. The early-return covers both onboarded and
un-onboarded recovery sessions in one place:
```ts
const inResetPassword = segments[0] === '(auth)' && segments[1] === 'reset-password';
// While completing a password reset, the recovery session must NOT trigger any
// redirect — the user has to stay on this screen to set a new password.
if (session && inResetPassword) return;
// ...existing redirect cascade unchanged below...
```
After `setNewPassword` succeeds, the screen explicitly calls
`router.replace('/(tabs)')` for an onboarded user, or
`router.replace('/onboarding/welcome')` for an un-onboarded one (read
`hasCompletedOnboarding` from `useUserStore`). The early-return only suppresses
*automatic* redirects while the screen is mounted; the screen drives its own
exit on success. This keeps the user signed in (they just proved control of the
email) — no forced re-login.

### `app/(auth)/login.tsx`
- Add a "Forgot password?" text `Pressable` below the password field, visible
  in **login mode only** (`mode === 'login'`). On press →
  `router.push('/(auth)/forgot-password')`.
- Min touch target 44pt; color from `Colors`; sizing via `Spacing`.
- Coordinate with [spec_social_login.md](spec_social_login.md) — both specs add
  elements to this screen.

### `components/modals/instances/toastCatalog.ts`
Add:
```ts
resetEmailSent() {
  Toast.show({ kind: 'success', id: 'reset.emailSent',
    title: 'Check your email for a reset link' });
},
resetLinkInvalid() {
  Toast.show({ kind: 'error', id: 'reset.linkInvalid',
    title: 'That reset link is invalid or expired',
    subtitle: 'Request a new one to continue' });
},
passwordUpdated() {
  Toast.show({ kind: 'success', id: 'reset.passwordUpdated',
    title: 'Password updated' });
},
```
Add `invalidEmail` / `resetRequestFailed` only if an existing toast doesn't fit.

## Out of scope (explicitly do not add)
- Changing password from within Profile while logged in (different entry point;
  separate spec if wanted).
- Email-verification / confirm-signup deep links (still off; only the
  *recovery* link is handled here).
- Rate-limiting / captcha on the request form (rely on Supabase's built-in
  reset throttling).
- Branded reset email design.
- Magic-link / passwordless login.

## Acceptance criteria
- [ ] Login screen (login mode) shows "Forgot password?"; signup mode does not.
- [ ] Submitting a registered email shows `resetEmailSent` and an email arrives.
- [ ] Submitting an **unregistered** but valid email shows the **same**
      confirmation (no account-existence leak) and no email arrives.
- [ ] Submitting an invalid email shows a validation toast and makes no network
      call.
- [ ] Tapping the email link opens the app on `reset-password` with the code
      exchanged into a recovery session.
- [ ] Setting a valid matching new password (≥ 8) succeeds, shows
      `passwordUpdated`, and lands the user in the app via the gate (onboarded →
      tabs; not-onboarded → onboarding) — **without** being bounced off the
      reset screen first.
- [ ] The user can then sign out and log in with the **new** password; the old
      password no longer works.
- [ ] An expired/reused link shows `resetLinkInvalid` and routes back to
      `forgot-password`.
- [ ] No client code calls `supabase.auth.resetPasswordForEmail` /
      `updateUser` / `exchangeCodeForSession` outside the reset screens +
      `services/api/auth.ts`.
- [ ] NAVIGATION.md gating table updated for the `reset-password` exception in
      the same PR as the `AppGate` change.

## Manual test plan
1. **Prereq:** redirect URL allow-listed in Supabase; `flowType: 'pkce'` set;
   new build installed (deep links need a dev/prod build, not Expo Go).
2. **Happy path:** login → Forgot password → enter your email → see
   confirmation → open email on the same device → tap link → app opens
   `reset-password` → set new password → confirm landed in app.
3. **New password works:** sign out → log in with new password (success) and
   with old password (fails).
4. **Unknown email:** request reset for a never-registered address → same
   confirmation, no email. (Verify no error reveals non-existence.)
5. **Invalid email:** type `notanemail` → validation toast, no request.
6. **Expired link:** request a reset, wait past the link TTL (or request a
   second link to invalidate the first), tap the stale link → `resetLinkInvalid`
   → back on `forgot-password`.
7. **Gate behavior:** confirm that opening the reset link for an **onboarded**
   account does not flash `/(tabs)` before the password is set, and that an
   **un-onboarded** account lands in onboarding after the reset (not stuck on
   reset screen).
8. **iOS + Android** both handle the deep link.

## Resolved decisions (owner, 2026-06-05)
- `[LOCKED]` — **Keep the recovery session after a successful reset** (no forced
  re-login). The user proved email control; the screen `router.replace`s into
  the app via the onboarded/un-onboarded split.
- `[LOCKED]` — **`forgot-password` stays on a "check your email" confirmation
  state with a Resend button** after a request; it does not auto-return to
  login. The user leaves via the back chip.
- `[DECIDED — capture during impl]` — Redirect URL is
  `Linking.createURL('reset-password')` (not the bare scheme). Log the exact
  string it prints once during implementation and allow-list precisely that in
  the Supabase dashboard (dev builds may add a path prefix).
- `[NOTE]` — This is the app's first deep-link handler. If email-confirmation or
  OAuth-deep-link flows are added later, factor a shared inbound-URL handler
  rather than duplicating per screen.

## Foundation doc amendment — NAVIGATION.md (apply on lock, with owner sign-off)
NAVIGATION.md is foundation and three of its sections are `[LOCKED]`. **Do not
edit it until this spec is locked and the owner signs off** (per CLAUDE.md, a
`[LOCKED]` decision is immutable without explicit owner sign-off). The exact
edits below are pre-drafted so they can land in the **same PR** as the
`AppGate` change — code and spec move together, never apart.

### 1. Route table (`## Routes`, after the `/(auth)/login` row)
Add:
```md
| `/(auth)/forgot-password` | [forgot-password.tsx](../../app/%28auth%29/forgot-password.tsx) | Stack, `headerShown: false`, bg `Colors.surface` | Screen-owned back chip | Request reset email. See [spec_password_reset](../../spec_docs/Sameecha/spec_password_reset.md). |
| `/(auth)/reset-password` | [reset-password.tsx](../../app/%28auth%29/reset-password.tsx) | ↑ | Screen-owned back chip | Deep-link landing; exchanges `code`, sets new password. See [spec_password_reset](../../spec_docs/Sameecha/spec_password_reset.md). |
```

### 2. Auth + onboarding gating matrix (`## Auth + onboarding gating`)
Add one row to the decision matrix (and a note under it). The reset exception
takes precedence over the existing rows because it is evaluated as an
early-return *before* the cascade:
```md
| ✅ (recovery) | — | `(auth)/reset-password` | **stay** — no redirect; screen owns exit after password is set |
```
Note to add below the table:
> **Reset-password exception:** while the user is on `(auth)/reset-password`, an
> active (recovery) session must not trigger any redirect. `AppGate` early-
> returns when `session && segments[1] === 'reset-password'`, so neither the
> onboarded→`/(tabs)` nor the un-onboarded→`/onboarding/welcome` rule fires.
> The screen calls `router.replace(...)` itself on success. See
> [spec_password_reset](../../spec_docs/Sameecha/spec_password_reset.md).

### 3. Deep linking (`## Deep linking`)
Replace "Custom linking config: none" with a note that the recovery deep link
is now handled:
```md
- **Custom linking config:** the password-recovery link
  (`Linking.createURL('reset-password')`, allow-listed in Supabase) opens
  `(auth)/reset-password`, which manually exchanges the `?code=` param for a
  session (`detectSessionInUrl` stays `false`). First and only deep-link
  handler. See [spec_password_reset](../../spec_docs/Sameecha/spec_password_reset.md).
```

### 4. Back behavior (`## Back behavior`, per-flow table)
Add:
```md
| `(auth)/forgot-password`, `(auth)/reset-password` | screen-owned back chip | Plain `router.back()` — nothing committed yet |
```

### 5. New journey (`## User journeys`, after J2)
```md
### J3: Reset a forgotten password

`[LOCKED]` — see [spec_password_reset](../../spec_docs/Sameecha/spec_password_reset.md).

1. `/(auth)/login` (login mode) → tap "Forgot password?" → `/(auth)/forgot-password`
2. Enter email → `resetPasswordForEmail` → confirmation shown (no account-existence leak)
3. User opens the email → taps link → app deep-links to `/(auth)/reset-password`
4. App exchanges `?code=` → recovery session; `AppGate` early-returns (no redirect)
5. Set + confirm new password → `updateUser({ password })` → `passwordUpdated`
6. Screen `router.replace`s into the app via the normal onboarded/un-onboarded split
```

> Social login ([spec_social_login.md](spec_social_login.md)) adds no new routes
> — only buttons on `login.tsx` — so it needs **no** route-table change. If the
> owner wants J1 to mention Google/Apple as alternative signup entry points,
> that is a one-line amendment owned by that spec, not this one.

## Where to wire it
- Client config: `flowType: 'pkce'` in `services/api/supabase.ts`.
- Accessor: `requestPasswordReset` / `setNewPassword` in
  `services/api/auth.ts`.
- Screens: `app/(auth)/forgot-password.tsx`, `app/(auth)/reset-password.tsx`
  (new); link from `app/(auth)/login.tsx`.
- Gate: `AppGate` reset-password exception in `app/_layout.tsx` (+ NAVIGATION.md
  update — locked section, needs sign-off).
- Toasts: `components/modals/instances/toastCatalog.ts`.
- Supabase dashboard: redirect URL allow-list + reset email template (owner).
