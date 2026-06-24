import { View, Text } from 'react-native';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';
import { Spacing, Radius } from '../../../constants/spacing';
import { Icons } from '../../../constants/icons';
import { useProgressStore } from '../../../stores/progressStore';
import { localDateISO } from '../../../utils/date';
import { useCompletedLessons } from '../../../hooks/progress';
import { useDbLessons } from '../../../hooks/useLessons';
import { STREAK_MILESTONES } from './StreakMilestoneTakeover';
import { RemindersSheet } from './RemindersSheet';
import { useModal } from '../ModalHost';
import { LipButton } from '../../ui/LipButton';
import { ChunkyCircle } from '../../ui/ChunkyLip';

/** ink = onSurface (#1b1d0e); the spec sizes the dashed/dot greys as alpha ink. */
const ink = (alpha: number) => `rgba(27,29,14,${alpha})`;

/** Deep gold for flame/text on gold-pale surfaces (no dedicated `goldDeep` token). */
const GOLD_DEEP = Colors.onSecondaryContainer;

type CellState = 'done' | 'today' | 'future';
interface DayCell {
  iso: string;
  letter: string;
  full: string;
  state: CellState;
}

const WEEKDAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;
const WEEKDAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

const getTodayISO = () => localDateISO();

/**
 * Build the current week Mon→Sun from the persisted `weeklyActivity` map.
 * `todayISO` is the local calendar day (matching how the store now stamps day
 * keys — audit H3); the UTC arithmetic below is pure calendar math on that
 * date string, so a day-dot never drifts off its stored key.
 */
function buildWeek(todayISO: string, weeklyActivity: Record<string, boolean>): DayCell[] {
  const base = new Date(`${todayISO}T00:00:00Z`);
  const mondayOffset = (base.getUTCDay() + 6) % 7; // days since this week's Monday
  const monday = new Date(base);
  monday.setUTCDate(base.getUTCDate() - mondayOffset);

  return WEEKDAY_LETTERS.map((letter, i) => {
    const d = new Date(monday);
    d.setUTCDate(monday.getUTCDate() + i);
    const iso = d.toISOString().split('T')[0];
    const done = weeklyActivity[iso] === true;
    const isToday = iso === todayISO;
    // A past missed day renders as future/empty (spec) — only `done` or today are special.
    const state: CellState = done ? 'done' : isToday ? 'today' : 'future';
    return { iso, letter, full: WEEKDAY_NAMES[i], state };
  });
}

/** First milestone above the current streak, or null past the top of the ladder. */
function nextMilestoneFor(streak: number): number | null {
  return STREAK_MILESTONES.find((m) => m > streak) ?? null;
}

export function StreakDetailSheet() {
  const router = useRouter();
  const modal = useModal();

  const streak = useProgressStore((s) => s.streak);
  const weeklyActivity = useProgressStore((s) => s.weeklyActivity);

  const completed = useCompletedLessons();
  const dbLessons = useDbLessons().data ?? [];
  const completedSet = new Set(completed);
  const nextLessonSlot = dbLessons.find(
    (l) => !completedSet.has(l.slug) && (l.words.length > 0 || l.phrases.length > 0),
  );

  const todayISO = getTodayISO();
  const days = buildWeek(todayISO, weeklyActivity);
  const todayDone = weeklyActivity[todayISO] === true;
  const nextMilestone = nextMilestoneFor(streak);
  const daysToNext = nextMilestone != null ? nextMilestone - streak : 0;

  const title =
    streak === 0 ? 'Start your streak today' : `${streak}-day streak`;
  const subtitle =
    streak === 0 ? 'Practise once today to light it up.' : 'Your best run yet';

  function onSetReminder() {
    modal.show({ kind: 'sheet', component: RemindersSheet });
  }

  function onKeepLearning() {
    modal.dismiss();
    if (nextLessonSlot) router.push(`/lesson/${nextLessonSlot.slug}`);
  }

  return (
    <BottomSheetView
      accessibilityLabel="Streak details"
      style={{
        paddingHorizontal: moderateScale(24),
        paddingTop: moderateScale(14),
        paddingBottom: moderateScale(28),
      }}
    >
      {/* Hero row — flame medallion + title/subtitle */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: moderateScale(16),
          marginBottom: moderateScale(20),
        }}
      >
        <ChunkyCircle
          size={moderateScale(64)}
          depth={moderateScale(5)}
          bg={Colors.secondaryContainer}
          lipColor={Colors.goldLip}
        >
          {/* Gradient face overlaid on the coin; flame sits centred on top. */}
          <LinearGradient
            colors={[Colors.goldBright, Colors.secondaryContainer]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{
              position: 'absolute',
              width: moderateScale(64),
              height: moderateScale(64),
              borderRadius: moderateScale(32),
            }}
          />
          <Icons.streak
            size={moderateScale(32)}
            color={Colors.primaryContainer}
            strokeWidth={2.2}
          />
        </ChunkyCircle>
        <View style={{ flex: 1, gap: moderateScale(2) }}>
          <Text
            style={{
              fontFamily: Fonts.baloo.extrabold,
              fontSize: moderateScale(22),
              lineHeight: moderateScale(32),
              color: Colors.onSurface,
              letterSpacing: -0.4,
              paddingBottom: moderateScale(2),
            }}
            numberOfLines={1}
            adjustsFontSizeToFit
            maxFontSizeMultiplier={1.2}
          >
            {title}
          </Text>
          <Text
            style={{
              fontFamily: Fonts.dmSans.medium,
              fontSize: moderateScale(13),
              color: Colors.tertiary,
            }}
            maxFontSizeMultiplier={1.3}
          >
            {subtitle}
          </Text>
        </View>
      </View>

      {/* THIS WEEK eyebrow */}
      <Text
        style={{
          fontFamily: Fonts.dmSans.bold,
          fontSize: moderateScale(11),
          letterSpacing: 1.4,
          textTransform: 'uppercase',
          color: Colors.textFaint,
          marginBottom: moderateScale(12),
        }}
        maxFontSizeMultiplier={1.4}
      >
        This week
      </Text>

      {/* Day-dots row — 7 equal cells */}
      <View style={{ flexDirection: 'row', gap: moderateScale(6), marginBottom: moderateScale(20) }}>
        {days.map((d) => (
          <DayDot key={d.iso} cell={d} />
        ))}
      </View>

      {/* Milestone nudge */}
      <MilestoneNudge
        nextMilestone={nextMilestone}
        daysToNext={daysToNext}
        streak={streak}
        todayDone={todayDone}
      />

      {/* Actions */}
      <View style={{ flexDirection: 'row', gap: moderateScale(10), marginTop: moderateScale(20) }}>
        <View style={{ flex: 1 }}>
          <LipButton
            label="Set a reminder"
            variant="secondary"
            onPress={onSetReminder}
            accessibilityLabel="Set a reminder"
          />
        </View>
        <View style={{ flex: 1 }}>
          <LipButton
            label="Keep learning"
            variant="primary"
            onPress={onKeepLearning}
            accessibilityLabel="Keep learning"
          />
        </View>
      </View>
    </BottomSheetView>
  );
}

