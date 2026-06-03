/**
 * A single Kannada akshara chip (spec_dictation_syllable_builder §2).
 * Used both in the scrambled tray and the assembled answer row.
 */
import React from 'react';
import { Pressable, Text } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/spacing';
import { Fonts } from '@/constants/fonts';

export type TileTone = 'tray' | 'placed' | 'correct' | 'wrong';

type Props = {
  char: string;
  onPress?: () => void;
  disabled?: boolean;
  tone?: TileTone;
};

const BG: Record<TileTone, string> = {
  tray: Colors.surfaceContainerHighest,
  placed: Colors.surfaceContainerHigh,
  correct: Colors.secondaryFixed,
  wrong: Colors.errorContainerLow,
};

const BORDER: Record<TileTone, string> = {
  tray: Colors.outlineVariant,
  placed: Colors.primary,
  correct: Colors.secondary,
  wrong: Colors.primary,
};

const AksharaTile: React.FC<Props> = ({ char, onPress, disabled, tone = 'tray' }) => (
  <Pressable
    onPress={onPress}
    disabled={disabled || !onPress}
    accessibilityRole="button"
    accessibilityLabel={char}
    style={({ pressed }) => ({
      minWidth: moderateScale(48),
      minHeight: moderateScale(48),
      paddingHorizontal: Spacing.md,
      borderRadius: Radius.md,
      borderWidth: 1.5,
      backgroundColor: BG[tone],
      borderColor: BORDER[tone],
      alignItems: 'center',
      justifyContent: 'center',
      opacity: disabled ? 0.35 : pressed ? 0.8 : 1,
    })}
  >
    <Text
      style={{ fontFamily: Fonts.notoSansKannada.bold, fontSize: moderateScale(22), color: Colors.onSurface }}
      maxFontSizeMultiplier={1.3}
    >
      {char}
    </Text>
  </Pressable>
);

export default AksharaTile;
