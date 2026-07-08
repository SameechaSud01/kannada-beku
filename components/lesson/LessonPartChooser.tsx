import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { PLANNED_LESSON_SLOTS } from '../../constants/lessons/plannedLessons';
import { ChunkyPressable } from '../ui/ChunkyPressable';
import { ChunkyCircle } from '../ui/ChunkyLip';
import { RoundIconButton } from '../ui/RoundIconButton';
import { LipButton } from '../ui/LipButton';
import { useModal } from '../modals/ModalHost';
import { WordsLearnedSheet } from '../modals/instances/WordsLearnedSheet';
import { useDbLessons } from '../../hooks/useLessons';
import type { Lesson } from '../../constants/lessons/types';
import { useLessonParts, type PartState } from '../../hooks/useLessonParts';

interface LessonPartChooserProps {
  lesson: Lesson;
  onSelectPart: (partKey: string) => void;
}

/**
 * Lesson detail (parts) page shown when a split lesson is opened. Parts unlock
 * in order (spec_lesson_split_map); redesigned per
 * spec_lessons_tab_detail_redesign §2 — pushed-page back header, eyebrow +
 * title + progress chip, three-state part cards, bottom continue/next CTA.
 */
export function LessonPartChooser({ lesson, onSelectPart }: LessonPartChooserProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const modal = useModal();
  const parts = useLessonParts(lesson);
  const lessonsQuery = useDbLessons();
  const dbLessons = lessonsQuery.data ?? [];

  const doneCount = parts.filter((p) => p.done).length;
  const allDone = doneCount === parts.length;
  const nextPart = parts.find((p) => p.active);

  // Next lesson (for the all-done CTA). "Built" = has real content in the DB.
  const nextNo = lesson.lessonNo + 1;
  const nextReal = dbLessons.find(
    (l) => l.lessonNo === nextNo && (l.words.length > 0 || l.phrases.length > 0),
  );
  const nextTitle =
    nextReal?.title ?? PLANNED_LESSON_SLOTS.find((s) => s.slot === nextNo)?.title ?? '';

  const openWordsLearned = () =>
    modal.show({
      kind: 'sheet',
      component: WordsLearnedSheet,
      props: {
        groups: [{ title: lesson.title, items: [...lesson.words, ...lesson.phrases] }],
        total: lesson.words.length + lesson.phrases.length,
        onDismiss: () => modal.dismiss(),
      },
    });

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surfaceCream }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.sm,
          paddingHorizontal: Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xxxl,
        }}
      >
        {/* Pushed page → back, not close. Deep links land here with an empty
            stack, where back() is a no-op — fall back to the Lessons tab. */}
        <RoundIconButton
          icon="back"
          variant="white"
          size={44}
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace('/(tabs)/learn');
          }}
          accessibilityLabel="Back to lessons"
        />

        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(11),
            letterSpacing: 1.4,
            color: Colors.tertiary,
            marginTop: Spacing.lg,
          }}
          maxFontSizeMultiplier={1.4}
        >
          LESSON {lesson.lessonNo}
        </Text>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.md,
            marginTop: moderateScale(2),
          }}
        >
          <Text
            style={{
              flex: 1,
              fontFamily: Fonts.baloo.extrabold,
              fontSize: moderateScale(36),
              color: Colors.onSurface,
              letterSpacing: -0.5,
              lineHeight: moderateScale(46),
            }}
            maxFontSizeMultiplier={1.2}
          >
            {lesson.title}
          </Text>
          <ProgressChip done={doneCount} total={parts.length} allDone={allDone} />
        </View>

        {lesson.situation ? (
          <Text
            style={{
              fontFamily: Fonts.dmSans.regular,
              fontSize: moderateScale(13.5),
              color: Colors.tertiary,
              lineHeight: moderateScale(20),
              marginTop: Spacing.sm,
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

        <View style={{ marginTop: Spacing.xxl }}>
          {allDone ? (
            <>
              <Pressable
                onPress={openWordsLearned}
                accessibilityRole="button"
                accessibilityLabel="Review words from this lesson"
                hitSlop={8}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: Spacing.sm,
                  alignSelf: 'center',
                  paddingVertical: Spacing.sm,
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <Icons.book size={moderateScale(18)} color={Colors.secondary} />
                <Text
                  style={{
                    fontFamily: Fonts.dmSans.bold,
                    fontSize: moderateScale(14),
                    color: Colors.secondary,
                  }}
                  maxFontSizeMultiplier={1.3}
                >
                  Review words from this lesson
                </Text>
              </Pressable>
              <LipButton
                label={
                  nextReal ? `Next: Lesson ${nextNo} · ${nextTitle} →` : 'More lessons coming soon'
                }
                disabled={!nextReal}
                onPress={nextReal ? () => router.push(`/lesson/${nextReal.slug}`) : undefined}
                style={{ marginTop: Spacing.lg }}
              />
            </>
          ) : nextPart ? (
            <LipButton
              label={`Continue · ${nextPart.label}`}
              icon={Icons.play}
              iconLeading
              onPress={() => onSelectPart(nextPart.key)}
            />
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

function ProgressChip({ done, total, allDone }: { done: number; total: number; allDone: boolean }) {
  return (
    <View
      accessibilityLabel={`${done} of ${total} parts done`}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: moderateScale(5),
        paddingHorizontal: moderateScale(11),
        paddingVertical: moderateScale(6),
        borderRadius: Radius.full,
        backgroundColor: allDone ? Colors.secondaryFixed : Colors.surfaceContainerLowest,
        borderWidth: allDone ? 0 : 1,
        borderColor: allDone ? undefined : Colors.hairline,
      }}
    >
      {allDone ? (
        <Icons.check
          size={moderateScale(13)}
          color={Colors.onSecondaryContainer}
          strokeWidth={2.8}
        />
      ) : null}
      <Text
        style={{
          fontFamily: Fonts.dmSans.bold,
          fontSize: moderateScale(12),
          color: allDone ? Colors.onSecondaryContainer : Colors.tertiary,
        }}
        maxFontSizeMultiplier={1.3}
      >
        {done} of {total} done
      </Text>
    </View>
  );
}

function partMeta(part: PartState): string {
  const items: string[] = [];
  if (part.wordCount) items.push(`${part.wordCount} ${part.wordCount === 1 ? 'word' : 'words'}`);
  if (part.phraseCount)
    items.push(`${part.phraseCount} ${part.phraseCount === 1 ? 'phrase' : 'phrases'}`);
  return items.join(' · ');
}

function PartRowContent({
  part,
  idColor,
  metaColor,
  trailing,
}: {
  part: PartState;
  idColor: string;
  metaColor: string;
  trailing: React.ReactNode;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: moderateScale(13),
        padding: moderateScale(14),
      }}
    >
      {/* Plain text part id — no tile, no underline. */}
      <Text
        style={{
          fontFamily: Fonts.baloo.extrabold,
          fontSize: moderateScale(20),
          color: idColor,
          minWidth: moderateScale(30),
        }}
        maxFontSizeMultiplier={1.2}
      >
        {part.key}
      </Text>

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
            color: metaColor,
            marginTop: moderateScale(1),
          }}
          maxFontSizeMultiplier={1.3}
          numberOfLines={1}
        >
          {partMeta(part)}
        </Text>
      </View>

      {trailing}
    </View>
  );
}

