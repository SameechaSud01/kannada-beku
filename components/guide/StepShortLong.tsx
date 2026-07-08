import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
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

// Precomputed outside the worklet — never call moderateScale inside one.
const SHAKE_PX = moderateScale(6);
const CHIP_LIP = moderateScale(4);

type AnswerState = 'idle' | 'correct' | 'wrong';

/**
 * Step 3 — "Short vs. long". Two listen cards (kali vs kaali) plus a
 * "Which did you hear?" self-check. Audit fixes (spec_onboarding_audit_fixes.md):
 * glyphs are ink (not red), play affordances are gold orbs, answer chips are
 * white chunky (never flat grey), correct is the ONE sanctioned green, and a
 * wrong pick shakes with encouraging copy and lets the learner retry. The quiz
 * never gates the CTA.
 */
export function StepShortLong({ shortLong }: { shortLong: ShortLongPair }) {
  const { play } = useGuideAudio();
  // The quiz plays the LONG word; the learner picks which they heard.
  const answer = shortLong.long.transliteration;
  const [played, setPlayed] = useState(false);
  const [answerState, setAnswerState] = useState<AnswerState>('idle');
  const [shakeToken, setShakeToken] = useState(0);
  const [wrongPick, setWrongPick] = useState<string | null>(null);

  const options = [shortLong.short, shortLong.long];

  const handlePick = (label: string) => {
    if (answerState === 'correct') return;
    if (label === answer) {
      setAnswerState('correct');
      setWrongPick(null);
      play('sl:answer', shortLong.long.kannada);
    } else {
      setAnswerState('wrong');
      setWrongPick(label);
      setShakeToken((t) => t + 1);
    }
  };

  return (
    <View>
      <StepHeading
        title="Short vs. long"
        subtitle="Hold a vowel longer and the word changes. Listen:"
      />

      <View style={{ flexDirection: 'row', gap: moderateScale(12) }}>
        <CompareTile
          word={shortLong.short}
          onPlay={() => play('sl:short', shortLong.short.kannada)}
        />
        <CompareTile word={shortLong.long} onPlay={() => play('sl:long', shortLong.long.kannada)} />
      </View>

      {/* Listening self-check — a flat tinted well. */}
      <View
        style={{
          backgroundColor: Colors.surfaceCreamLow,
          borderRadius: Radius.chunky,
          paddingTop: moderateScale(14),
          paddingBottom: moderateScale(16),
          paddingHorizontal: moderateScale(16),
          marginTop: Spacing.lg,
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(12),
            letterSpacing: 1.4,
            textTransform: 'uppercase',
            color: Colors.secondary,
            marginBottom: moderateScale(10),
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
          lip={3}
          radius={Radius.tile}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: moderateScale(8),
            paddingVertical: moderateScale(11),
          }}
        >
          <ChunkyCircle
            size={moderateScale(24)}
            bg={Colors.secondaryContainer}
            lipColor={Colors.goldLip}
            depth={2}
          >
            <Icons.play size={moderateScale(11)} color={Colors.onSecondaryContainer} />
          </ChunkyCircle>
          <Text
            style={{
              fontFamily: Fonts.baloo.bold,
              fontSize: moderateScale(15),
              color: Colors.onSurface,
            }}
            maxFontSizeMultiplier={1.3}
          >
            {played ? 'Play again' : 'Play a sound'}
          </Text>
        </ChunkyPressable>

        <View
          style={{ flexDirection: 'row', gap: moderateScale(10), marginTop: moderateScale(10) }}
        >
          {options.map((opt) => (
            <AnswerChip
              key={opt.transliteration}
              label={opt.transliteration}
              correct={answerState === 'correct' && opt.transliteration === answer}
              locked={answerState === 'correct'}
              shakeToken={wrongPick === opt.transliteration ? shakeToken : 0}
              onPick={() => handlePick(opt.transliteration)}
            />
          ))}
        </View>

        {answerState !== 'idle' ? (
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: moderateScale(13.5),
              textAlign: 'center',
              marginTop: moderateScale(12),
              color: answerState === 'correct' ? Colors.onSuccessContainer : Colors.primary,
            }}
            maxFontSizeMultiplier={1.4}
            accessibilityLiveRegion="polite"
          >
            {answerState === 'correct' ? 'Correct! Well done.' : "Not quite. Let's try again!"}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function CompareTile({ word, onPlay }: { word: GuideWord; onPlay: () => void }) {
  return (
    <ChunkyPressable
      onPress={onPlay}
      accessibilityLabel={`Hear ${word.transliteration}, meaning ${word.english}`}
      border
      radius={Radius.chunky}
      style={{
        flex: 1,
        alignItems: 'center',
        gap: moderateScale(3),
        paddingTop: moderateScale(18),
        paddingBottom: moderateScale(14),
        paddingHorizontal: moderateScale(8),
      }}
    >
      <Text
        style={{
          fontFamily: Fonts.notoSansKannada.bold,
          fontSize: moderateScale(34),
          color: Colors.onSurface,
        }}
        maxFontSizeMultiplier={1.2}
      >
        {word.kannada}
      </Text>
      <Text
        style={{
          fontFamily: Fonts.dmSans.bold,
          fontSize: moderateScale(15),
          color: Colors.onSurface,
        }}
        maxFontSizeMultiplier={1.3}
      >
        {word.transliteration}
      </Text>
      <Text
        style={{
          fontFamily: Fonts.dmSans.regular,
          fontSize: moderateScale(12.5),
          color: Colors.inkFaint,
        }}
        maxFontSizeMultiplier={1.3}
      >
        {word.english}
      </Text>
      <View style={{ marginTop: moderateScale(8) }}>
        <ChunkyCircle
          size={moderateScale(40)}
          bg={Colors.secondaryContainer}
          lipColor={Colors.goldLip}
          depth={3}
        >
          <Icons.play size={moderateScale(16)} color={Colors.onSecondaryContainer} />
        </ChunkyCircle>
      </View>
    </ChunkyPressable>
  );
}

function AnswerChip({
  label,
  correct,
  locked,
  shakeToken,
  onPick,
}: {
  label: string;
  correct: boolean;
  locked: boolean;
  /** Increments each time this chip was a wrong pick — triggers the shake. */
  shakeToken: number;
  onPick: () => void;
}) {
  const offsetX = useSharedValue(0);

  useEffect(() => {
    if (shakeToken > 0) {
      offsetX.value = withSequence(
        withTiming(-SHAKE_PX, { duration: 55 }),
        withTiming(SHAKE_PX, { duration: 55 }),
        withTiming(-SHAKE_PX * 0.6, { duration: 55 }),
        withTiming(SHAKE_PX * 0.6, { duration: 55 }),
        withTiming(0, { duration: 55 }),
      );
    }
  }, [shakeToken, offsetX]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offsetX.value }],
  }));

  return (
    <Animated.View style={[{ flex: 1 }, shakeStyle]}>
      <Pressable
        onPress={onPick}
        disabled={locked}
        accessibilityRole="button"
        accessibilityLabel={`I heard ${label}`}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: moderateScale(8),
          backgroundColor: correct ? Colors.successContainerLow : '#ffffff',
          borderWidth: 2,
          borderColor: correct ? Colors.successContainer : Colors.hairlineStrong,
          borderBottomWidth: CHIP_LIP,
          borderBottomColor: correct ? Colors.successLip : Colors.cardLip,
          borderRadius: Radius.lg,
          paddingVertical: moderateScale(13),
        }}
      >
        {correct ? (
          <Icons.check size={moderateScale(15)} color={Colors.onSuccessContainer} strokeWidth={3} />
        ) : null}
        <Text
          style={{
            fontFamily: Fonts.baloo.bold,
            fontSize: moderateScale(16.5),
            color: correct ? Colors.onSuccessContainer : Colors.onSurface,
          }}
          maxFontSizeMultiplier={1.3}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
