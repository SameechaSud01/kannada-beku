import { useState } from 'react';
import { Image, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { type VowelSound } from '../../constants/guide';
import { StepHeading } from './StepHeading';
import { ChunkyLip } from '../ui/ChunkyLip';
import { useGuideAudio } from './useGuideAudio';

const COLS = 4;

/**
 * Step 2 — "The vowel sounds". The 8 common vowels in a 4-column grid; tap a
 * tile to hear it, then say it back. Audit fixes (spec_onboarding_audit_fixes.md):
 * each tile carries a speaker glyph, flips to a persistent gold "heard" state
 * with a check, an "n of 8 heard" counter tracks progress, and transliteration
 * labels are ink (not red). Tiles use ChunkyLip (a second copy of the shape) so
 * the chunky lip follows the rounded corners.
 */
export function StepVowelSounds({ vowels }: { vowels: VowelSound[] }) {
  const { play } = useGuideAudio();
  const { width } = useWindowDimensions();
  const [heard, setHeard] = useState<Set<string>>(() => new Set());

  // Fixed tile size so ChunkyLip (which is absolutely positioned) has real dims.
  const gap = moderateScale(10);
  const contentW = width - Spacing.xxl * 2;
  const tile = Math.floor((contentW - gap * (COLS - 1)) / COLS);

  const hear = (key: string, kannada: string) => {
    setHeard((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      return next;
    });
    play(key, kannada);
  };

  return (
    <View>
      <StepHeading title="The vowel sounds" subtitle="Hear it first, then say it. Tap each one." />

      {/* Mouth-position card — diagram beside its caption. */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.lg,
          backgroundColor: '#ffffff',
          borderWidth: 1,
          borderColor: Colors.hairline,
          borderBottomWidth: moderateScale(4),
          borderBottomColor: Colors.cardLip,
          borderRadius: Radius.chunky,
          paddingVertical: moderateScale(12),
          paddingHorizontal: moderateScale(16),
          marginBottom: Spacing.lg,
        }}
      >
        <Image
          source={require('../../assets/tongue-diagrams/a.png')}
          style={{
            width: moderateScale(76),
            height: moderateScale(106),
            borderRadius: Radius.tile,
          }}
          resizeMode="cover"
          accessible
          accessibilityRole="image"
          accessibilityLabel="Mouth position: relaxed, tongue flat"
        />
        <Text
          style={{
            flex: 1,
            fontFamily: Fonts.dmSans.regular,
            fontSize: moderateScale(14.5),
            lineHeight: moderateScale(21),
            color: Colors.tertiary,
          }}
          maxFontSizeMultiplier={1.3}
        >
          Vowels stay open — mouth relaxed, tongue flat.
        </Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}>
        {vowels.map((vowel) => {
          const key = `vowel:${vowel.kannada}`;
          const isHeard = heard.has(key);
          const StatusIcon = isHeard ? Icons.check : Icons.audio;
          return (
            <Pressable
              key={key}
              onPress={() => hear(key, vowel.kannada)}
              accessibilityRole="button"
              accessibilityLabel={`Hear ${vowel.transliteration}`}
              accessibilityState={{ selected: isHeard }}
            >
              <ChunkyLip
                width={tile}
                height={tile}
                radius={Radius.chunky}
                bg={isHeard ? Colors.goldSoft : '#ffffff'}
                lipColor={isHeard ? Colors.goldLip : Colors.cardLip}
                depth={4}
                border
                borderColor={isHeard ? Colors.goldLip : Colors.hairline}
                borderWidth={1}
              >
                <Text
                  style={{
                    fontFamily: Fonts.dmSans.bold,
                    fontSize: moderateScale(30),
                    color: isHeard ? Colors.onSecondaryContainer : Colors.onSurface,
                  }}
                  maxFontSizeMultiplier={1.2}
                >
                  {vowel.transliteration}
                </Text>
                <Text
                  style={{
                    fontFamily: Fonts.notoSansKannada.bold,
                    fontSize: moderateScale(13),
                    color: Colors.onSurface,
                    lineHeight: moderateScale(18),
                    marginTop: moderateScale(1),
                  }}
                  maxFontSizeMultiplier={1.2}
                >
                  {vowel.kannada}
                </Text>
                <View
                  style={{ position: 'absolute', top: moderateScale(6), right: moderateScale(7) }}
                >
                  <StatusIcon
                    size={moderateScale(12)}
                    color={isHeard ? Colors.secondary : 'rgba(27,29,14,0.35)'}
                    strokeWidth={2.6}
                  />
                </View>
              </ChunkyLip>
            </Pressable>
          );
        })}
      </View>

      <Text
        style={{
          fontFamily: Fonts.dmSans.bold,
          fontSize: moderateScale(13),
          color: Colors.secondary,
          textAlign: 'center',
          marginTop: Spacing.lg,
        }}
        maxFontSizeMultiplier={1.3}
        accessibilityLiveRegion="polite"
      >
        {heard.size} of {vowels.length} heard
      </Text>
    </View>
  );
}
