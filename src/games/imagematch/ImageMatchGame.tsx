import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/spacing';
import { Fonts } from '@/constants/fonts';
import { useImageMatchItems, useRecordImageMatchAttempt } from '../../../hooks/games/imageMatch';
import { useImageMatchBoard } from './hooks/useImageMatchBoard';
import ProgressBar from './components/ProgressBar';
import MatchBoard from './components/MatchBoard';
import ResultScreen from '../shared/ResultScreen';
import { haptics } from '../shared/haptics';
import { ExitBackButton } from '@/components/ui/ExitBackButton';
import type { VocabItem } from './types';
import type { ImageMatchItem } from '../../../services/api/games/imageMatch';

type Props = { lessonNo: number };

const PLACEHOLDER_EMOJI = '🔤';

function toVocab(item: ImageMatchItem): VocabItem {
  return {
    id: item.id,
    kn: item.kannada,
    ph: item.transliteration ?? '',
    en: item.meaning,
    emoji: item.emoji ?? PLACEHOLDER_EMOJI,
    imageUrl: item.imageUrl,
  };
}

const ImageMatchGame: React.FC<Props> = ({ lessonNo }) => {
  // Fetch the lesson's items + a fallback pool from neighbouring lessons (BOTH
  // directions) for distractor sampling when the lesson has < 4 items. Earlier
  // neighbours alone leave Lesson 1 with no pool, so pull later lessons too.
  const target = useImageMatchItems(lessonNo);
  const prev1 = useImageMatchItems(lessonNo > 1 ? lessonNo - 1 : null);
  const prev2 = useImageMatchItems(lessonNo > 2 ? lessonNo - 2 : null);
  const next1 = useImageMatchItems(lessonNo + 1);
  const next2 = useImageMatchItems(lessonNo + 2);

  const targetBank = useMemo<VocabItem[]>(
    () => (target.data ?? []).map(toVocab),
    [target.data],
  );

  const distractorBank = useMemo<VocabItem[]>(() => {
    const all = [
      ...(target.data ?? []),
      ...(prev1.data ?? []),
      ...(prev2.data ?? []),
      ...(next1.data ?? []),
      ...(next2.data ?? []),
    ];
    // de-dupe by id
    const seen = new Set<string>();
    const dedup: ImageMatchItem[] = [];
    for (const item of all) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      dedup.push(item);
    }
    return dedup.map(toVocab);
  }, [target.data, prev1.data, prev2.data, next1.data, next2.data]);

  // Wait for the neighbour pools too — the board is built once on mount, so it
  // must have its distractors in hand or it would render a degenerate board
  // (e.g. L1's single pair).
  const neighborsLoading = prev1.isLoading || prev2.isLoading || next1.isLoading || next2.isLoading;

  if (target.isLoading || neighborsLoading) return <CenteredLoading />;
  if (target.isError) return <ErrorState onRetry={() => target.refetch()} />;
  if (targetBank.length === 0) return <EmptyState lessonNo={lessonNo} />;

  return <ImageMatchGameInner targetBank={targetBank} distractorBank={distractorBank} />;
};

function ImageMatchGameInner({
  targetBank,
  distractorBank,
}: {
  targetBank: VocabItem[];
  distractorBank: VocabItem[];
}) {
  const recordAttempt = useRecordImageMatchAttempt();

  const {
    wordColumn,
    imageColumn,
    matchedCount,
    totalPairs,
    score,
    phase,
    selectedWordId,
    handleWordTap,
    handleImageTap,
    restart,
  } = useImageMatchBoard(targetBank, distractorBank, ({ itemId, isCorrect }) => {
    recordAttempt.mutate(
      { itemId, isCorrect },
      { onError: (err) => console.warn('[image-match] record attempt failed', err) },
    );
    if (isCorrect) haptics.correct();
    else haptics.wrong();
  });

  if (phase === 'result') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
        <ExitBackButton skipConfirm />
        <ResultScreen score={score} total={totalPairs} onReplay={restart} />
      </SafeAreaView>
    );
  }

  const prompt = selectedWordId ? 'Now tap its picture' : 'Tap a word, then its picture';

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
          <Text
            style={{
              fontSize: moderateScale(14),
              color: Colors.tertiary,
              fontFamily: Fonts.dmSans.regular,
            }}
          >
            {matchedCount} / {totalPairs} matched
          </Text>
          <Text
            style={{
              fontSize: moderateScale(14),
              fontFamily: Fonts.dmSans.bold,
              color: Colors.onSurface,
            }}
          >
            Score {score}
          </Text>
        </View>

        <ProgressBar current={matchedCount} total={totalPairs} />

        <Text
          style={{
            fontSize: moderateScale(15),
            fontFamily: Fonts.dmSans.medium,
            color: Colors.onSurface,
            textAlign: 'center',
          }}
          maxFontSizeMultiplier={1.3}
        >
          {prompt}
        </Text>

        <MatchBoard
          wordColumn={wordColumn}
          imageColumn={imageColumn}
          onWordTap={handleWordTap}
          onImageTap={handleImageTap}
        />
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
            fontFamily: Fonts.dmSans.bold,
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
          <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: moderateScale(14), color: Colors.onPrimary }}>
            Retry
          </Text>
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
            fontFamily: Fonts.dmSans.bold,
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
          No image-match items have been authored for this lesson yet. Try an earlier lesson.
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
          <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: moderateScale(14), color: Colors.onPrimary }}>
            Back to lessons
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export default ImageMatchGame;
