import { useEffect, useRef } from 'react';
import { View, Text, ScrollView, Pressable, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { useCompletedLessons } from '../../hooks/progress';
import { useStreakCelebration } from '../../hooks/useStreakCelebration';
import { useDbLessons } from '../../hooks/useLessons';
import { useProgressStore } from '../../stores/progressStore';
import { PLANNED_LESSON_SLOTS, TOTAL_LESSON_SLOTS } from '../../constants/lessons/plannedLessons';
import { TS_LESSONS_BY_SLUG } from '../../constants/lessons/lessonContent';
import { computePartStates } from '../../constants/lessons/parts';
import { useModal } from '../../components/modals/ModalHost';
import { LessonLockedDialog } from '../../components/modals/instances/LessonLockedDialog';
import { LessonInfoDialog } from '../../components/modals/instances/LessonInfoDialog';
import { BasicsCard } from '../../components/guide/BasicsCard';
import { Watermark } from '../../components/ui/Watermark';
import { TopBar } from '../../components/ui/TopBar';
import { TAB_BAR_CLEARANCE } from '../../components/ui/TabBar';
import { ChunkyPressable } from '../../components/ui/ChunkyPressable';
import { ChunkyCircle, ChunkyLip } from '../../components/ui/ChunkyLip';
import { LockTile } from '../../components/ui/LockTile';
import { LearnSkeleton } from '../../components/states/skeletons/TabSkeletons';
import { ErrorState } from '../../components/states/ErrorState';
import { OfflineState } from '../../components/states/OfflineState';
import { useIsOffline } from '../../hooks/useIsOffline';

const ESTIMATED_MIN_PER_LESSON = 5;

type RowState = 'done' | 'active' | 'locked';

type LessonRow = {
  slot: number;
  state: RowState;
  title: string;
  subtitle: string;
  char: string;
  phraseCount: number;
  realLessonSlug?: string;
  prevTitle?: string;
  prevSlug?: string;
  /** Sub-part progress for the in-progress lesson (0 when not split / not active). */
  partsDone: number;
  partsTotal: number;
};

export default function LearnScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const completedLessons = useCompletedLessons();
  const completedParts = useProgressStore((s) => s.completedParts);
  const { streak, onStreakPress } = useStreakCelebration();
  const modal = useModal();
  const lessonsQuery = useDbLessons();
  const dbLessons = lessonsQuery.data ?? [];
  const offline = useIsOffline();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(4)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, []);

  const completedCount = Math.min(completedLessons.length, TOTAL_LESSON_SLOTS);

  const rows: LessonRow[] = PLANNED_LESSON_SLOTS.map((slot, idx) => {
    const real = dbLessons.find((l) => l.lessonNo === slot.slot);
    const prevReal = dbLessons.find((l) => l.lessonNo === slot.slot - 1);
    const n = idx + 1;

    let state: RowState;
    if (n <= completedCount) state = 'done';
    else if (n === completedCount + 1) state = 'active';
    else state = 'locked';

    // Sub-part progress is only meaningful for the in-progress lesson that is
    // actually split into sections (TS-canonical content).
    let partsDone = 0;
    let partsTotal = 0;
    if (state === 'active' && real?.slug) {
      const canonical = TS_LESSONS_BY_SLUG[real.slug];
      if (canonical && canonical.sections.length > 1) {
        const states = computePartStates(canonical, new Set(completedParts), false);
        partsTotal = states.length;
        partsDone = states.filter((p) => p.done).length;
      }
    }

    return {
      slot: n,
      state,
      title: real?.title ?? slot.title,
      subtitle: slot.subtitle,
      char: slot.charPlaceholder,
      phraseCount: real?.phrases.length ?? 0,
      realLessonSlug: real?.slug,
      prevTitle: idx > 0 ? (prevReal?.title ?? PLANNED_LESSON_SLOTS[idx - 1].title) : undefined,
      prevSlug: prevReal?.slug,
      partsDone,
      partsTotal,
    };
  });

  const handleRowPress = (row: LessonRow) => {
    if (row.state === 'locked') {
      const prevSlot = row.slot - 1;
      modal.show({
        kind: 'dialog',
        component: LessonLockedDialog,
        props: {
          lessonNumber: row.slot,
          lessonTitle: row.title,
          prevLessonNumber: prevSlot,
          prevLessonTitle: row.prevTitle ?? `Lesson ${prevSlot}`,
          onGoToPrev: () => {
            modal.dismiss();
            if (row.prevSlug) router.push(`/lesson/${row.prevSlug}`);
          },
          onDismiss: () => modal.dismiss(),
        },
        dim: 0.4,
      });
      return;
    }
    if (row.realLessonSlug) {
      router.push(`/lesson/${row.realLessonSlug}`);
    }
  };

  const handleInfoPress = (row: LessonRow) => {
    const prevSlot = row.slot - 1;
    modal.show({
      kind: 'dialog',
      component: LessonInfoDialog,
      props: {
        lessonNumber: row.slot,
        lessonTitle: row.title,
        description: row.subtitle,
        phraseCount: row.phraseCount,
        estimatedMinutes: ESTIMATED_MIN_PER_LESSON,
        locked: row.state === 'locked',
        prevLessonNumber: row.state === 'locked' ? prevSlot : undefined,
        prevLessonTitle:
          row.state === 'locked' ? (row.prevTitle ?? `Lesson ${prevSlot}`) : undefined,
        onDismiss: () => modal.dismiss(),
      },
      dim: 0.4,
    });
  };

  // First-load shimmer while lessons fetch — same chrome, no reflow on arrival.
  if (lessonsQuery.isLoading) return <LearnSkeleton streak={streak} />;

  // A failed fetch must not silently render placeholder lesson titles (audit
  // B5/H1): offline → reassuring caution state; otherwise a genuine error.
  if (lessonsQuery.isError) {
    return offline ? (
      <OfflineState
        onRetry={() => lessonsQuery.refetch()}
        onPracticeOffline={() => router.push('/emergency')}
      />
    ) : (
      <ErrorState onRetry={() => lessonsQuery.refetch()} />
    );
  }

  return (
    <Animated.View
      style={{
        flex: 1,
        backgroundColor: Colors.surfaceCream,
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <Watermark motif="kolamGrid" />

      <TopBar streak={streak} onStreakPress={onStreakPress} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: TAB_BAR_CLEARANCE + insets.bottom }}
      >
        {/* Page title */}
        <View style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg }}>
          <Text
            style={{
              fontFamily: Fonts.baloo.extrabold,
              fontSize: moderateScale(32),
              color: Colors.onSurface,
              letterSpacing: -0.5,
              lineHeight: moderateScale(45),
            }}
            maxFontSizeMultiplier={1.2}
          >
            Lessons
          </Text>
          <Text
            style={{
              fontFamily: Fonts.dmSans.medium,
              fontSize: moderateScale(15),
              color: Colors.tertiary,
              marginTop: moderateScale(2),
            }}
            maxFontSizeMultiplier={1.4}
          >
            {TOTAL_LESSON_SLOTS} steps to speaking.
          </Text>
        </View>

        <View
          style={{
            paddingHorizontal: Spacing.lg,
            paddingTop: Spacing.lg,
            marginBottom: moderateScale(14),
          }}
        >
          <BasicsCard />
        </View>

        <View style={{ paddingHorizontal: Spacing.lg, gap: moderateScale(11) }}>
          {rows.map((row) => (
            <LessonRowView
              key={`slot-${row.slot}`}
              row={row}
              onPress={() => handleRowPress(row)}
              onInfoPress={() => handleInfoPress(row)}
            />
          ))}
        </View>
      </ScrollView>
    </Animated.View>
  );
}

