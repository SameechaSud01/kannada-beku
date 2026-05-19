import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Colors } from '../../../../constants/colors';
import { Fonts } from '../../../../constants/fonts';
import { Radius, Spacing } from '../../../../constants/spacing';

type Props = {
  sessionAvg: number;
  answeredCount: number;
  totalWords: number;
  onReplay: () => void;
};

function emoji(avg: number): string {
  if (avg === 100) return '🎯';
  if (avg >= 80) return '😊';
  if (avg >= 55) return '😐';
  return '😔';
}

function title(avg: number): string {
  if (avg === 100) return 'perfect score!';
  if (avg >= 80) return 'well done!';
  if (avg >= 55) return 'keep practising!';
  return 'keep learning!';
}

const ResultScreen: React.FC<Props> = ({ sessionAvg, answeredCount, totalWords, onReplay }) => {
  const skipped = totalWords - answeredCount;

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xxl, gap: Spacing.lg }}>
      <Text style={{ fontSize: 52 }}>{emoji(sessionAvg)}</Text>
      <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 22, color: Colors.onSurface }}>
        {title(sessionAvg)}
      </Text>
      <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 52, color: Colors.primary }}>
        {sessionAvg}%
      </Text>
      <Text style={{ fontFamily: Fonts.dmSans.regular, fontSize: 14, color: Colors.tertiary, textAlign: 'center' }}>
        average match across {answeredCount} word{answeredCount !== 1 ? 's' : ''}
      </Text>
      {skipped > 0 && (
        <Text style={{ fontFamily: Fonts.dmSans.regular, fontSize: 13, color: Colors.tertiary, textAlign: 'center' }}>
          {skipped} word{skipped !== 1 ? 's' : ''} skipped
        </Text>
      )}
      <Pressable
        onPress={onReplay}
        style={({ pressed }) => ({
          width: '100%',
          backgroundColor: Colors.primary,
          borderRadius: Radius.lg,
          paddingVertical: Spacing.lg,
          alignItems: 'center',
          marginTop: Spacing.md,
          opacity: pressed ? 0.88 : 1,
        })}
      >
        <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 16, color: Colors.onPrimary }}>
          play again
        </Text>
      </Pressable>
    </View>
  );
};

export default ResultScreen;
