/**
 * Single source of truth for every icon in the app (Spec 03).
 *
 * Rules:
 *   1. ONE library — `@tabler/icons-react-native` outline weight (pinned in
 *      package.json).
 *   2. Never reach into the library directly from a component. Every icon comes
 *      from this map so swaps stay one-line.
 *   3. No hand-drawn inline SVGs for iconography. (Illustrations / brand marks
 *      are not icons and are out of scope.)
 *   4. No emoji glyphs in UI.
 *
 * Sizing (Spec 03 §sizing):
 *   - Tab bar: 19
 *   - Inline / list / chip: 16–21
 *   - Decorative max: 24
 *   - Never below 11
 *
 * Colour: inherit from parent per Spec 02 — primary for actions, tertiary for
 * muted, onPrimary on primary fills.
 */
import {
  IconAlertTriangle,
  IconArrowBackUp,
  IconArrowLeft,
  IconArrowsLeftRight,
  IconBell,
  IconBolt,
  IconBook2,
  IconCar,
  IconCheck,
  IconChevronRight,
  IconCircle,
  IconCircleCheck,
  IconCircleX,
  IconFlame,
  IconHeadphones,
  IconHelpCircle,
  IconClock,
  IconEye,
  IconEyeOff,
  IconHome,
  IconInfoCircle,
  IconLock,
  IconMessage2,
  IconMessages,
  IconMicrophone,
  IconMoodHappy,
  IconMoodNeutral,
  IconMoodSad,
  IconPhoto,
  IconPlayerPlayFilled,
  IconRefresh,
  IconSparkles,
  IconStack2,
  IconStarFilled,
  IconTargetArrow,
  IconTrophy,
  IconUrgent,
  IconUser,
  IconVolume,
  IconWifiOff,
  IconX,
} from '@tabler/icons-react-native';

export const Icons = {
  // Tab bar
  tabHome: IconHome,
  tabLearn: IconBook2,
  // Beginners' Guide entry (Learn tab card, spec_beginners_guide.md)
  book: IconBook2,
  tabPractice: IconTargetArrow, // changed from microphone (user-confirmed, Spec 03)
  tabProfile: IconUser,

  // Global / shared
  streak: IconFlame,
  audio: IconVolume,
  forward: IconChevronRight,
  back: IconArrowLeft,
  // In-lesson "previous step" affordance — distinct from the exit-lesson back
  // chip (spec_lesson_runner_ux §2.2).
  stepBack: IconArrowBackUp,
  lessonDone: IconCircleCheck,
  locked: IconLock,
  emergency: IconUrgent,
  phrasePool: IconStack2,

  // Practice games
  gameQuickQuiz: IconBolt,
  gameImageMatch: IconPhoto,
  gameDictation: IconHeadphones,
  gameConversations: IconMessages,
  gameOpposites: IconArrowsLeftRight,

  // Emergency guide groups
  emAuto: IconCar,
  emHelp: IconAlertTriangle,
  emBasic: IconMessage2,

  // Settings rows
  setReminders: IconBell,
  setAudio: IconVolume,
  setHelp: IconHelpCircle,

  // Password field show/hide toggle + requirement checklist
  eye: IconEye,
  eyeOff: IconEyeOff,
  ruleMet: IconCircleCheck,
  ruleUnmet: IconCircle,

  // Onboarding
  info: IconInfoCircle,
  clock: IconClock,

  // Lesson runner — practice / shadowing feedback glyphs
  correct: IconCircleCheck,
  wrong: IconCircleX,
  close: IconX,
  mic: IconMicrophone,
  ratingEasy: IconMoodHappy,
  ratingOk: IconMoodNeutral,
  ratingHard: IconMoodSad,

  // Modal system (Spec MODALS)
  x: IconX,
  play: IconPlayerPlayFilled,
  bell: IconBell,
  check: IconCheck,
  headphones: IconHeadphones,
  sparkle: IconSparkles,
  flame: IconFlame,
  lock: IconLock,
  bolt: IconBolt, // streak-detail milestone nudge

  // Celebration overlay (spec_playful_redesign §Celebration)
  trophy: IconTrophy, // lesson complete
  star: IconStarFilled, // level up

  // System states (failure full-screens)
  refresh: IconRefresh, // "Try again" on error/offline screens
  wifiOff: IconWifiOff, // full-screen offline caution well
} as const;

export type IconName = keyof typeof Icons;
