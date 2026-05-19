import React, { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import { Colors } from '../../../../constants/colors';
import { Fonts } from '../../../../constants/fonts';
import { Spacing } from '../../../../constants/spacing';
import type { AnswerState } from '../types';

type Props = {
  answerState: AnswerState;
  score: number;
  accepted: string[];
  kannadaWord: string;
};

function verdictText(answerState: AnswerState, score: number): string {
  if (answerState === 'correct') return '✓ exact match!';
  if (answerState === 'partial') {
    if (score >= 80) return '✓ very close!';
    if (score >= 60) return '~ close enough';
    return '~ not quite';
  }
  return '✗ incorrect';
}

function verdictColor(answerState: AnswerState): string {
  if (answerState === 'correct') return '#2d7a5f';
  if (answerState === 'partial') return '#b07d2a';
  return Colors.primary;
}

function barFillColor(score: number): string {
  if (score >= 70) return '#2d7a5f';
  if (score >= 40) return '#b07d2a';
  return Colors.primary;
}

const FeedbackCard: React.FC<Props> = ({ answerState, score, accepted, kannadaWord }) => {
  const barWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(barWidth, {
      toValue: score,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [score, barWidth]);

  if (answerState === 'unanswered') return null;

  return (
    <View style={{ gap: Spacing.md }}>
      <Text style={{ fontFamily: Fonts.dmSans.medium, fontSize: 15, color: verdictColor(answerState) }}>
        {verdictText(answerState, score)}
      </Text>

      {score < 100 && (
        <View style={{ gap: Spacing.xs }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontFamily: Fonts.dmSans.regular, fontSize: 12, color: Colors.tertiary }}>
              match score
            </Text>
            <Text style={{ fontFamily: Fonts.dmSans.medium, fontSize: 12, color: Colors.tertiary }}>
              {score}%
            </Text>
          </View>
          <View style={{ height: 6, width: '100%', borderRadius: 999, backgroundColor: Colors.surfaceContainerHigh }}>
            <Animated.View
              style={{
                height: '100%',
                borderRadius: 999,
                backgroundColor: barFillColor(score),
                width: barWidth.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
              }}
            />
          </View>
        </View>
      )}

      <Text style={{ fontFamily: Fonts.dmSans.regular, fontSize: 12, color: Colors.tertiary }}>
        accepted: {accepted.join(', ')}
      </Text>

      <Text
        style={{
          fontFamily: 'NotoSansKannada_700Bold',
          fontSize: 30,
          textAlign: 'center',
          color: Colors.onSurface,
        }}
      >
        {kannadaWord}
      </Text>
    </View>
  );
};

export default FeedbackCard;