/** One weekday cell: letter label + 38px state circle (done / today / future). */
function DayDot({ cell }: { cell: DayCell }) {
  const { letter, full, state } = cell;

  const a11y =
    state === 'done'
      ? `${full}, practised`
      : state === 'today'
        ? `${full}, today, not yet`
        : `${full}, upcoming`;

  return (
    <View
      style={{ flex: 1, alignItems: 'center', gap: moderateScale(6) }}
      accessibilityLabel={a11y}
      accessible
    >
      <Text
        style={{
          fontFamily: Fonts.dmSans.bold,
          fontSize: moderateScale(11),
          color: state === 'future' ? Colors.textFaint : Colors.tertiary,
        }}
        maxFontSizeMultiplier={1.3}
      >
        {letter}
      </Text>
      {state === 'done' ? (
        <ChunkyCircle
          size={moderateScale(38)}
          depth={moderateScale(3)}
          bg={Colors.secondaryFixed}
          lipColor={Colors.goldLip}
          border
          borderColor={Colors.goldLip}
        >
          <Icons.streak size={moderateScale(16)} color={GOLD_DEEP} strokeWidth={2.4} />
        </ChunkyCircle>
      ) : state === 'today' ? (
        <ChunkyCircle
          size={moderateScale(38)}
          depth={moderateScale(3)}
          bg={Colors.primaryContainer}
          lipColor={Colors.redLip}
        >
          <Icons.streak size={moderateScale(16)} color="#ffffff" strokeWidth={2.4} />
        </ChunkyCircle>
      ) : (
        <View
          style={{
            width: moderateScale(38),
            height: moderateScale(38),
            borderRadius: moderateScale(19),
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderStyle: 'dashed',
            borderColor: ink(0.18),
          }}
        >
          <View
            style={{
              width: moderateScale(5),
              height: moderateScale(5),
              borderRadius: moderateScale(2.5),
              backgroundColor: ink(0.2),
            }}
          />
        </View>
      )}
    </View>
  );
}

/**
 * Gold nudge card. Counts down to the next badge from the same ladder as
 * `isStreakMilestone`; past the top milestone it switches to a maintenance line.
 */
function MilestoneNudge({
  nextMilestone,
  daysToNext,
  streak,
  todayDone,
}: {
  nextMilestone: number | null;
  daysToNext: number;
  streak: number;
  todayDone: boolean;
}) {
  const numberStyle = {
    fontFamily: Fonts.baloo.extrabold,
    fontSize: moderateScale(13),
    color: GOLD_DEEP,
  } as const;
  const textStyle = {
    flex: 1,
    fontFamily: Fonts.dmSans.bold,
    fontSize: moderateScale(13),
    color: GOLD_DEEP,
    lineHeight: moderateScale(18),
  } as const;

  const when = todayDone ? 'tomorrow' : 'today';

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: moderateScale(12),
        backgroundColor: Colors.secondaryFixed,
        borderRadius: Radius.lg,
        borderBottomWidth: moderateScale(4),
        borderBottomColor: Colors.goldLip,
        paddingVertical: moderateScale(13),
        paddingHorizontal: moderateScale(16),
      }}
    >
      <Icons.bolt size={moderateScale(20)} color={Colors.primaryContainer} strokeWidth={2.4} />
      {nextMilestone != null ? (
        <Text style={textStyle} maxFontSizeMultiplier={1.3}>
          <Text style={numberStyle}>{daysToNext}</Text>
          {` day${daysToNext === 1 ? '' : 's'} to your `}
          <Text style={numberStyle}>{nextMilestone}</Text>
          {`-day badge — practise ${when} to claim it.`}
        </Text>
      ) : (
        <Text style={textStyle} maxFontSizeMultiplier={1.3}>
          {`You're on a `}
          <Text style={numberStyle}>{streak}</Text>
          {`-day roll — don't break the chain.`}
        </Text>
      )}
    </View>
  );
}
