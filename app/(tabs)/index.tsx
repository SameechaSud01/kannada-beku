import { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, Animated as RNAnimated } from 'react-native';
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
import { Shadows } from '../../constants/shadows';
import { Icons } from '../../constants/icons';
import { useAuthStore } from '../../stores/useAuthStore';
import { useDbLessons } from '../../hooks/useLessons';
import { useUserStore } from '../../stores/useUserStore';
import { PLANNED_LESSON_SLOTS, TOTAL_LESSON_SLOTS } from '../../constants/lessons/plannedLessons';
import { formatFirstName } from '../../utils/formatName';
import { useCompletedLessons, useStreak } from '../../hooks/progress';
import { useKarnatakaFunFacts } from '../../hooks/useKarnatakaFunFacts';
import type { FunFact } from '../../services/api/karnataka_fun_facts';
import { Toasts } from '../../components/modals/instances/toastCatalog';
import { useModal } from '../../components/modals/ModalHost';
import { Celebration } from '../../components/ui/Celebration';
import { isStreakMilestone } from '../../components/modals/instances/StreakMilestoneTakeover';
import { BrandGradient } from '../../components/ui/BrandGradient';
import { LipButton } from '../../components/ui/LipButton';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { Watermark } from '../../components/ui/Watermark';

const ESTIMATED_MIN_PER_LESSON = 5;

type CardFact = Pick<FunFact, 'category' | 'fact'>;

