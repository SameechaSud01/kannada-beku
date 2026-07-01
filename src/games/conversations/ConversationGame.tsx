import React, { useEffect, useRef, useState } from 'react';
import { logger } from '../../../lib/logger';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { Fonts } from '@/constants/fonts';
import { Icons } from '@/constants/icons';
import { GAMES } from '@/constants/games';
import { useProgressStore } from '@/stores/progressStore';
import { recordLearningDay } from '@/services/progress/streak';
import { useGameSplit } from '@/src/games/shared/parts';
import { GamePartChooser } from '@/components/games/GamePartChooser';
import { ExitBackButton } from '@/components/ui/ExitBackButton';
import {
  useConversationScenarios,
  useRecordConversationAttempt,
} from '../../../hooks/games/conversations';
import { useConversation } from './hooks/useConversation';
import ChatTranscript from './components/ChatTranscript';
import ReplyOptionGrid from './components/ReplyOptionGrid';
import ProgressBar from '../opposites/components/ProgressBar';
import ResultScreen from '../shared/ResultScreen';
import FeedbackBanner from '../shared/FeedbackBanner';
import { useAnswerHaptics } from '../shared/haptics';
import { LipButton } from '@/components/ui/LipButton';
import type { ConversationScenario } from './types';

type Props = { lessonNo: number; section?: string };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const ConversationGame: React.FC<Props> = ({ lessonNo, section }) => {
  const router = useRouter();
  const scenarios = useConversationScenarios(lessonNo);
  const { parts, showChooser, playItems, activeSection } = useGameSplit(
    'conversations',
    lessonNo,
    scenarios.data,
    section ?? null,
  );

  if (scenarios.isLoading) return <CenteredLoading />;
  if (scenarios.isError) return <ErrorState onRetry={() => scenarios.refetch()} />;
  if (showChooser) {
    return (
      <GamePartChooser
        title={GAMES.conversations.title}
        lessonNo={lessonNo}
        parts={parts}
        onSelectPart={(key) => router.push(`/conversations/${lessonNo}?part=${key}`)}
      />
    );
  }
  if (playItems.length === 0) return <EmptyState lessonNo={lessonNo} />;

  return (
    <ConversationFlow scenarios={playItems} gameKey="conversations" sectionKey={activeSection} />
  );
};

function ConversationFlow({
  scenarios,
  gameKey,
  sectionKey,
}: {
  scenarios: ConversationScenario[];
  gameKey: string;
  sectionKey: string | null;
}) {
  const completeGamePart = useProgressStore((s) => s.completeGamePart);
  // Shuffle the scenario order once, play through sequentially, then surface an
  // "all caught up" end state instead of cycling the same dialogues forever.
  const [order, setOrder] = useState<ConversationScenario[]>(() => shuffle(scenarios));
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [allDone, setAllDone] = useState(false);

  // The sub-part is done once every scenario in it has been played through.
  useEffect(() => {
    if (allDone && sectionKey) {
      completeGamePart(gameKey, sectionKey);
      // Finishing a game part counts as a learning day (audit H2/B4).
      recordLearningDay();
    }
  }, [allDone, sectionKey, gameKey, completeGamePart]);

  const advance = () => {
    if (scenarioIndex + 1 >= order.length) setAllDone(true);
    else setScenarioIndex((i) => i + 1);
  };

  const restartAll = () => {
    setOrder(shuffle(scenarios));
    setScenarioIndex(0);
    setAllDone(false);
  };

  if (allDone) return <AllCaughtUp count={order.length} onRestart={restartAll} />;

  const scenario = order[scenarioIndex];
  return <ConversationRound key={scenario.id} scenario={scenario} onReplay={advance} />;
}

