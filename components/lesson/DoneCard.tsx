import { useEffect, useRef } from 'react';
import { logger } from '../../lib/logger';
import { useRouter } from 'expo-router';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import type { Lesson } from '../../constants/lessons/types';
import { lessonSlugByNo } from '../../constants/lessons/lessonContent';
import { PLANNED_LESSON_SLOTS, TOTAL_LESSON_SLOTS } from '../../constants/lessons/plannedLessons';
import type { LessonRunner } from '../../hooks/useLessonRunner';
import { ChunkyCircle } from '../ui/ChunkyLip';
import { LipButton } from '../ui/LipButton';
import { Toast } from '../../components/modals/ToastHost';
import { Toasts } from '../../components/modals/instances/toastCatalog';
import { DoneNode, NextCard, Connector, numberWord, PIP } from './LessonTrail';
import {
  useCompleteLessonMutation,
  LessonNotRegisteredError,
} from '../../hooks/useCompleteLessonMutation';

const ESTIMATED_MIN_PER_LESSON = 5;
const COMPLETION_SCORE = 100;

interface DoneCardProps {
  lesson: Lesson;
  runner?: LessonRunner;
  onClose?: () => void;
}

export function DoneCard({ lesson }: DoneCardProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const phraseCount = lesson.phrases.length;
  const wordCount = lesson.words.length;
  const itemsLearned = wordCount + phraseCount;

  const lessonNo = lesson.lessonNo;
  const total = TOTAL_LESSON_SLOTS;
  const remaining = Math.max(0, total - lessonNo);

  const nextLessonSlug = lessonSlugByNo(lessonNo + 1);
  // PLANNED_LESSON_SLOTS is 0-indexed by slot order: index = lessonNo - 1.
  const prevSlot = lessonNo > 1 ? PLANNED_LESSON_SLOTS[lessonNo - 2] : undefined;
  const nextSlot = PLANNED_LESSON_SLOTS[lessonNo];
  const hasNext = Boolean(nextLessonSlug && nextSlot);

  const mutation = useCompleteLessonMutation();
  const attemptedRef = useRef(false);

  const runSave = () => {
    if (mutation.isPending || mutation.isSuccess) return;

    mutation.mutate(
      {
        slug: lesson.slug,
        score: COMPLETION_SCORE,
        phrasesLearned: itemsLearned,
        minutesPracticed: ESTIMATED_MIN_PER_LESSON,
      },
      {
        onSuccess: (result) => {
          if (result.queuedOffline) {
            // Saved locally; the outbox will push it on reconnect (TODO T019).
            Toasts.lessonSavedOffline();
          }
          logger.info('lesson', 'completed', {
            lessonSlug: lesson.slug,
            itemsLearned,
            queuedOffline: result.queuedOffline,
          });
        },
        onError: (err) => {
          if (err instanceof LessonNotRegisteredError) {
            Toast.show({
              kind: 'error',
              id: 'lesson.notRegistered',
              title: 'Lesson not registered on server',
              subtitle: 'Try again later — tap anywhere to retry',
            });
          } else {
            Toast.show({
              kind: 'error',
              id: 'lesson.saveFailed',
              title: "Couldn't save your progress. Try again.",
              subtitle: 'Tap a button to retry',
            });
          }
          logger.debug('lesson', 'save failed', { err });
        },
      },
    );
  };

  useEffect(() => {
    if (attemptedRef.current) return;
    attemptedRef.current = true;
    runSave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // All exits are gated on the save: while it's in flight we wait, and a failed
  // save retries on the next tap rather than leaving the lesson un-recorded.
  const navigateTo = (go: () => void) => {
    if (mutation.isPending) return;
    if (mutation.isError) {
      runSave();
      return;
    }
    go();
  };

  const goToNextLesson = () => navigateTo(() => router.replace(`/lesson/${nextLessonSlug}`));
  const goToGames = () => navigateTo(() => router.replace('/(tabs)/practice'));
  const goHome = () => navigateTo(() => router.replace('/(tabs)'));

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.surfaceCream,
        paddingHorizontal: Spacing.xl,
        paddingTop: insets.top + Spacing.xxl,
        paddingBottom: insets.bottom + moderateScale(48),
      }}
    >
      {/* ---- Header: orientation, not applause ---- */}
      <View>
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(11),
            letterSpacing: 1.8,
            textTransform: 'uppercase',
            color: Colors.textFaint,
          }}
          maxFontSizeMultiplier={1.2}
        >
          {`Lesson ${lessonNo} · ${lesson.title} — done`}
        </Text>
        <Text
          style={{
            fontFamily: Fonts.baloo.extrabold,
            fontSize: moderateScale(27),
            color: Colors.onSurface,
            letterSpacing: -0.4,
            lineHeight: moderateScale(37),
            marginTop: moderateScale(10),
          }}
          maxFontSizeMultiplier={1.2}
        >
          {hasNext
            ? `That's ${numberWord(lessonNo)} of ${numberWord(total)}.`
            : `That's all ${numberWord(total)} done.`}
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.medium,
            fontSize: moderateScale(14.5),
            lineHeight: moderateScale(21),
            color: Colors.tertiary,
            marginTop: moderateScale(12),
          }}
          maxFontSizeMultiplier={1.3}
        >
          {hasNext ? (
            <>
              <Text style={{ fontFamily: Fonts.dmSans.bold, color: Colors.onSurface }}>
                {nextSlot!.title}
              </Text>
              {` is next — ${numberWord(remaining)} ${
                remaining === 1 ? 'lesson' : 'lessons'
              } to go.`}
            </>
          ) : (
            "You've finished every lesson. Keep them sharp with practice."
          )}
        </Text>
      </View>

      {/* ---- Trail: where you are ---- */}
      <View style={{ marginTop: moderateScale(34) }}>
        {prevSlot ? (
          <>
            <DoneNode title={prevSlot.title} subtitle={`Lesson ${lessonNo - 1} · done`} />
            <Connector filled />
          </>
        ) : null}

        <DoneNode title={lesson.title} subtitle={`Just finished · Lesson ${lessonNo}`} highlight />

        {hasNext ? (
          <>
            <Connector />
            <NextCard
              title={nextSlot!.title}
              subtitle={nextSlot!.subtitle}
              onPress={goToNextLesson}
            />
          </>
        ) : (
          <>
            <Connector filled />
            <FinishedNode />
          </>
        )}
      </View>

      <View style={{ flex: 1 }} />

      {/* ---- Actions ---- */}
      <View style={{ flexDirection: 'row', gap: Spacing.md }}>
        <View style={{ flex: 1 }}>
          <LipButton
            label="Practice games"
            onPress={goToGames}
            accessibilityLabel="Go to practice games"
            variant="secondary"
            icon={Icons.tabPractice}
            iconLeading
          />
        </View>
        <View style={{ flex: 1 }}>
          <LipButton
            label="Home"
            onPress={goHome}
            accessibilityLabel="Go to home"
            variant="secondary"
            icon={Icons.tabHome}
            iconLeading
          />
        </View>
      </View>
    </View>
  );
}

/** Final-state node shown after the last lesson instead of an "up next" card. */
function FinishedNode() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(14) }}>
      <ChunkyCircle
        size={PIP}
        depth={moderateScale(3)}
        bg={Colors.secondaryContainer}
        lipColor={Colors.goldLip}
      >
        <Icons.trophy
          size={moderateScale(20)}
          color={Colors.onSecondaryContainer}
          strokeWidth={2.4}
        />
      </ChunkyCircle>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          style={{
            fontFamily: Fonts.baloo.bold,
            fontSize: moderateScale(15.5),
            color: Colors.onSurface,
            letterSpacing: -0.2,
          }}
          numberOfLines={1}
          maxFontSizeMultiplier={1.2}
        >
          {`All ${numberWord(TOTAL_LESSON_SLOTS)} lessons complete`}
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(11.5),
            color: Colors.onSecondaryContainer,
            marginTop: moderateScale(2),
          }}
          numberOfLines={1}
          maxFontSizeMultiplier={1.2}
        >
          Course finished
        </Text>
      </View>
    </View>
  );
}
