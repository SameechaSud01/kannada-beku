import { useEffect, useRef } from 'react';
import { View, Text, ScrollView, Pressable, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { useCompletedLessons } from '../../hooks/progress';
import { Icons } from '../../constants/icons';
import { Watermark } from '../../components/ui/Watermark';
import type { Icon as TablerIcon } from '@tabler/icons-react-native';

type GameId = 'quiz' | 'image-match' | 'dictation' | 'conversations' | 'opposites';

type GameDef = {
  id: GameId;
  title: string;
  subtitle: string;
  Icon: TablerIcon;
  /** Card face, lip (hard bottom edge), text colour, decorative glyph. */
  bg: string;
  lip: string;
  fg: string;
  glyph: string;
};

export const GAMES: GameDef[] = [
  {
    id: 'quiz',
    title: 'Quick quiz',
    subtitle: 'Test your speed.',
    Icon: Icons.gameQuickQuiz,
    bg: Colors.secondary,
    lip: Colors.onSecondaryContainer,
    fg: Colors.onPrimary,
    glyph: 'ಪ',
  },
  // 'image-match' temporarily hidden from Practice (CONTRADICTIONS C13) — the
  // tap-to-connect board needs a better mechanic. Game code + route stay intact.
  {
    id: 'dictation',
    title: 'Dictation',
    subtitle: 'Hear it. Type it.',
    Icon: Icons.gameDictation,
    bg: Colors.primary,
    lip: Colors.redLip,
    fg: Colors.onPrimary,
    glyph: 'ಕ',
  },
  {
    id: 'conversations',
    title: 'Conversations',
    subtitle: 'Roleplay real scenes.',
    Icon: Icons.gameConversations,
    bg: Colors.primaryContainer,
    lip: Colors.redLip,
    fg: Colors.onPrimary,
    glyph: 'ಮ',
  },
  {
    id: 'opposites',
    title: 'Opposites',
    subtitle: 'Match contrasts.',
    Icon: Icons.gameOpposites,
    bg: Colors.secondaryContainer,
    lip: Colors.goldLip,
    fg: Colors.onSecondaryContainer,
    glyph: 'ವ',
  },
];

export default function PracticeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const completedLessons = useCompletedLessons();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(4)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, []);

  const completed = completedLessons.length;
  const hasUnlocked = completed > 0;

  const bannerText = !hasUnlocked
    ? 'Finish Lesson 1 to unlock your games.'
    : completed === 1
      ? 'Lesson 1 is ready to play with.'
      : `Lessons 1–${completed} are ready to play with.`;

  return (
    <Animated.View
      style={{
        flex: 1,
        backgroundColor: Colors.surface,
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <Watermark motif="rangoli" />

      {/* Header — "Practice" + line + hairline */}
      <View
        style={{
          paddingTop: insets.top + Spacing.sm,
          paddingBottom: Spacing.md,
          paddingHorizontal: Spacing.lg,
          borderBottomWidth: 1,
          borderBottomColor: Colors.hairline,
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.baloo.extrabold,
            fontSize: moderateScale(25),
            color: Colors.onSurface,
            letterSpacing: -0.4,
            lineHeight: moderateScale(38),
          }}
          maxFontSizeMultiplier={1.2}
        >
          Practice
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.medium,
            fontSize: moderateScale(13),
            color: Colors.tertiary,
            marginTop: moderateScale(1),
          }}
          maxFontSizeMultiplier={1.4}
        >
          Play with the phrases you&apos;ve met.
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: moderateScale(40) + insets.bottom }}
      >
        {/* Phrase-pool banner */}
        <View style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, marginBottom: Spacing.lg }}>
          <View
            style={{
              backgroundColor: Colors.surfaceContainerLowest,
              borderRadius: Radius.lg,
              padding: Spacing.md,
              flexDirection: 'row',
              alignItems: 'center',
              gap: Spacing.md,
              borderWidth: 1,
              borderColor: Colors.hairline,
            }}
          >
            <View
              style={{
                width: moderateScale(36),
                height: moderateScale(36),
                borderRadius: moderateScale(10),
                backgroundColor: Colors.surfaceContainerHigh,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icons.phrasePool size={moderateScale(18)} color={Colors.primary} />
            </View>
            <Text
              style={{
                flex: 1,
                fontFamily: Fonts.dmSans.medium,
                fontSize: moderateScale(12.5),
                lineHeight: moderateScale(17),
                color: Colors.tertiary,
              }}
              maxFontSizeMultiplier={1.4}
            >
              {bannerText}
            </Text>
          </View>
        </View>

        {/* Game grid — 2-up colour-coded cards with a lip */}
        <View
          style={{
            paddingHorizontal: Spacing.lg,
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            rowGap: moderateScale(11),
          }}
        >
          {GAMES.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              completed={completed}
              hasUnlocked={hasUnlocked}
              onPress={() => router.push(`/${game.id}`)}
            />
          ))}
        </View>

        {hasUnlocked ? (
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
            Each game draws only from phrases you&apos;ve already learned.
          </Text>
        ) : null}
      </ScrollView>
    </Animated.View>
  );
}

function GameCard({
  game,
  completed,
  hasUnlocked,
  onPress,
}: {
  game: GameDef;
  completed: number;
  hasUnlocked: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!hasUnlocked}
      accessibilityRole={hasUnlocked ? 'button' : 'text'}
      accessibilityLabel={
        hasUnlocked
          ? `${game.title} — ${game.subtitle}. ${completed} lesson${completed === 1 ? '' : 's'} loaded.`
          : `${game.title}, locked. Finish lesson 1 to unlock.`
      }
      style={({ pressed }) => ({
        width: '48%',
        minHeight: moderateScale(158),
        borderRadius: Radius.xl,
        backgroundColor: game.bg,
        borderBottomWidth: 5,
        borderBottomColor: game.lip,
        overflow: 'hidden',
        padding: moderateScale(16),
        justifyContent: 'flex-end',
        opacity: hasUnlocked ? 1 : 0.55,
        transform: [{ scale: pressed && hasUnlocked ? 0.98 : 1 }],
      })}
    >
      {/* Decorative glyph — fully visible, top-right */}
      <Text
        aria-hidden
        style={{
          position: 'absolute',
          top: moderateScale(8),
          right: moderateScale(12),
          fontFamily: Fonts.notoSansKannada.bold,
          fontSize: moderateScale(64),
          lineHeight: moderateScale(72),
          color: 'rgba(255,255,255,0.22)',
        }}
        maxFontSizeMultiplier={1}
      >
        {game.glyph}
      </Text>

      {!hasUnlocked ? (
        <View style={{ position: 'absolute', top: moderateScale(12), left: moderateScale(12) }}>
          <Icons.locked size={moderateScale(16)} color={game.fg} />
        </View>
      ) : null}

      <Text
        style={{
          fontFamily: Fonts.baloo.bold,
          fontSize: moderateScale(18),
          color: game.fg,
          letterSpacing: -0.2,
        }}
        maxFontSizeMultiplier={1.2}
        numberOfLines={1}
      >
        {game.title}
      </Text>
      <Text
        style={{
          fontFamily: Fonts.dmSans.medium,
          fontSize: moderateScale(12),
          color: game.fg,
          opacity: 0.84,
          marginTop: moderateScale(1),
        }}
        maxFontSizeMultiplier={1.3}
        numberOfLines={1}
      >
        {game.subtitle}
      </Text>
    </Pressable>
  );
}
