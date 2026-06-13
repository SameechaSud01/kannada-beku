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

// chunky_v3: correct = goldPale + 2px goldLip border + gold check; wrong =
// redPale + 2px primaryContainer border (wrong STAYS red).
const BG: Record<OptionState, string> = {
  default:  '#ffffff',
  correct:  Colors.secondaryFixed,
  wrong:    Colors.errorContainerLow,
  reveal:   Colors.secondaryFixed,
  disabled: '#ffffff',
};

const BORDER: Record<OptionState, string> = {
  default:  Colors.hairline,
  correct:  Colors.goldLip,
  wrong:    Colors.primaryContainer,
  reveal:   Colors.goldLip,
  disabled: Colors.hairline,
};

const ReplyOptionButton: React.FC<Props> = ({ option, state, onPress }) => {
  const isLifted = state === 'correct' || state === 'reveal';
  const translateX = useShake(state === 'wrong');
  const { checkProgress, checkScale } = useCorrectLift(isLifted);

  const borderW = state === 'default' || state === 'disabled' ? 1 : 2;

  return (
    <Animated.View
      style={{
        transform: [{ translateX }],
        borderRadius: Radius.chunky,
      }}
    >
      <Pressable
        onPress={onPress}
        disabled={state !== 'default'}
        accessibilityRole="button"
        accessibilityLabel={`${option.tr || option.kn}, ${option.en}`}
        accessibilityState={{ selected: isLifted, disabled: state !== 'default' }}
        style={({ pressed }) => ({
          borderRadius: Radius.chunky,
          borderWidth: borderW,
          borderBottomWidth: state === 'default' ? 4 : borderW,
          borderBottomColor: state === 'default' ? Colors.cardLip : BORDER[state],
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.md,
          backgroundColor: BG[state],
          borderColor: BORDER[state],
          minHeight: moderateScale(56),
          justifyContent: 'center',
          transform: [{ translateY: pressed && state === 'default' ? 2 : 0 }],
        })}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md }}>
          <View style={{ flex: 1 }}>
            {option.tr ? (
              <Text
                style={{ fontFamily: Fonts.dmSans.bold, fontSize: moderateScale(16), color: Colors.onSurface }}
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
              width: moderateScale(20),
              height: moderateScale(20),
              borderRadius: Radius.full,
              backgroundColor: Colors.secondaryContainer,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icons.check size={moderateScale(13)} color={Colors.onSecondaryContainer} strokeWidth={3} />
          </Animated.View>
        )}
      </Pressable>
    </Animated.View>
  );
};

export default ReplyOptionButton;