function PartRow({ part, onPress }: { part: PartState; onPress: () => void }) {
  // Done — sun-drenched gold gradient face, gold lip; tap replays the part.
  if (part.done) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Part ${part.key}: ${part.label}, done. Review it.`}
      >
        {({ pressed }) => (
          <LinearGradient
            colors={[Colors.goldSunHi, Colors.goldSunLo]}
            start={{ x: 0.33, y: 0.03 }}
            end={{ x: 0.67, y: 0.97 }}
            style={{
              borderRadius: Radius.chunky,
              borderBottomWidth: pressed ? 2 : 4,
              borderBottomColor: Colors.goldLip,
              transform: [{ translateY: pressed ? 2 : 0 }],
            }}
          >
            <PartRowContent
              part={part}
              idColor={Colors.onSecondaryContainer}
              metaColor={Colors.onSecondaryContainer}
              trailing={
                <View style={{ alignItems: 'center' }}>
                  {/* Flat gold check — earned status, not a button (no lip). */}
                  <View
                    style={{
                      width: moderateScale(40),
                      height: moderateScale(40),
                      borderRadius: Radius.full,
                      backgroundColor: Colors.secondaryContainer,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icons.check
                      size={moderateScale(20)}
                      color={Colors.onSecondaryContainer}
                      strokeWidth={2.6}
                    />
                  </View>
                  <Text
                    style={{
                      fontFamily: Fonts.dmSans.bold,
                      fontSize: moderateScale(11),
                      color: Colors.onSecondaryContainer,
                      marginTop: moderateScale(3),
                    }}
                    maxFontSizeMultiplier={1.3}
                  >
                    Review
                  </Text>
                </View>
              }
            />
          </LinearGradient>
        )}
      </Pressable>
    );
  }

  // Up next — white face, red border, red play orb.
  if (part.active) {
    return (
      <ChunkyPressable
        onPress={onPress}
        accessibilityLabel={`Part ${part.key}: ${part.label}. Start.`}
        bg="#ffffff"
        lip={3}
        // The lip doubles as the bottom border edge — red, so the 2px red
        // border wraps all four sides instead of stopping at the lip.
        lipColor={Colors.primaryContainer}
        border
        borderColor={Colors.primaryContainer}
        borderWidth={2}
        radius={Radius.chunky}
      >
        <PartRowContent
          part={part}
          idColor={Colors.onSurface}
          metaColor={Colors.tertiary}
          trailing={
            <ChunkyCircle
              size={moderateScale(48)}
              depth={moderateScale(3)}
              bg={Colors.primaryContainer}
              lipColor={Colors.redLip}
            >
              <Icons.play size={moderateScale(18)} color={Colors.onPrimary} />
            </ChunkyCircle>
          }
        />
      </ChunkyPressable>
    );
  }

  // Not started — flat, faded, inert.
  return (
    <View
      accessibilityLabel={`Part ${part.key}: ${part.label}, locked. Finish the previous part to unlock.`}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: Radius.chunky,
        borderWidth: 1,
        borderColor: Colors.hairline,
        opacity: 0.85,
      }}
    >
      <PartRowContent
        part={part}
        idColor={Colors.textFaint}
        metaColor={Colors.tertiary}
        trailing={
          <View
            style={{
              width: moderateScale(40),
              height: moderateScale(40),
              borderRadius: Radius.full,
              backgroundColor: Colors.surfaceCreamLow,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icons.lock size={moderateScale(16)} color={Colors.textFaint} strokeWidth={2.2} />
          </View>
        }
      />
    </View>
  );
}