function LessonRowView({
  row,
  onPress,
  onInfoPress,
}: {
  row: LessonRow;
  onPress: () => void;
  onInfoPress: () => void;
}) {
  const isLocked = row.state === 'locked';
  const isDone = row.state === 'done';
  const isActive = row.state === 'active';

  const titleColor = isLocked ? Colors.textFaint : Colors.onSurface;

  const content = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: moderateScale(13),
        padding: moderateScale(12),
      }}
    >
      {/* Glyph tile / lock */}
      {isLocked ? (
        <LockTile size={50} radius={moderateScale(14)} />
      ) : (
        <ChunkyLip
          size={moderateScale(50)}
          radius={moderateScale(14)}
          depth={moderateScale(3)}
          bg={isActive ? Colors.primaryContainer : Colors.secondaryFixed}
          lipColor={isActive ? Colors.redLip : Colors.goldLip}
        >
          <Text
            style={{
              fontFamily: Fonts.baloo.extrabold,
              fontSize: moderateScale(26),
              includeFontPadding: false,
              textAlign: 'center',
              textAlignVertical: 'center',
              color: isActive ? Colors.onPrimary : Colors.onSecondaryContainer,
            }}
            maxFontSizeMultiplier={1.2}
          >
            {row.slot}
          </Text>
        </ChunkyLip>
      )}

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: Fonts.baloo.bold,
            fontSize: moderateScale(17),
            color: titleColor,
            letterSpacing: -0.2,
          }}
          maxFontSizeMultiplier={1.3}
          numberOfLines={1}
        >
          {row.title}
        </Text>
        {isActive && row.partsTotal > 1 ? (
          <PartProgressBar done={row.partsDone} total={row.partsTotal} />
        ) : null}
      </View>

      <Pressable
        onPress={onInfoPress}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={`About Lesson ${row.slot}: ${row.title}`}
        style={({ pressed }) => ({ padding: moderateScale(4), opacity: pressed ? 0.5 : 1 })}
      >
        <Icons.info size={moderateScale(18)} color={Colors.tertiary} />
      </Pressable>

      {/* Trailing affordance */}
      {isDone ? (
        <ChunkyCircle
          size={moderateScale(26)}
          depth={moderateScale(2)}
          bg={Colors.secondaryContainer}
          lipColor={Colors.goldLip}
        >
          <Icons.check
            size={moderateScale(15)}
            color={Colors.onSecondaryContainer}
            strokeWidth={2.6}
          />
        </ChunkyCircle>
      ) : isActive ? (
        <ChunkyCircle
          size={moderateScale(42)}
          depth={moderateScale(3)}
          bg={Colors.primaryContainer}
          lipColor={Colors.redLip}
        >
          <Icons.play size={moderateScale(16)} color={Colors.onPrimary} />
        </ChunkyCircle>
      ) : (
        <View style={{ width: moderateScale(26) }} />
      )}
    </View>
  );

  const a11yLabel = isLocked
    ? `Locked. Complete ${row.prevTitle ?? 'the previous lesson'} to unlock.`
    : `${row.slot}. ${row.title}${isDone ? ', completed' : ', start'}`;

  // Locked rows are de-emphasised and flat (no lip / no press-translate).
  if (isLocked) {
    return (
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={a11yLabel}>
        <View
          style={{
            backgroundColor: Colors.surfaceCreamLow,
            borderRadius: Radius.chunky,
            borderWidth: 1,
            borderColor: 'rgba(217,123,58,0.30)',
            opacity: 0.85,
          }}
        >
          {content}
        </View>
      </Pressable>
    );
  }

  return (
    <ChunkyPressable
      onPress={onPress}
      accessibilityLabel={a11yLabel}
      bg="#ffffff"
      lip={isActive ? 5 : 4}
      lipColor={isActive ? Colors.redLip : Colors.cardLip}
      border
      borderColor={isActive ? Colors.primaryContainer : Colors.hairline}
      borderWidth={isActive ? 2 : 1}
      radius={Radius.chunky}
    >
      {content}
    </ChunkyPressable>
  );
}

/**
 * Segmented sub-part progress for the in-progress lesson card — one segment per
 * section, filled in order as each section is completed.
 */
function PartProgressBar({ done, total }: { done: number; total: number }) {
  return (
    <View
      style={{ flexDirection: 'row', gap: moderateScale(5), marginTop: moderateScale(7) }}
      accessibilityRole="progressbar"
      accessibilityLabel={`${done} of ${total} parts complete`}
    >
      {Array.from({ length: total }).map((_, i) => {
        const filled = i < done;
        return (
          <View
            key={i}
            style={{
              flex: 1,
              height: moderateScale(7),
              borderRadius: moderateScale(4),
              backgroundColor: filled ? Colors.secondaryContainer : Colors.surfaceCreamLow,
              borderBottomWidth: filled ? 2 : 0,
              borderBottomColor: Colors.goldLip,
              borderWidth: filled ? 0 : 1,
              borderColor: 'rgba(201,138,0,0.25)',
            }}
          />
        );
      })}
    </View>
  );
}
