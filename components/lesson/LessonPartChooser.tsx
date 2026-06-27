import { View, Text, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { BACK_CHIP_TOP_RESERVE } from '../ui/ExitBackButton';
import { ChunkyPressable } from '../ui/ChunkyPressable';
import { ChunkyCircle } from '../ui/ChunkyLip';
import { LockTile } from '../ui/LockTile';
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
    <View style={{ flex: 1, backgroundColor: Colors.surfaceCream }}>
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
  const titleColor = locked ? Colors.textFaint : Colors.onSurface;
  const subColor = locked ? Colors.textFaint : Colors.tertiary;

  const items: string[] = [];
  if (part.wordCount) items.push(`${part.wordCount} ${part.wordCount === 1 ? 'word' : 'words'}`);
  if (part.phraseCount)
    items.push(`${part.phraseCount} ${part.phraseCount === 1 ? 'phrase' : 'phrases'}`);

  const a11yLabel = locked
    ? `${part.label}, locked. Finish the previous part to unlock.`
    : `${part.label}${part.done ? ', done' : part.active ? ', continue' : ''}`;

  const content = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: moderateScale(13),
        padding: moderateScale(12),
      }}
    >
      {/* Number tile / lock */}
      {locked ? (
        <LockTile size={46} radius={moderateScale(14)} />
      ) : (
        <View
          style={{
            width: moderateScale(46),
            height: moderateScale(46),
            borderRadius: moderateScale(14),
            backgroundColor: part.active ? Colors.primaryContainer : Colors.secondaryFixed,
            borderBottomWidth: 3,
            borderBottomColor: part.active ? Colors.redLip : Colors.goldLip,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontFamily: Fonts.baloo.extrabold,
              fontSize: moderateScale(18),
              color: part.active ? Colors.onPrimary : Colors.onSecondaryContainer,
            }}
            maxFontSizeMultiplier={1.2}
          >
            {part.key}
          </Text>
        </View>
      )}

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: Fonts.baloo.bold,
            fontSize: moderateScale(16),
            color: titleColor,
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
            color: subColor,
            marginTop: moderateScale(1),
          }}
          maxFontSizeMultiplier={1.3}
          numberOfLines={1}
        >
          {items.join(' · ')}
        </Text>
      </View>

      <View style={{ width: moderateScale(42), alignItems: 'center', justifyContent: 'center' }}>
        {part.done ? (
          <ChunkyCircle
            size={moderateScale(26)}
            depth={moderateScale(2)}
            bg={Colors.secondaryContainer}
            lipColor={Colors.goldLip}
          >
            <Icons.check
              size={moderateScale(15)}
              color={Colors.onSecondaryContainer}
              strokeWidth={2.6}
            />
          </ChunkyCircle>
        ) : part.active ? (
          <ChunkyCircle
            size={moderateScale(42)}
            depth={moderateScale(3)}
            bg={Colors.primaryContainer}
            lipColor={Colors.redLip}
          >
            <Icons.play size={moderateScale(16)} color={Colors.onPrimary} />
          </ChunkyCircle>
        ) : null}
      </View>
    </View>
  );

  // Locked rows are de-emphasised and flat (no lip / no press-translate).
  if (locked) {
    return (
      <Pressable
        onPress={onPress}
        disabled
        accessibilityRole="button"
        accessibilityState={{ disabled: true }}
        accessibilityLabel={a11yLabel}
      >
        <View
          style={{
            backgroundColor: Colors.surfaceCreamLow,
            borderRadius: Radius.chunky,
            borderWidth: 1,
            borderColor: 'rgba(217,123,58,0.30)',
            opacity: 0.85,
          }}
        >
          {content}
        </View>
      </Pressable>
    );
  }

  return (
    <ChunkyPressable
      onPress={onPress}
      accessibilityLabel={a11yLabel}
      bg={part.active ? '#ffffff' : Colors.secondaryFixed}
      lip={part.active ? 5 : 4}
      lipColor={part.active ? Colors.redLip : Colors.goldLip}
      border={part.active}
      borderColor={Colors.primaryContainer}
      borderWidth={2}
      radius={Radius.chunky}
    >
      {content}
    </ChunkyPressable>
  );
}