function factOfDayIndex(arrayLength: number): number {
  if (arrayLength <= 0) return 0;
  const dateStr = new Date().toISOString().split('T')[0];
  let sum = 0;
  for (let i = 0; i < dateStr.length; i++) sum += dateStr.charCodeAt(i);
  return sum % arrayLength;
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const modal = useModal();
  const completedLessons = useCompletedLessons();
  const streak = useStreak();
  const user = useAuthStore((s) => s.user);
  const displayName = useUserStore((s) => s.displayName);
  const lessonsQuery = useDbLessons();
  const dbLessons = lessonsQuery.data ?? [];
  const factsQuery = useKarnatakaFunFacts();

  const fadeAnim = useRef(new RNAnimated.Value(0)).current;
  const slideAnim = useRef(new RNAnimated.Value(4)).current;

  useEffect(() => {
    RNAnimated.parallel([
      RNAnimated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      RNAnimated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (factsQuery.error) {
      console.warn('[home] fun-facts fetch failed', factsQuery.error);
    }
  }, [factsQuery.error]);

  // One-time nudge pointing at the Learn-tab Beginners' Guide card.
  // See spec_beginners_guide.md §Re-entry — first home toast.
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

  const facts: readonly CardFact[] = factsQuery.data ?? [];

  const completedSlugSet = new Set(completedLessons);
  const completedCount = Math.min(completedLessons.length, TOTAL_LESSON_SLOTS);
  const progressPercent = Math.round((completedCount / TOTAL_LESSON_SLOTS) * 100);

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

  // Streak pill tap → flame wiggle; only replays the streak celebration on an
  // actual milestone day (locked milestone copy — no fake milestones).
  const handleStreakPress = () => {
    if (isStreakMilestone(streak)) {
      modal.show({
        kind: 'takeover',
        component: Celebration,
        props: { kind: 'streak', streak, onClose: () => modal.dismiss() },
      });
    }
  };

  return (
    <RNAnimated.View
      style={{
        flex: 1,
        backgroundColor: Colors.surface,
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <Watermark motif="rangoli" />

      {/* Top bar — left wordmark, streak pill right, hairline */}
      <View
        style={{
          paddingTop: insets.top + Spacing.sm,
          paddingBottom: Spacing.sm,
          paddingHorizontal: Spacing.lg,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottomWidth: 1,
          borderBottomColor: Colors.hairline,
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.notoSansKannada.bold,
            fontSize: moderateScale(22),
            color: Colors.primary,
            letterSpacing: -0.3,
            lineHeight: moderateScale(34),
          }}
          maxFontSizeMultiplier={1.2}
        >
          ಕನ್ನಡ ಬೇಕು
        </Text>
        <StreakPill streak={streak} onPress={handleStreakPress} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: moderateScale(40) + insets.bottom }}
      >
        {/* Demoted fun-fact banner */}
        {facts.length > 0 ? <FunFactBanner facts={facts} /> : null}

        <View style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.md }}>
          {/* Greeting */}
          <Text
            style={{
              fontFamily: Fonts.baloo.bold,
              fontSize: moderateScale(24),
              color: Colors.onSurface,
              letterSpacing: -0.3,
            }}
            maxFontSizeMultiplier={1.3}
          >
            Namaskāra, {userName}!
          </Text>
          <Text
            style={{
              fontFamily: Fonts.dmSans.medium,
              fontSize: moderateScale(13.5),
              color: Colors.tertiary,
              marginTop: moderateScale(2),
              marginBottom: Spacing.lg,
            }}
            maxFontSizeMultiplier={1.4}
          >
            Pick up where you left off — 5 minutes today keeps the streak.
          </Text>

          {/* HOOK — continue the next lesson (brand gradient) */}
          {!allDone && nextLessonSlot ? (
            <Pressable
              onPress={handleStartNext}
              accessibilityRole="button"
              accessibilityLabel={`Continue lesson ${lessonNo}: ${nextTitle}`}
              style={({ pressed }) => ({
                borderRadius: Radius.xl,
                backgroundColor: Colors.primary,
                ...Shadows.floatingNav,
                transform: [{ scale: pressed ? 0.99 : 1 }],
              })}
            >
              <BrandGradient
                style={{
                  borderRadius: Radius.xl,
                  padding: Spacing.lg,
                  overflow: 'hidden',
                }}
              >
                <Text
                  aria-hidden
                  style={{
                    position: 'absolute',
                    right: moderateScale(-16),
                    top: moderateScale(-40),
                    fontFamily: Fonts.notoSansKannada.bold,
                    fontSize: moderateScale(150),
                    lineHeight: moderateScale(150),
                    color: 'rgba(255,255,255,0.12)',
                  }}
                >
                  ನ
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignSelf: 'flex-start',
                    alignItems: 'center',
                    gap: moderateScale(6),
                    backgroundColor: 'rgba(255,255,255,0.18)',
                    borderRadius: Radius.sm,
                    paddingVertical: moderateScale(4),
                    paddingHorizontal: moderateScale(9),
                  }}
                >
                  <Icons.play size={moderateScale(11)} color={Colors.onPrimary} />
                  <Text
                    style={{
                      fontFamily: Fonts.dmSans.bold,
                      fontSize: moderateScale(11),
                      letterSpacing: 0.5,
                      color: Colors.onPrimary,
                    }}
                    maxFontSizeMultiplier={1.3}
                  >
                    CONTINUE · LESSON {lessonNo}
                  </Text>
                </View>
                <Text
                  style={{
                    fontFamily: Fonts.baloo.extrabold,
                    fontSize: moderateScale(28),
                    color: Colors.onPrimary,
                    letterSpacing: -0.5,
                    lineHeight: moderateScale(38),
                    marginTop: Spacing.sm,
                  }}
                  maxFontSizeMultiplier={1.2}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {nextTitle}
                </Text>
                <Text
                  style={{
                    fontFamily: Fonts.dmSans.medium,
                    fontSize: moderateScale(13.5),
                    color: 'rgba(255,255,255,0.9)',
                    marginTop: moderateScale(5),
                  }}
                  maxFontSizeMultiplier={1.3}
                >
                  ~{ESTIMATED_MIN_PER_LESSON} min
                </Text>
                {/* lesson progress dots */}
                <View style={{ flexDirection: 'row', gap: moderateScale(5), marginTop: Spacing.md }}>
                  {Array.from({ length: TOTAL_LESSON_SLOTS }).map((_, i) => {
                    const on = i < completedCount;
                    return (
                      <View
                        key={i}
                        style={{
                          width: on ? moderateScale(22) : moderateScale(8),
                          height: moderateScale(8),
                          borderRadius: moderateScale(5),
                          backgroundColor: on ? Colors.secondaryContainer : 'rgba(255,255,255,0.3)',
                        }}
                      />
                    );
                  })}
                </View>
                <View style={{ marginTop: Spacing.lg, maxWidth: moderateScale(240) }}>
                  <LipButton
                    label="Continue lesson"
                    onPress={handleStartNext}
                    color={Colors.secondaryContainer}
                    lip={Colors.goldLip}
                    fg={Colors.onSecondaryContainer}
                    icon={Icons.forward}
                  />
                </View>
              </BrandGradient>
            </Pressable>
          ) : (
            <View
              style={{
                borderRadius: Radius.xl,
                padding: Spacing.xxl,
                backgroundColor: Colors.surfaceContainerHighest,
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

          {/* YOUR PROGRESS — gold ring → Learn tab */}
          <Pressable
            onPress={() => router.navigate('/(tabs)/learn')}
            accessibilityRole="button"
            accessibilityLabel={`Progress: ${completedCount} of ${TOTAL_LESSON_SLOTS} lessons.`}
            style={({ pressed }) => ({
              marginTop: moderateScale(11),
              flexDirection: 'row',
              alignItems: 'center',
              gap: Spacing.lg,
              backgroundColor: Colors.surfaceContainerLowest,
              borderRadius: Radius.xl,
              padding: Spacing.lg,
              borderWidth: 1,
              borderColor: Colors.hairline,
              transform: [{ scale: pressed ? 0.99 : 1 }],
            })}
          >
            <ProgressRing
              progress={completedCount / TOTAL_LESSON_SLOTS}
              size={58}
              strokeWidth={6.5}
              color={Colors.goldLip}
              trackColor={Colors.surfaceContainerHigh}
            >
              <Text
                style={{
                  fontFamily: Fonts.baloo.extrabold,
                  fontSize: moderateScale(15),
                  color: Colors.onSecondaryContainer,
                }}
                maxFontSizeMultiplier={1.2}
              >
                {progressPercent}%
              </Text>
            </ProgressRing>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: Fonts.baloo.bold,
                  fontSize: moderateScale(18),
                  color: Colors.onSurface,
                  letterSpacing: -0.2,
                }}
                maxFontSizeMultiplier={1.3}
              >
                {completedCount} of {TOTAL_LESSON_SLOTS} lessons
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.dmSans.regular,
                  fontSize: moderateScale(12.5),
                  color: Colors.tertiary,
                  marginTop: moderateScale(2),
                  lineHeight: moderateScale(18),
                }}
                numberOfLines={2}
                maxFontSizeMultiplier={1.4}
              >
                {allDone ? 'All caught up — more lessons soon.' : `${nextTitle} is next.`}
              </Text>
            </View>
            <Icons.forward size={moderateScale(18)} color={Colors.goldLip} />
          </Pressable>

          {/* STUCK — the single urgent red accent */}
          <Pressable
            onPress={() => router.push('/emergency')}
            accessibilityRole="button"
            accessibilityLabel="Stuck right now? Survival phrases for the auto, shop and street."
            style={({ pressed }) => ({
              marginTop: moderateScale(11),
              flexDirection: 'row',
              alignItems: 'center',
              gap: Spacing.md,
              backgroundColor: Colors.errorContainerLow,
              borderRadius: Radius.xl,
              padding: Spacing.lg,
              transform: [{ scale: pressed ? 0.99 : 1 }],
            })}
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
          </Pressable>

          {/* QUICK LINKS */}
          <View style={{ flexDirection: 'row', gap: moderateScale(11), marginTop: moderateScale(11) }}>
            <QuickLink
              label="Practice"
              sub="Games & drills"
              Icon={Icons.tabPractice}
              accent={Colors.primary}
              onPress={() => router.navigate('/(tabs)/practice')}
            />
            <QuickLink
              label="Journey"
              sub={`${completedCount} of ${TOTAL_LESSON_SLOTS} done`}
              Icon={Icons.tabLearn}
              accent={Colors.secondary}
              onPress={() => router.navigate('/(tabs)/learn')}
            />
          </View>
        </View>
      </ScrollView>
    </RNAnimated.View>
  );
}

