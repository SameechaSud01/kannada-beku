import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/spacing';
import { Fonts } from '@/constants/fonts';
import { Icons } from '@/constants/icons';
import { GAMES } from '@/constants/games';
import { useProgressStore } from '@/stores/progressStore';
import { useGameSplit } from '@/src/games/shared/parts';
import { GamePartChooser } from '@/components/games/GamePartChooser';
import { ExitBackButton } from '@/components/ui/ExitBackButton';
import { useConversationScenarios, useRecordConversationAttempt } from '../../../hooks/games/conversations';
import { useConversation } from './hooks/useConversation';
import ChatTranscript from './components/ChatTranscript';
import ReplyOptionGrid from './components/ReplyOptionGrid';
import ProgressBar from '../imagematch/components/ProgressBar';
import ResultScreen from '../shared/ResultScreen';
import FeedbackBanner from '../shared/FeedbackBanner';
import { useAnswerHaptics } from '../shared/haptics';
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

  return <ConversationFlow scenarios={playItems} gameKey="conversations" sectionKey={activeSection} />;
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
    if (allDone && sectionKey) completeGamePart(gameKey, sectionKey);
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
      { onError: (err) => console.warn('[conversations] record attempt failed', err) },
    );
  });

  useAnswerHaptics(answerState);

  if (phase === 'result') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
        <ExitBackButton skipConfirm />
        <ResultScreen score={score} total={totalTurns} bestStreak={bestStreak} onReplay={onReplay} replayLabel="Next conversation ▸" />
      </SafeAreaView>
    );
  }

  const answered = answerState !== 'unanswered';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
      <ScrollView
        ref={scrollRef}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
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
            {scenario.title}
          </Text>
          <Text style={{ fontSize: moderateScale(14), fontFamily: Fonts.dmSans.bold, color: Colors.onSurface }}>
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
              {currentIndex + 1 < totalTurns ? 'Next →' : 'See results'}
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function AllCaughtUp({ count, onRestart }: { count: number; onRestart: () => void }) {
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
      <ExitBackButton skipConfirm />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xxl, gap: Spacing.lg }}>
        <Icons.gameConversations size={moderateScale(24)} color={Colors.primary} />
        <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: moderateScale(20), color: Colors.onSurface, textAlign: 'center' }}>
          All caught up!
        </Text>
        <Text
          style={{ fontFamily: Fonts.dmSans.regular, fontSize: moderateScale(14), color: Colors.tertiary, textAlign: 'center', lineHeight: moderateScale(20) }}
        >
          You&apos;ve played all {count} conversation{count === 1 ? '' : 's'} for this lesson. Go again for more practice?
        </Text>
        <Pressable
          onPress={onRestart}
          accessibilityRole="button"
          accessibilityLabel="Play again"
          style={{ width: '100%', backgroundColor: Colors.primary, borderRadius: Radius.xl, paddingVertical: moderateScale(14), alignItems: 'center', marginTop: Spacing.sm }}
        >
          <Text style={{ color: Colors.onPrimary, fontFamily: Fonts.dmSans.bold, fontSize: moderateScale(16) }}>Play again ▸</Text>
        </Pressable>
        <Pressable
          onPress={() => router.replace('/(tabs)/practice')}
          style={({ pressed }) => ({ width: '100%', backgroundColor: Colors.surfaceContainerHighest, borderRadius: Radius.lg, paddingVertical: moderateScale(14), alignItems: 'center', opacity: pressed ? 0.7 : 1 })}
        >
          <Text style={{ color: Colors.onSurface, fontFamily: Fonts.dmSans.bold, fontSize: moderateScale(15) }}>Back to games</Text>
        </Pressable>
      </View>
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
          Couldn&apos;t load this conversation
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
          No conversations have been written for this lesson yet. Try an earlier lesson.
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

export default ConversationGame;
