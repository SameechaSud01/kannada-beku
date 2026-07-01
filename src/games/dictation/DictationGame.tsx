import React, { useEffect, useMemo, useState } from 'react';
import { logger } from '../../../lib/logger';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { useRouter } from 'expo-router';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';
import { Radius, Spacing } from '../../../constants/spacing';
import { GAMES } from '../../../constants/games';
import { useProgressStore } from '../../../stores/progressStore';
import { recordLearningDay } from '../../../services/progress/streak';
import { useGameSplit } from '../shared/parts';
import { GamePartChooser } from '../../../components/games/GamePartChooser';
import { useDictationItems, useRecordDictationAttempt } from '../../../hooks/games/dictation';
import { useDictationGame } from './hooks/useDictationGame';
import ProgressBar from './components/ProgressBar';
import AudioButton from './components/AudioButton';
import AnswerInput from './components/AnswerInput';
import SyllableTray from './components/SyllableTray';
import AnswerRow from './components/AnswerRow';
import ResultScreen from '../shared/ResultScreen';
import FeedbackBanner from '../shared/FeedbackBanner';
import { useAnswerHaptics } from '../shared/haptics';
import { ExitBackButton } from '../../../components/ui/ExitBackButton';
import { LipButton } from '../../../components/ui/LipButton';
import type { DictationWord } from './types';
import type { DictationItem } from '../../../services/api/games/dictation';

type Props = { lessonNo: number; section?: string };

function toWord(item: DictationItem): DictationWord {
  return {
    id: item.id,
    kn: item.expectedAnswer,
    accepted: item.acceptedSpellings ?? [],
    phonetic: item.phonetic ?? '',
  };
}

export default function DictationGame({ lessonNo, section }: Props) {
  const router = useRouter();
  const { data: items, isLoading, isError, refetch } = useDictationItems(lessonNo);
  const { parts, showChooser, playItems, activeSection } = useGameSplit(
    'dictation',
    lessonNo,
    items,
    section ?? null,
  );

  const bank = useMemo<DictationWord[]>(() => playItems.map(toWord), [playItems]);

  if (isLoading) return <CenteredLoading />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (showChooser) {
    return (
      <GamePartChooser
        title={GAMES.dictation.title}
        lessonNo={lessonNo}
        parts={parts}
        onSelectPart={(key) => router.push(`/dictation/${lessonNo}?part=${key}`)}
      />
    );
  }
  if (bank.length === 0) return <EmptyState lessonNo={lessonNo} />;
  return <DictationGameInner bank={bank} gameKey="dictation" sectionKey={activeSection} />;
}

