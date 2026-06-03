import React, { useEffect, useRef } from 'react';
import { Animated, View, Text } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/spacing';
import { Fonts } from '@/constants/fonts';
import { Icons } from '@/constants/icons';

type Props = {
  secondsLeft: number;
  total:       number;
  /** When the question is answered, freeze the bar (no colour alarm). */
  frozen?:     boolean;
};

const TimerBar: React.FC<Props> = ({ secondsLeft, total, frozen }) => {
  const ratio = Math.max(0, Math.min(1, secondsLeft / total));
  const low = !frozen && secondsLeft <= 3;

  // Smoothly ease the fill width as seconds tick (non-native driver — width
  // can't run on the native thread).
  const fill = useRef(new Animated.Value(ratio)).current;
  useEffect(() => {
    Animated.timing(fill, {
      toValue: ratio,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [ratio, fill]);

  // Pulse the icon/track while time is running low.
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!low) {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.4, duration: 450, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 450, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [low, pulse]);

  const widthInterpolate = fill.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });
  const barColor = low ? Colors.primary : Colors.secondary;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
      <Animated.View style={{ opacity: low ? pulse : 1 }}>
        <Icons.clock size={moderateScale(16)} color={barColor} />
      </Animated.View>
      <View
        accessibilityRole="progressbar"
        accessibilityLabel={`${secondsLeft} seconds left`}
        style={{
          flex: 1,
          height: moderateScale(6),
          borderRadius: Radius.full,
          backgroundColor: Colors.surfaceContainerHigh,
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={{
            height: '100%',
            borderRadius: Radius.full,
            backgroundColor: barColor,
            width: widthInterpolate,
          }}
        />
      </View>
      <Text
        style={{
          fontFamily: Fonts.dmSans.bold,
          fontSize: moderateScale(13),
          color: barColor,
          minWidth: moderateScale(18),
          textAlign: 'right',
        }}
        maxFontSizeMultiplier={1.2}
      >
        {secondsLeft}
      </Text>
    </View>
  );
};

export default TimerBar;
