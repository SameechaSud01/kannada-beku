import React from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/spacing';
import { Fonts } from '@/constants/fonts';
import { Icons } from '@/constants/icons';
import { useShake } from '../../shared/animations';
import type { OptionState, QuizOption } from '../types';

type Props = {
  option:  QuizOption;
  state:   OptionState;
  onPress: () => void;
};

// chunky_v3 §9: correct = goldPale face + goldLip border + gold check; wrong =
// redPale + 2px primaryContainer border (wrong STAYS red — error ≠ warning).
const FACE: Record<OptionState, string> = {
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

const BORDER_WIDTH: Record<OptionState, number> = {
  default:  1,
  correct:  2,
  wrong:    2,
  reveal:   2,
  disabled: 1,
};

const QuizOptionButton: React.FC<Props> = ({ option, state, onPress }) => {
  const isLifted = state === 'correct' || state === 'reveal';
  const isWrong = state === 'wrong';
  const translateX = useShake(isWrong);

  return (
    <Animated.View style={{ flex: 1, transform: [{ translateX }] }}>
      <Pressable
        onPress={onPress}
        disabled={state !== 'default'}
        accessibilityRole="button"
        accessibilityLabel={`${option.primary}${option.secondary ? `, ${option.secondary}` : ''}`}
        accessibilityState={{ selected: isLifted, disabled: state !== 'default' }}
        style={({ pressed }) => ({
          flex: 1,
          borderRadius: Radius.chunky,
          borderWidth: BORDER_WIDTH[state],
          // Chunky lip on interactive (default) tiles; flat once answered.
          borderBottomWidth: state === 'default' ? 4 : BORDER_WIDTH[state],
          borderBottomColor: state === 'default' ? Colors.cardLip : BORDER[state],
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.md,
          backgroundColor: FACE[state],
          borderColor: BORDER[state],
          minHeight: moderateScale(76),
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ translateY: pressed && state === 'default' ? 2 : 0 }],
        })}
      >
        <Text
          style={{
            fontFamily: option.secondary ? Fonts.dmSans.bold : Fonts.dmSans.medium,
            fontSize: moderateScale(16),
            color: Colors.onSurface,
            textAlign: 'center',
          }}
          maxFontSizeMultiplier={1.3}
        >
          {option.primary}
        </Text>
        {option.secondary ? (
          <Text
            style={{
              fontFamily: Fonts.notoSansKannada.regular,
              fontSize: moderateScale(13),
              color: Colors.tertiary,
              textAlign: 'center',
              marginTop: moderateScale(2),
            }}
            maxFontSizeMultiplier={1.3}
          >
            {option.secondary}
          </Text>
        ) : null}
        {isLifted && (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: Spacing.sm,
              right: Spacing.sm,
              width: moderateScale(20),
              height: moderateScale(20),
              borderRadius: Radius.full,
              backgroundColor: Colors.secondaryContainer,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icons.check size={moderateScale(13)} color={Colors.onSecondaryContainer} strokeWidth={3} />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

export default QuizOptionButton;
