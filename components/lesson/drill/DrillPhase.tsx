import { useCallback, useState } from 'react';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';
import { Spacing } from '../../../constants/spacing';
import { PhaseHeader } from '../PhaseHeader';
import { ListenPickItem } from './ListenPickItem';
import { TranslatePickItem } from './TranslatePickItem';
import { FillBlankPlaceholder } from './FillBlankPlaceholder';
import type { Lesson, Phrase } from '../../../constants/lessons/types';
import type { DrillAttempt } from '../../../hooks/useLessonRunner';

interface DrillPhaseProps {
  lesson: Lesson;
  onComplete: (attempts: DrillAttempt[]) => void;
}

function collectPhrases(lesson: Lesson): Map<string, Phrase> {
  const map = new Map<string, Phrase>();
  for (const p of lesson.intake) map.set(p.id, p);
  map.set(lesson.output.driverLine.id, lesson.output.driverLine);
  map.set(lesson.output.expectedResponse.id, lesson.output.expectedResponse);
  return map;
}

export function DrillPhase({ lesson, onComplete }: DrillPhaseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [attempts, setAttempts] = useState<DrillAttempt[]>([]);

  const phraseMap = collectPhrases(lesson);
  const items = lesson.drill;
  const item = items[currentIndex];

  const handleResolve = useCallback(
    (correct: boolean) => {
      if (!item) return;
      const attempt: DrillAttempt = {
        itemIndex: currentIndex,
        phraseId: item.phraseId,
        correct,
      };
      const nextAttempts = [...attempts, attempt];
      const nextIndex = currentIndex + 1;
      if (nextIndex >= items.length) {
        onComplete(nextAttempts);
        return;
      }
      setAttempts(nextAttempts);
      setCurrentIndex(nextIndex);
    },
    [attempts, currentIndex, item, items.length, onComplete],
  );

  if (!item) {
    return <DrillDataError reason="Drill list is empty." />;
  }

  const target = phraseMap.get(item.phraseId);
  if (!target) {
    console.error('[drill] phrase not found for id', item.phraseId);
    return <DrillDataError reason={`Phrase '${item.phraseId}' not found in lesson.`} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <PhaseHeader
        phase="drill"
        drillProgress={{ current: currentIndex + 1, total: items.length }}
      />
      {renderDrillItem(item, target, phraseMap, handleResolve, currentIndex)}
    </View>
  );
}

function renderDrillItem(
  item: Lesson['drill'][number],
  target: Phrase,
  phraseMap: Map<string, Phrase>,
  onResolve: (correct: boolean) => void,
  key: number,
) {
  if (item.type === 'fill_blank') {
    return <FillBlankPlaceholder key={key} onSkip={() => onResolve(false)} />;
  }

  const distractors: Phrase[] = [];
  for (const id of item.distractorIds) {
    const p = phraseMap.get(id);
    if (!p) {
      console.error('[drill] distractor not found', id);
      return <DrillDataError key={key} reason={`Distractor '${id}' not found.`} />;
    }
    distractors.push(p);
  }

  if (item.type === 'listen_pick') {
    return (
      <ListenPickItem
        key={key}
        target={target}
        distractors={distractors}
        onResolve={onResolve}
      />
    );
  }

  return (
    <TranslatePickItem
      key={key}
      target={target}
      distractors={distractors}
      onResolve={onResolve}
    />
  );
}

function DrillDataError({ reason }: { reason: string }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.lg,
        paddingBottom: insets.bottom + Spacing.lg,
      }}
    >
      <Text
        style={{
          fontFamily: Fonts.dmSans.bold,
          fontSize: 18,
          color: Colors.onSurface,
          marginBottom: Spacing.sm,
        }}
      >
        Drill data invalid
      </Text>
      <Text
        style={{
          fontFamily: Fonts.dmSans.regular,
          fontSize: 13,
          color: Colors.tertiary,
          textAlign: 'center',
        }}
      >
        {reason}
      </Text>
    </View>
  );
}
