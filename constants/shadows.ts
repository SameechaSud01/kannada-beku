import type { ViewStyle } from 'react-native';
import { Colors } from './colors';

type ShadowToken = Pick<
  ViewStyle,
  'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'
>;

/**
 * Shadow tokens for the modal/overlay system (MODALS §5).
 *
 * Single source of truth for drop shadows used by dialogs, sheets, toasts,
 * takeovers, and decorative medallions. RN's elevation is set on Android
 * to approximate iOS shadow depth; values are tuned, not 1:1.
 */
export const Shadows = {
  modal: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.22,
    shadowRadius: 60,
    elevation: 24,
  } satisfies ShadowToken,

  toastDark: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 18,
  } satisfies ShadowToken,

  toastSoft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 30,
    elevation: 12,
  } satisfies ShadowToken,

  medallion: {
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 22,
    elevation: 12,
  } satisfies ShadowToken,

  // Playful redesign — floating bottom-nav pill (spec_playful_redesign §Spacing,
  // "0 8px 24px rgba(27,29,14,0.16)"). onSurface ink-tinted soft shadow.
  floatingNav: {
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 12,
  } satisfies ShadowToken,

  // Active tab — solid red circle (chunky_v3: depth comes from the redLip lip,
  // not a glow). A tiny ambient lift keeps the circle reading as raised.
  tabActive: {
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  } satisfies ShadowToken,
} as const;

export type ShadowName = keyof typeof Shadows;

/**
 * Chunky-kit "lip" presets (chunky_v3). RN can't render hard-offset box-shadows,
 * so the lip is a `borderBottom` (face colour + lip colour + resting depth). On
 * press the face drops `depth`px and the lip shrinks to keep the bottom edge put
 * (see `ChunkyPressable` / `LipButton`). `disabled` is flat: no lip, no depth.
 */
export const Lips = {
  primary: { face: Colors.primaryContainer, lip: Colors.redLip, depth: 5 },
  red: { face: Colors.primaryContainer, lip: Colors.redLip, depth: 5 },
  redDeep: { face: Colors.primary, lip: Colors.redLipDeep, depth: 5 },
  gold: { face: Colors.secondaryContainer, lip: Colors.goldLip, depth: 5 },
  secondary: { face: '#ffffff', lip: Colors.interactiveSecondaryLip, depth: 4 },
  white: { face: '#ffffff', lip: 'rgba(27,29,14,0.10)', depth: 4 },
  chip: { face: '#ffffff', lip: 'rgba(27,29,14,0.10)', depth: 3 },
  disabled: { face: Colors.surfaceContainerHighest, lip: 'transparent', depth: 0 },
} as const;

export type LipName = keyof typeof Lips;
