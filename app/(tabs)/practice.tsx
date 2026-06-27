import { useEffect, useRef } from 'react';
import { View, Text, ScrollView, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { useCompletedLessons } from '../../hooks/progress';
import { useProgressStore } from '../../stores/progressStore';
import { useStreakCelebration } from '../../hooks/useStreakCelebration';
import { useDbLessons } from '../../hooks/useLessons';
import { GamesLockedEmpty } from '../../components/states/empties/TabEmpties';
import { Icons } from '../../constants/icons';
import { Watermark } from '../../components/ui/Watermark';
import { TopBar } from '../../components/ui/TopBar';
import { TAB_BAR_CLEARANCE } from '../../components/ui/TabBar';
import { ChunkyPressable } from '../../components/ui/ChunkyPressable';
import { ChunkyCircle } from '../../components/ui/ChunkyLip';
import type { Icon as TablerIcon } from '@tabler/icons-react-native';

type GameId = 'quiz' | 'dictation' | 'conversations' | 'opposites';

type GameDef = {
  id: GameId;
  title: string;
  subtitle: string;
  Icon: TablerIcon;
  bg: string;
  lip: string;
  fg: string;
  glyph: string;
  /** Glyph watermark tint. */
  glyphColor: string;
};

// 'image-match' stays hidden from Practice (CONTRADICTIONS C13). The featured
// Quick quiz renders separately; these three fill the grid + wide row.
const GRID_GAMES: GameDef[] = [
  {
    id: 'dictation',
    title: 'Dictation',
    subtitle: 'Hear it. Type it.',
    Icon: Icons.gameDictation,
    bg: Colors.primaryContainer,
    lip: Colors.redLip,
    fg: Colors.onPrimary,
    glyph: 'ಕ',
    glyphColor: 'rgba(255,255,255,0.22)',
  },
  {
    id: 'conversations',
    title: 'Conversations',
    subtitle: 'Roleplay real scenes.',
    Icon: Icons.gameConversations,
    bg: Colors.primary,
    lip: Colors.redLipDeep,
    fg: Colors.onPrimary,
    glyph: 'ಮ',
    glyphColor: 'rgba(255,255,255,0.22)',
  },
];

const WIDE_GAME: GameDef = {
  id: 'opposites',
  title: 'Opposites',
  subtitle: 'Match contrasts.',
  Icon: Icons.gameOpposites,
  bg: Colors.secondaryFixed,
  lip: Colors.goldLip,
  fg: Colors.onSecondaryContainer,
  glyph: 'ವ',
  glyphColor: 'rgba(120,89,0,0.20)',
};

export default function PracticeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const completedLessons = useCompletedLessons();
  const completedParts = useProgressStore((s) => s.completedParts);
  const { streak, onStreakPress } = useStreakCelebration();
  const dbLessons = useDbLessons().data ?? [];

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(4)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, []);

  const hasUnlocked = completedParts.length > 0 || completedLessons.length > 0;
  const go = (id: GameId) => router.push(`/${id}`);

  // Nothing unlocked yet → a single "Games unlock as you learn" empty whose one
  // action starts Lesson 1 (falls back to the Learn tab if lessons aren't loaded).
  if (!hasUnlocked) {
    const firstSlug = dbLessons.find((l) => l.lessonNo === 1)?.slug ?? dbLessons[0]?.slug;
    return (
      <GamesLockedEmpty
        streak={streak}
        onStart={() => router.push(firstSlug ? `/lesson/${firstSlug}` : '/(tabs)/learn')}
      />
    );
  }

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
        <View style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, marginBottom: Spacing.lg }}>
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
          <Text
            style={{
              fontFamily: Fonts.dmSans.medium,
              fontSize: moderateScale(15),
              color: Colors.tertiary,
              marginTop: moderateScale(2),
            }}
            maxFontSizeMultiplier={1.4}
          >
            Every game matches your lessons, one to one.
          </Text>
        </View>

        {/* Featured — Quick quiz */}
        <View style={{ paddingHorizontal: Spacing.lg, marginBottom: moderateScale(11) }}>
          <FeaturedQuiz locked={!hasUnlocked} onPress={() => go('quiz')} />
        </View>

        {/* 2-up grid */}
        <View
          style={{
            paddingHorizontal: Spacing.lg,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          {GRID_GAMES.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              width="48%"
              minHeight={150}
              locked={!hasUnlocked}
              onPress={() => go(game.id)}
            />
          ))}
        </View>

        {/* Wide — Opposites */}
        <View style={{ paddingHorizontal: Spacing.lg, marginTop: moderateScale(11) }}>
          <GameCard game={WIDE_GAME} width="100%" minHeight={96} locked={!hasUnlocked} onPress={() => go('opposites')} />
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
          {hasUnlocked
            ? 'Each game draws only from phrases you’ve already learned.'
            : 'Finish a lesson part on the Learn tab to unlock your games.'}
        </Text>
      </ScrollView>
    </Animated.View>
  );
}

