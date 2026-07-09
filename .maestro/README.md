# Maestro E2E flows

End-to-end flows for Kannada Beku, mapped to the critical IDs in the manual
test plan (`TESTING_PLAN.html`). Maestro drives a **dev/preview build** on a
simulator — not Expo Go — so auth, deep links, and storage behave like
production.

## One-time setup

```sh
# Install the Maestro CLI (https://maestro.mobile.dev)
curl -Ls "https://get.maestro.mobile.dev" | bash

# Build + install the app on the booted iOS simulator
npx expo run:ios
```

## Test account

Flows sign in with a dedicated Supabase test account passed via env vars —
never commit credentials:

```sh
export MAESTRO_TEST_EMAIL="e2e@yourtestdomain.dev"
export MAESTRO_TEST_PASSWORD="..."
```

- `login.yaml`, `session-persistence.yaml`, `lesson-open.yaml` need an account
  that has **completed onboarding**.
- `onboarding.yaml` needs an account that has **never onboarded** (or reset the
  test user's row in the Supabase dashboard first: clear `users` onboarding
  fields for that account).

## Running

```sh
# Everything
maestro test .maestro/flows/

# One flow
maestro test .maestro/flows/login.yaml
```

## Flow ↔ manual-plan coverage

| Flow                     | Manual IDs        | What it proves                                  |
| ------------------------ | ----------------- | ----------------------------------------------- |
| `login.yaml`             | AUTH-02           | Email/password login lands in the app           |
| `session-persistence.yaml` | AUTH-07         | Force-quit + relaunch keeps the session         |
| `onboarding.yaml`        | ONB-01…05, ONB-06 | Intake completes; relaunch never re-loops       |
| `lesson-open.yaml`       | LRN-01, LRN-02    | Learn tab lists lessons; first lesson opens     |

Deliberately NOT automated (stay manual): Google/Apple OAuth (system sheets),
audio output, device matrix / safe-area checks, and iOS offline toggling
(Maestro can only toggle airplane mode on Android).

> **Status note:** these flows were authored against the current screen copy
> ("Welcome back", "Get Started", "Your name", "Continue", tab labels
> Home/Learn/Practice/Profile). They have not yet been run against a build —
> expect to calibrate selectors on the first run and extend from here (e.g. a
> full lesson-completion → unlock flow once the runner steps are stable).
