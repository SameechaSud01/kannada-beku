const TRUNCATE_AT = 15;
const TRUNCATE_TO = 12;

export function formatFirstName(raw: string | null | undefined, fallback = 'there'): string {
  if (!raw) return fallback;
  const trimmed = raw.trim();
  if (!trimmed) return fallback;
  const segments = trimmed.split(/[\s_.\-]+/).filter(Boolean);
  const first = segments[0] ?? trimmed;
  const cased = first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
  return cased.length > TRUNCATE_AT ? cased.slice(0, TRUNCATE_TO) + '…' : cased;
}
