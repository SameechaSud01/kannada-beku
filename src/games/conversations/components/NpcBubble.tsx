/**
 * Left-aligned NPC chat bubble with an icon avatar
 * (spec_conversations_runner §8). When `live`, the Kannada line types in behind
 * a typing indicator; history bubbles render in full immediately.
 */
import React from 'react';
import { View, Text } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/spacing';
import { Fonts } from '@/constants/fonts';
import { Icons } from '@/constants/icons';
import TypingIndicator from './TypingIndicator';
import { useTypewriter } from '../hooks/useTypewriter';

type Props = { kn: string; en: string; live?: boolean };

const NpcBubble: React.FC<Props> = ({ kn, en, live = false }) => {
  const { shown, phase } = useTypewriter(live ? kn : '');
  const isDots = live && phase === 'dots';
  const knText = live ? shown : kn;
  const showEn = live ? phase === 'done' : true;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm }}>
      <View
        style={{
          width: moderateScale(30),
          height: moderateScale(30),
          borderRadius: Radius.full,
          backgroundColor: Colors.secondaryFixed,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icons.gameConversations size={moderateScale(16)} color={Colors.onSecondaryContainer} />
      </View>
      <View
        style={{
          maxWidth: '82%',
          backgroundColor: '#ffffff',
          borderWidth: 1,
          borderColor: Colors.hairline,
          borderTopLeftRadius: Radius.sm,
          borderTopRightRadius: Radius.chunky,
          borderBottomRightRadius: Radius.chunky,
          borderBottomLeftRadius: Radius.chunky,
          paddingVertical: Spacing.md,
          paddingHorizontal: Spacing.lg,
          gap: moderateScale(4),
        }}
      >
        {isDots ? (
          <TypingIndicator />
        ) : (
          <>
            {/* English meaning is the hero — NPC speaker lines carry no
                transliteration, so English leads per the text-hierarchy rule
                (Kannada script never primary). */}
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: moderateScale(16),
                color: Colors.onSurface,
                lineHeight: moderateScale(22),
              }}
              maxFontSizeMultiplier={1.4}
            >
              {en}
            </Text>
            <Text
              style={{
                fontFamily: Fonts.notoSansKannada.regular,
                fontSize: moderateScale(15),
                color: Colors.tertiary,
                lineHeight: moderateScale(23),
                opacity: 0.7,
              }}
              maxFontSizeMultiplier={1.3}
            >
              {knText}
            </Text>
          </>
        )}
      </View>
    </View>
  );
};

export default NpcBubble;
