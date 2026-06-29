import { useEffect, useRef } from 'react';
import { View, Text, ScrollView, Pressable, Animated as RNAnimated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { useAuthStore } from '../../stores/useAuthStore';
import { useDbLessons } from '../../hooks/useLessons';
import { useUserStore } from '../../stores/useUserStore';
import { PLANNED_LESSON_SLOTS, TOTAL_LESSON_SLOTS } from '../../constants/lessons/plannedLessons';
import { WEEKLY_WORD_TARGET } from '../../constants/goals';
import { formatFirstName } from '../../utils/formatName';
import { useCompletedLessons, useWordsLearned, useDailyGoal } from '../../hooks/progress';
import { useStreakCelebration } from '../../hooks/useStreakCelebration';
import { useModal } from '../../components/modals/ModalHost';
import {
  WordsLearnedSheet,
  type WordsLearnedGroup,
} from '../../components/modals/instances/WordsLearnedSheet';
import { RingInfoSheet } from '../../components/modals/instances/RingInfoSheet';
import { Toasts } from '../../components/modals/instances/toastCatalog';
import { ChunkyPressable } from '../../components/ui/ChunkyPressable';
import { ChunkyCircle, ChunkyLip } from '../../components/ui/ChunkyLip';
import { MultiProgressRing } from '../../components/ui/ProgressRing';
import { Watermark } from '../../components/ui/Watermark';
import { TopBar } from '../../components/ui/TopBar';
import { TAB_BAR_CLEARANCE } from '../../components/ui/TabBar';
import { HomeSkeleton } from '../../components/states/skeletons/TabSkeletons';
import { ErrorState } from '../../components/states/ErrorState';
import { OfflineState } from '../../components/states/OfflineState';
import { useIsOffline } from '../../hooks/useIsOffline';

const ESTIMATED_MIN_PER_LESSON = 5;

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const completedLessons = useCompletedLessons();
  const wordsLearned = useWordsLearned();
  const daily = useDailyGoal();
  const { streak, onStreakPress } = useStreakCelebration();
  const modal = useModal();
  const user = useAuthStore((s) => s.user);
  const displayName = useUserStore((s) => s.displayName);
  const lessonsQuery = useDbLessons();
  const dbLessons = lessonsQuery.data ?? [];
  const offline = useIsOffline();

  const fadeAnim = useRef(new RNAnimated.Value(0)).current;
  const slideAnim = useRef(new RNAnimated.Value(4)).current;

  useEffect(() => {
    RNAnimated.parallel([
      RNAnimated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      RNAnimated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, []);

  // One-time nudge pointing at the Learn-tab Beginners' Guide card.
  const hasSeenBasicsGuide = useUserStore((s) => s.hasSeenBasicsGuide);
  const hasSeenBasicsHomeNudge = useUserStore((s) => s.hasSeenBasicsHomeNudge);
  const userHydrated = useUserStore((s) => s.isHydrated);
  const setHasSeenBasicsHomeNudge = useUserStore((s) => s.setHasSeenBasicsHomeNudge);
  useEffect(() => {
    if (!userHydrated) return;
    if (!hasSeenBasicsGuide) return;
    if (hasSeenBasicsHomeNudge) return;
    Toasts.basicsHomeNudge();
    setHasSeenBasicsHomeNudge(true);
  }, [userHydrated, hasSeenBasicsGuide, hasSeenBasicsHomeNudge, setHasSeenBasicsHomeNudge]);

  const rawName =
    displayName ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'there';
  const userName = formatFirstName(rawName, 'there');

  const completedSlugSet = new Set(completedLessons);
  const completedCount = Math.min(completedLessons.length, TOTAL_LESSON_SLOTS);

  // Never offer a lesson whose content_json is empty (would render blank phases).
  const nextLessonSlot = dbLessons.find(
    (l) => !completedSlugSet.has(l.slug) && (l.words.length > 0 || l.phrases.length > 0),
  );
  const nextSlot = PLANNED_LESSON_SLOTS[completedCount];
  const nextTitle = nextLessonSlot?.title ?? nextSlot?.title ?? 'All caught up';
  const lessonNo = completedCount + 1;
  const allDone = completedCount >= TOTAL_LESSON_SLOTS;

  const handleStartNext = () => {
    if (nextLessonSlot) router.push(`/lesson/${nextLessonSlot.slug}`);
  };

  // Words-learnt reward banner — progress toward a fixed weekly word target.
  const wordPct = Math.max(0, Math.min(100, Math.round((wordsLearned / WEEKLY_WORD_TARGET) * 100)));

  // Every word & phrase from completed lessons, grouped by lesson, for the
  // "Words learnt" sheet. Mirrors the count (words + phrases per lesson).
  const learnedGroups: WordsLearnedGroup[] = dbLessons
    .filter((l) => completedSlugSet.has(l.slug) && (l.words.length > 0 || l.phrases.length > 0))
    .map((l) => ({ title: l.title, items: [...l.words, ...l.phrases] }));

  const openWordsLearned = () =>
    modal.show({
      kind: 'sheet',
      component: WordsLearnedSheet,
      props: { groups: learnedGroups, total: wordsLearned, onDismiss: () => modal.dismiss() },
    });

  const openRingInfo = () =>
    modal.show({
      kind: 'sheet',
      component: RingInfoSheet,
      props: { onDismiss: () => modal.dismiss() },
    });

  // Daily-goal rings now read real per-day activity counts (useDailyGoal):
  // Listen = audio played in-app, Speak = practice-phase reps, Practice = game
  // questions answered. Resets at midnight.

  // First-load shimmer while lessons fetch — same chrome, no reflow on arrival.
  if (lessonsQuery.isLoading) return <HomeSkeleton streak={streak} />;

  // A failed fetch must not silently render placeholder content (audit B5/H1).
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
    <RNAnimated.View
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
        <View
          style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, gap: moderateScale(11) }}
        >
          {/* Greeting */}
          <View style={{ marginBottom: moderateScale(2) }}>
            <Text
              style={{
                fontFamily: Fonts.baloo.extrabold,
                fontSize: moderateScale(32),
                color: Colors.onSurface,
                letterSpacing: -0.5,
                lineHeight: moderateScale(45),
              }}
              maxFontSizeMultiplier={1.3}
            >
              Namaskāra, {userName}!
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
              Let&apos;s build your Kannada fluency today.
            </Text>
          </View>

          {/* Daily-goal rings card (interim data — see note above) */}
          <DailyGoalCard
            listenFrac={daily.listen.frac}
            speakFrac={daily.speak.frac}
            practiceFrac={daily.practice.frac}
            listen={`${daily.listen.value}/${daily.listen.target}`}
            speak={`${daily.speak.value}/${daily.speak.target}`}
            practice={`${daily.practice.value}/${daily.practice.target}`}
            onInfoPress={openRingInfo}
          />

          {/* Continue card — the screen's one action-red */}
          {!allDone && nextLessonSlot ? (
            <ChunkyPressable
              onPress={handleStartNext}
              accessibilityLabel={`Continue lesson ${lessonNo}: ${nextTitle}`}
              bg={Colors.primaryContainer}
              lip={5}
              lipColor={Colors.redLip}
              radius={Radius.chunky}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: Spacing.md,
                padding: moderateScale(16),
              }}
            >
              <ChunkyCircle
                size={moderateScale(44)}
                depth={moderateScale(3)}
                bg="#ffffff"
                lipColor={Colors.redLip}
              >
                <Icons.play size={moderateScale(20)} color={Colors.primaryContainer} />
              </ChunkyCircle>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: Fonts.baloo.bold,
                    fontSize: moderateScale(17),
                    color: Colors.onPrimary,
                    letterSpacing: -0.2,
                  }}
                  maxFontSizeMultiplier={1.2}
                  numberOfLines={1}
                >
                  Continue where you left off
                </Text>
                <Text
                  style={{
                    fontFamily: Fonts.dmSans.medium,
                    fontSize: moderateScale(12.5),
                    color: 'rgba(255,255,255,0.85)',
                    marginTop: moderateScale(2),
                  }}
                  maxFontSizeMultiplier={1.3}
                  numberOfLines={1}
                >
                  Lesson {lessonNo} · {nextTitle} · ~{ESTIMATED_MIN_PER_LESSON} min
                </Text>
              </View>
              <Icons.forward size={moderateScale(20)} color={Colors.onPrimary} />
            </ChunkyPressable>
          ) : (
            <View
              style={{
                borderRadius: Radius.chunky,
                padding: Spacing.xxl,
                backgroundColor: '#ffffff',
                borderWidth: 1,
                borderColor: Colors.hairline,
              }}
            >
              <Text
                style={{
                  fontFamily: Fonts.baloo.bold,
                  fontSize: moderateScale(20),
                  color: Colors.onSurface,
                }}
                maxFontSizeMultiplier={1.2}
              >
                All caught up
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.dmSans.regular,
                  fontSize: moderateScale(13),
                  color: Colors.tertiary,
                  marginTop: Spacing.xs,
                }}
                maxFontSizeMultiplier={1.3}
              >
                More lessons coming soon.
              </Text>
            </View>
          )}

          {/* Words-learnt banner — gold reward; tap to see every word learnt */}
          <Pressable
            onPress={openWordsLearned}
            accessibilityRole="button"
            accessibilityLabel={`Words learnt: ${wordsLearned}. Tap to see all words learnt.`}
            style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
          >
            <LinearGradient
              colors={[Colors.goldBright, Colors.secondaryContainer]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: Radius.chunky,
                borderBottomWidth: 5,
                borderBottomColor: Colors.goldLip,
                padding: moderateScale(16),
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                <Text
                  style={{
                    fontFamily: Fonts.baloo.extrabold,
                    fontSize: moderateScale(19),
                    color: Colors.onSecondaryContainer,
                    letterSpacing: -0.2,
                  }}
                  maxFontSizeMultiplier={1.2}
                >
                  Words learnt: {wordsLearned}
                </Text>
                <Text
                  style={{
                    fontFamily: Fonts.baloo.extrabold,
                    fontSize: moderateScale(19),
                    color: Colors.onSecondaryContainer,
                    fontVariant: ['tabular-nums'],
                  }}
                  maxFontSizeMultiplier={1.2}
                >
                  {wordPct}%
                </Text>
              </View>
              <View
                style={{
                  height: moderateScale(9),
                  backgroundColor: 'rgba(108,80,0,0.22)',
                  borderRadius: Radius.full,
                  overflow: 'hidden',
                  marginTop: Spacing.sm,
                }}
              >
                <View
                  style={{
                    height: '100%',
                    width: `${wordPct}%`,
                    backgroundColor: Colors.primaryContainer,
                    borderRadius: Radius.full,
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: Spacing.sm,
                }}
              >
                <Text
                  style={{
                    fontFamily: Fonts.dmSans.medium,
                    fontSize: moderateScale(12),
                    color: Colors.onSecondaryContainer,
                    flexShrink: 1,
                  }}
                  maxFontSizeMultiplier={1.3}
                >
                  of your weekly target achieved
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(2) }}>
                  <Text
                    style={{
                      fontFamily: Fonts.dmSans.bold,
                      fontSize: moderateScale(12),
                      color: Colors.onSecondaryContainer,
                    }}
                    maxFontSizeMultiplier={1.3}
                  >
                    See all
                  </Text>
                  <Icons.forward size={moderateScale(14)} color={Colors.onSecondaryContainer} />
                </View>
              </View>
            </LinearGradient>
          </Pressable>

          {/* Stuck right now? — the single urgent red surface (not a warning) */}
          <ChunkyPressable
            onPress={() => router.push('/emergency')}
            accessibilityLabel="Stuck right now? Survival phrases for the auto, shop and street."
            bg={Colors.errorContainerLow}
            lip={4}
            lipColor="rgba(110,0,20,0.18)"
            radius={Radius.chunky}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: Spacing.md,
              padding: moderateScale(16),
            }}
          >
            <StuckIcon />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: Fonts.baloo.bold,
                  fontSize: moderateScale(18),
                  color: Colors.primary,
                  letterSpacing: -0.2,
                }}
                maxFontSizeMultiplier={1.3}
              >
                Stuck right now?
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.dmSans.regular,
                  fontSize: moderateScale(12.5),
                  color: Colors.tertiary,
                  marginTop: moderateScale(1),
                  lineHeight: moderateScale(17),
                }}
                numberOfLines={2}
                maxFontSizeMultiplier={1.4}
              >
                Survival phrases for the auto, shop &amp; street · works offline.
              </Text>
            </View>
            <Icons.forward size={moderateScale(18)} color={Colors.primary} />
          </ChunkyPressable>
        </View>
      </ScrollView>
    </RNAnimated.View>
  );
}

