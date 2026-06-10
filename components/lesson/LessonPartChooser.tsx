import { View, Text, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { BACK_CHIP_TOP_RESERVE } from '../ui/ExitBackButton';
import type { Lesson } from '../../constants/lessons/types';
import { useLessonParts, type PartState } from '../../hooks/useLessonParts';

interface LessonPartChooserProps {
  lesson: Lesson;
  onSelectPart: (partKey: string) => void;
}

/**
 * Sub-part picker shown when a split lesson is opened. Parts unlock in order
 * (spec_lesson_split_map); the learner picks the active one to play.
 */
export function LessonPartChooser({ lesson, onSelectPart }: LessonPartChooserProps) {
  const insets = useSafeAreaInsets();
  const parts = useLessonParts(lesson);
  const doneCount = parts.filter((p) => p.done).length;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + BACK_CHIP_TOP_RESERVE,
          paddingHorizontal: Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xxxl,
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.baloo.extrabold,
            fontSize: moderateScale(26),
            color: Colors.onSurface,
            letterSpacing: -0.4,
            lineHeight: moderateScale(36),
          }}
          maxFontSizeMultiplier={1.2}
        >
          {lesson.title}
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.medium,
            fontSize: moderateScale(13),
            color: Colors.tertiary,
            marginTop: Spacing.xs,
          }}
          maxFontSizeMultiplier={1.3}
        >
          {doneCount} of {parts.length} parts done
        </Text>

        {lesson.situation ? (
          <Text
            style={{
              fontFamily: Fonts.dmSans.regular,
              fontSize: moderateScale(13.5),
              color: Colors.tertiary,
              lineHeight: moderateScale(20),
              marginTop: Spacing.md,
            }}
            maxFontSizeMultiplier={1.3}
          >
            {lesson.situation}
          </Text>
        ) : null}

        <View style={{ gap: moderateScale(10), marginTop: Spacing.xl }}>
          {parts.map((part) => (
            <PartRow
              key={part.key}
              part={part}
              onPress={() => part.unlocked && onSelectPart(part.key)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function PartRow({ part, onPress }: { part: PartState; onPress: () => void }) {
  const locked = !part.unlocked;
  const tileBg = part.done
    ? Colors.secondaryFixed
    : part.active
      ? Colors.primary
      : Colors.surfaceContainerHigh;
  const numColor = part.done
    ? Colors.onSecondaryContainer
    : part.active
      ? Colors.onPrimary
      : Colors.textFaint;

  const items: string[] = [];
  if (part.wordCount) items.push(`${part.wordCount} ${part.wordCount === 1 ? 'word' : 'words'}`);
  if (part.phraseCount)
    items.push(`${part.phraseCount} ${part.phraseCount === 1 ? 'phrase' : 'phrases'}`);

  return (
    <Pressable
      onPress={onPress}
      disabled={locked}
      accessibilityRole="button"
      accessibilityState={{ disabled: locked }}
      accessibilityLabel={
        locked
          ? `${part.label}, locked. Finish the previous part to unlock.`
          : `${part.label}${part.done ? ', done' : part.active ? ', continue' : ''}`
      }
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: moderateScale(13),
        borderRadius: Radius.xl,
        padding: moderateScale(12),
        opacity: locked ? 0.55 : 1,
        backgroundColor: part.active ? Colors.surfaceContainerLowest : Colors.surfaceContainerLow,
        ...(part.active
          ? {
              borderWidth: 2,
              borderColor: Colors.primary,
              shadowColor: Colors.primary,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.18,
              shadowRadius: 16,
              elevation: 4,
            }
          : null),
        transform: [{ scale: pressed && !locked ? 0.98 : 1 }],
      })}
    >
      <View
        style={{
          width: moderateScale(46),
          height: moderateScale(46),
          borderRadius: moderateScale(14),
          backgroundColor: tileBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.baloo.extrabold,
            fontSize: moderateScale(18),
            color: numColor,
          }}
          maxFontSizeMultiplier={1.2}
        >
          {part.key}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: Fonts.baloo.bold,
            fontSize: moderateScale(16),
            color: Colors.onSurface,
            letterSpacing: -0.2,
          }}
          maxFontSizeMultiplier={1.3}
          numberOfLines={1}
        >
          {part.label}
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.medium,
            fontSize: moderateScale(12.5),
            color: Colors.tertiary,
            marginTop: moderateScale(1),
          }}
          maxFontSizeMultiplier={1.3}
          numberOfLines={1}
        >
          {items.join(' · ')}
        </Text>
      </View>

      <View
        style={{
          width: moderateScale(30),
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {part.done ? (
          <View
            style={{
              width: moderateScale(26),
              height: moderateScale(26),
              borderRadius: Radius.full,
              backgroundColor: Colors.secondary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icons.check size={moderateScale(15)} color={Colors.onPrimary} strokeWidth={2.6} />
          </View>
        ) : locked ? (
          <Icons.locked size={moderateScale(17)} color={Colors.textFaint} />
        ) : (
          <Icons.play size={moderateScale(16)} color={Colors.primary} />
        )}
      </View>
    </Pressable>
  );
}
