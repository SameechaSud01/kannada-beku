import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { IconPlayerPlay, IconVolume } from '@tabler/icons-react-native';
import { Colors } from '../../../../constants/colors';
import { Fonts } from '../../../../constants/fonts';
import { Radius } from '../../../../constants/spacing';

type Props = {
  isPlaying: boolean;
  onPress: () => void;
};

const AudioButton: React.FC<Props> = ({ isPlaying, onPress }) => {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.15, duration: 500, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulse.stopAnimation();
      pulse.setValue(1);
    }
  }, [isPlaying, pulse]);

  return (
    <View style={{ alignItems: 'center' }}>
      <Pressable
        onPress={onPress}
        disabled={isPlaying}
        accessibilityRole='button'
        accessibilityLabel='tap to hear the word'
        style={{
          width: 64,
          height: 64,
          borderRadius: Radius.full,
          backgroundColor: Colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isPlaying ? 0.85 : 1,
        }}
      >
        <Animated.View style={{ transform: [{ scale: pulse }] }}>
          {isPlaying ? (
            <IconVolume size={28} color={Colors.onPrimary} />
          ) : (
            <IconPlayerPlay size={28} color={Colors.onPrimary} />
          )}
        </Animated.View>
      </Pressable>
      <Text
        style={{
          fontFamily: Fonts.dmSans.regular,
          fontSize: 12,
          color: Colors.tertiary,
          marginTop: 8,
          textAlign: 'center',
        }}
      >
        {isPlaying ? 'playing…' : 'tap to hear the word'}
      </Text>
    </View>
  );
};

export default AudioButton;
