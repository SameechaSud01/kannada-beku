# Local Setup — Kannada Beku

Follow these steps exactly. They guarantee everyone runs the **same Node version**
and the **same dependency tree**, which is what prevents the "works for one person,
crashes for another" problem.

## 1. Use the pinned Node version

This repo pins Node **22** (see `.nvmrc`). Expo SDK 54 needs Node ≥ 20.19.4 — older
versions (and bleeding-edge odd releases like 23/25) cause Metro to crash on start.

Install [nvm](https://github.com/nvm-sh/nvm) if you don't have it, then in the repo root:

```bash
nvm install   # installs the version from .nvmrc (22)
nvm use       # switches to it
node -v       # should print v22.x
```

> Tip: run `nvm use` every time you open a new terminal for this project, or set up
> [automatic switching](https://github.com/nvm-sh/nvm#deeper-shell-integration).

## 2. Clean install from the lockfile

Always use `npm ci` (not `npm install`). `ci` installs the **exact** versions from
`package-lock.json` — `install` can quietly drift the tree and is a common cause of
crashes that hit some machines but not others.

```bash
npm ci
```

If something is already broken, do a full reset first:

```bash
rm -rf node_modules .expo
npm ci
```

## 3. Fill in your environment variables

`npm ci` auto-creates `.env` from `.env.example` (via the postinstall script), but it
contains **placeholders**. The app will crash or fail to load data until you put in
real values. Ask Samee for the `EXPO_PUBLIC_SUPABASE_*` keys (and any others marked in
`.env.example`) and paste them into `.env`.

## 4. Start with a clean cache

The first time, or any time something looks stale/weird, clear Metro's cache:

```bash
npx expo start -c
```

After that, `npm start` is fine.

---

## If it still crashes on start

Run Expo's built-in environment checker and paste the output to the team:

```bash
npx expo-doctor
```

Then double-check:

- `node -v` prints **v22.x** (run `nvm use` if not)
- You ran `npm ci`, not `npm install`
- `.env` has real Supabase values, not placeholders
- You did the clean reset in step 2 + `npx expo start -c`
