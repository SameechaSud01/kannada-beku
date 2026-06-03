import React from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/spacing';
import { Fonts } from '@/constants/fonts';
import { Icons } from '@/constants/icons';
import { GlossTag } from '@/components/ui/GlossTag';
import { splitGloss } from '@/utils/gloss';
import { useShake, useCorrectLift } from '../../shared/animations';
import type { Option } from '../types';

export type OptionState = 'default' | 'correct' | 'wrong' | 'reveal' | 'disabled';

type Props = {
  option: Option;
  state: OptionState;
  onPress: () => void;
  /** When any option in the round has a gloss tag, every tile reserves the
   *  tag's height (invisible placeholder when absent) so all tiles match. */
  reserveTag?: boolean;
};

const OptionButton: React.FC<Props> = ({ option, state, onPress, reserveTag }) => {
  const isLifted = state === 'correct' || state === 'reveal';
  const isWrong = state === 'wrong';

  const { text: enText, tag } = splitGloss(option.en);

  const translateX = useShake(isWrong);
  const { translateY, scale, checkProgress, checkScale } = useCorrectLift(isLifted);

  return (
    <Animated.View
      style={{
        transform: [{ translateY }, { translateX }, { scale }],
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
        android_ripple={null}
        accessibilityRole="button"
        accessibilityLabel={`${option.tr || option.en}, ${option.en}`}
        accessibilityState={{ selected: isLifted, disabled: state !== 'default' }}
        style={{
          backgroundColor: Colors.surface,
          borderWidth: 1,
          borderColor: Colors.outlineVariant,
          borderRadius: Radius.xl,
          padding: Spacing.lg,
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: moderateScale(88),
        }}
      >
        {option.tr ? (
          <Text
            style={{
              fontFamily: Fonts.lora.italic,
              fontSize: moderateScale(18),
              textAlign: 'center',
              color: Colors.onSurface,
            }}
            maxFontSizeMultiplier={1.3}
          >
            {option.tr}
          </Text>
        ) : null}
        <Text
          style={{
            fontFamily: Fonts.dmSans.medium,
            fontSize: moderateScale(13),
            textAlign: 'center',
            marginTop: option.tr ? moderateScale(2) : 0,
            color: Colors.tertiary,
          }}
          maxFontSizeMultiplier={1.3}
        >
          {enText}
        </Text>
        {tag ? (
          <View style={{ marginTop: moderateScale(4) }}>
            <GlossTag tag={tag} />
          </View>
        ) : reserveTag ? (
          // Invisible same-height placeholder so tag-less tiles match tagged ones.
          <View style={{ marginTop: moderateScale(4), opacity: 0 }} pointerEvents="none">
            <GlossTag tag="—" />
          </View>
        ) : null}
        <Text
          style={{
            fontFamily: Fonts.notoSansKannada.regular,
            fontSize: moderateScale(13),
            textAlign: 'center',
            marginTop: moderateScale(4),
            color: Colors.tertiary,
            opacity: 0.7,
          }}
          maxFontSizeMultiplier={1.3}
        >
          {option.kn}
        </Text>
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
            <Icons.correct size={moderateScale(18)} color={Colors.secondary} />
          </Animated.View>
        )}
      </Pressable>
    </Animated.View>
  );
};

export default OptionButton;
