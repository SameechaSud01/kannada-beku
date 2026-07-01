import { useEffect, useState } from 'react';
import { logger } from '../../lib/logger';
import { View, Text, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { BACK_CHIP_TOP_RESERVE } from '../ui/ExitBackButton';
import { useIsMounted } from '../../hooks/useIsMounted';
import { deviceTtsAudioService } from '../../services/audio/deviceTtsAudioService';
import { useProgressStore } from '../../stores/progressStore';
import { Toasts } from '../../components/modals/instances/toastCatalog';
import { LessonProgressBar } from './LessonProgressBar';
import { LipButton } from '../ui/LipButton';
import { AudioOrb } from '../ui/AudioOrb';
import { useUserStore } from '../../stores/useUserStore';
import { GlossTag } from '../ui/GlossTag';
import { splitGloss } from '../../utils/gloss';
import { fitFontSize } from '../../utils/fontScale';
import type { Word } from '../../constants/lessons/types';

interface TeachWordsPhaseProps {
  words: Word[];
  wordIndex: number;
  lessonNo: number;
  /** Sub-part name (e.g. "Saying hello"); shown on the progress label when split. */
  sectionLabel?: string;
  onAdvance: () => void;
}

export function TeachWordsPhase({
  words,
  wordIndex,
  lessonNo,
  sectionLabel,
  onAdvance,
}: TeachWordsPhaseProps) {
  const insets = useSafeAreaInsets();
  const word = words[wordIndex];
  const total = words.length;
  const isLast = wordIndex >= total - 1;
  const autoReplay = useUserStore((s) => s.autoReplay);
  const [playing, setPlaying] = useState(false);
  const mounted = useIsMounted();

  useEffect(() => {
    if (!word || !autoReplay) return;
    if (lessonNo >= 1) useProgressStore.getState().recordListen();
    setPlaying(true);
    deviceTtsAudioService
      .play(word.kannada)
      .catch((err) => {
        logger.warn('teach_words', 'auto-play failed', { err });
      })
      .finally(() => {
        if (mounted.current) setPlaying(false);
      });
    return () => {
      deviceTtsAudioService.stop().catch(() => undefined);
      setPlaying(false);
    };
  }, [word?.kannada, autoReplay]);

  if (!word) return null;

  const { text: englishText, tag } = splitGloss(word.english);

  const handleReplay = () => {
    if (lessonNo >= 1) useProgressStore.getState().recordListen();
    setPlaying(true);
    deviceTtsAudioService
      .play(word.kannada)
      .catch((err) => {
        logger.warn('teach_words', 'replay failed', { err });
        Toasts.audioFailed(handleReplay);
      })
      .finally(() => {
        if (mounted.current) setPlaying(false);
      });
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surfaceCream }}>
      <View
        style={{ paddingTop: insets.top + BACK_CHIP_TOP_RESERVE, paddingHorizontal: Spacing.lg }}
      >
        <LessonProgressBar
          current={wordIndex + 1}
          total={total}
          label={`${sectionLabel ? `${sectionLabel} · ` : ''}Word ${wordIndex + 1} of ${total}`}
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
            backgroundColor: Colors.surfaceCreamLow,
            borderRadius: Radius.chunky,
            borderBottomWidth: 4,
            borderBottomColor: Colors.cardLip,
            paddingVertical: Spacing.xxxl,
            paddingHorizontal: Spacing.lg,
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: moderateScale(
                fitFontSize(word.transliteration, { max: 40, min: 24, comfortable: 10 }),
              ),
              lineHeight: moderateScale(52),
              color: Colors.onSurface,
              textAlign: 'center',
            }}
            maxFontSizeMultiplier={1.2}
            adjustsFontSizeToFit
            numberOfLines={2}
          >
            {word.transliteration}
          </Text>

          <Animated.View
            key={word.kannada}
            entering={FadeInDown.duration(280)}
            style={{ alignItems: 'center', alignSelf: 'stretch' }}
          >
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
                fontSize: moderateScale(14),
                color: Colors.textFaint,
                textAlign: 'center',
                marginTop: Spacing.lg,
              }}
              maxFontSizeMultiplier={1.3}
            >
              {word.kannada}
            </Text>
          </Animated.View>
        </View>

        {word.hook ? (
          <Animated.View
            entering={FadeInDown.duration(280)}
            style={{
              flexDirection: 'row',
              gap: Spacing.sm,
              alignItems: 'flex-start',
              backgroundColor: Colors.surfaceCreamLow,
              borderRadius: Radius.chunky,
              paddingVertical: moderateScale(11),
              paddingHorizontal: Spacing.lg,
              marginTop: Spacing.lg,
              width: '100%',
            }}
          >
            <Icons.sparkle size={moderateScale(16)} color={Colors.secondary} strokeWidth={2.2} />
            <Text
              style={{
                flex: 1,
                fontFamily: Fonts.dmSans.regular,
                fontSize: moderateScale(13),
                lineHeight: moderateScale(19),
                color: Colors.tertiary,
              }}
              maxFontSizeMultiplier={1.3}
            >
              <Text style={{ fontFamily: Fonts.dmSans.bold, color: Colors.onSurface }}>
                Memory hook ·{' '}
              </Text>
              {word.hook}
            </Text>
          </Animated.View>
        ) : null}

        <View style={{ marginTop: Spacing.xxl }}>
          <AudioOrb
            onPress={handleReplay}
            playing={playing}
            size={64}
            accessibilityLabel={`Hear ${word.english} again`}
          />
        </View>
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
