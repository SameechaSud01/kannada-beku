import { useEffect, useRef } from 'react';
import { View, Text, ScrollView, Pressable, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { useCompletedLessons } from '../../hooks/progress';
import { useDbLessons } from '../../hooks/useLessons';
import {
  PLANNED_LESSON_SLOTS,
  TOTAL_LESSON_SLOTS,
} from '../../constants/lessons/plannedLessons';
import { useModal } from '../../components/modals/ModalHost';
import { LessonLockedDialog } from '../../components/modals/instances/LessonLockedDialog';
import { LessonInfoDialog } from '../../components/modals/instances/LessonInfoDialog';
import { BasicsCard } from '../../components/guide/BasicsCard';
import { Watermark } from '../../components/ui/Watermark';

const ESTIMATED_MIN_PER_LESSON = 5;

type RowState = 'done' | 'active' | 'locked';

type LessonRow = {
  slot: number;
  state: RowState;
  title: string;
  subtitle: string;
  char: string;
  phraseCount: number;
  realLessonSlug?: string;
  prevTitle?: string;
  prevSlug?: string;
};

export default function LearnScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const completedLessons = useCompletedLessons();
  const modal = useModal();
  const lessonsQuery = useDbLessons();
  const dbLessons = lessonsQuery.data ?? [];

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(4)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, []);

  const completedCount = Math.min(completedLessons.length, TOTAL_LESSON_SLOTS);

  const rows: LessonRow[] = PLANNED_LESSON_SLOTS.map((slot, idx) => {
    const real = dbLessons.find((l) => l.lessonNo === slot.slot);
    const prevReal = dbLessons.find((l) => l.lessonNo === slot.slot - 1);
    const n = idx + 1;

    let state: RowState;
    if (n <= completedCount) state = 'done';
    else if (n === completedCount + 1) state = 'active';
    else state = 'locked';

    return {
      slot: n,
      state,
      title: real?.title ?? slot.title,
      subtitle: slot.subtitle,
      char: slot.charPlaceholder,
      phraseCount: real?.phrases.length ?? 0,
      realLessonSlug: real?.slug,
      prevTitle: idx > 0 ? (prevReal?.title ?? PLANNED_LESSON_SLOTS[idx - 1].title) : undefined,
      prevSlug: prevReal?.slug,
    };
  });

  const handleRowPress = (row: LessonRow) => {
    if (row.state === 'locked') {
      const prevSlot = row.slot - 1;
      modal.show({
        kind: 'dialog',
        component: LessonLockedDialog,
        props: {
          lessonNumber: row.slot,
          lessonTitle: row.title,
          prevLessonNumber: prevSlot,
          prevLessonTitle: row.prevTitle ?? `Lesson ${prevSlot}`,
          onGoToPrev: () => {
            modal.dismiss();
            if (row.prevSlug) router.push(`/lesson/${row.prevSlug}`);
          },
          onDismiss: () => modal.dismiss(),
        },
        dim: 0.4,
      });
      return;
    }
    if (row.realLessonSlug) {
      router.push(`/lesson/${row.realLessonSlug}`);
    }
  };

  const handleInfoPress = (row: LessonRow) => {
    const prevSlot = row.slot - 1;
    modal.show({
      kind: 'dialog',
      component: LessonInfoDialog,
      props: {
        lessonNumber: row.slot,
        lessonTitle: row.title,
        description: row.subtitle,
        phraseCount: row.phraseCount,
        estimatedMinutes: ESTIMATED_MIN_PER_LESSON,
        locked: row.state === 'locked',
        prevLessonNumber: row.state === 'locked' ? prevSlot : undefined,
        prevLessonTitle:
          row.state === 'locked' ? row.prevTitle ?? `Lesson ${prevSlot}` : undefined,
        onDismiss: () => modal.dismiss(),
      },
      dim: 0.4,
    });
  };

  return (
    <Animated.View
      style={{
        flex: 1,
        backgroundColor: Colors.surface,
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <Watermark motif="rangoli" />

      {/* Header — "Your journey" + italic line + hairline */}
      <View
        style={{
          paddingTop: insets.top + Spacing.sm,
          paddingBottom: Spacing.md,
          paddingHorizontal: Spacing.lg,
          borderBottomWidth: 1,
          borderBottomColor: Colors.hairline,
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.baloo.extrabold,
            fontSize: moderateScale(25),
            color: Colors.onSurface,
            letterSpacing: -0.4,
            lineHeight: moderateScale(38),
          }}
          maxFontSizeMultiplier={1.2}
        >
          Your journey
        </Text>
        <Text
          style={{
            fontFamily: Fonts.lora.italic,
            fontSize: moderateScale(13),
            color: Colors.tertiary,
            marginTop: moderateScale(1),
          }}
          maxFontSizeMultiplier={1.4}
        >
          Swalpa swalpa — one step at a time.
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: moderateScale(40) + insets.bottom }}
      >
        <View style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, marginBottom: moderateScale(14) }}>
          <BasicsCard />
        </View>

        <View style={{ paddingHorizontal: Spacing.lg, gap: moderateScale(9) }}>
          {rows.map((row) => (
            <LessonRowView
              key={`slot-${row.slot}`}
              row={row}
              onPress={() => handleRowPress(row)}
              onInfoPress={() => handleInfoPress(row)}
            />
          ))}
        </View>
      </ScrollView>
    </Animated.View>
  );
}

