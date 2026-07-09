# Testing

How this app is tested, layer by layer. Built on branch `chore/testing-framework`
(2026-07-09); see `TESTING_FRAMEWORK_PLAN.html` for the original plan and
`TESTING_PLAN.html` for the manual QA suites.

## The layers

| Layer            | Where                       | Runs                    | Catches                                     |
| ---------------- | --------------------------- | ----------------------- | ------------------------------------------- |
| Unit (logic)     | `__tests__/{lib,utils,stores,hooks,progress,dictation,opposites,quickquiz,conversations}` | every PR + pre-push | broken game/progress/util logic |
| Content integrity | `__tests__/content/`       | every PR + pre-push     | bad lesson/game data, missing audio         |
| Component        | `__tests__/components/`     | every PR + pre-push     | broken UI states, missing a11y labels       |
| Integration      | `__tests__/integration/`    | every PR + pre-push     | sync-queue loss, cross-account leakage      |
| E2E (Maestro)    | `.maestro/flows/`           | locally, on demand      | onboarding loops, auth/session regressions  |
| Manual           | `TESTING_PLAN.html`         | before releases         | OAuth, audio, device matrix, feel           |

## Running

```sh
npm test               # everything Jest knows about (~3s)
npm run test:watch     # watch mode while developing
npm run test:coverage  # with the coverage ratchet (what CI runs)
npx jest __tests__/content   # one folder
maestro test .maestro/flows/ # E2E — see .maestro/README.md for setup
```

## The coverage ratchet

CI runs `test:coverage`; the thresholds in `package.json → jest.coverageThreshold`
are pinned slightly *below* current coverage. The build fails only when coverage
**drops** — nobody has to chase a number, but decay is visible. When coverage
rises meaningfully, bump the floor to just under the new baseline.

## Conventions

- **Query by role/label** in component tests (`getByRole('button', { name: … })`),
  never by testID unless there is no accessible handle — this makes missing
  `accessibilityLabel`s test failures for free. No full-screen snapshots.
- **Mock at the seams.** Integration tests mock the `services/api/*` RPC
  wrappers and `expo-network`, and exercise the real stores/services in
  between. Don't mock Zustand stores — reset their state in `beforeEach`.
- **Global mocks** live in `jest.setup.js`: AsyncStorage, Sentry, Reanimated
  (official mock — animations render statically), safe-area-context (insets 0).
  Suites needing assertions on these re-mock locally.
- **Content tests are tripwires, not style checks.** `__tests__/content/`
  encodes the ISO diacritic conventions, lesson/section taxonomy, and audio
  coverage. If one fails after a `gen:content` / `gen:audio` run, the data is
  wrong (or the pinned expectations need a deliberate update — e.g. the
  game-bank lesson coverage list when new lessons are authored in the DB).
  Known data warts are documented inline (`KNOWN_RETROFLEX_EXCEPTIONS`).

## When you add…

- **A utility or hook** → a unit test next to the existing ones (CLAUDE.md
  already requires this for `lib/`).
- **A shared component** → an RNTL test in `__tests__/components/` asserting
  visible copy + press behaviour through accessible queries.
- **Lesson/game content** (TS edit or `gen:content`) → just run `npm test`;
  the content suites validate it. Extend the pinned coverage lists when a new
  lesson's game banks land.
- **A store or sync behaviour** → an integration test in
  `__tests__/integration/` mocking only the RPC seam.
- **A new critical user flow** → a Maestro flow in `.maestro/flows/` mapped to
  its manual-plan ID.

## What stays manual (by design)

Google/Apple OAuth, real audio output, push notifications, the device matrix
(iPhone SE / Pro Max / Android / iPad), and anything about feel. These live in
`TESTING_PLAN.html` — the automated layers exist so a manual pass can focus on
exactly these.

## E2E in CI (future)

E2E is local-only for now: a GitHub Actions macOS runner would need a full
simulator build per run (slow, ~10× Linux cost). If/when it's wanted, the
options are a `workflow_dispatch`/nightly macOS job, or EAS Workflows'
hosted `maestro` job running against an EAS build.
