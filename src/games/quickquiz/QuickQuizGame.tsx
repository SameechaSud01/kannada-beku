import React, { useEffect, useMemo } from 'react';
import { logger } from '../../../lib/logger';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { Fonts } from '@/constants/fonts';
import { GAMES } from '@/constants/games';
import { useProgressStore } from '@/stores/progressStore';
import { recordLearningDay } from '@/services/progress/streak';
import { useGameSplit } from '@/src/games/shared/parts';
import { GamePartChooser } from '@/components/games/GamePartChooser';
import { ExitBackButton } from '@/components/ui/ExitBackButton';
import { useQuickQuizItems, useRecordQuickQuizAttempt } from '../../../hooks/games/quickQuiz';
import { useQuickQuiz, PER_QUESTION_SECONDS } from './hooks/useQuickQuiz';
import QuizPrompt from './components/QuizPrompt';
import QuizOptionGrid from './components/QuizOptionGrid';
import TimerBar from './components/TimerBar';
import ResultScreen from '../shared/ResultScreen';
import FeedbackBanner from '../shared/FeedbackBanner';
import { useAnswerHaptics } from '../shared/haptics';
import { LipButton } from '@/components/ui/LipButton';
import type { QuizVocab } from './types';
import type { QuickQuizItem } from '../../../services/api/games/quickQuiz';

type Props = { lessonNo: number; section?: string };

function toVocab(item: QuickQuizItem): QuizVocab {
  return {
    id: item.id,
    kannada: item.kannada,
    transliteration: item.transliteration ?? '',
    meaning: item.meaning,
  };
}

const QuickQuizGame: React.FC<Props> = ({ lessonNo, section }) => {
  const router = useRouter();
  // Like Image Match, pull neighbour lessons so sparse lessons still have
  // enough vocab for 3 distractors per question.
  const target = useQuickQuizItems(lessonNo);
  const neighbor1 = useQuickQuizItems(lessonNo > 1 ? lessonNo - 1 : null);
  const neighbor2 = useQuickQuizItems(lessonNo > 2 ? lessonNo - 2 : null);

  const { parts, showChooser, playItems, activeSection } = useGameSplit(
    'quiz',
    lessonNo,
    target.data,
    section ?? null,
  );

  // The questions asked are only the active sub-part's words…
  const targetBank = useMemo<QuizVocab[]>(() => playItems.map(toVocab), [playItems]);

  // …but distractors may still draw on the whole lesson + neighbours.
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
  if (showChooser) {
    return (
      <GamePartChooser
        title={GAMES.quiz.title}
        lessonNo={lessonNo}
        parts={parts}
        onSelectPart={(key) => router.push(`/quiz/${lessonNo}?part=${key}`)}
      />
    );
  }
  if (targetBank.length === 0) return <EmptyState lessonNo={lessonNo} />;

  return (
    <QuickQuizGameInner
      targetBank={targetBank}
      distractorBank={distractorBank}
      gameKey="quiz"
      sectionKey={activeSection}
    />
  );
};

function QuickQuizGameInner({
  targetBank,
  distractorBank,
  gameKey,
  sectionKey,
}: {
  targetBank: QuizVocab[];
  distractorBank: QuizVocab[];
  gameKey: string;
  sectionKey: string | null;
}) {
  const recordAttempt = useRecordQuickQuizAttempt();
  const completeGamePart = useProgressStore((s) => s.completeGamePart);

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
      { onError: (err) => logger.debug('quick-quiz', 'record attempt failed', { err }) },
    );
  });

  useAnswerHaptics(answerState);

  useEffect(() => {
    if (phase === 'result' && sectionKey) {
      completeGamePart(gameKey, sectionKey);
      // Finishing a game part counts as a learning day (audit H2/B4).
      recordLearningDay();
    }
  }, [phase, sectionKey, gameKey, completeGamePart]);

  if (phase === 'result') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surfaceCream }}>
        <ExitBackButton skipConfirm />
        <ResultScreen
          score={score}
          total={totalQuestions}
          bestStreak={bestStreak}
          onReplay={restart}
        />
      </SafeAreaView>
    );
  }

  // Defensive: if the round builder yields no questions (e.g. banks desync),
  // don't dereference an undefined question — bail out cleanly (audit Phase 5).
  if (!currentQuestion) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surfaceCream }}>
        <ExitBackButton skipConfirm />
      </SafeAreaView>
    );
  }

  const answered = answerState !== 'unanswered';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surfaceCream }}>
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
          <Text
            style={{
              fontSize: moderateScale(14),
              color: Colors.tertiary,
              fontFamily: Fonts.dmSans.medium,
              fontVariant: ['tabular-nums'],
            }}
          >
            Question {currentIndex + 1} / {totalQuestions}
          </Text>
          <Text
            style={{
              fontSize: moderateScale(14),
              fontFamily: Fonts.baloo.bold,
              color: Colors.onSurface,
              fontVariant: ['tabular-nums'],
            }}
          >
            Score {score}
          </Text>
        </View>

        <TimerBar secondsLeft={secondsLeft} total={PER_QUESTION_SECONDS} frozen={answered} />

        <QuizPrompt question={currentQuestion} />

        <QuizOptionGrid
          options={currentQuestion.options}
          optionState={optionState}
          onSelect={handleOptionTap}
        />

        <FeedbackBanner state={answerState} streak={streak} />

        {answered && (
          <LipButton
            label={currentIndex + 1 < totalQuestions ? 'Next ▸' : 'See results'}
            variant="primary"
            onPress={handleNext}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function CenteredLoading() {
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors.surfaceCream }}
      edges={['top', 'bottom']}
    >
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    </SafeAreaView>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  const router = useRouter();
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors.surfaceCream }}
      edges={['top', 'bottom']}
    >
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: Spacing.xxl,
          gap: Spacing.md,
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.baloo.extrabold,
            fontSize: moderateScale(18),
            color: Colors.onSurface,
            textAlign: 'center',
          }}
        >
          Couldn&apos;t load this quiz
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.regular,
            fontSize: moderateScale(14),
            color: Colors.tertiary,
            textAlign: 'center',
            marginBottom: Spacing.md,
          }}
        >
          Check your connection and try again.
        </Text>
        <LipButton label="Retry" variant="primary" fullWidth={false} onPress={onRetry} />
        <LipButton
          label="Back"
          variant="tertiary"
          fullWidth={false}
          onPress={() => router.back()}
        />
      </View>
    </SafeAreaView>
  );
}

function EmptyState({ lessonNo }: { lessonNo: number }) {
  const router = useRouter();
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors.surfaceCream }}
      edges={['top', 'bottom']}
    >
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: Spacing.xxl,
          gap: Spacing.md,
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.baloo.extrabold,
            fontSize: moderateScale(18),
            color: Colors.onSurface,
            textAlign: 'center',
          }}
        >
          Lesson {lessonNo} — coming soon
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.regular,
            fontSize: moderateScale(14),
            color: Colors.tertiary,
            textAlign: 'center',
            lineHeight: moderateScale(20),
            marginBottom: Spacing.md,
          }}
        >
          No quiz words have been authored for this lesson yet. Try an earlier lesson.
        </Text>
        <LipButton
          label="Back to lessons"
          variant="primary"
          fullWidth={false}
          onPress={() => router.back()}
        />
      </View>
    </SafeAreaView>
  );
}

export default QuickQuizGame;
