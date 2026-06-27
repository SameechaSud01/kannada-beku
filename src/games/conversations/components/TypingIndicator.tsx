/**
 * Three pulsing dots shown while an NPC line is "being typed"
 * (spec_conversations_runner §8).
 */
import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '@/constants/colors';

const Dot: React.FC<{ delay: number }> = ({ delay }) => {
  const v = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(v, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0.3, duration: 300, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v, delay]);
  return (
    <Animated.View
      style={{
        width: moderateScale(7),
        height: moderateScale(7),
        borderRadius: moderateScale(4),
        backgroundColor: Colors.tertiary,
        opacity: v,
      }}
    />
  );
};

const TypingIndicator: React.FC = () => (
  <View
    accessibilityLabel="typing"
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      gap: moderateScale(4),
      paddingVertical: moderateScale(4),
    }}
  >
    <Dot delay={0} />
    <Dot delay={150} />
    <Dot delay={300} />
  </View>
);

export default TypingIndicator;