function LessonRowView({
  row,
  onPress,
  onInfoPress,
}: {
  row: LessonRow;
  onPress: () => void;
  onInfoPress: () => void;
}) {
  const isLocked = row.state === 'locked';
  const isDone = row.state === 'done';
  const isActive = row.state === 'active';

  // Tile colours per state (done = gold-wash, active = red, locked = dim).
  const tileBg = isDone ? Colors.secondaryFixed : isActive ? Colors.primary : Colors.surfaceContainerHigh;
  const glyphColor = isDone ? Colors.onSecondaryContainer : isActive ? Colors.onPrimary : Colors.textFaint;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        isLocked
          ? `Locked. Complete ${row.prevTitle ?? 'the previous lesson'} to unlock.`
          : `${row.slot}. ${row.title}${isDone ? ', completed' : ', start'}`
      }
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: moderateScale(13),
        borderRadius: Radius.xl,
        padding: moderateScale(12),
        opacity: isLocked ? 0.62 : 1,
        // Active = white card with a 2px red ring + soft red shadow.
        // Done/locked = tonal fill, no border (No-Line rule).
        backgroundColor: isActive ? Colors.surfaceContainerLowest : isDone ? Colors.secondaryFixed : Colors.surfaceContainerLow,
        ...(isActive
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
        transform: [{ scale: pressed && !isLocked ? 0.98 : 1 }],
      })}
    >
      <View
        style={{
          width: moderateScale(50),
          height: moderateScale(50),
          borderRadius: moderateScale(15),
          backgroundColor: tileBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.notoSansKannada.bold,
            fontSize: moderateScale(24),
            lineHeight: moderateScale(36),
            paddingTop: moderateScale(2),
            color: glyphColor,
          }}
          maxFontSizeMultiplier={1.2}
        >
          {row.char}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: Fonts.baloo.bold,
            fontSize: moderateScale(17),
            color: Colors.onSurface,
            letterSpacing: -0.2,
          }}
          maxFontSizeMultiplier={1.3}
          numberOfLines={1}
        >
          {row.title}
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
          {row.subtitle}
        </Text>
      </View>

      <Pressable
        onPress={onInfoPress}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={`About Lesson ${row.slot}: ${row.title}`}
        style={({ pressed }) => ({ padding: moderateScale(4), opacity: pressed ? 0.5 : 1 })}
      >
        <Icons.info size={moderateScale(18)} color={Colors.tertiary} />
      </Pressable>

      <View style={{ marginLeft: moderateScale(4) }}>
        {isDone ? (
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
        ) : isActive ? (
          <View
            style={{
              width: moderateScale(32),
              height: moderateScale(32),
              borderRadius: Radius.full,
              backgroundColor: Colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              ...{
                shadowColor: Colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 10,
                elevation: 6,
              },
            }}
          >
            <Icons.play size={moderateScale(15)} color={Colors.onPrimary} />
          </View>
        ) : (
          <Icons.locked size={moderateScale(17)} color={Colors.textFaint} />
        )}
      </View>
    </Pressable>
  );
}