/** Gold-wash streak pill with a flame that wiggles on tap. */
function StreakPill({ streak, onPress }: { streak: number; onPress: () => void }) {
  const rot = useSharedValue(0);
  const flameStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rot.value}deg` }] }));
  const handle = () => {
    rot.value = withSequence(
      withTiming(-12, { duration: 90, easing: Easing.out(Easing.ease) }),
      withTiming(10, { duration: 90 }),
      withTiming(0, { duration: 90 }),
    );
    onPress();
  };
  return (
    <Pressable
      onPress={handle}
      accessibilityRole="button"
      accessibilityLabel={`Current streak: ${streak} day${streak === 1 ? '' : 's'}`}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: moderateScale(4),
        backgroundColor: Colors.secondaryFixed,
        borderRadius: Radius.full,
        paddingVertical: moderateScale(6),
        paddingLeft: moderateScale(9),
        paddingRight: moderateScale(12),
        borderWidth: 1.5,
        borderColor: Colors.secondaryContainer,
      }}
    >
      <Animated.View style={flameStyle}>
        <Icons.streak size={moderateScale(17)} color={Colors.primary} />
      </Animated.View>
      <Text
        style={{ fontFamily: Fonts.baloo.extrabold, fontSize: moderateScale(16), color: Colors.onSurface }}
        maxFontSizeMultiplier={1.2}
      >
        {streak}
      </Text>
    </Pressable>
  );
}

/** Slim, dismissible, cycling fun-fact banner. */
function FunFactBanner({ facts }: { facts: readonly CardFact[] }) {
  const [index, setIndex] = useState(() => factOfDayIndex(facts.length));
  const [dismissed, setDismissed] = useState(false);
  if (dismissed || facts.length === 0) return null;
  const fact = facts[index % facts.length];
  return (
    <View style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.md }}>
      <Pressable
        onPress={() => setIndex((v) => v + 1)}
        accessibilityRole="button"
        accessibilityLabel={`Did you know? ${fact.fact}. Tap for another.`}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: moderateScale(9),
          backgroundColor: Colors.surfaceContainerLowest,
          borderRadius: Radius.lg,
          paddingVertical: Spacing.sm,
          paddingHorizontal: moderateScale(10),
          borderWidth: 1,
          borderColor: Colors.hairline,
        }}
      >
        <View
          style={{
            width: moderateScale(24),
            height: moderateScale(24),
            borderRadius: moderateScale(7),
            backgroundColor: Colors.secondary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icons.sparkle size={moderateScale(14)} color={Colors.onPrimary} />
        </View>
        <Text
          numberOfLines={1}
          style={{
            flex: 1,
            fontFamily: Fonts.dmSans.medium,
            fontSize: moderateScale(12.5),
            color: Colors.tertiary,
          }}
          maxFontSizeMultiplier={1.3}
        >
          <Text style={{ fontFamily: Fonts.dmSans.bold, color: Colors.secondary }}>Did you know? </Text>
          {fact.fact}
        </Text>
        <Pressable
          onPress={() => setDismissed(true)}
          accessibilityRole="button"
          accessibilityLabel="Dismiss fun fact"
          hitSlop={moderateScale(8)}
        >
          <Icons.close size={moderateScale(14)} color={Colors.textFaint} />
        </Pressable>
      </Pressable>
    </View>
  );
}

/** Red SOS tile with a gentle continuous pulse. */
function StuckIcon() {
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withSequence(
      withTiming(1.06, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
    );
    // loop
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
    <Animated.View
      style={[
        {
          width: moderateScale(44),
          height: moderateScale(44),
          borderRadius: Radius.lg,
          backgroundColor: Colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          ...Shadows.tabActive,
        },
        style,
      ]}
    >
      <Icons.emergency size={moderateScale(23)} color={Colors.onPrimary} strokeWidth={2.3} />
    </Animated.View>
  );
}

function QuickLink({
  label,
  sub,
  Icon,
  accent,
  onPress,
}: {
  label: string;
  sub: string;
  Icon: typeof Icons.tabPractice;
  accent: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}. ${sub}.`}
      style={({ pressed }) => ({
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: moderateScale(11),
        backgroundColor: Colors.surfaceContainerLowest,
        borderRadius: Radius.lg,
        padding: moderateScale(13),
        borderWidth: 1,
        borderColor: Colors.hairline,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <View
        style={{
          width: moderateScale(36),
          height: moderateScale(36),
          borderRadius: moderateScale(11),
          backgroundColor: Colors.surfaceContainerHigh,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={moderateScale(18)} color={accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{ fontFamily: Fonts.baloo.bold, fontSize: moderateScale(15), color: Colors.onSurface, letterSpacing: -0.2 }}
          maxFontSizeMultiplier={1.2}
          numberOfLines={1}
        >
          {label}
        </Text>
        <Text
          style={{ fontFamily: Fonts.dmSans.medium, fontSize: moderateScale(11), color: Colors.textFaint, marginTop: moderateScale(1) }}
          maxFontSizeMultiplier={1.3}
          numberOfLines={1}
        >
          {sub}
        </Text>
      </View>
    </Pressable>
  );
}
