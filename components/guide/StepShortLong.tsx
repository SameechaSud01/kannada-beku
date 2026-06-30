import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { type GuideWord, type ShortLongPair } from '../../constants/guide';
import { StepHeading } from './StepHeading';
import { ChunkyPressable } from '../ui/ChunkyPressable';
import { ChunkyCircle } from '../ui/ChunkyLip';
import { useGuideAudio } from './useGuideAudio';

/**
 * Step 3 — "Short vs. long". Two compare tiles (kali vs kaali) plus a
 * "Which did you hear?" listening self-check. The quiz gives green/red feedback
 * but never gates the CTA, and there is no recording — it plays the long word
 * and the learner taps which they heard (spec_lesson0_redesign.md).
 */
export function StepShortLong({ shortLong }: { shortLong: ShortLongPair }) {
  const { playingKey, play } = useGuideAudio();
  // The quiz plays the LONG word; the learner picks which they heard.
  const answer = shortLong.long.transliteration;
  const [played, setPlayed] = useState(false);
  const [pick, setPick] = useState<string | null>(null);
  const correct = pick === answer;

  const options = [shortLong.short, shortLong.long];

  return (
    <View>
      <StepHeading
        title="Short vs. long"
        subtitle="Hold a vowel longer and the word changes. Listen:"
      />

      <View style={{ flexDirection: 'row', gap: moderateScale(11) }}>
        <CompareTile
          word={shortLong.short}
          accent={Colors.onSurface}
          active={playingKey === 'sl:short'}
          onPlay={() => play('sl:short', shortLong.short.kannada)}
        />
        <CompareTile
          word={shortLong.long}
          accent={Colors.primaryContainer}
          active={playingKey === 'sl:long'}
          onPlay={() => play('sl:long', shortLong.long.kannada)}
        />
      </View>

      {/* Listening self-check — a flat tinted well. */}
      <View
        style={{
          backgroundColor: Colors.surfaceCreamLow,
          borderRadius: Radius.chunky,
          paddingVertical: moderateScale(18),
          paddingHorizontal: moderateScale(18),
          marginTop: Spacing.lg,
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(12),
            letterSpacing: 1.6,
            textTransform: 'uppercase',
            color: Colors.secondary,
            marginBottom: moderateScale(12),
          }}
          maxFontSizeMultiplier={1.3}
        >
          Which did you hear?
        </Text>

        <ChunkyPressable
          onPress={() => {
            setPlayed(true);
            play('sl:quiz', shortLong.long.kannada);
          }}
          accessibilityLabel={played ? 'Play the sound again' : 'Play a sound'}
          border
          radius={Radius.tile}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: moderateScale(8),
            paddingVertical: moderateScale(14),
          }}
        >
          <Icons.play size={moderateScale(17)} color={Colors.secondary} />
          <Text
            style={{ fontFamily: Fonts.baloo.bold, fontSize: moderateScale(15.5), color: Colors.onSurface }}
            maxFontSizeMultiplier={1.3}
          >
            {played ? 'Play again' : 'Play a sound'}
          </Text>
        </ChunkyPressable>

        <View style={{ flexDirection: 'row', gap: moderateScale(11), marginTop: moderateScale(12) }}>
          {options.map((opt) => (
            <QuizOption
              key={opt.transliteration}
              label={opt.transliteration}
              picked={pick}
              answer={answer}
              onPick={() => {
                if (!pick) {
                  setPick(opt.transliteration);
                  play('sl:answer', shortLong.long.kannada);
                }
              }}
            />
          ))}
        </View>

        {pick ? (
          <Text
            style={{
              fontFamily: Fonts.dmSans.medium,
              fontSize: moderateScale(13.5),
              lineHeight: moderateScale(20),
              marginTop: moderateScale(12),
              borderRadius: Radius.md,
              overflow: 'hidden',
              paddingVertical: moderateScale(11),
              paddingHorizontal: moderateScale(13),
              backgroundColor: correct ? Colors.successContainerLow : Colors.errorContainerLow,
              color: correct ? Colors.onSuccessContainer : Colors.primary,
            }}
            maxFontSizeMultiplier={1.4}
            accessibilityLiveRegion="polite"
          >
            {correct
              ? `Right! That was “${answer}” — the long one you hold a beat longer.`
              : `Not quite — that was “${answer}” (the long one). Tap play and listen again.`}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function CompareTile({
  word,
  accent,
  active,
  onPlay,
}: {
  word: GuideWord;
  accent: string;
  active: boolean;
  onPlay: () => void;
}) {
  return (
    <ChunkyPressable
      onPress={onPlay}
      accessibilityLabel={`Hear ${word.transliteration}, meaning ${word.english}`}
      border
      borderColor={active ? Colors.primaryContainer : Colors.hairline}
      borderWidth={active ? 2 : 1}
      lipColor={active ? Colors.primaryContainer : Colors.cardLip}
      radius={Radius.chunky}
      style={{
        flex: 1,
        alignItems: 'center',
        gap: moderateScale(4),
        paddingVertical: moderateScale(20),
        paddingHorizontal: moderateScale(8),
      }}
    >
      <Text
        style={{ fontFamily: Fonts.notoSansKannada.bold, fontSize: moderateScale(34), color: accent }}
        maxFontSizeMultiplier={1.2}
      >
        {word.kannada}
      </Text>
      <Text
        style={{ fontFamily: Fonts.dmSans.bold, fontSize: moderateScale(18), color: accent }}
        maxFontSizeMultiplier={1.3}
      >
        {word.transliteration}
      </Text>
      <Text
        style={{ fontFamily: Fonts.dmSans.regular, fontSize: moderateScale(13), color: Colors.tertiary }}
        maxFontSizeMultiplier={1.3}
      >
        {word.english}
      </Text>
      <View style={{ marginTop: moderateScale(8) }}>
        <ChunkyCircle
          size={moderateScale(40)}
          bg={Colors.secondaryFixed}
          lipColor={Colors.goldLip}
          depth={3}
        >
          <Icons.play size={moderateScale(17)} color={Colors.secondary} />
        </ChunkyCircle>
      </View>
    </ChunkyPressable>
  );
}

function QuizOption({
  label,
  picked,
  answer,
  onPick,
}: {
  label: string;
  picked: string | null;
  answer: string;
  onPick: () => void;
}) {
  // Neutral until a pick is made; then green for the answer, red for a wrong pick,
  // muted for the rest (owner-approved green/red answer-feedback exception).
  let bg = Colors.surfaceContainerHigh;
  let fg = Colors.secondary;
  if (picked) {
    if (label === answer) {
      bg = Colors.successContainerLow;
      fg = Colors.onSuccessContainer;
    } else if (label === picked) {
      bg = Colors.errorContainerLow;
      fg = Colors.primary;
    } else {
      fg = Colors.textFaint;
    }
  }

  return (
    <Pressable
      onPress={onPick}
      disabled={!!picked}
      accessibilityRole="button"
      accessibilityLabel={`I heard ${label}`}
      style={{
        flex: 1,
        alignItems: 'center',
        backgroundColor: bg,
        borderRadius: Radius.tile,
        paddingVertical: moderateScale(14),
      }}
    >
      <Text
        style={{ fontFamily: Fonts.baloo.bold, fontSize: moderateScale(16), color: fg }}
        maxFontSizeMultiplier={1.3}
      >
        {label}
      </Text>
    </Pressable>
  );
}
