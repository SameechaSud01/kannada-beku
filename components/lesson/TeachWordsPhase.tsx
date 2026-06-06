import { useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { BACK_CHIP_TOP_RESERVE } from '../ui/ExitBackButton';
import { deviceTtsAudioService } from '../../services/audio/deviceTtsAudioService';
import { Toasts } from '../../components/modals/instances/toastCatalog';
import { LessonProgressBar } from './LessonProgressBar';
import { LipButton } from '../ui/LipButton';
import { useUserStore } from '../../stores/useUserStore';
import { GlossTag } from '../ui/GlossTag';
import { splitGloss } from '../../utils/gloss';
import type { Word } from '../../constants/lessons/types';

interface TeachWordsPhaseProps {
  words: Word[];
  wordIndex: number;
  onAdvance: () => void;
}

export function TeachWordsPhase({ words, wordIndex, onAdvance }: TeachWordsPhaseProps) {
  const insets = useSafeAreaInsets();
  const word = words[wordIndex];
  const total = words.length;
  const isLast = wordIndex >= total - 1;
  const autoReplay = useUserStore((s) => s.autoReplay);

  useEffect(() => {
    if (!word || !autoReplay) return;
    deviceTtsAudioService.play(word.kannada).catch((err) => {
      console.warn('[teach_words] auto-play failed', err);
    });
    return () => {
      deviceTtsAudioService.stop().catch(() => undefined);
    };
  }, [word?.kannada, autoReplay]);

  if (!word) return null;

  const { text: englishText, tag } = splitGloss(word.english);

  const handleReplay = () => {
    deviceTtsAudioService.play(word.kannada).catch((err) => {
      console.warn('[teach_words] replay failed', err);
      Toasts.audioFailed(handleReplay);
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <View style={{ paddingTop: insets.top + BACK_CHIP_TOP_RESERVE, paddingHorizontal: Spacing.lg }}>
        <LessonProgressBar
          current={wordIndex + 1}
          total={total}
          label={`Word ${wordIndex + 1} of ${total}`}
        />
      </View>

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: Spacing.lg,
          paddingTop: Spacing.xxl,
          paddingBottom: Spacing.lg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            backgroundColor: Colors.surfaceContainerLow,
            borderRadius: Radius.xl,
            paddingVertical: Spacing.xxxl,
            paddingHorizontal: Spacing.lg,
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: moderateScale(42),
              lineHeight: moderateScale(54),
              color: Colors.onSurface,
              textAlign: 'center',
            }}
            maxFontSizeMultiplier={1.2}
            adjustsFontSizeToFit
            numberOfLines={2}
          >
            {word.transliteration}
          </Text>
          <Text
            style={{
              fontFamily: Fonts.dmSans.medium,
              fontSize: moderateScale(18),
              color: Colors.tertiary,
              textAlign: 'center',
              marginTop: Spacing.md,
            }}
            maxFontSizeMultiplier={1.3}
          >
            {englishText}
          </Text>
          {tag ? (
            <View style={{ marginTop: Spacing.sm }}>
              <GlossTag tag={tag} />
            </View>
          ) : null}
          <Text
            style={{
              fontFamily: Fonts.notoSansKannada.regular,
              fontSize: moderateScale(13),
              color: Colors.tertiary,
              textAlign: 'center',
              marginTop: Spacing.lg,
              opacity: 0.7,
            }}
            maxFontSizeMultiplier={1.3}
          >
            {word.kannada}
          </Text>
        </View>

        <Pressable
          onPress={handleReplay}
          accessibilityRole="button"
          accessibilityLabel={`Hear ${word.english} again`}
          hitSlop={8}
          style={({ pressed }) => ({
            marginTop: Spacing.xxl,
            width: moderateScale(64),
            height: moderateScale(64),
            borderRadius: Radius.full,
            backgroundColor: pressed ? Colors.primary : Colors.primaryContainer,
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ scale: pressed ? 0.94 : 1 }],
          })}
        >
          <Icons.audio size={moderateScale(26)} color={Colors.onPrimary} />
        </Pressable>
      </ScrollView>

      <View style={{ padding: Spacing.lg, paddingBottom: insets.bottom + Spacing.lg }}>
        <LipButton
          label={isLast ? 'Start practising words' : 'Got it'}
          onPress={onAdvance}
          accessibilityLabel={isLast ? 'Start practising words' : 'Got it, next word'}
          icon={Icons.forward}
        />
      </View>
    </View>
  );
}
