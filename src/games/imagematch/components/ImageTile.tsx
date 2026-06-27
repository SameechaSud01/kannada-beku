import React, { useEffect, useRef } from 'react';
import { Animated, Image, Pressable, Text, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/spacing';
import { Icons } from '@/constants/icons';
import { useShake } from '../../shared/animations';
import type { TileState, VocabItem } from '../types';

type Props = {
  item: VocabItem;
  state: TileState;
  imageUrl?: string | null;
  onPress: () => void;
};

const BG: Record<TileState, string> = {
  default: Colors.surface,
  selected: Colors.surfaceContainerHigh,
  matched: Colors.secondaryFixed,
  mismatch: Colors.errorContainerLow,
};

const BORDER: Record<TileState, string> = {
  default: Colors.outlineVariant,
  selected: Colors.primary,
  matched: Colors.secondary,
  mismatch: Colors.primary,
};

const ImageTile: React.FC<Props> = ({ item, state, imageUrl, onPress }) => {
  const translateX = useShake(state === 'mismatch');
  const pop = useRef(new Animated.Value(1)).current;
  const locked = state === 'matched';

  useEffect(() => {
    if (state !== 'matched') return;
    Animated.sequence([
      Animated.spring(pop, {
        toValue: 1.08,
        damping: 8,
        stiffness: 220,
        mass: 1,
        useNativeDriver: true,
      }),
      Animated.spring(pop, {
        toValue: 1,
        damping: 12,
        stiffness: 200,
        mass: 1,
        useNativeDriver: true,
      }),
    ]).start();
  }, [state, pop]);

  return (
    <Animated.View
      style={{ transform: [{ translateX }, { scale: pop }], opacity: locked ? 0.55 : 1 }}
    >
      <Pressable
        onPress={onPress}
        disabled={locked}
        accessibilityRole="button"
        accessibilityLabel={`Picture option ${item.en}`}
        accessibilityState={{ disabled: locked }}
        style={({ pressed }) => ({
          borderRadius: Radius.lg,
          borderWidth: 1.5,
          padding: Spacing.sm,
          backgroundColor: BG[state],
          borderColor: BORDER[state],
          minHeight: moderateScale(56),
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed && state === 'default' ? 0.8 : 1,
        })}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={{ width: moderateScale(40), height: moderateScale(40) }}
            resizeMode="contain"
          />
        ) : (
          <Text style={{ fontSize: moderateScale(34), textAlign: 'center' }}>{item.emoji}</Text>
        )}
        {locked && (
          <View style={{ position: 'absolute', top: moderateScale(4), right: moderateScale(4) }}>
            <Icons.correct size={moderateScale(16)} color={Colors.secondary} />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

export default ImageTile;
