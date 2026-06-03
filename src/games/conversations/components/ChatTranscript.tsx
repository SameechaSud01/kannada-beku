/**
 * The accumulating chat log (spec_conversations_runner §8). Renders each turn's
 * NPC line, and for already-answered turns the user's chosen reply beneath it.
 * The current turn's NPC line types in live; past lines render in full.
 */
import React from 'react';
import { View } from 'react-native';
import { Spacing } from '@/constants/spacing';
import NpcBubble from './NpcBubble';
import UserBubble from './UserBubble';
import type { ConversationTurn } from '../types';

type Props = {
  turns:        ConversationTurn[];
  currentIndex: number;
  answers:      Record<number, string>;
};

const ChatTranscript: React.FC<Props> = ({ turns, currentIndex, answers }) => (
  <View style={{ gap: Spacing.md }}>
    {turns.slice(0, currentIndex + 1).map((turn, i) => {
      const chosenId = answers[i];
      const chosen = turn.options.find((o) => o.id === chosenId);
      const isPast = i < currentIndex;
      return (
        <View key={turn.id} style={{ gap: Spacing.sm }}>
          <NpcBubble kn={turn.speakerLineKn} en={turn.speakerLineEn} live={i === currentIndex} />
          {isPast && chosen ? (
            <UserBubble option={chosen} correct={chosen.id === turn.correctOptionId} />
          ) : null}
        </View>
      );
    })}
  </View>
);

export default ChatTranscript;
