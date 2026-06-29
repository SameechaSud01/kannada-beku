import { COPY, type CopyKey } from '../constants/copy';

/**
 * Resolve a user-facing copy string by key. Single-voice since the classic/rowdy
 * system was removed (CONTRADICTIONS C3 / TODO T001) — kept as a hook so call
 * sites stay stable and a future i18n layer has one place to hook into.
 */
export function useCopy() {
  return (key: CopyKey) => COPY[key];
}
