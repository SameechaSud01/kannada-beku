import React, { useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/spacing';
import { Fonts } from '../../constants/fonts';
import { Icons } from '../../constants/icons';
import { ChunkyPressable } from '../ui/ChunkyPressable';
import { LockTile } from '../ui/LockTile';
import type { Game } from '../../constants/games';
import type { LessonSelectorItem as Lesson } from '../../hooks/useLessons';

type LessonSelectorProps = {
  game: Game;
  lessons: Lesson[];
  onSelectLesson: (lesson: Lesson) => void;
  onBack: () => void;
};

type LessonPillProps = {
  lesson: Lesson;
  index: number;
  onTap: (lesson: Lesson) => void;
};

function LessonPill({ lesson, index, onTap }: LessonPillProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(moderateScale(8));
  const { unlocked } = lesson;

  useEffect(() => {
    const delay = index * 60;
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 360, easing: Easing.out(Easing.cubic) }),
    );
    translateY.value = withDelay(
      delay,
      withTiming(0, { duration: 360, easing: Easing.out(Easing.cubic) }),
    );
  }, [index, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  // Shared row contents (glyph/lock tile + title block + trailing chevron).
  const row = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        paddingVertical: moderateScale(14),
        paddingHorizontal: moderateScale(16),
      }}
    >
      {unlocked ? (
        <View
          style={{
            width: moderateScale(42),
            height: moderateScale(42),
            borderRadius: Radius.tile,
            backgroundColor: Colors.secondaryFixed,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontFamily: Fonts.notoSansKannada.bold,
              fontSize: moderateScale(22),
              color: Colors.onSecondaryContainer,
            }}
            maxFontSizeMultiplier={1.3}
          >
            {lesson.glyph}
          </Text>
        </View>
      ) : (
        <LockTile size={42} iconSize={20} />
      )}

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: Fonts.baloo.bold,
            fontSize: moderateScale(16),
            color: unlocked ? Colors.onSurface : Colors.textFaint,
          }}
          maxFontSizeMultiplier={1.3}
        >
          Lesson {lesson.n}
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.regular,
            fontSize: moderateScale(12.5),
            color: unlocked ? Colors.tertiary : Colors.textFaint,
            marginTop: moderateScale(1),
          }}
          maxFontSizeMultiplier={1.3}
        >
          {lesson.theme}
        </Text>
      </View>

      {unlocked ? (
        <Icons.forward size={moderateScale(20)} color={Colors.tertiary} />
      ) : null}
    </View>
  );

  return (
    <Animated.View style={animatedStyle}>
      {unlocked ? (
        // Unlocked: white chunky card with a real lip-press.
        <ChunkyPressable
          onPress={() => onTap(lesson)}
          accessibilityLabel={`Lesson ${lesson.n}: ${lesson.theme}`}
          bg="#ffffff"
          lip={4}
          border
          borderColor={Colors.hairline}
          radius={Radius.chunky}
        >
          {row}
        </ChunkyPressable>
      ) : (
        // Locked: §State-semantics recipe — tonal surfaceCreamLow @ ~65%, flat
        // (no lip, no press-translate), opens nothing. textFaint title.
        <View
          accessibilityRole="button"
          accessibilityLabel={`Lesson ${lesson.n}: ${lesson.theme}, locked`}
          accessibilityState={{ disabled: true }}
          style={{
            borderRadius: Radius.chunky,
            backgroundColor: Colors.surfaceCreamLow,
          }}
        >
          {row}
        </View>
      )}
    </Animated.View>
  );
}

export function LessonSelector({
  game,
  lessons,
  onSelectLesson,
  onBack,
}: LessonSelectorProps) {
  const headerOpacity = useSharedValue(0);
  useEffect(() => {
    headerOpacity.value = withTiming(1, {
      duration: 280,
      easing: Easing.out(Easing.cubic),
    });
  }, [headerOpacity]);
  const headerStyle = useAnimatedStyle(() => ({ opacity: headerOpacity.value }));

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.surfaceCream }}
      contentContainerStyle={{
        paddingTop: moderateScale(26),
        paddingHorizontal: Spacing.xl,
        paddingBottom: Spacing.xxxl,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={headerStyle}>
        {/* Back chip */}
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={12}
          style={({ pressed }) => ({
            width: moderateScale(38),
            height: moderateScale(38),
            borderRadius: Radius.full,
            backgroundColor: '#ffffff',
            borderWidth: 1,
            borderColor: Colors.hairline,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: Spacing.md,
            transform: [{ scale: pressed ? 0.94 : 1 }],
          })}
        >
          <Icons.back size={moderateScale(20)} color={Colors.primary} />
        </Pressable>

        <Text
          style={{
            fontFamily: Fonts.baloo.extrabold,
            fontSize: moderateScale(28),
            color: Colors.onSurface,
            letterSpacing: -0.4,
            lineHeight: moderateScale(39),
          }}
          maxFontSizeMultiplier={1.3}
          numberOfLines={2}
        >
          {game.title}
        </Text>

        <Text
          style={{
            fontFamily: Fonts.dmSans.medium,
            fontSize: moderateScale(14),
            color: Colors.tertiary,
            marginTop: moderateScale(2),
            marginBottom: Spacing.lg,
          }}
          maxFontSizeMultiplier={1.3}
        >
          Pick a lesson to play with.
        </Text>
      </Animated.View>

      <View style={{ gap: moderateScale(10) }}>
        {lessons.map((lesson, idx) => (
          <LessonPill key={lesson.n} lesson={lesson} index={idx} onTap={onSelectLesson} />
        ))}
      </View>

      <Text
        style={{
          fontFamily: Fonts.dmSans.regular,
          fontSize: moderateScale(12),
          color: Colors.tertiary,
          lineHeight: moderateScale(18),
          marginTop: Spacing.lg,
        }}
        maxFontSizeMultiplier={1.4}
      >
        Finish a lesson on the Learn tab to unlock it here.
      </Text>
    </ScrollView>
  );
}

export default LessonSelector;
