import { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { BACK_CHIP_TOP_RESERVE } from '../ui/ExitBackButton';
import { LipButton } from '../ui/LipButton';
import { AudioOrb } from '../ui/AudioOrb';
import { deviceTtsAudioService } from '../../services/audio/deviceTtsAudioService';
import type { Phrase, Word } from '../../constants/lessons/types';

interface SummaryPhaseProps {
  words: Word[];
  phrases: Phrase[];
  onAdvance: () => void;
}

export function SummaryPhase({ words, phrases, onAdvance }: SummaryPhaseProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surfaceCream }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: Spacing.lg,
          paddingTop: insets.top + BACK_CHIP_TOP_RESERVE,
          paddingBottom: Spacing.lg,
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.baloo.extrabold,
            fontSize: moderateScale(24),
            color: Colors.onSurface,
            letterSpacing: -0.3,
            lineHeight: moderateScale(34),
            marginBottom: Spacing.xl,
          }}
          maxFontSizeMultiplier={1.2}
        >
          What you learned
        </Text>

        <SectionLabel label="Words" />
        <View style={{ gap: Spacing.sm, marginBottom: Spacing.xl }}>
          {words.map((w, i) => (
            <SummaryRow
              key={`w-${i}`}
              transliteration={w.transliteration}
              english={w.english}
              kannada={w.kannada}
            />
          ))}
        </View>

        <SectionLabel label="Phrases" />
        <View style={{ gap: Spacing.sm }}>
          {phrases.map((p, i) => (
            <SummaryRow
              key={`p-${i}`}
              transliteration={p.transliteration}
              english={p.english}
              kannada={p.kannada}
            />
          ))}
        </View>
      </ScrollView>

      <View style={{ padding: Spacing.lg, paddingBottom: insets.bottom + Spacing.lg }}>
        <LipButton label="Continue" onPress={onAdvance} icon={Icons.forward} />
      </View>
    </View>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <Text
      style={{
        fontFamily: Fonts.dmSans.bold,
        fontSize: moderateScale(11),
        letterSpacing: 2,
        color: Colors.tertiary,
        textTransform: 'uppercase',
        marginBottom: Spacing.md,
      }}
      maxFontSizeMultiplier={1.4}
    >
      {label}
    </Text>
  );
}

function SummaryRow({
  transliteration,
  english,
  kannada,
}: {
  transliteration: string;
  english: string;
  kannada: string;
}) {
  const [playing, setPlaying] = useState(false);
  const handlePlay = () => {
    setPlaying(true);
    deviceTtsAudioService
      .play(kannada)
      .catch(() => undefined)
      .finally(() => setPlaying(false));
  };
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        backgroundColor: '#ffffff',
        borderRadius: Radius.chunky,
        borderWidth: 1,
        borderColor: Colors.hairline,
        borderBottomWidth: 3,
        borderBottomColor: Colors.cardLip,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(14.5),
            color: Colors.onSurface,
          }}
          maxFontSizeMultiplier={1.3}
        >
          {transliteration}
        </Text>
        <Text
          style={{
            fontFamily: Fonts.notoSansKannada.regular,
            fontSize: moderateScale(12),
            color: Colors.textFaint,
            marginTop: moderateScale(2),
          }}
          maxFontSizeMultiplier={1.3}
        >
          {kannada}
        </Text>
      </View>
      <Text
        style={{
          fontFamily: Fonts.dmSans.regular,
          fontSize: moderateScale(12.5),
          color: Colors.tertiary,
          flexShrink: 1,
          textAlign: 'right',
          maxWidth: '40%',
        }}
        numberOfLines={2}
        maxFontSizeMultiplier={1.3}
      >
        {english}
      </Text>
      <AudioOrb
        onPress={handlePlay}
        playing={playing}
        size={34}
        color={Colors.secondaryFixed}
        iconColor={Colors.secondary}
        lipColor={Colors.goldLip}
        accessibilityLabel={`Hear ${english}`}
      />
    </View>
  );
}