/** Small burnt-orange lock badge for a locked (colour-coded) game tile. */
function LockBadge() {
  return (
    <View
      style={{
        position: 'absolute',
        top: moderateScale(12),
        left: moderateScale(12),
        width: moderateScale(30),
        height: moderateScale(30),
        borderRadius: Radius.full,
        backgroundColor: Colors.warningContainerLow,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icons.locked size={moderateScale(16)} color={Colors.warningContainer} strokeWidth={2} />
    </View>
  );
}

function RedPlayOrb() {
  return (
    <ChunkyCircle
      size={moderateScale(46)}
      depth={moderateScale(3)}
      bg={Colors.primaryContainer}
      lipColor={Colors.redLip}
    >
      <Icons.play size={moderateScale(18)} color={Colors.onPrimary} />
    </ChunkyCircle>
  );
}

function FeaturedQuiz({ locked, onPress }: { locked: boolean; onPress: () => void }) {
  const inner = (
    <View style={{ padding: moderateScale(18), overflow: 'hidden' }}>
      <Text
        aria-hidden
        style={{
          position: 'absolute',
          top: moderateScale(-6),
          right: moderateScale(6),
          fontFamily: Fonts.notoSansKannada.bold,
          fontSize: moderateScale(88),
          lineHeight: moderateScale(96),
          color: 'rgba(120,89,0,0.18)',
        }}
        maxFontSizeMultiplier={1}
      >
        ಪ
      </Text>
      {locked ? <LockBadge /> : null}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(14) }}>
        <View style={{ flex: 1 }}>
          <View
            style={{
              width: moderateScale(52),
              height: moderateScale(52),
              borderRadius: Radius.tile,
              backgroundColor: 'rgba(255,255,255,0.45)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: moderateScale(10),
            }}
          >
            <Icons.gameQuickQuiz size={moderateScale(26)} color={Colors.secondary} strokeWidth={2.2} />
          </View>
          <Text
            style={{ fontFamily: Fonts.baloo.extrabold, fontSize: moderateScale(21), color: Colors.onSecondaryContainer, letterSpacing: -0.3 }}
            maxFontSizeMultiplier={1.2}
          >
            Quick quiz
          </Text>
          <Text
            style={{ fontFamily: Fonts.dmSans.medium, fontSize: moderateScale(13), color: Colors.onSecondaryContainer, marginTop: moderateScale(1) }}
            maxFontSizeMultiplier={1.3}
          >
            Test your speed.
          </Text>
        </View>
        {!locked ? <RedPlayOrb /> : null}
      </View>
    </View>
  );

  if (locked) {
    return (
      <View
        accessibilityRole="button"
        accessibilityLabel="Quick quiz — locked. Finish a lesson part on the Learn tab to unlock."
        accessibilityState={{ disabled: true }}
        style={{
          borderRadius: Radius.chunky,
          backgroundColor: Colors.secondaryContainer,
          borderBottomWidth: 5,
          borderBottomColor: Colors.goldLip,
          opacity: 0.55,
        }}
      >
        {inner}
      </View>
    );
  }
  return (
    <ChunkyPressable
      onPress={onPress}
      accessibilityLabel="Quick quiz — test your speed."
      bg={Colors.secondaryContainer}
      lip={5}
      lipColor={Colors.goldLip}
      radius={Radius.chunky}
    >
      {inner}
    </ChunkyPressable>
  );
}

function GameCard({
  game,
  width,
  minHeight,
  locked,
  onPress,
}: {
  game: GameDef;
  width: '48%' | '100%';
  minHeight: number;
  locked: boolean;
  onPress: () => void;
}) {
  const inner = (
    <View style={{ minHeight: moderateScale(minHeight), padding: moderateScale(16), justifyContent: 'flex-end', overflow: 'hidden' }}>
      <Text
        aria-hidden
        style={{
          position: 'absolute',
          top: moderateScale(8),
          right: moderateScale(12),
          fontFamily: Fonts.notoSansKannada.bold,
          fontSize: moderateScale(64),
          lineHeight: moderateScale(72),
          color: game.glyphColor,
        }}
        maxFontSizeMultiplier={1}
      >
        {game.glyph}
      </Text>
      {locked ? <LockBadge /> : null}
      <Text
        style={{ fontFamily: Fonts.baloo.bold, fontSize: moderateScale(18), color: game.fg, letterSpacing: -0.2 }}
        maxFontSizeMultiplier={1.2}
        numberOfLines={1}
      >
        {game.title}
      </Text>
      <Text
        style={{ fontFamily: Fonts.dmSans.medium, fontSize: moderateScale(12), color: game.fg, marginTop: moderateScale(1) }}
        maxFontSizeMultiplier={1.3}
        numberOfLines={2}
      >
        {game.subtitle}
      </Text>
    </View>
  );

  if (locked) {
    return (
      <View
        accessibilityRole="button"
        accessibilityLabel={`${game.title} — locked. Finish a lesson part on the Learn tab to unlock.`}
        accessibilityState={{ disabled: true }}
        style={{
          width,
          borderRadius: Radius.chunky,
          backgroundColor: game.bg,
          borderBottomWidth: 5,
          borderBottomColor: game.lip,
          opacity: 0.55,
        }}
      >
        {inner}
      </View>
    );
  }
  return (
    <ChunkyPressable
      onPress={onPress}
      accessibilityLabel={`${game.title} — ${game.subtitle}`}
      bg={game.bg}
      lip={5}
      lipColor={game.lip}
      radius={Radius.chunky}
      style={{ width }}
    >
      {inner}
    </ChunkyPressable>
  );
}
