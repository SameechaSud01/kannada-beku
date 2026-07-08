import { useEffect, useMemo, type ReactNode } from 'react';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing } from '../../constants/spacing';
import { flattenSections, type Lesson } from '../../constants/lessons/types';
import { useDbLesson } from '../../hooks/useLessons';
import { useLessonRunner } from '../../hooks/useLessonRunner';
import { useProgressStore } from '../../stores/progressStore';
import { recordLearningDay } from '../../services/progress/streak';
import { SituationPhase } from '../../components/lesson/SituationPhase';
import { TeachWordsPhase } from '../../components/lesson/TeachWordsPhase';
import { PracticeWordsPhase } from '../../components/lesson/PracticeWordsPhase';
import { TeachPhrasesPhase } from '../../components/lesson/TeachPhrasesPhase';
import { PracticePhrasesPhase } from '../../components/lesson/PracticePhrasesPhase';
import { SummaryPhase } from '../../components/lesson/SummaryPhase';
import { RealWorldPhase } from '../../components/lesson/RealWorldPhase';
import { DoneCard } from '../../components/lesson/DoneCard';
import { PartDoneCard } from '../../components/lesson/PartDoneCard';
import { LessonPartChooser } from '../../components/lesson/LessonPartChooser';
import { PhaseBackButton } from '../../components/lesson/PhaseBackButton';
import { ExitBackButton } from '../../components/ui/ExitBackButton';
import { LoadingScreen } from '../../components/states/LoadingScreen';
import { ErrorState } from '../../components/states/ErrorState';
import { Toasts } from '../../components/modals/instances/toastCatalog';

