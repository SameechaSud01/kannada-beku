import type { Icon as TablerIcon } from '@tabler/icons-react-native';
import { Icons } from './icons';

/**
 * Intake "Why are you learning Kannada?" options (spec_onboarding_audit_fixes.md).
 * Exactly these 6 — the audit fixed the below-the-fold problem by trimming the
 * list to compact icon rows that all fit on screen. `label` is what persists in
 * the store (motivations[]); `short` + `Icon` also feed the post-intake
 * greeting's plan chips.
 */
export type MotivationOption = {
  label: string;
  short: string;
  Icon: TablerIcon;
};

export const MOTIVATION_OPTIONS: MotivationOption[] = [
  { label: "Don't want to feel like an outsider", short: 'Belonging', Icon: Icons.moodHappy },
  { label: 'Connect better with Kannadiga friends', short: 'Friends', Icon: Icons.chat },
  {
    label: 'Navigate daily life in Bengaluru',
    short: 'Daily life in Bengaluru',
    Icon: Icons.globe,
  },
  { label: 'Stop getting overcharged (auto, markets)', short: 'Fair prices', Icon: Icons.bolt },
  { label: 'Impress someone special', short: 'Someone special', Icon: Icons.sparkle },
  { label: 'Talk to family and in-laws', short: 'Family', Icon: Icons.home },
];

/** Max simultaneous motivation picks. */
export const MAX_MOTIVATIONS = 3;
