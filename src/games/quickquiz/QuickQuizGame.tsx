import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/spacing';
import { Fonts } from '@/constants/fonts';
import { ExitBackButton } from '@/components/ui/ExitBackButton';
import { useQuickQuizItems, useRecordQuickQuizAttempt } from '../../../hooks/games/quickQuiz';
import { useQuickQuiz, PER_QUESTION_SECONDS } from './hooks/useQuickQuiz';
import QuizPrompt from './components/QuizPrompt';
import QuizOptionGrid from './components/QuizOptionGrid';
import TimerBar from './components/TimerBar';
import ResultScreen from '../shared/ResultScreen';
import FeedbackBanner from '../shared/FeedbackBanner';
import { useAnswerHaptics } from '../shared/haptics';
import ProgressBar from '../imagematch/components/ProgressBar';
import type { QuizVocab } from './types';
import type { QuickQuizItem } from '../../../services/api/games/quickQuiz';

type Props = { lessonNo: number };

function toVocab(item: QuickQuizItem): QuizVocab {
  return {
    id: item.id,
    kannada: item.kannada,
    transliteration: item.transliteration ?? '',
    meaning: item.meaning,
  };
}

const QuickQuizGame: React.FC<Props> = ({ lessonNo }) => {
  // Like Image Match, pull neighbour lessons so sparse lessons still have
  // enough vocab for 3 distractors per question.
  const target = useQuickQuizItems(lessonNo);
  const neighbor1 = useQuickQuizItems(lessonNo > 1 ? lessonNo - 1 : null);
  const neighbor2 = useQuickQuizItems(lessonNo > 2 ? lessonNo - 2 : null);

  const targetBank = useMemo<QuizVocab[]>(
    () => (target.data ?? []).map(toVocab),
    [target.data],
  );

  const distractorBank = useMemo<QuizVocab[]>(() => {
    const all = [...(target.data ?? []), ...(neighbor1.data ?? []), ...(neighbor2.data ?? [])];
    const seen = new Set<string>();
    const dedup: QuickQuizItem[] = [];
    for (const item of all) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      dedup.push(item);
    }
    return dedup.map(toVocab);
  }, [target.data, neighbor1.data, neighbor2.data]);

  if (target.isLoading) return <CenteredLoading />;
  if (target.isError) return <ErrorState onRetry={() => target.refetch()} />;
  if (targetBank.length === 0) return <EmptyState lessonNo={lessonNo} />;

  return <QuickQuizGameInner targetBank={targetBank} distractorBank={distractorBank} />;
};

function QuickQuizGameInner({
  targetBank,
  distractorBank,
}: {
  targetBank: QuizVocab[];
  distractorBank: QuizVocab[];
}) {
  const recordAttempt = useRecordQuickQuizAttempt();

  const {
    currentQuestion,
    currentIndex,
    totalQuestions,
    score,
    streak,
    bestStreak,
    phase,
    answerState,
    secondsLeft,
    optionState,
    handleOptionTap,
    handleNext,
    restart,
  } = useQuickQuiz(targetBank, distractorBank, ({ itemId, isCorrect }) => {
    recordAttempt.mutate(
      { itemId, isCorrect },
      { onError: (err) => console.warn('[quick-quiz] record attempt failed', err) },
    );
  });

  useAnswerHaptics(answerState);

  if (phase === 'result') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
        <ExitBackButton skipConfirm />
        <ResultScreen score={score} total={totalQuestions} bestStreak={bestStreak} onReplay={restart} />
      </SafeAreaView>
    );
  }

  const answered = answerState !== 'unanswered';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.lg,
          gap: Spacing.lg,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: Spacing.md,
          }}
        >
          <ExitBackButton floating={false} variant="game" />
          <Text style={{ fontSize: moderateScale(14), color: Colors.tertiary, fontFamily: Fonts.dmSans.regular }}>
            Question {currentIndex + 1} / {totalQuestions}
          </Text>
          <Text style={{ fontSize: moderateScale(14), fontFamily: Fonts.dmSans.bold, color: Colors.onSurface }}>
            Score {score}
          </Text>
        </View>

        <ProgressBar current={currentIndex} total={totalQuestions} />

        <TimerBar secondsLeft={secondsLeft} total={PER_QUESTION_SECONDS} frozen={answered} />

        <QuizPrompt question={currentQuestion} />

        <QuizOptionGrid
          options={currentQuestion.options}
          optionState={optionState}
          onSelect={handleOptionTap}
        />

        <FeedbackBanner state={answerState} streak={streak} />

        {answered && (
          <Pressable
            style={{
              width: '100%',
              backgroundColor: Colors.primary,
              borderRadius: Radius.xl,
              paddingVertical: moderateScale(14),
              alignItems: 'center',
            }}
            onPress={handleNext}
          >
            <Text style={{ color: Colors.onPrimary, fontFamily: Fonts.dmSans.bold, fontSize: moderateScale(16) }}>
              {currentIndex + 1 < totalQuestions ? 'Next →' : 'See results'}
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function CenteredLoading() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }} edges={['top', 'bottom']}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    </SafeAreaView>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }} edges={['top', 'bottom']}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xxl, gap: Spacing.md }}>
        <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: moderateScale(18), color: Colors.onSurface, textAlign: 'center' }}>
          Couldn&apos;t load this quiz
        </Text>
        <Text style={{ fontFamily: Fonts.dmSans.regular, fontSize: moderateScale(14), color: Colors.tertiary, textAlign: 'center', marginBottom: Spacing.md }}>
          Check your connection and try again.
        </Text>
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Retry"
          style={({ pressed }) => ({
            backgroundColor: Colors.primary,
            borderRadius: Radius.lg,
            paddingVertical: Spacing.md,
            paddingHorizontal: Spacing.xl,
            transform: [{ scale: pressed ? 0.97 : 1 }],
          })}
        >
          <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: moderateScale(14), color: Colors.onPrimary }}>Retry</Text>
        </Pressable>
        <Pressable onPress={() => router.back()} style={({ pressed }) => ({ paddingVertical: Spacing.sm, opacity: pressed ? 0.6 : 1 })}>
          <Text style={{ fontFamily: Fonts.dmSans.regular, fontSize: moderateScale(13), color: Colors.tertiary }}>Back</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function EmptyState({ lessonNo }: { lessonNo: number }) {
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }} edges={['top', 'bottom']}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xxl, gap: Spacing.md }}>
        <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: moderateScale(18), color: Colors.onSurface, textAlign: 'center' }}>
          Lesson {lessonNo} — coming soon
        </Text>
        <Text style={{ fontFamily: Fonts.dmSans.regular, fontSize: moderateScale(14), color: Colors.tertiary, textAlign: 'center', lineHeight: moderateScale(20), marginBottom: Spacing.md }}>
          No quiz words have been authored for this lesson yet. Try an earlier lesson.
        </Text>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back to lessons"
          style={({ pressed }) => ({
            backgroundColor: Colors.primary,
            borderRadius: Radius.lg,
            paddingVertical: Spacing.md,
            paddingHorizontal: Spacing.xl,
            transform: [{ scale: pressed ? 0.97 : 1 }],
          })}
        >
          <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: moderateScale(14), color: Colors.onPrimary }}>Back to lessons</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export default QuickQuizGame;
