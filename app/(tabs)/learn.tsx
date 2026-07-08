import { useEffect, useRef } from 'react';
import { View, Text, ScrollView, Animated } from 'react-native';
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
import { BasicsCard } from '../../components/guide/BasicsCard';
import { Watermark } from '../../components/ui/Watermark';
import { TopBar } from '../../components/ui/TopBar';
import { TAB_BAR_CLEARANCE } from '../../components/ui/TabBar';
import { ChunkyPressable } from '../../components/ui/ChunkyPressable';
import { ChunkyCircle } from '../../components/ui/ChunkyLip';
import { LearnSkeleton } from '../../components/states/skeletons/TabSkeletons';
import { ErrorState } from '../../components/states/ErrorState';
import { OfflineState } from '../../components/states/OfflineState';
import { useIsOffline } from '../../hooks/useIsOffline';

type RowState = 'done' | 'active' | 'locked';

type LessonRow = {
  slot: number;
  state: RowState;
  title: string;
  subtitle: string;
  realLessonSlug?: string;
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
      realLessonSlug: real?.slug,
      partsDone,
      partsTotal,
    };
  });

  const handleRowPress = (row: LessonRow) => {
    if (row.state !== 'locked' && row.realLessonSlug) {
      router.push(`/lesson/${row.realLessonSlug}`);
    }
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
        {/* Page title + lessons-done progress header */}
        <View
          style={{
            paddingHorizontal: Spacing.lg,
            paddingTop: Spacing.lg,
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: Spacing.md,
          }}
        >
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
          <View style={{ alignItems: 'flex-end', paddingBottom: moderateScale(10) }}>
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: moderateScale(13),
                color: Colors.secondary,
              }}
              maxFontSizeMultiplier={1.3}
            >
              {completedCount} of {TOTAL_LESSON_SLOTS} done
            </Text>
            <View
              accessibilityRole="progressbar"
              accessibilityLabel={`${completedCount} of ${TOTAL_LESSON_SLOTS} lessons done`}
              style={{
                width: moderateScale(96),
                height: moderateScale(10),
                borderRadius: Radius.full,
                backgroundColor: Colors.surfaceCreamLow,
                borderWidth: 1,
                borderColor: Colors.hairline,
                marginTop: moderateScale(5),
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  width: `${(completedCount / TOTAL_LESSON_SLOTS) * 100}%`,
                  height: '100%',
                  borderRadius: Radius.full,
                  backgroundColor: Colors.secondaryContainer,
                }}
              />
            </View>
          </View>
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

        {/* Tracked eyebrow above the lesson list (replaces the old subtitle). */}
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(11),
            letterSpacing: 1.4,
            color: Colors.tertiary,
            paddingHorizontal: Spacing.lg,
            marginBottom: moderateScale(10),
          }}
          maxFontSizeMultiplier={1.4}
        >
          {TOTAL_LESSON_SLOTS} STEPS TO SPEAKING
        </Text>

        <View style={{ paddingHorizontal: Spacing.lg, gap: moderateScale(11) }}>
          {rows.map((row) => (
            <LessonRowView key={`slot-${row.slot}`} row={row} onPress={() => handleRowPress(row)} />
          ))}
        </View>
      </ScrollView>
    </Animated.View>
  );
}

const BADGE = 46;
const BADGE_RADIUS = 13;

function LessonRowView({ row, onPress }: { row: LessonRow; onPress: () => void }) {
  const isLocked = row.state === 'locked';
  const isDone = row.state === 'done';
  const isActive = row.state === 'active';

  const content = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: moderateScale(13),
        padding: moderateScale(12),
      }}
    >
      {/* Flat cream number badge — status, not a button (no lip). */}
      <View
        style={{
          width: moderateScale(BADGE),
          height: moderateScale(BADGE),
          borderRadius: moderateScale(BADGE_RADIUS),
          backgroundColor: Colors.surfaceCreamLow,
          borderWidth: 1,
          borderColor: Colors.hairline,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.baloo.bold,
            fontSize: moderateScale(20),
            includeFontPadding: false,
            color: isLocked ? Colors.textFaint : Colors.onSurface,
          }}
          maxFontSizeMultiplier={1.2}
        >
          {row.slot}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: Fonts.baloo.bold,
            fontSize: moderateScale(18),
            color: isLocked ? Colors.textFaint : Colors.onSurface,
            letterSpacing: -0.2,
          }}
          maxFontSizeMultiplier={1.3}
          numberOfLines={1}
        >
          {row.title}
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.medium,
            fontSize: moderateScale(13),
            color: isLocked ? Colors.textFaint : Colors.tertiary,
            marginTop: moderateScale(1),
          }}
          maxFontSizeMultiplier={1.3}
          numberOfLines={1}
        >
          {row.subtitle}
        </Text>
        {isActive && row.partsTotal > 1 ? (
          <PartProgressBar done={row.partsDone} total={row.partsTotal} />
        ) : null}
      </View>

      {/* Trailing affordance */}
      {isDone ? (
        // Flat gold check — earned status, not a button (no lip).
        <View
          style={{
            width: moderateScale(38),
            height: moderateScale(38),
            borderRadius: Radius.full,
            backgroundColor: Colors.secondaryContainer,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icons.check
            size={moderateScale(19)}
            color={Colors.onSecondaryContainer}
            strokeWidth={2.6}
          />
        </View>
      ) : isActive ? (
        <ChunkyCircle
          size={moderateScale(BADGE)}
          depth={moderateScale(3)}
          bg={Colors.primaryContainer}
          lipColor={Colors.redLip}
        >
          <Icons.play size={moderateScale(17)} color={Colors.onPrimary} />
        </ChunkyCircle>
      ) : (
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(12),
            color: Colors.textFaint,
            marginRight: moderateScale(4),
          }}
          maxFontSizeMultiplier={1.3}
        >
          Soon
        </Text>
      )}
    </View>
  );

  // Locked / not-built rows are flat and inert — "Soon", not an error.
  if (isLocked) {
    return (
      <View
        accessibilityLabel={`Lesson ${row.slot}: ${row.title}. Coming soon.`}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: Radius.chunky,
          borderWidth: 1,
          borderColor: Colors.hairline,
          opacity: 0.65,
        }}
      >
        {content}
      </View>
    );
  }

  return (
    <ChunkyPressable
      onPress={onPress}
      accessibilityLabel={`${row.slot}. ${row.title}${isDone ? ', completed' : ', start'}`}
      bg="#ffffff"
      lip={isActive ? 3 : 4}
      // The lip doubles as the bottom border edge, so the up-next card's lip
      // goes red too — otherwise the 2px red border only wraps three sides.
      lipColor={isActive ? Colors.primaryContainer : Colors.cardLip}
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
