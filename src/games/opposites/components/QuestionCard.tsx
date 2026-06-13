import React from 'react';
import { View, Text } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/spacing';
import { Fonts } from '@/constants/fonts';
import { Icons } from '@/constants/icons';
import { GlossTag } from '@/components/ui/GlossTag';
import { splitGloss } from '@/utils/gloss';

type Props = {
  word: string;
  tr: string;
  meaning: string;
  streak: number;
  hintUsed: boolean;
  isAnswered: boolean;
  onHint: () => void;
};

const QuestionCard: React.FC<Props> = ({ word, tr, meaning, streak }) => {
  const { text: meaningText, tag } = splitGloss(meaning);
  return (
  <View
    style={{
      borderRadius: Radius.chunky,
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: Colors.hairline,
      borderBottomWidth: 4,
      borderBottomColor: Colors.cardLip,
      padding: Spacing.xxl,
      width: '100%',
      alignItems: 'center',
    }}
  >
    <Text
      style={{
        fontFamily: Fonts.dmSans.bold,
        fontSize: moderateScale(11),
        textTransform: 'uppercase',
        letterSpacing: 1.4,
        color: Colors.tertiary,
        marginBottom: Spacing.sm,
      }}
    >
      find the opposite of
    </Text>
    {tr ? (
      <Text
        style={{
          fontFamily: Fonts.baloo.extrabold,
          fontSize: moderateScale(38),
          lineHeight: moderateScale(53),
          textAlign: 'center',
          color: Colors.onSurface,
        }}
        adjustsFontSizeToFit
        numberOfLines={2}
        maxFontSizeMultiplier={1.2}
      >
        {tr}
      </Text>
    ) : null}
    <Text
      style={{
        fontFamily: Fonts.dmSans.medium,
        fontSize: moderateScale(16),
        textAlign: 'center',
        color: Colors.tertiary,
        marginTop: Spacing.sm,
      }}
      maxFontSizeMultiplier={1.3}
    >
      {meaningText}
    </Text>
    {tag ? (
      <View style={{ marginTop: Spacing.sm }}>
        <GlossTag tag={tag} />
      </View>
    ) : null}
    <Text
      style={{
        fontFamily: Fonts.notoSansKannada.regular,
        fontSize: moderateScale(14),
        textAlign: 'center',
        color: Colors.tertiary,
        marginTop: Spacing.md,
        opacity: 0.7,
      }}
      maxFontSizeMultiplier={1.3}
    >
      {word}
    </Text>

    {streak >= 2 && (
      <View
        style={{
          position: 'absolute',
          top: Spacing.md,
          right: Spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          gap: moderateScale(4),
          backgroundColor: Colors.secondaryFixed,
          borderRadius: Radius.full,
          paddingHorizontal: Spacing.sm,
          paddingVertical: moderateScale(2),
        }}
      >
        <Icons.streak size={moderateScale(12)} color={Colors.secondary} />
        <Text
          style={{
            color: Colors.secondary,
            fontSize: moderateScale(12),
            fontFamily: Fonts.dmSans.bold,
          }}
        >
          {streak}
        </Text>
      </View>
    )}
  </View>
  );
};

export default QuestionCard;
