/**
 * Right-aligned bubble showing the user's chosen reply in a past turn
 * (spec_conversations_runner §8).
 */
import React from 'react';
import { View, Text } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/spacing';
import { Fonts } from '@/constants/fonts';
import type { ConversationOption } from '../types';

type Props = { option: ConversationOption; correct: boolean };

const UserBubble: React.FC<Props> = ({ option, correct }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
    <View
      style={{
        maxWidth: '82%',
        backgroundColor: correct ? Colors.secondaryFixed : Colors.surfaceDim,
        borderTopLeftRadius: Radius.xl,
        borderTopRightRadius: Radius.sm,
        borderBottomRightRadius: Radius.xl,
        borderBottomLeftRadius: Radius.xl,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        gap: moderateScale(2),
      }}
    >
      <Text
        style={{ fontFamily: Fonts.notoSansKannada.regular, fontSize: moderateScale(16), color: Colors.onSurface, textAlign: 'right' }}
        maxFontSizeMultiplier={1.3}
      >
        {option.kn}
      </Text>
      {option.tr ? (
        <Text
          style={{ fontFamily: Fonts.lora.italic, fontSize: moderateScale(13), color: Colors.tertiary, textAlign: 'right' }}
          maxFontSizeMultiplier={1.3}
        >
          {option.tr}
        </Text>
      ) : null}
    </View>
  </View>
);

export default UserBubble;
