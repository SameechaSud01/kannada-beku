import { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { useCompletedLessons } from '../../hooks/progress';
import { LESSONS } from '../../constants/lessons';
import { PLANNED_LESSON_SLOTS } from '../../constants/lessons/plannedLessons';
import { GAMES } from '../(tabs)/practice';

export default function GameDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const completedLessons = useCompletedLessons();

  const game = GAMES.find((g) => g.id === id);

  // Default-all-selected chip set, one per completed lesson.
  const completedSlots = useMemo(() => {
    return completedLessons.map((lessonId, idx) => {
      const real = LESSONS[lessonId];
      const planned = PLANNED_LESSON_SLOTS[idx];
      return {
        lessonId,
        slot: idx + 1,
        title: real?.situation.title ?? planned?.title ?? `Lesson ${idx + 1}`,
        char: planned?.charPlaceholder ?? 'ಕ',
      };
    });
  }, [completedLessons]);

  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(completedLessons)
  );

  const toggle = (lessonId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(lessonId)) next.delete(lessonId);
      else next.add(lessonId);
      return next;
    });
  };

  if (!game) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.surface,
          paddingTop: insets.top + Spacing.xxxl,
          paddingHorizontal: Spacing.xxl,
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(18),
            color: Colors.onSurface,
            marginBottom: Spacing.sm,
          }}
        >
          Game not found
        </Text>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text
            style={{
              fontFamily: Fonts.dmSans.medium,
              fontSize: moderateScale(14),
              color: Colors.primary,
              paddingVertical: Spacing.md,
            }}
          >
            ← Back
          </Text>
        </Pressable>
      </View>
    );
  }

  const handleStart = () => {
    if (selected.size === 0) return;
    if (id === 'opposites') {
      router.push('/opposites');
      return;
    }
    if (id === 'dictation') {
      router.push('/dictation');
      return;
    }
    // Other game runners not yet implemented.
    Alert.alert(
      'Round queued',
      `Starting ${game.title} with ${selected.size} lesson${selected.size === 1 ? '' : 's'} loaded.\n\nGame runner UI is not implemented yet.`
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + Spacing.sm,
          paddingBottom: Spacing.md,
          paddingHorizontal: Spacing.xxl,
          flexDirection: 'row',
          alignItems: 'center',
          gap: moderateScale(14),
        }}
      >
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={12}
          style={({ pressed }) => ({
            width: moderateScale(40),
            height: moderateScale(40),
            borderRadius: Radius.full,
            backgroundColor: Colors.surfaceContainerHighest,
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ scale: pressed ? 0.94 : 1 }],
          })}
        >
          <Icons.back size={20} color={Colors.primary} />
        </Pressable>
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(20),
            color: Colors.onSurface,
            letterSpacing: -0.3,
          }}
          maxFontSizeMultiplier={1.3}
        >
          {game.title}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: moderateScale(120) + insets.bottom }}
      >
        <View style={{ paddingHorizontal: Spacing.xxl, paddingTop: Spacing.md }}>
          <Text
            style={{
              fontFamily: Fonts.dmSans.regular,
              fontSize: moderateScale(14),
              color: Colors.tertiary,
              lineHeight: moderateScale(20),
              marginBottom: moderateScale(28),
            }}
            maxFontSizeMultiplier={1.4}
          >
            Pick which lessons to practice. Everything you&apos;ve completed is available.
          </Text>

          {completedSlots.length === 0 ? (
            <View
              style={{
                backgroundColor: Colors.surfaceContainerHighest,
                borderRadius: Radius.lg,
                padding: Spacing.xl,
              }}
            >
              <Text
                style={{
                  fontFamily: Fonts.dmSans.medium,
                  fontSize: moderateScale(14),
                  color: Colors.onSurface,
                  marginBottom: moderateScale(6),
                }}
              >
                No lessons completed yet
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.dmSans.regular,
                  fontSize: moderateScale(13),
                  color: Colors.tertiary,
                  lineHeight: moderateScale(18),
                }}
              >
                Finish Lesson 1 to start practicing here.
              </Text>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: moderateScale(10) }}>
              {completedSlots.map((slot) => {
                const isSelected = selected.has(slot.lessonId);
                return (
                  <Pressable
                    key={slot.lessonId}
                    onPress={() => toggle(slot.lessonId)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected }}
                    accessibilityLabel={`Lesson ${slot.slot}: ${slot.title}`}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: Spacing.sm,
                      paddingVertical: moderateScale(10),
                      paddingHorizontal: moderateScale(14),
                      borderRadius: Radius.full,
                      minHeight: moderateScale(44),
                      backgroundColor: isSelected
                        ? Colors.secondaryFixed
                        : Colors.surfaceContainerHigh,
                      transform: [{ scale: pressed ? 0.97 : 1 }],
                    })}
                  >
                    <Text
                      style={{
                        fontFamily: Fonts.notoSerifKannada.bold,
                        fontSize: moderateScale(18),
                        lineHeight: moderateScale(26),
                        paddingTop: moderateScale(2),
                        color: isSelected
                          ? Colors.onSecondaryContainer
                          : Colors.primary,
                      }}
                      maxFontSizeMultiplier={1.2}
                    >
                      {slot.char}
                    </Text>
                    <Text
                      style={{
                        fontFamily: Fonts.dmSans.bold,
                        fontSize: moderateScale(13),
                        color: isSelected
                          ? Colors.onSecondaryContainer
                          : Colors.onSurface,
                      }}
                      maxFontSizeMultiplier={1.3}
                    >
                      Lesson {slot.slot}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky bottom — Start round */}
      {completedSlots.length > 0 && (
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            paddingHorizontal: Spacing.xxl,
            paddingTop: Spacing.md,
            paddingBottom: Spacing.md + insets.bottom,
            backgroundColor: Colors.surface,
            elevation: 8,
            zIndex: 10,
            borderTopWidth: 1,
            borderTopColor: Colors.surfaceContainerHigh,
          }}
        >
          <Pressable
            onPress={handleStart}
            disabled={selected.size === 0}
            accessibilityRole="button"
            accessibilityLabel={`Start round with ${selected.size} lesson${
              selected.size === 1 ? '' : 's'
            }`}
            style={({ pressed }) => ({
              backgroundColor:
                selected.size === 0 ? Colors.surfaceDim : Colors.primary,
              borderRadius: Radius.lg,
              paddingVertical: Spacing.lg,
              alignItems: 'center',
              transform: [{ scale: pressed && selected.size > 0 ? 0.98 : 1 }],
            })}
          >
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: moderateScale(16),
                color: selected.size === 0 ? Colors.tertiary : Colors.onPrimary,
                letterSpacing: 0.2,
              }}
              maxFontSizeMultiplier={1.2}
            >
              {selected.size === 0
                ? 'Select at least one lesson'
                : 'Start Game'}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
