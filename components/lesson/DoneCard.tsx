import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { GAMES, type Game } from '../../constants/games';
import type { Lesson } from '../../constants/lessons/types';
import type { LessonRunner } from '../../hooks/useLessonRunner';
import { useProgressStore } from '../../stores/progressStore';
import { useUserStore } from '../../stores/useUserStore';
import { useModal } from '../../components/modals/ModalHost';
import { GoalCompleteDialog } from '../../components/modals/instances/GoalCompleteDialog';
import { isStreakMilestone } from '../../components/modals/instances/StreakMilestoneTakeover';
import { Celebration } from '../ui/Celebration';
import { LipButton } from '../ui/LipButton';
import { Toast } from '../../components/modals/ToastHost';
import {
  useCompleteLessonMutation,
  LessonNotRegisteredError,
} from '../../hooks/useCompleteLessonMutation';

const ESTIMATED_MIN_PER_LESSON = 5;
const COMPLETION_SCORE = 100;
// Image Match queries a table dropped from the DB, so its runner can never
// finish — keep it out of the post-lesson "keep practising" list until the full
// removal (spec_game_subsection_split §5). spec_fix_games_flow Phase B.
const DEFAULT_GAMES: Game[] = Object.values(GAMES).filter((g) => g.key !== 'image-match');

interface DoneCardProps {
  lesson: Lesson;
  runner?: LessonRunner;
  games?: Game[];
  onClose?: () => void;
}