export default function LessonScreen() {
  const { id, part } = useLocalSearchParams<{ id: string; part?: string }>();
  const router = useRouter();
  const lessonQuery = useDbLesson(id);
  const lesson = lessonQuery.data ?? null;
  const completePart = useProgressStore((s) => s.completePart);

  // A split lesson opened without a chosen part shows the chooser; otherwise we
  // run a single sub-part. `partIndex < 0` means whole-lesson run (un-split
  // lessons, or a malformed part param falling back gracefully).
  const partIndex = lesson ? lesson.sections.findIndex((s) => s.key === part) : -1;
  const isPartRun = !!part && partIndex >= 0 && !!lesson && lesson.sections.length > 1;

  // The slice the runner actually plays: one section for a part run, else all.
  const runLesson = useMemo<Lesson | null>(() => {
    if (!lesson) return null;
    if (!isPartRun) return lesson;
    const section = lesson.sections[partIndex];
    return { ...lesson, sections: [section], ...flattenSections([section]) };
  }, [lesson, isPartRun, partIndex]);

  // Part runs skip the lesson-level intro/outro (shown by the chooser + final
  // done card) so they aren't repeated once per sub-part.
  const runner = useLessonRunner(runLesson, { intro: !isPartRun, outro: !isPartRun });

  // A `part` param that matches no section (locked/typo'd deep link) silently
  // falls back to the whole lesson above — tell the user instead of going quiet.
  useEffect(() => {
    if (part && lesson && partIndex < 0) {
      Toasts.partUnavailable();
    }
  }, [part, lesson, partIndex]);

  // Record sub-part completion as soon as its run reaches `done` (idempotent).
  useEffect(() => {
    if (runner.phase === 'done' && isPartRun && lesson && part) {
      completePart(lesson.slug, part);
      // Finishing a lesson sub-part counts as a learning day (audit H2/B4).
      recordLearningDay();
    }
  }, [runner.phase, isPartRun, lesson, part, completePart]);

  if (lessonQuery.isLoading) {
    return <LessonLoading />;
  }

  // True fetch failure (vs. a lesson that genuinely doesn't exist) → red error
  // with retry; back chip keeps the user from getting stuck.
  if (lessonQuery.isError) {
    return (
      <ErrorState
        back
        onRetry={() => lessonQuery.refetch()}
        onHelp={() => router.push('/settings/help')}
        body="We couldn't load this lesson. Check your connection and give it another try."
      />
    );
  }

  if (!lesson) {
    return <LessonNotFound onBack={() => router.back()} />;
  }

  // Split lesson, no part chosen yet → lesson detail (parts) page. It renders
  // its own ← back header (pushed page, not a modal).
  if (!part && lesson.sections.length > 1) {
    return (
      <LessonPartChooser
        lesson={lesson}
        onSelectPart={(key) => router.push(`/lesson/${lesson.slug}?part=${key}`)}
      />
    );
  }

  const active = runLesson ?? lesson;
  const isLastPart = isPartRun && partIndex === lesson.sections.length - 1;
  const nextSection = isPartRun ? lesson.sections[partIndex + 1] : undefined;

  // Sub-part label rides on the progress bar only during a part run.
  const sectionLabel = isPartRun ? runner.sectionLabel : undefined;
  const sectionWords = runner.section?.words ?? [];
  const sectionPhrases = runner.section?.phrases ?? [];

  let phaseEl: ReactNode = null;
  switch (runner.phase) {
    case 'idle':
    case 'situation':
      phaseEl = <SituationPhase lesson={lesson} onAdvance={runner.advance} />;
      break;
    case 'teach_words':
      phaseEl = (
        <TeachWordsPhase
          words={sectionWords}
          wordIndex={runner.wordIndex}
          lessonNo={lesson.lessonNo}
          sectionLabel={sectionLabel}
          onAdvance={runner.advance}
        />
      );
      break;
    case 'practice_words':
      phaseEl = (
        <PracticeWordsPhase
          words={sectionWords}
          practiceWordIndex={runner.practiceWordIndex}
          step={runner.practiceWordStep}
          sectionLabel={sectionLabel}
          distractorPool={lesson.words}
          onAdvance={runner.advance}
        />
      );
      break;
    case 'teach_phrases':
      phaseEl = (
        <TeachPhrasesPhase
          phrases={sectionPhrases}
          // Full lesson vocab so chips for words taught in earlier sub-parts
          // still resolve their audio.
          words={lesson.words}
          phraseIndex={runner.phraseIndex}
          lessonNo={lesson.lessonNo}
          sectionLabel={sectionLabel}
          onAdvance={runner.advance}
        />
      );
      break;
    case 'practice_phrases':
      phaseEl = (
        <PracticePhrasesPhase
          phrases={sectionPhrases}
          practicePhrasesIndex={runner.practicePhrasesIndex}
          step={runner.practicePhrasesStep}
          sectionLabel={sectionLabel}
          distractorPool={lesson.phrases}
          onAdvance={runner.advance}
        />
      );
      break;
    case 'summary':
      // Recap just the sub-part that was played (whole lesson for un-split).
      phaseEl = (
        <SummaryPhase words={active.words} phrases={active.phrases} onAdvance={runner.advance} />
      );
      break;
    case 'real_world':
      phaseEl = (
        <RealWorldPhase
          prompt={lesson.realWorldPrompt}
          title={lesson.title}
          onAdvance={runner.advance}
        />
      );
      break;
    case 'done':
      // Intermediate sub-part → light "continue" card, no server completion.
      if (isPartRun && !isLastPart && nextSection) {
        return (
          <PartDoneCard
            lesson={lesson}
            partIndex={partIndex}
            onContinue={() => router.replace(`/lesson/${lesson.slug}?part=${nextSection.key}`)}
            onBack={() => router.back()}
            onHome={() => router.replace('/(tabs)')}
          />
        );
      }
      // Final sub-part (or whole lesson) → "Where you are" completion screen
      // (server completion + trail orientation, not applause).
      return <DoneCard lesson={lesson} runner={runner} onClose={() => router.back()} />;
  }

  return (
    <View style={{ flex: 1 }}>
      {phaseEl}
      <ExitBackButton />
      {runner.canGoPrevious && <PhaseBackButton onPress={runner.goPrevious} />}
    </View>
  );
}

function LessonLoading() {
  // Branded red spinner + back chip so the user is never trapped on a slow load.
  return <LoadingScreen back />;
}

function LessonNotFound({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.surface,
        paddingTop: insets.top + Spacing.xxxl,
        paddingHorizontal: Spacing.lg,
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          fontFamily: Fonts.dmSans.bold,
          fontSize: moderateScale(20),
          color: Colors.onSurface,
          marginBottom: Spacing.sm,
        }}
      >
        Lesson not found
      </Text>
      <Text
        onPress={onBack}
        style={{
          fontFamily: Fonts.dmSans.medium,
          fontSize: moderateScale(14),
          color: Colors.primaryContainer,
          marginTop: Spacing.lg,
        }}
      >
        ← Back
      </Text>
    </View>
  );
}
