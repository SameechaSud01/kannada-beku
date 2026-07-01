import * as Sentry from '@sentry/react-native';

/**
 * Centralized structured logger (production-log monitoring).
 *
 * One place to send diagnostics instead of scattered console calls. Every log
 * is always forwarded to Sentry; Sentry itself is a no-op unless a DSN is set
 * and the build is non-dev (see Sentry.init in app/_layout.tsx), so these calls
 * are free in development and local runs. In __DEV__ we ALSO print to the
 * console so developers still see output while working.
 *
 * Level → destination in a reporting build:
 *   debug / info  → Sentry breadcrumb (context attached to any later crash)
 *   warn          → Sentry captureMessage (level: warning)
 *   error         → Sentry captureException (grouped, with stack when available)
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogData = Record<string, unknown>;

// Keys whose values must never reach the dashboard (CLAUDE.md: never log PII or
// secrets). Matched case-insensitively against top-level keys of `data`.
const REDACT_KEY = /token|password|secret|authorization|apikey|api_key|email|phone/i;
const REDACTED = '[redacted]';

// Shallow-redact the ad-hoc context object. Error values are preserved as-is —
// they're the whole point of a report and Sentry serializes them.
function redact(data?: LogData): LogData | undefined {
  if (!data) return undefined;
  const out: LogData = {};
  for (const [key, value] of Object.entries(data)) {
    out[key] = REDACT_KEY.test(key) ? REDACTED : value;
  }
  return out;
}

// Pull a real Error out of the context so captureException keeps its stack. The
// common call sites pass the caught error under `err` or `error`.
function extractError(data?: LogData): Error | undefined {
  if (!data) return undefined;
  const candidate = data.err ?? data.error;
  return candidate instanceof Error ? candidate : undefined;
}

function emit(level: LogLevel, scope: string, message: string, data?: LogData): void {
  const safe = redact(data);

  if (__DEV__) {
    const tag = `[${scope}] ${message}`;
    if (level === 'error') console.error(tag, safe ?? '');
    else if (level === 'warn') console.warn(tag, safe ?? '');
    // eslint-disable-next-line no-console -- the logger is the one sanctioned place for console.log
    else console.log(tag, safe ?? '');
  }

  switch (level) {
    case 'debug':
    case 'info':
      Sentry.addBreadcrumb({
        category: scope,
        message,
        level: level === 'debug' ? 'debug' : 'info',
        data: safe,
      });
      break;
    case 'warn':
      Sentry.captureMessage(`[${scope}] ${message}`, {
        level: 'warning',
        tags: { scope },
        extra: safe,
      });
      break;
    case 'error': {
      const err = extractError(data) ?? new Error(`[${scope}] ${message}`);
      Sentry.captureException(err, {
        tags: { scope },
        extra: { message, ...safe },
      });
      break;
    }
  }
}

export const logger = {
  debug: (scope: string, message: string, data?: LogData) => emit('debug', scope, message, data),
  info: (scope: string, message: string, data?: LogData) => emit('info', scope, message, data),
  warn: (scope: string, message: string, data?: LogData) => emit('warn', scope, message, data),
  error: (scope: string, message: string, data?: LogData) => emit('error', scope, message, data),
};