export function DoneCard({ lesson, games = DEFAULT_GAMES, onClose }: DoneCardProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [intentMarked, setIntentMarked] = useState(false);

  const phraseCount = lesson.phrases.length;
  const wordCount = lesson.words.length;
  const itemsLearned = wordCount + phraseCount;

  const markGoalCelebrated = useProgressStore((s) => s.markGoalCelebrated);
  const dailyGoalMinutes = useUserStore((s) => s.dailyGoalMinutes);
  const modal = useModal();
  const mutation = useCompleteLessonMutation();
  const attemptedRef = useRef(false);

  const runSave = () => {
    if (mutation.isPending || mutation.isSuccess) return;

    const today = new Date().toISOString().split('T')[0];
    const pre = useProgressStore.getState();
    const prevStreak = pre.streak;
    const prevTodayMinutes = pre.todayMinutesDate === today ? pre.todayMinutes : 0;

    mutation.mutate(
      {
        slug: lesson.slug,
        score: COMPLETION_SCORE,
        phrasesLearned: itemsLearned,
        minutesPracticed: ESTIMATED_MIN_PER_LESSON,
      },
      {
        onSuccess: () => {
          const post = useProgressStore.getState();

          // Streak milestone wins (unified Celebration, locked milestone copy).
          if (post.streak !== prevStreak && isStreakMilestone(post.streak)) {
            modal.show({
              kind: 'takeover',
              component: Celebration,
              props: {
                kind: 'streak',
                streak: post.streak,
                onClose: () => modal.dismiss(),
              },
            });
            return;
          }

          // Else daily-goal complete (existing dialog).
          if (
            dailyGoalMinutes &&
            prevTodayMinutes < dailyGoalMinutes &&
            post.todayMinutes >= dailyGoalMinutes &&
            post.lastGoalCelebrationDate !== today
          ) {
            markGoalCelebrated();
            modal.show({
              kind: 'dialog',
              component: GoalCompleteDialog,
              props: {
                goalMinutes: dailyGoalMinutes,
                streakDays: post.streak,
                onOneMore: () => {
                  modal.dismiss();
                  router.push('/(tabs)/learn');
                },
                onDone: () => {
                  modal.dismiss();
                  router.push('/(tabs)');
                },
              },
            });
          } else {
            // Default lesson-complete celebration (the recap sits behind it).
            modal.show({
              kind: 'takeover',
              component: Celebration,
              props: {
                kind: 'lesson',
                title: `${lesson.title} done!`,
                sub: 'You spoke Kannada today. Keep the streak alive.',
                onClose: () => modal.dismiss(),
              },
            });
          }

          console.log('[lesson] completed', {
            lessonSlug: lesson.slug,
            itemsLearned,
          });
        },
        onError: (err) => {
          if (err instanceof LessonNotRegisteredError) {
            Toast.show({
              kind: 'error',
              id: 'lesson.notRegistered',
              title: 'Lesson not registered on server',
              subtitle: 'Try again later — tap anywhere to retry',
            });
          } else {
            Toast.show({
              kind: 'error',
              id: 'lesson.saveFailed',
              title: "Couldn't save your progress. Try again.",
              subtitle: 'Tap "Back to lessons" to retry',
            });
          }
          console.warn('[lesson] save failed', err);
        },
      },
    );
  };

  useEffect(() => {
    if (attemptedRef.current) return;
    attemptedRef.current = true;
    runSave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBackToLessons = () => {
    if (mutation.isPending) return;
    if (mutation.isError) {
      runSave();
      return;
    }
    if (onClose) onClose();
    else router.back();
  };

  const handleMarkIntent = () => {
    if (intentMarked) return;
    console.log('[done] real-life intent marked', { lessonSlug: lesson.slug });
    setIntentMarked(true);
  };

  // Primary CTA: record the real-life intent AND leave in one tap. Exit is
  // gated by handleBackToLessons (no-ops while saving, retries on error), so a
  // failed save still surfaces "Retry" on the secondary button below.
  const handleCommitAndExit = () => {
    handleMarkIntent();
    handleBackToLessons();
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surfaceCream }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: Spacing.lg,
          paddingTop: insets.top + Spacing.xxxl,
          paddingBottom: Spacing.lg,
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.baloo.extrabold,
            fontSize: moderateScale(24),
            color: Colors.onSurface,
            textAlign: 'center',
            lineHeight: moderateScale(34),
            letterSpacing: -0.3,
            marginBottom: Spacing.xl,
          }}
          maxFontSizeMultiplier={1.2}
        >
          Nice — that's the lesson done.
        </Text>

        {/* Stats block */}
        <View
          style={{
            alignItems: 'flex-start',
            alignSelf: 'center',
            gap: Spacing.sm,
            marginBottom: Spacing.xl,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
            <Icons.tabLearn size={18} color={Colors.primaryContainer} />
            <Text
              style={{
                fontFamily: Fonts.dmSans.medium,
                fontSize: moderateScale(15),
                color: Colors.onSurface,
              }}
            >
              {wordCount} {wordCount === 1 ? 'word' : 'words'} learned
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
            <Icons.tabPractice size={18} color={Colors.primaryContainer} />
            <Text
              style={{
                fontFamily: Fonts.dmSans.medium,
                fontSize: moderateScale(15),
                color: Colors.onSurface,
              }}
            >
              {phraseCount} {phraseCount === 1 ? 'phrase' : 'phrases'} learned
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
            <Icons.mic size={18} color={Colors.primaryContainer} />
            <Text
              style={{
                fontFamily: Fonts.dmSans.medium,
                fontSize: moderateScale(15),
                color: Colors.onSurface,
              }}
            >
              You spoke Kannada today
            </Text>
          </View>
        </View>

        {/* Real-world prompt card */}
        <View
          style={{
            backgroundColor: Colors.secondaryFixed,
            borderRadius: Radius.chunky,
            borderBottomWidth: 5,
            borderBottomColor: Colors.goldLip,
            padding: Spacing.xxl,
            marginBottom: Spacing.xl,
          }}
        >
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: moderateScale(11),
              color: Colors.onSecondaryContainer,
              letterSpacing: 1.4,
              textTransform: 'uppercase',
              marginBottom: Spacing.sm,
            }}
          >
            Take it outside
          </Text>
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: moderateScale(17),
              color: Colors.onSecondaryContainer,
              lineHeight: moderateScale(26),
            }}
          >
            {lesson.realWorldPrompt}
          </Text>
        </View>

        {intentMarked && (
          <View
            style={{
              backgroundColor: Colors.secondaryFixed,
              borderRadius: Radius.tile,
              paddingVertical: Spacing.md,
              paddingHorizontal: Spacing.lg,
              alignItems: 'center',
              marginBottom: Spacing.xl,
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: moderateScale(13),
                color: Colors.onSecondaryContainer,
                textAlign: 'center',
              }}
            >
              Nice. We'll check in tomorrow.
            </Text>
          </View>
        )}

        {/* Keep practising — game modes */}
        {games.length > 0 && (
          <View>
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: moderateScale(11),
                letterSpacing: 2,
                color: Colors.tertiary,
                textTransform: 'uppercase',
                marginBottom: Spacing.md,
              }}
              maxFontSizeMultiplier={1.4}
            >
              Keep practising
            </Text>
            <View style={{ gap: Spacing.sm }}>
              {games.map((g) => (
                <GameRow key={g.key} game={g} onPlay={() => router.push(`/(games)/${g.key}`)} />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View
        style={{
          padding: Spacing.lg,
          paddingBottom: insets.bottom + Spacing.lg,
          gap: Spacing.md,
        }}
      >
        <LipButton
          label="I'll try this in real life"
          onPress={handleCommitAndExit}
          accessibilityLabel="Commit to trying this in real life and return to lessons"
          color={intentMarked ? Colors.secondary : Colors.primaryContainer}
          lip={intentMarked ? Colors.onSecondaryContainer : Colors.redLip}
          fg={Colors.onPrimary}
        />

        {/* Secondary (tan) "Back to lessons" — keeps a Pressable (not LipButton)
            so it can show the saving spinner / retry copy from the mutation. */}
        <Pressable
          onPress={handleBackToLessons}
          disabled={mutation.isPending}
          accessibilityRole="button"
          accessibilityLabel={
            mutation.isPending
              ? 'Saving progress'
              : mutation.isError
                ? 'Retry saving progress'
                : 'Back to lessons'
          }
          accessibilityState={{ disabled: mutation.isPending, busy: mutation.isPending }}
          style={({ pressed }) => {
            const isDisabled = mutation.isPending;
            return {
              backgroundColor: isDisabled ? Colors.surfaceContainerHighest : '#ffffff',
              borderRadius: moderateScale(15),
              borderTopWidth: isDisabled ? 0 : 2,
              borderLeftWidth: isDisabled ? 0 : 2,
              borderRightWidth: isDisabled ? 0 : 2,
              borderColor: isDisabled ? undefined : Colors.interactiveSecondary,
              borderBottomWidth: isDisabled ? 0 : pressed ? 2 : 4,
              borderBottomColor: Colors.interactiveSecondaryLip,
              paddingVertical: Spacing.md,
              minHeight: moderateScale(48),
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ translateY: !isDisabled && pressed ? 2 : 0 }],
            };
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
            {mutation.isPending && <ActivityIndicator size="small" color={Colors.textFaint} />}
            <Text
              style={{
                fontFamily: Fonts.baloo.bold,
                fontSize: moderateScale(15),
                letterSpacing: 0.1,
                color: mutation.isPending ? Colors.textFaint : Colors.onSurface,
              }}
            >
              {mutation.isPending
                ? 'Saving…'
                : mutation.isError
                  ? 'Retry'
                  : 'Back to lessons'}
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

function GameRow({ game, onPlay }: { game: Game; onPlay: () => void }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        backgroundColor: '#ffffff',
        borderRadius: Radius.chunky,
        borderWidth: 1,
        borderColor: Colors.hairline,
        borderBottomWidth: 4,
        borderBottomColor: Colors.cardLip,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(14),
            color: Colors.onSurface,
          }}
          maxFontSizeMultiplier={1.3}
        >
          {game.title}
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.regular,
            fontSize: moderateScale(12),
            color: Colors.tertiary,
            marginTop: moderateScale(2),
            lineHeight: moderateScale(16),
          }}
          maxFontSizeMultiplier={1.4}
          numberOfLines={2}
        >
          {game.tagline}
        </Text>
      </View>
      <Pressable
        onPress={onPlay}
        accessibilityRole="button"
        accessibilityLabel={`Play ${game.title}`}
        style={({ pressed }) => ({
          backgroundColor: Colors.primaryContainer,
          borderRadius: Radius.full,
          borderBottomWidth: pressed ? 1 : 3,
          borderBottomColor: Colors.redLip,
          paddingVertical: Spacing.sm,
          paddingHorizontal: Spacing.lg,
          minHeight: moderateScale(36),
          justifyContent: 'center',
          transform: [{ translateY: pressed ? 2 : 0 }],
        })}
      >
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(12),
            letterSpacing: 0.5,
            color: Colors.onPrimary,
          }}
          maxFontSizeMultiplier={1.2}
        >
          Play
        </Text>
      </Pressable>
    </View>
  );
}
