import { Pressable, Text, View } from 'react-native';
import { logger } from '../../../lib/logger';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';
import { Spacing, Radius } from '../../../constants/spacing';
import { Icons } from '../../../constants/icons';
import { ChunkyCircle } from '../../ui/ChunkyLip';
import { deviceTtsAudioService } from '../../../services/audio/deviceTtsAudioService';
import { Toasts } from './toastCatalog';

/** A vocabulary item — both Word and Phrase share these three fields. */
export interface VocabItem {
  transliteration: string;
  english: string;
  kannada: string;
}

export interface WordsLearnedGroup {
  /** Lesson title, used as the section header. */
  title: string;
  items: VocabItem[];
}

export interface WordsLearnedSheetProps {
  groups: WordsLearnedGroup[];
  total: number;
  onDismiss: () => void;
}

function speakable(kannada: string): string {
  return kannada.replace(/\[name\]/g, '').trim();
}

/**
 * Bottom sheet listing every word & phrase the learner has collected, grouped by
 * lesson. Opened from the Home "Words learnt" banner. Tapping a row speaks it
 * (device TTS), mirroring PhraseDetailSheet's play behaviour.
 */
export function WordsLearnedSheet({ groups, total, onDismiss }: WordsLearnedSheetProps) {
  const play = (kannada: string) => {
    const txt = speakable(kannada);
    if (!txt) return;
    deviceTtsAudioService.play(txt).catch((err) => {
      logger.warn('audio', 'words-learnt play failed', { err });
      Toasts.audioFailed(() => play(kannada));
    });
  };

  return (
    <BottomSheetScrollView
      bounces={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        gap: moderateScale(18),
        paddingTop: moderateScale(4),
        paddingHorizontal: moderateScale(20),
        paddingBottom: moderateScale(36),
      }}
    >
      {/* Header — back button + title */}
      <View style={{ gap: moderateScale(12) }}>
        {/* White chunky circle — same family as ExitBackButton/PhaseBackButton. */}
        <Pressable
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={8}
          style={{ width: moderateScale(40), height: moderateScale(40) }}
        >
          {({ pressed }) => (
            <ChunkyCircle
              size={moderateScale(38)}
              depth={moderateScale(3)}
              bg="#ffffff"
              lipColor={Colors.cardLip}
              border
              borderColor={Colors.hairline}
              pressed={pressed}
            >
              <Icons.back size={moderateScale(20)} color={Colors.onSurface} />
            </ChunkyCircle>
          )}
        </Pressable>

        <View>
          <Text
            style={{
              fontFamily: Fonts.baloo.extrabold,
              fontSize: moderateScale(26),
              color: Colors.onSurface,
              letterSpacing: -0.3,
            }}
            maxFontSizeMultiplier={1.2}
          >
            Words learnt
          </Text>
          <Text
            style={{
              fontFamily: Fonts.dmSans.medium,
              fontSize: moderateScale(13),
              color: Colors.tertiary,
              marginTop: moderateScale(2),
            }}
            maxFontSizeMultiplier={1.4}
          >
            {total === 0
              ? 'Finish a lesson to start collecting words.'
              : `${total} so far · tap any word to hear it`}
          </Text>
        </View>
      </View>

      {groups.map((group) => (
        <View key={group.title} style={{ gap: moderateScale(8) }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(6) }}>
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: moderateScale(11),
                letterSpacing: 1.6,
                color: Colors.secondary,
                textTransform: 'uppercase',
              }}
              maxFontSizeMultiplier={1.4}
            >
              {group.title}
            </Text>
            <Text
              style={{
                fontFamily: Fonts.dmSans.medium,
                fontSize: moderateScale(11),
                color: Colors.tertiary,
                fontVariant: ['tabular-nums'],
              }}
              maxFontSizeMultiplier={1.3}
            >
              · {group.items.length}
            </Text>
          </View>

          {group.items.map((item, idx) => (
            <Pressable
              key={`${item.kannada}-${idx}`}
              onPress={() => play(item.kannada)}
              accessibilityRole="button"
              accessibilityLabel={`Hear: ${item.english}`}
              style={({ pressed }) => ({
                backgroundColor: '#ffffff',
                borderRadius: Radius.tile,
                borderWidth: 1,
                borderColor: Colors.hairline,
                paddingVertical: moderateScale(10),
                paddingHorizontal: moderateScale(13),
                flexDirection: 'row',
                alignItems: 'center',
                gap: moderateScale(12),
                opacity: pressed ? 0.75 : 1,
              })}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: Fonts.dmSans.bold,
                    fontSize: moderateScale(16),
                    color: Colors.onSurface,
                  }}
                  maxFontSizeMultiplier={1.4}
                  numberOfLines={2}
                >
                  {item.transliteration}
                </Text>
                <Text
                  style={{
                    fontFamily: Fonts.notoSansKannada.regular,
                    fontSize: moderateScale(14),
                    color: Colors.secondary,
                    marginTop: moderateScale(3),
                  }}
                  maxFontSizeMultiplier={1.3}
                >
                  {speakable(item.kannada) || item.kannada}
                </Text>
                <Text
                  style={{
                    fontFamily: Fonts.dmSans.medium,
                    fontSize: moderateScale(13),
                    color: Colors.tertiary,
                    marginTop: moderateScale(2),
                  }}
                  maxFontSizeMultiplier={1.4}
                  numberOfLines={2}
                >
                  {item.english}
                </Text>
              </View>
              {/* Canonical gold audio look (TeachWordsPhase recipe) — decorative;
                  the row Pressable stays the single touch target. */}
              <ChunkyCircle
                size={moderateScale(36)}
                depth={moderateScale(2)}
                bg={Colors.secondaryFixed}
                lipColor={Colors.goldLip}
              >
                <Icons.audio size={moderateScale(18)} color={Colors.secondary} />
              </ChunkyCircle>
            </Pressable>
          ))}
        </View>
      ))}
    </BottomSheetScrollView>
  );
}
