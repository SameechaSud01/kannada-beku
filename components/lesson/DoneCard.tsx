import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing } from '../../constants/spacing';
import type { Lesson } from '../../constants/lessons/types';
import { lessonSlugByNo } from '../../constants/lessons/lessonContent';
import type { LessonRunner } from '../../hooks/useLessonRunner';
import { LipButton } from '../ui/LipButton';
import { Toast } from '../../components/modals/ToastHost';
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
  const nextLessonSlug = lessonSlugByNo(lesson.lessonNo + 1);

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
        onSuccess: () => {
          console.log('[lesson] completed', {
            lessonSlug: lesson.slug,
            itemsLearned,
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
              subtitle: 'Tap "Back to lessons" to retry',
            });
          }
          console.warn('[lesson] save failed', err);
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

  // All three exits are gated on the save: while it's in flight we wait, and a
  // failed save retries on the next tap rather than leaving the lesson
  // un-recorded.
  const navigateTo = (go: () => void) => {
    if (mutation.isPending) return;
    if (mutation.isError) {
      runSave();
      return;
    }
    go();
  };

  const goToNextLesson = () =>
    navigateTo(() => router.replace(`/lesson/${nextLessonSlug}`));
  const goToGames = () => navigateTo(() => router.replace('/(tabs)/practice'));
  const goHome = () => navigateTo(() => router.replace('/(tabs)'));

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.surfaceCream,
        paddingHorizontal: Spacing.lg,
        paddingTop: insets.top + Spacing.xxxl,
        paddingBottom: insets.bottom + Spacing.lg,
      }}
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text
          style={{
            fontFamily: Fonts.baloo.extrabold,
            fontSize: moderateScale(26),
            color: Colors.onSurface,
            textAlign: 'center',
            lineHeight: moderateScale(36),
            letterSpacing: -0.3,
          }}
          maxFontSizeMultiplier={1.2}
        >
          Nice — that's the lesson done.
        </Text>
      </View>

      <View style={{ gap: Spacing.md }}>
        {nextLessonSlug && (
          <LipButton
            label="Next lesson"
            onPress={goToNextLesson}
            accessibilityLabel="Go to the next lesson"
            variant="primary"
          />
        )}
        <LipButton
          label="Practice games"
          onPress={goToGames}
          accessibilityLabel="Go to practice games"
          variant={nextLessonSlug ? 'secondary' : 'primary'}
        />
        <LipButton
          label="Home"
          onPress={goHome}
          accessibilityLabel="Go to home"
          variant="secondary"
        />
      </View>
    </View>
  );
}
