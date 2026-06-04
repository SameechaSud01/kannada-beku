import React from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/spacing';
import { Fonts } from '@/constants/fonts';
import { Icons } from '@/constants/icons';
import { useShake, useCorrectLift } from '../../shared/animations';
import type { ConversationOption, OptionState } from '../types';

type Props = {
  option:  ConversationOption;
  state:   OptionState;
  onPress: () => void;
};

const BG: Record<OptionState, string> = {
  default:  Colors.surface,
  correct:  Colors.secondaryFixed,
  wrong:    Colors.errorContainerLow,
  reveal:   Colors.secondaryFixed,
  disabled: Colors.surfaceContainerHigh,
};

const BORDER: Record<OptionState, string> = {
  default:  Colors.outlineVariant,
  correct:  Colors.secondary,
  wrong:    Colors.primary,
  reveal:   Colors.secondary,
  disabled: Colors.surfaceDim,
};

const ReplyOptionButton: React.FC<Props> = ({ option, state, onPress }) => {
  const isLifted = state === 'correct' || state === 'reveal';
  const translateX = useShake(state === 'wrong');
  // Full-width stacked replies signal "correct" via shadow + gold fill +
  // checkmark — no translate/scale, so rows stay evenly spaced.
  const { checkProgress, checkScale } = useCorrectLift(isLifted);

  return (
    <Animated.View
      style={{
        transform: [{ translateX }],
        shadowColor: Colors.onSurface,
        shadowOpacity: isLifted ? 0.18 : 0.06,
        shadowOffset: { width: 0, height: isLifted ? moderateScale(6) : moderateScale(2) },
        shadowRadius: isLifted ? moderateScale(10) : moderateScale(4),
        elevation: isLifted ? 6 : 2,
        borderRadius: Radius.xl,
      }}
    >
      <Pressable
        onPress={onPress}
        disabled={state !== 'default'}
        accessibilityRole="button"
        accessibilityLabel={`${option.tr || option.kn}, ${option.en}`}
        accessibilityState={{ selected: isLifted, disabled: state !== 'default' }}
        style={({ pressed }) => ({
          borderRadius: Radius.xl,
          borderWidth: 1.5,
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.md,
          backgroundColor: BG[state],
          borderColor: BORDER[state],
          minHeight: moderateScale(56),
          justifyContent: 'center',
          opacity: pressed && state === 'default' ? 0.8 : 1,
        })}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md }}>
          <View style={{ flex: 1 }}>
            {option.tr ? (
              <Text
                style={{ fontFamily: Fonts.lora.italic, fontSize: moderateScale(16), color: Colors.onSurface }}
                maxFontSizeMultiplier={1.3}
              >
                {option.tr}
              </Text>
            ) : null}
            <Text
              style={{
                fontFamily: Fonts.dmSans.medium,
                fontSize: moderateScale(13),
                color: Colors.tertiary,
                marginTop: moderateScale(2),
              }}
              maxFontSizeMultiplier={1.3}
            >
              {option.en}
            </Text>
          </View>
          <Text
            style={{ fontFamily: Fonts.notoSansKannada.regular, fontSize: moderateScale(16), color: Colors.onSurface }}
            maxFontSizeMultiplier={1.3}
          >
            {option.kn}
          </Text>
        </View>
        {isLifted && (
          <Animated.View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: Spacing.sm,
              right: Spacing.sm,
              opacity: checkProgress,
              transform: [{ scale: checkScale }],
            }}
          >
            <Icons.correct size={moderateScale(16)} color={Colors.secondary} />
          </Animated.View>
        )}
      </Pressable>
    </Animated.View>
  );
};

export default ReplyOptionButton;
