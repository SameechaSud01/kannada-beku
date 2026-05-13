import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing } from '../../constants/spacing';
import { useLessonRunner } from '../../hooks/useLessonRunner';
import { ScenarioPhase } from '../../components/lesson/ScenarioPhase';
import { IntakePhase } from '../../components/lesson/IntakePhase';
import { DrillPhase } from '../../components/lesson/drill/DrillPhase';
import { OutputPhase } from '../../components/lesson/output/OutputPhase';
import { DoneCard } from '../../components/lesson/DoneCard';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { state, advance, recordDrillAttempts } = useLessonRunner(id ?? '');
  const { lesson, phase, intakeIndex, drillAttempts } = state;

  if (!lesson) {
    return <LessonNotFound onBack={() => router.back()} />;
  }

  switch (phase) {
    case 'idle':
    case 'scenario':
      return <ScenarioPhase lesson={lesson} onContinue={advance} />;
    case 'intake':
      return (
        <IntakePhase
          lesson={lesson}
          phraseIndex={intakeIndex}
          onAdvance={advance}
        />
      );
    case 'drill':
      return (
        <DrillPhase
          lesson={lesson}
          onComplete={(attempts) => {
            recordDrillAttempts(attempts);
            advance();
          }}
        />
      );
    case 'output':
      return <OutputPhase lesson={lesson} onAdvance={advance} />;
    case 'done':
      return (
        <DoneCard
          lesson={lesson}
          drillAttempts={drillAttempts}
          onClose={() => router.back()}
        />
      );
  }
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
          fontSize: 20,
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
          fontSize: 14,
          color: Colors.primaryContainer,
          marginTop: Spacing.lg,
        }}
      >
        ← Back
      </Text>
    </View>
  );
}