function ConversationRound({
  scenario,
  onReplay,
}: {
  scenario: ConversationScenario;
  onReplay: () => void;
}) {
  const recordAttempt = useRecordConversationAttempt();
  const scrollRef = useRef<ScrollView>(null);

  const {
    currentTurn,
    currentIndex,
    totalTurns,
    score,
    streak,
    bestStreak,
    phase,
    answerState,
    answers,
    optionState,
    handleOptionTap,
    handleNext,
  } = useConversation(scenario.turns, ({ itemId, isCorrect }) => {
    recordAttempt.mutate(
      { itemId, isCorrect },
      { onError: (err) => logger.debug('conversations', 'record attempt failed', { err }) },
    );
  });

  useAnswerHaptics(answerState);

  if (phase === 'result') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surfaceCream }}>
        <ExitBackButton skipConfirm />
        <ResultScreen
          score={score}
          total={totalTurns}
          bestStreak={bestStreak}
          onReplay={onReplay}
          replayLabel="Next conversation ▸"
        />
      </SafeAreaView>
    );
  }

  const answered = answerState !== 'unanswered';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surfaceCream }}>
      <ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
        // Non-animated: the NPC line types in character-by-character, firing
        // onContentSizeChange every ~35ms. An *animated* scrollToEnd keeps a
        // scroll in flight for the whole reveal, and the ScrollView's gesture
        // responder eats taps on its children while it runs (B1). Jumping
        // instantly avoids that touch-stealing window.
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
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
            }}
            numberOfLines={1}
          >
            {scenario.title}
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

        <ProgressBar current={currentIndex} total={totalTurns} />

        <ChatTranscript turns={scenario.turns} currentIndex={currentIndex} answers={answers} />

        <Text
          style={{
            fontFamily: Fonts.dmSans.medium,
            fontSize: moderateScale(13),
            color: Colors.tertiary,
            textTransform: 'uppercase',
            letterSpacing: 1.2,
          }}
          maxFontSizeMultiplier={1.3}
        >
          Your reply
        </Text>

        <ReplyOptionGrid
          options={currentTurn.options}
          optionState={optionState}
          onSelect={handleOptionTap}
        />

        <FeedbackBanner state={answerState} streak={streak} />
      </ScrollView>

      {/* Advance button lives OUTSIDE the ScrollView so its taps are never
          intercepted by the auto-scroll responder while the next line types (B1). */}
      {answered && (
        <View
          style={{
            paddingHorizontal: Spacing.lg,
            paddingTop: Spacing.md,
            paddingBottom: Spacing.lg,
          }}
        >
          <LipButton
            label={currentIndex + 1 < totalTurns ? 'Next ▸' : 'See results'}
            variant="primary"
            onPress={handleNext}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

function AllCaughtUp({ count, onRestart }: { count: number; onRestart: () => void }) {
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surfaceCream }}>
      <ExitBackButton skipConfirm />
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: Spacing.xxl,
          gap: Spacing.lg,
        }}
      >
        <Icons.gameConversations size={moderateScale(24)} color={Colors.primary} />
        <Text
          style={{
            fontFamily: Fonts.baloo.extrabold,
            fontSize: moderateScale(22),
            color: Colors.onSurface,
            textAlign: 'center',
          }}
        >
          All caught up!
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.regular,
            fontSize: moderateScale(14),
            color: Colors.tertiary,
            textAlign: 'center',
            lineHeight: moderateScale(20),
          }}
        >
          You&apos;ve played all {count} conversation{count === 1 ? '' : 's'} for this lesson. Go
          again for more practice?
        </Text>
        <View style={{ width: '100%', gap: Spacing.md, marginTop: Spacing.sm }}>
          <LipButton label="Play again ▸" variant="primary" onPress={onRestart} />
          <LipButton
            label="Back to Practice"
            variant="secondary"
            onPress={() => router.replace('/(tabs)/practice')}
          />
        </View>
      </View>
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
          Couldn&apos;t load this conversation
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
          No conversations have been written for this lesson yet. Try an earlier lesson.
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

export default ConversationGame;
