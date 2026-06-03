/**
 * Shared game result screen (spec_game_polish §2/§4).
 *
 * Replaces the four near-duplicate per-game ResultScreens. Animates in on
 * mount, embeds the generative rangoli, fires the completion haptic, and
 * optionally shows a best-streak line.
 */
import React, { useEffect } from 'react';
import { Animated, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/spacing';
import { Fonts } from '@/constants/fonts';
import { Icons } from '@/constants/icons';
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
  const { opacity, scale } = useEntrance();

  useEffect(() => {
    haptics.complete();
  }, []);

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
      <Text style={{ fontSize: moderateScale(20), fontFamily: Fonts.dmSans.bold, color: Colors.onSurface }}>
        {getTitle(score, total)}
      </Text>
      <Text style={{ fontSize: moderateScale(48), fontFamily: Fonts.dmSans.bold, color: Colors.primary }}>
        {score}
      </Text>
      <Text style={{ fontSize: moderateScale(14), color: Colors.tertiary, fontFamily: Fonts.dmSans.regular }}>
        {subline ?? `out of ${total} correct`}
      </Text>
      {bestStreak && bestStreak >= 2 ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: moderateScale(4),
            backgroundColor: Colors.secondaryFixed,
            borderRadius: Radius.full,
            paddingHorizontal: Spacing.md,
            paddingVertical: moderateScale(4),
          }}
        >
          <Icons.streak size={moderateScale(14)} color={Colors.onSecondaryContainer} />
          <Text style={{ fontSize: moderateScale(13), fontFamily: Fonts.dmSans.bold, color: Colors.onSecondaryContainer }}>
            Best streak {bestStreak}
          </Text>
        </View>
      ) : null}
      <Pressable
        style={{
          width: '100%',
          backgroundColor: Colors.primary,
          borderRadius: Radius.xl,
          paddingVertical: moderateScale(14),
          alignItems: 'center',
          marginTop: Spacing.md,
        }}
        onPress={onReplay}
      >
        <Text style={{ color: Colors.onPrimary, fontFamily: Fonts.dmSans.bold, fontSize: moderateScale(16) }}>
          {replayLabel}
        </Text>
      </Pressable>
      <View style={{ flexDirection: 'row', gap: Spacing.md, width: '100%' }}>
        <Pressable
          onPress={() => router.replace('/(tabs)/practice')}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: Colors.surfaceContainerHighest,
            borderRadius: Radius.lg,
            paddingVertical: moderateScale(14),
            alignItems: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ color: Colors.onSurface, fontFamily: Fonts.dmSans.bold, fontSize: moderateScale(15) }}>
            Back to games
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.replace('/(tabs)/')}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: Colors.surfaceContainerHighest,
            borderRadius: Radius.lg,
            paddingVertical: moderateScale(14),
            alignItems: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ color: Colors.onSurface, fontFamily: Fonts.dmSans.bold, fontSize: moderateScale(15) }}>
            Back home
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
};

export default ResultScreen;
