import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/spacing';
import { Fonts } from '@/constants/fonts';
import { isGameKey, type GameKey } from '@/constants/games';
import OppositeGame from '@/src/games/opposites';
import DictationGame from '@/src/games/dictation';
import QuickQuizGame from '@/src/games/quickquiz';
import ConversationGame from '@/src/games/conversations';

export default function GameRunnerScreen() {
  const router = useRouter();
  const {
    game: gameParam,
    n: nParam,
    part,
  } = useLocalSearchParams<{
    game: string;
    n: string;
    part?: string;
  }>();

  // Image Match was retired (DB tables dropped; code removed). Old deep links
  // and bookmarks may still target it, so answer with a clear retired-game
  // message rather than the generic not-found.
  if (gameParam === 'image-match') {
    return (
      <NotFound
        title="No longer available"
        message="Image Match has been retired. Try another game."
        onBack={() => router.replace('/practice')}
      />
    );
  }
  if (!gameParam || !isGameKey(gameParam)) {
    return <NotFound onBack={() => router.replace('/practice')} />;
  }

  const lessonNo = Number.parseInt(String(nParam ?? ''), 10);
  if (!Number.isFinite(lessonNo) || lessonNo < 1 || lessonNo > 8) {
    return <NotFound onBack={() => router.replace(`/${gameParam}`)} />;
  }

  switch (gameParam as GameKey) {
    case 'opposites':
      return <OppositeGame lessonNo={lessonNo} section={part} />;
    case 'dictation':
      return <DictationGame lessonNo={lessonNo} section={part} />;
    case 'quiz':
      return <QuickQuizGame lessonNo={lessonNo} section={part} />;
    case 'conversations':
      return <ConversationGame lessonNo={lessonNo} section={part} />;
  }
}

function NotFound({
  onBack,
  title = 'Game not found',
  message,
}: {
  onBack: () => void;
  title?: string;
  message?: string;
}) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }} edges={['top', 'bottom']}>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: Spacing.xxl,
          gap: Spacing.md,
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(18),
            color: Colors.onSurface,
            textAlign: 'center',
          }}
        >
          {title}
        </Text>
        {message ? (
          <Text
            style={{
              fontFamily: Fonts.dmSans.medium,
              fontSize: moderateScale(14),
              color: Colors.tertiary,
              textAlign: 'center',
            }}
          >
            {message}
          </Text>
        ) : null}
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back to Practice"
          style={({ pressed }) => ({
            backgroundColor: Colors.primary,
            borderRadius: Radius.lg,
            paddingVertical: Spacing.md,
            paddingHorizontal: Spacing.xl,
            transform: [{ scale: pressed ? 0.97 : 1 }],
          })}
        >
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: moderateScale(14),
              color: Colors.onPrimary,
            }}
          >
            Back to Practice
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
