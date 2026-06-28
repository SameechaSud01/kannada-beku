#!/bin/sh
# Pre-push secret scan (audit H2). Fails the push if a likely secret is tracked
# by git, or if a local secrets file is staged. Scans only git-tracked content
# so untracked .env files don't trip it. Keep patterns conservative to avoid
# false positives on public identifiers (EXPO_PUBLIC_*, Google client IDs,
# Supabase *publishable* anon keys).
set -eu

fail=0

note() { printf '  %s\n' "$1"; }

# 1) A real .env must never be tracked.
if git ls-files --error-unmatch .env >/dev/null 2>&1; then
  note "FAIL: .env is tracked by git — it must stay untracked (contains secrets)."
  fail=1
fi

# 2) Scan tracked files for high-signal secret markers. Excludes the lockfile
#    and this script. Patterns target genuine secrets, not public ids.
PATTERNS='-----BEGIN [A-Z ]*PRIVATE KEY-----|sb_secret_|service_role|AZURE_SPEECH_KEY=|AKIA[0-9A-Z]{16}|aws_secret_access_key'

matches=$(
  git ls-files -z \
    | grep -zZv -e 'package-lock.json' -e 'scripts/security-scan.sh' -e '.env.example' \
    | xargs -0 grep -nEI "$PATTERNS" 2>/dev/null || true
)

if [ -n "$matches" ]; then
  note "FAIL: possible secret(s) found in tracked files:"
  printf '%s\n' "$matches" | sed 's/^/    /'
  fail=1
fi

if [ "$fail" -ne 0 ]; then
  exit 1
fi

note "Security scan: PASS (no tracked secrets)."
exit 0
