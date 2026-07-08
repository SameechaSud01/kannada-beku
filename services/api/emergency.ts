import { EMERGENCY_GROUPS } from '../../constants/emergencyPhrases';

export type EmergencyItem = {
  id: string;
  kannada: string;
  transliteration: string | null;
  meaning: string;
  audioUrl: string | null;
};

export type EmergencyGroup = {
  id: string;
  label: string;
  items: EmergencyItem[];
};

/**
 * Bundled-first (spec_scalability_offline_fixes Phase 2): Emergency is the
 * app's advertised offline surface, so phrases ship in the binary. The
 * emergency_phrases table remains the source for regeneration only —
 * `npm run gen:content` after any dashboard content change.
 */
export async function fetchEmergencyPhrases(): Promise<EmergencyGroup[]> {
  return EMERGENCY_GROUPS;
}
