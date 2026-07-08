import { useEffect, useRef } from 'react';
import { View, Text, ScrollView, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { useStreakCelebration } from '../../hooks/useStreakCelebration';
import { useLessons } from '../../hooks/useLessons';
import { Icons } from '../../constants/icons';
import { Watermark } from '../../components/ui/Watermark';
import { TopBar } from '../../components/ui/TopBar';
import { TAB_BAR_CLEARANCE } from '../../components/ui/TabBar';
import { ChunkyPressable } from '../../components/ui/ChunkyPressable';

type GameId = 'quiz' | 'dictation' | 'conversations' | 'opposites';

type SignDef = {
  id: GameId;
  title: string;
  /** Kannada shop name, painted beside the English title on the board. */
  kannada: string;
  desc: string;
  glyph: string;
  /** Signboard tilt — each board hangs slightly off-level. */
  tilt: string;
  bg: string;
  lip: string;
  ink: string;
  /** Glyph tile fill. */
  tile: string;
};

// Game Street signboards, in street order (spec_game_street §1). No featured
// game — the street is flat; the quiz leads because it's first.
const SIGNS: SignDef[] = [
  {
    id: 'quiz',
    title: 'Quick quiz',
    kannada: 'ವೇಗ',
    desc: 'Test your speed.',
    glyph: 'ಪ',
    tilt: '-1.2deg',
    bg: Colors.secondaryContainer,
    lip: Colors.goldLip,
    ink: Colors.onSecondaryContainer,
    tile: 'rgba(255,255,255,0.45)',
  },
  {
    id: 'dictation',
    title: 'Dictation',
    kannada: 'ಕೇಳಿ',
    desc: 'Hear it. Type it.',
    glyph: 'ಕ',
    tilt: '1deg',
    bg: Colors.primaryContainer,
    lip: Colors.redLip,
    ink: Colors.onPrimary,
    tile: 'rgba(255,255,255,0.18)',
  },
  {
    id: 'conversations',
    title: 'Conversations',
    kannada: 'ಮಾತು',
    desc: 'Roleplay real scenes.',
    glyph: 'ಮ',
    tilt: '-0.8deg',
    bg: Colors.primary,
    lip: Colors.redLipDeep,
    ink: Colors.onPrimary,
    tile: 'rgba(255,255,255,0.16)',
  },
  {
    id: 'opposites',
    title: 'Opposites',
    kannada: 'ವಿರುದ್ಧ',
    desc: 'Match contrasts.',
    glyph: 'ವ',
    tilt: '1.1deg',
    bg: Colors.secondaryFixed,
    lip: Colors.goldLip,
    ink: Colors.onSecondaryContainer,
    tile: 'rgba(255,255,255,0.6)',
  },
];

export default function PracticeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { streak, onStreakPress } = useStreakCelebration();
  const lessons = useLessons();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(4)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, []);

  const go = (id: GameId) => router.push(`/${id}`);

  const unlockedCount = lessons.filter((l) => l.unlocked).length;
  const meta = `${unlockedCount} ${unlockedCount === 1 ? 'LESSON' : 'LESSONS'} READY`;

  return (
    <Animated.View
      style={{
        flex: 1,
        backgroundColor: Colors.surfaceCream,
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <Watermark motif="kolamGrid" />

      <TopBar streak={streak} onStreakPress={onStreakPress} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: TAB_BAR_CLEARANCE + insets.bottom }}
      >
        {/* Page title */}
        <View
          style={{
            paddingHorizontal: Spacing.lg,
            paddingTop: Spacing.lg,
            marginBottom: Spacing.lg,
          }}
        >
          <Text
            style={{
              fontFamily: Fonts.baloo.extrabold,
              fontSize: moderateScale(32),
              color: Colors.onSurface,
              letterSpacing: -0.5,
              lineHeight: moderateScale(45),
            }}
            maxFontSizeMultiplier={1.2}
          >
            Games
          </Text>
        </View>

        {/* The street */}
        <View style={{ paddingHorizontal: Spacing.lg, gap: moderateScale(16) }}>
          {SIGNS.map((sign) => (
            <Sign key={sign.id} sign={sign} meta={meta} onPress={() => go(sign.id)} />
          ))}
        </View>

        <Text
          style={{
            paddingHorizontal: Spacing.lg,
            marginTop: moderateScale(16),
            fontFamily: Fonts.dmSans.regular,
            fontSize: moderateScale(12),
            color: Colors.tertiary,
            lineHeight: moderateScale(18),
          }}
          maxFontSizeMultiplier={1.4}
        >
          Each game draws only from phrases you’ve already learned.
        </Text>
      </ScrollView>
    </Animated.View>
  );
}

/** One shop signboard on Game Street. */
function Sign({ sign, meta, onPress }: { sign: SignDef; meta: string; onPress: () => void }) {
  return (
    // Tilt lives on a wrapper — ChunkyPressable's press animation owns transform.
    <View style={{ transform: [{ rotate: sign.tilt }] }}>
      <ChunkyPressable
        onPress={onPress}
        accessibilityLabel={`${sign.title} — ${sign.desc}`}
        bg={sign.bg}
        lip={5}
        lipColor={sign.lip}
        radius={Radius.chunky}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: moderateScale(14),
            paddingVertical: moderateScale(15),
            paddingHorizontal: moderateScale(16),
          }}
        >
          {/* Painted inner outline, inset from the board edge */}
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: moderateScale(6),
              left: moderateScale(6),
              right: moderateScale(6),
              bottom: moderateScale(6),
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.35)',
              borderRadius: Radius.chunky - moderateScale(6),
            }}
          />

          {/* Glyph tile */}
          <View
            style={{
              width: moderateScale(54),
              height: moderateScale(54),
              borderRadius: Radius.tile,
              backgroundColor: sign.tile,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.notoSansKannada.bold,
                fontSize: moderateScale(27),
                color: sign.ink,
              }}
              maxFontSizeMultiplier={1}
            >
              {sign.glyph}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: moderateScale(8) }}>
              <Text
                style={{
                  fontFamily: Fonts.baloo.extrabold,
                  fontSize: moderateScale(21),
                  color: sign.ink,
                  letterSpacing: -0.3,
                }}
                maxFontSizeMultiplier={1.2}
                numberOfLines={1}
              >
                {sign.title}
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.notoSansKannada.regular,
                  fontSize: moderateScale(13),
                  color: sign.ink,
                  opacity: 0.75,
                }}
                maxFontSizeMultiplier={1}
              >
                {sign.kannada}
              </Text>
            </View>
            <Text
              style={{
                fontFamily: Fonts.dmSans.medium,
                fontSize: moderateScale(12.5),
                color: sign.ink,
                opacity: 0.82,
                marginTop: moderateScale(2),
              }}
              maxFontSizeMultiplier={1.3}
              numberOfLines={1}
            >
              {sign.desc}
            </Text>
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: moderateScale(11.5),
                color: sign.ink,
                opacity: 0.65,
                marginTop: moderateScale(4),
                letterSpacing: 0.3,
              }}
              maxFontSizeMultiplier={1.2}
              numberOfLines={1}
            >
              {meta}
            </Text>
          </View>

          <Icons.forward size={moderateScale(19)} color={sign.ink} />
        </View>
      </ChunkyPressable>
    </View>
  );
}
