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

// chunky_v3: tray = white chunky; placed = goldPale; correct = goldPale +
// goldLip; wrong = redPale + primaryContainer (error stays red).
const BG: Record<TileTone, string> = {
  tray: '#ffffff',
  placed: Colors.secondaryFixed,
  correct: Colors.secondaryFixed,
  wrong: Colors.errorContainerLow,
};

const BORDER: Record<TileTone, string> = {
  tray: Colors.hairline,
  placed: Colors.goldLip,
  correct: Colors.goldLip,
  wrong: Colors.primaryContainer,
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
      borderRadius: Radius.tile,
      borderWidth: tone === 'tray' ? 1 : 2,
      // Chunky lip on interactive tray tiles; flat for placed/result tones.
      borderBottomWidth: tone === 'tray' && !disabled ? 4 : tone === 'tray' ? 1 : 2,
      borderBottomColor: tone === 'tray' && !disabled ? Colors.cardLip : BORDER[tone],
      backgroundColor: BG[tone],
      borderColor: BORDER[tone],
      alignItems: 'center',
      justifyContent: 'center',
      opacity: disabled ? 0.35 : 1,
      transform: [{ translateY: pressed && tone === 'tray' && !disabled ? 2 : 0 }],
    })}
  >
    <Text
      style={{
        fontFamily: Fonts.notoSansKannada.bold,
        fontSize: moderateScale(22),
        color: Colors.onSurface,
      }}
      maxFontSizeMultiplier={1.3}
    >
      {char}
    </Text>
  </Pressable>
);

export default AksharaTile;