function DictationGameInner({
  bank,
  gameKey,
  sectionKey,
}: {
  bank: DictationWord[];
  gameKey: string;
  sectionKey: string | null;
}) {
  const recordAttempt = useRecordDictationAttempt();
  const completeGamePart = useProgressStore((s) => s.completeGamePart);

  const {
    currentWord,
    currentIndex,
    totalWords,
    phase,
    answerState,
    score,
    streak,
    bestStreak,
    isPlaying,
    audioUnavailable,
    tileable,
    tray,
    placed,
    aksharaCount,
    canCheck,
    playCurrentWord,
    tapTile,
    removeAt,
    check,
    submitTyped,
    nextWord,
    skipWord,
    restart,
  } = useDictationGame(bank, ({ itemId, isCorrect }) => {
    recordAttempt.mutate(
      { itemId, isCorrect },
      { onError: (err) => logger.debug('dictation', 'record attempt failed', { err }) },
    );
  });

  useAnswerHaptics(
    answerState === 'correct' ? 'correct' : answerState === 'unanswered' ? 'unanswered' : 'wrong',
  );

  const [inputText, setInputText] = useState('');
  useEffect(() => {
    setInputText('');
  }, [currentIndex]);

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
          total={totalWords}
          bestStreak={bestStreak}
          subline={`${score} / ${totalWords} correct`}
          onReplay={restart}
        />
      </SafeAreaView>
    );
  }

  const answered = answerState !== 'unanswered';
  const canSubmit = tileable ? canCheck : inputText.trim().length > 0;
  const onCheck = () => (tileable ? check() : submitTyped(inputText));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surfaceCream }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.lg,
          gap: Spacing.lg,
        }}
      >
        {/* Header */}
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
              fontFamily: Fonts.dmSans.medium,
              fontSize: 14,
              color: Colors.tertiary,
              fontVariant: ['tabular-nums'],
            }}
          >
            Word{' '}
            <Text style={{ fontFamily: Fonts.baloo.bold, color: Colors.onSurface }}>
              {currentIndex + 1}
            </Text>{' '}
            / {totalWords}
          </Text>
          <Text
            style={{
              fontFamily: Fonts.dmSans.medium,
              fontSize: 14,
              color: Colors.tertiary,
              fontVariant: ['tabular-nums'],
            }}
          >
            Score{' '}
            <Text style={{ fontFamily: Fonts.baloo.bold, color: Colors.onSurface }}>{score}</Text>
          </Text>
        </View>

        <ProgressBar current={currentIndex} total={totalWords} />

        {/* Audio card — white chunky */}
        <View
          style={{
            backgroundColor: '#ffffff',
            borderRadius: Radius.chunky,
            borderWidth: 1,
            borderColor: Colors.hairline,
            borderBottomWidth: 4,
            borderBottomColor: Colors.cardLip,
            padding: Spacing.xxl,
            alignItems: 'center',
            gap: Spacing.md,
          }}
        >
          <AudioButton isPlaying={isPlaying} onPress={playCurrentWord} />
          {audioUnavailable ? (
            // No audio on this device — reveal the word so the game is still
            // playable as a copy/read exercise (audit H7).
            <>
              <Text
                style={{
                  fontFamily: Fonts.notoSansKannada.bold,
                  fontSize: moderateScale(30),
                  color: Colors.onSurface,
                  lineHeight: moderateScale(44),
                }}
              >
                {currentWord.kn}
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.dmSans.regular,
                  fontSize: moderateScale(13),
                  color: Colors.tertiary,
                  textAlign: 'center',
                }}
              >
                Audio isn’t available on this device — type the word shown above.
              </Text>
            </>
          ) : (
            <Text
              style={{
                fontFamily: Fonts.dmSans.regular,
                fontSize: moderateScale(13),
                color: Colors.tertiary,
              }}
            >
              {tileable ? 'Tap the tiles to spell the word' : 'Type what you hear'}
            </Text>
          )}
        </View>

        {tileable ? (
          <>
            <AnswerRow
              tray={tray}
              placed={placed}
              aksharaCount={aksharaCount}
              answerState={answerState}
              onRemove={removeAt}
            />
            <SyllableTray tray={tray} placed={placed} disabled={answered} onTap={tapTile} />
          </>
        ) : (
          <AnswerInput
            value={inputText}
            onChange={setInputText}
            onSubmit={onCheck}
            answerState={answerState}
            disabled={answered}
          />
        )}

        <FeedbackBanner
          state={answerState === 'correct' ? 'correct' : answered ? 'wrong' : 'unanswered'}
          streak={streak}
        />

        {/* On a miss, reveal the correct word so the learner still learns it —
            English transliteration leads, Kannada script as a small reference. */}
        {answered && answerState !== 'correct' && (
          <View style={{ alignItems: 'center', gap: moderateScale(2) }}>
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: moderateScale(22),
                color: Colors.onSurface,
              }}
            >
              {currentWord.phonetic || currentWord.accepted[0] || currentWord.kn}
            </Text>
            <Text
              style={{
                fontFamily: Fonts.notoSansKannada.regular,
                fontSize: moderateScale(15),
                color: Colors.tertiary,
              }}
            >
              {currentWord.kn}
            </Text>
          </View>
        )}

        {/* Check / Next — disabled uses the flat recipe (no opacity dim). */}
        {!answered ? (
          <LipButton
            label="Check answer"
            variant="primary"
            disabled={!canSubmit}
            onPress={onCheck}
          />
        ) : (
          <LipButton
            label={currentIndex + 1 < totalWords ? 'Next word ▸' : 'See results'}
            variant="primary"
            onPress={nextWord}
          />
        )}

        {/* Skip */}
        {!answered && <LipButton label="Skip this word" variant="tertiary" onPress={skipWord} />}
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
          No dictation words have been authored for this lesson yet. Try an earlier lesson.
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
