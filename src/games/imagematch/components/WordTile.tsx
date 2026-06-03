import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/spacing';
import { Fonts } from '@/constants/fonts';
import { Icons } from '@/constants/icons';
import { useShake } from '../../shared/animations';
import type { TileState, VocabItem } from '../types';

type Props = {
  item:    VocabItem;
  state:   TileState;
  onPress: () => void;
};

const BG: Record<TileState, string> = {
  default:  Colors.surface,
  selected: Colors.surfaceContainerHigh,
  matched:  Colors.secondaryFixed,
  mismatch: Colors.errorContainerLow,
};

const BORDER: Record<TileState, string> = {
  default:  Colors.outlineVariant,
  selected: Colors.primary,
  matched:  Colors.secondary,
  mismatch: Colors.primary,
};

const WordTile: React.FC<Props> = ({ item, state, onPress }) => {
  const translateX = useShake(state === 'mismatch');
  const pop = useRef(new Animated.Value(1)).current;
  const locked = state === 'matched';

  // Lock "pop" when a pair matches.
  useEffect(() => {
    if (state !== 'matched') return;
    Animated.sequence([
      Animated.spring(pop, { toValue: 1.08, damping: 8, stiffness: 220, mass: 1, useNativeDriver: true }),
      Animated.spring(pop, { toValue: 1, damping: 12, stiffness: 200, mass: 1, useNativeDriver: true }),
    ]).start();
  }, [state, pop]);

  return (
    <Animated.View style={{ transform: [{ translateX }, { scale: pop }], opacity: locked ? 0.55 : 1 }}>
      <Pressable
        onPress={onPress}
        disabled={locked}
        accessibilityRole="button"
        accessibilityLabel={`${item.ph || item.kn}, ${item.en}`}
        accessibilityState={{ selected: state === 'selected', disabled: locked }}
        style={({ pressed }) => ({
          borderRadius: Radius.lg,
          borderWidth: 1.5,
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.md,
          backgroundColor: BG[state],
          borderColor: BORDER[state],
          minHeight: moderateScale(56),
          justifyContent: 'center',
          opacity: pressed && state === 'default' ? 0.8 : 1,
        })}
      >
        {item.ph ? (
          <Text
            style={{ fontFamily: Fonts.lora.italic, fontSize: moderateScale(16), color: Colors.onSurface }}
            numberOfLines={1}
            maxFontSizeMultiplier={1.3}
          >
            {item.ph}
          </Text>
        ) : null}
        <Text
          style={{ fontFamily: Fonts.notoSansKannada.regular, fontSize: moderateScale(14), color: Colors.tertiary, marginTop: moderateScale(2) }}
          numberOfLines={1}
          maxFontSizeMultiplier={1.3}
        >
          {item.kn}
        </Text>
        {locked && (
          <View style={{ position: 'absolute', top: moderateScale(4), right: moderateScale(4) }}>
            <Icons.correct size={moderateScale(16)} color={Colors.secondary} />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

export default WordTile;
