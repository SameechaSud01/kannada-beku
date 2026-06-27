import React, { useEffect, useMemo } from 'react';
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
import { useOppositesItems, useRecordOppositesAttempt } from '../../../hooks/games/opposites';
import { useGameState } from './hooks/useGameState';
import ProgressBar from './components/ProgressBar';
import QuestionCard from './components/QuestionCard';
import OptionGrid from './components/OptionGrid';
import FeedbackBanner from '../shared/FeedbackBanner';
import ResultScreen from '../shared/ResultScreen';
import { useAnswerHaptics } from '../shared/haptics';
import { ExitBackButton } from '@/components/ui/ExitBackButton';
import { LipButton } from '@/components/ui/LipButton';
import type { QuestionPair } from './types';
import type { OppositesItem } from '../../../services/api/games/opposites';

type Props = { lessonNo: number; section?: string };

function toPair(item: OppositesItem): QuestionPair {
  return {
    id: item.id,
    word: item.word,
    tr: item.transliteration ?? '',
    meaning: item.meaning ?? '',
    answer: item.opposite,
    opts: item.options,
  };
}

const OppositeGame: React.FC<Props> = ({ lessonNo, section }) => {
  const router = useRouter();
  const { data: items, isLoading, isError, refetch } = useOppositesItems(lessonNo);
  const { parts, showChooser, playItems, activeSection } = useGameSplit(
    'opposites',
    lessonNo,
    items,
    section ?? null,
  );

  const pairs = useMemo<QuestionPair[]>(() => playItems.map(toPair), [playItems]);

  if (isLoading) {
    return <CenteredLoading />;
  }
  if (isError) {
    return <ErrorState onRetry={() => refetch()} />;
  }
  if (showChooser) {
    return (
      <GamePartChooser
        title={GAMES.opposites.title}
        lessonNo={lessonNo}
        parts={parts}
        onSelectPart={(key) => router.push(`/opposites/${lessonNo}?part=${key}`)}
      />
    );
  }
  if (pairs.length === 0) {
    return <EmptyState lessonNo={lessonNo} />;
  }
  return <OppositeGameInner pairs={pairs} gameKey="opposites" sectionKey={activeSection} />;
};

function OppositeGameInner({
  pairs,
  gameKey,
  sectionKey,
}: {
  pairs: QuestionPair[];
  gameKey: string;
  sectionKey: string | null;
}) {
  const recordAttempt = useRecordOppositesAttempt();
  const completeGamePart = useProgressStore((s) => s.completeGamePart);

  const {
    currentQuestion,
    shuffledOpts,
    currentIndex,
    totalQuestions,
    score,
    streak,
    phase,
    answerState,
    selectedOpt,
    hintUsed,
    handleOptionTap,
    handleNext,
    useHint,
    restart,
  } = useGameState(pairs, ({ itemId, isCorrect }) => {
    // Fire-and-forget. Server preserves personal-best on conflict; transient
    // failures shouldn't disrupt play.
    recordAttempt.mutate(
      { itemId, isCorrect },
      { onError: (err) => console.warn('[opposites] record attempt failed', err) },
    );
  });

  useAnswerHaptics(answerState);

  // Finishing the round marks this sub-part done, so the chooser unlocks the
  // next one (spec_game_subsection_split). Idempotent in the store.
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
        <ResultScreen score={score} total={totalQuestions} onReplay={restart} />
      </SafeAreaView>
    );
  }

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

        <ProgressBar current={currentIndex} total={totalQuestions} />

        <QuestionCard
          word={currentQuestion.word}
          tr={currentQuestion.tr}
          meaning={currentQuestion.meaning}
          streak={streak}
          hintUsed={hintUsed}
          isAnswered={answerState !== 'unanswered'}
          onHint={useHint}
        />

        <OptionGrid
          opts={shuffledOpts}
          answerState={answerState}
          selectedOpt={selectedOpt}
          correctAnswer={currentQuestion.answer}
          onSelect={handleOptionTap}
        />

        <FeedbackBanner state={answerState} streak={streak} />

        {answerState !== 'unanswered' && (
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
          Couldn&apos;t load this round
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
          No opposites items have been authored for this lesson yet. Try an earlier lesson.
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

export default OppositeGame;
