/**
 * Shared game result screen (spec_game_polish §2/§4; chunky_v3 §9).
 *
 * Replaces the four near-duplicate per-game ResultScreens. Animates in on
 * mount, embeds the generative rangoli, fires the completion haptic, and
 * optionally shows a best-streak line.
 */
import React, { useEffect } from 'react';
import { Animated, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { moderateScale } from 'react-native-size-matters';
import { useAuthStore } from '@/stores/useAuthStore';
import { refreshGameMasteryIfDirty } from '@/services/progress/masteryRefresh';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/spacing';
import { Fonts } from '@/constants/fonts';
import { Icons } from '@/constants/icons';
import { LipButton } from '@/components/ui/LipButton';
import Rangoli from './Rangoli';
import { useEntrance } from './animations';
import { haptics } from './haptics';

type Props = {
  score: number;
  total: number;
  onReplay: () => void;
  /** Optional best-streak line (games with a streak mechanic). */
  bestStreak?: number;
  /** Optional override of the "out of N correct" subline. */
  subline?: string;
  /** Label for the replay CTA. */
  replayLabel?: string;
};

function ratioOf(score: number, total: number): number {
  return total > 0 ? score / total : 0;
}

function getTitle(score: number, total: number): string {
  const ratio = ratioOf(score, total);
  if (ratio === 1) return 'Perfect score!';
  if (ratio >= 0.7) return 'Well done!';
  if (ratio >= 0.4) return 'Keep practising!';
  return 'Keep learning!';
}

const ResultScreen: React.FC<Props> = ({
  score,
  total,
  onReplay,
  bestStreak,
  subline,
  replayLabel = 'Play again ▸',
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { opacity, scale } = useEntrance();

  useEffect(() => {
    haptics.complete();
    // Warm the overall-% rollup while the player reads their score, so
    // Profile is fresh before they can reach it (spec_scalability_offline_fixes §1).
    void refreshGameMasteryIfDirty(queryClient, useAuthStore.getState().user?.id);
  }, [queryClient]);

  return (
    <Animated.View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.xxl,
        gap: Spacing.md,
        opacity,
        transform: [{ scale }],
      }}
    >
      <Rangoli ratio={ratioOf(score, total)} />
      <Text
        style={{
          fontSize: moderateScale(22),
          fontFamily: Fonts.baloo.extrabold,
          color: Colors.onSurface,
        }}
      >
        {getTitle(score, total)}
      </Text>
      <Text
        style={{
          fontSize: moderateScale(52),
          fontFamily: Fonts.baloo.extrabold,
          color: Colors.primaryContainer,
        }}
      >
        {score}
      </Text>
      <Text
        style={{
          fontSize: moderateScale(14),
          color: Colors.tertiary,
          fontFamily: Fonts.dmSans.regular,
        }}
      >
        {subline ?? `out of ${total} correct`}
      </Text>
      {bestStreak && bestStreak >= 2 ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: moderateScale(5),
            backgroundColor: Colors.secondaryFixed,
            borderRadius: Radius.full,
            paddingHorizontal: Spacing.md,
            paddingVertical: moderateScale(5),
          }}
        >
          <Icons.streak size={moderateScale(14)} color={Colors.onSecondaryContainer} />
          <Text
            style={{
              fontSize: moderateScale(13),
              fontFamily: Fonts.dmSans.bold,
              color: Colors.onSecondaryContainer,
            }}
          >
            Best streak {bestStreak}
          </Text>
        </View>
      ) : null}

      <View style={{ width: '100%', gap: Spacing.md, marginTop: Spacing.md }}>
        <LipButton label={replayLabel} variant="primary" onPress={onReplay} />
        <LipButton
          label="Back to Practice"
          variant="secondary"
          onPress={() => router.replace('/(tabs)/practice')}
        />
      </View>
    </Animated.View>
  );
};

export default ResultScreen;