function DailyGoalCard({
  listenFrac,
  speakFrac,
  practiceFrac,
  listen,
  speak,
  practice,
  onInfoPress,
}: {
  listenFrac: number;
  speakFrac: number;
  practiceFrac: number;
  listen: string;
  speak: string;
  practice: string;
  onInfoPress: () => void;
}) {
  // Dot uses the bright ring colour; value text uses a readable-on-white colour
  // (Speak's bright gold fails contrast on white, so its text is dark gold).
  const metrics = [
    { label: 'Listen', value: listen, dot: Colors.primaryContainer, text: Colors.primaryContainer },
    { label: 'Speak', value: speak, dot: Colors.secondaryContainer, text: Colors.secondary },
    { label: 'Practice', value: practice, dot: Colors.primary, text: Colors.primary },
  ];
  return (
    <View
      style={{
        backgroundColor: '#ffffff',
        borderRadius: Radius.chunky,
        borderWidth: 1,
        borderColor: Colors.hairline,
        borderBottomWidth: 4,
        borderBottomColor: Colors.cardLip,
        padding: moderateScale(16),
        gap: moderateScale(14),
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.baloo.extrabold,
            fontSize: moderateScale(22),
            color: Colors.onSurface,
            letterSpacing: -0.3,
          }}
          maxFontSizeMultiplier={1.2}
        >
          Daily Goal
        </Text>
        <Pressable
          onPress={onInfoPress}
          accessibilityRole="button"
          accessibilityLabel="How your rings are scored"
          hitSlop={10}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Icons.info size={moderateScale(20)} color={Colors.tertiary} strokeWidth={2} />
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(26) }}>
        <MultiProgressRing
          size={158}
          strokeWidth={12}
          gap={9}
          animated
          rings={[
            { progress: listenFrac, color: Colors.primaryContainer },
            { progress: speakFrac, color: Colors.secondaryContainer },
            { progress: practiceFrac, color: Colors.primary },
          ]}
        />

        <View style={{ flex: 1, gap: moderateScale(12) }}>
          {metrics.map((m) => (
            <View key={m.label}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(6) }}>
                <View
                  style={{
                    width: moderateScale(8),
                    height: moderateScale(8),
                    borderRadius: Radius.full,
                    backgroundColor: m.dot,
                  }}
                />
                <Text
                  style={{
                    fontFamily: Fonts.dmSans.bold,
                    fontSize: moderateScale(13),
                    color: Colors.tertiary,
                  }}
                  maxFontSizeMultiplier={1.3}
                >
                  {m.label}
                </Text>
              </View>
              <Text
                style={{
                  fontFamily: Fonts.baloo.extrabold,
                  fontSize: moderateScale(22),
                  color: m.text,
                  letterSpacing: -0.3,
                  fontVariant: ['tabular-nums'],
                  marginTop: moderateScale(1),
                }}
                maxFontSizeMultiplier={1.2}
              >
                {m.value}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

/** Red SOS tile with a gentle continuous pulse + chunky lip. */
function StuckIcon() {
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withSequence(
      withTiming(1.06, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
    );
    const id = setInterval(() => {
      scale.value = withSequence(
        withTiming(1.06, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      );
    }, 2400);
    return () => clearInterval(id);
  }, [scale]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={style}>
      <ChunkyLip
        size={moderateScale(44)}
        radius={Radius.tile}
        depth={moderateScale(3)}
        bg={Colors.primaryContainer}
        lipColor={Colors.redLip}
      >
        <Icons.emergency size={moderateScale(23)} color={Colors.onPrimary} strokeWidth={2.3} />
      </ChunkyLip>
    </Animated.View>
  );
}
