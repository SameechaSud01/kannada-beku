import { useEffect, useRef } from 'react';
import { View, Text, ScrollView, Pressable, Animated, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { useAuthStore } from '../../stores/useAuthStore';
import { useCopy } from '../../hooks/useCopy';
import { LESSONS, LESSON_ORDER } from '../../constants/lessons';
import type { Phrase } from '../../constants/lessons/types';
import { deviceTtsAudioService } from '../../services/audio/deviceTtsAudioService';
import { formatFirstName } from '../../utils/formatName';
import { useCompletedLessons, useDailyGoalToday } from '../../hooks/progress';

const STARTER_PHRASE: Phrase = {
  id: 'starter.namaskara',
  kannada: 'ನಮಸ್ಕಾರ',
  transliteration: 'Namaskara',
  english: 'Hello / Greetings',
  vocabAtoms: ['ನಮಸ್ಕಾರ'],
};

function speakable(text: string): string {
  return text.replace(/\[name\]/g, '').trim();
}

function wordOfDayIndex(arrayLength: number): number {
  if (arrayLength <= 0) return 0;
  const dateStr = new Date().toISOString().split('T')[0];
  let sum = 0;
  for (let i = 0; i < dateStr.length; i++) sum += dateStr.charCodeAt(i);
  return sum % arrayLength;
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const completedLessons = useCompletedLessons();
  const dailyGoal = useDailyGoalToday();
  const user = useAuthStore((s) => s.user);
  const copy = useCopy();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(4)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, []);

  const rawName = user?.user_metadata?.full_name
    || user?.user_metadata?.name
    || user?.email?.split('@')[0]
    || 'there';
  const userName = formatFirstName(rawName, 'there');

  const nextLessonId = LESSON_ORDER.find((id) => !completedLessons.includes(id));
  const nextLesson = nextLessonId ? LESSONS[nextLessonId] : null;
  const allLessonsComplete = !nextLessonId;

  const completedPhrases: Phrase[] = completedLessons
    .map((id) => LESSONS[id])
    .filter((l): l is NonNullable<typeof l> => Boolean(l))
    .flatMap((l) => l.intake);
  const hasCompletedPhrases = completedPhrases.length > 0;
  const wordOfDay: Phrase = hasCompletedPhrases
    ? completedPhrases[wordOfDayIndex(completedPhrases.length)]
    : STARTER_PHRASE;
  const wordOfDayKannadaForDisplay = speakable(wordOfDay.kannada) || wordOfDay.kannada;
  const wordOfDayKannadaForTts = speakable(wordOfDay.kannada);

  const reviewableLessons = completedLessons
    .map((id) => LESSONS[id])
    .filter((l): l is NonNullable<typeof l> => Boolean(l));
  const hasReviewable = reviewableLessons.length > 0;

  const goalPercent = dailyGoal.target > 0
    ? Math.min(dailyGoal.completed / dailyGoal.target, 1)
    : 0;
  const goalDone = goalPercent >= 1;
  const goalSize = 80;
  const goalStroke = 6;
  const goalR = (goalSize - goalStroke) / 2;
  const goalCirc = 2 * Math.PI * goalR;
  const goalOffset = goalCirc * (1 - goalPercent);
  const showDailyDone = goalDone || allLessonsComplete;

  const reviewCardW = screenWidth * 0.55;

  const handleStartNext = () => {
    if (nextLessonId) router.push(`/lesson/${nextLessonId}`);
  };

  const handleListenWordOfDay = () => {
    if (!wordOfDayKannadaForTts) return;
    deviceTtsAudioService
      .play(wordOfDayKannadaForTts)
      .catch((err) => console.warn('[audio] home word-of-day failed', err));
  };

  return (
    <Animated.View
      style={{
        flex: 1,
        backgroundColor: '#FBFBE2',
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      {/* ── GLASS HEADER ── */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingBottom: 12,
          paddingHorizontal: 24,
          backgroundColor: 'rgba(251,251,226,0.85)',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottomWidth: 0,
        }}
      >
        {/* Hamburger + Title */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Pressable>
            <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
              <Path d="M3 6h18M3 12h18M3 18h18" stroke="#91001B" strokeWidth={2.2} strokeLinecap="round" />
            </Svg>
          </Pressable>
          <Text
            style={{
              fontFamily: Fonts.notoSerifKannada.bold,
              fontSize: 22,
              color: '#91001B',
              letterSpacing: -0.3,
              lineHeight: 36,
              paddingTop: 4,
            }}
          >
            ಕನ್ನಡ ಬಾ
          </Text>
        </View>

        {/* Profile avatar */}
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: Colors.primaryContainer,
            borderWidth: 2,
            borderColor: 'rgba(145,0,27,0.15)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 15, color: '#FFFFFF' }}>
            {userName[0]?.toUpperCase()}
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ paddingHorizontal: 24, paddingTop: 20 }}>
          {/* ── WELCOME SECTION ── */}
          <Text
            style={{
              fontFamily: Fonts.dmSans.medium,
              fontSize: 13,
              letterSpacing: 0.2,
              color: '#464646',
              marginBottom: 6,
            }}
          >
            Namaskara, {userName}
          </Text>
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: 36,
              color: '#1B1D0E',
              lineHeight: 42,
              marginBottom: 28,
            }}
          >
            {copy('homeGreeting').split('Kannada')[0]}
            <Text style={{ color: '#91001B', fontStyle: 'italic' }}>
              Kannada{copy('homeGreeting').split('Kannada')[1] || '?'}
            </Text>
          </Text>
        </View>

        {/* ── BENTO GRID ── */}
        <View style={{ paddingHorizontal: 24, marginBottom: 40 }}>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            {/* LEFT — Word of the Day */}
            <View
              style={{
                flex: 1,
                backgroundColor: '#FFFFFF',
                borderRadius: 32,
                paddingVertical: 24,
                paddingHorizontal: 16,
                alignItems: 'center',
                shadowColor: '#1B1D0E',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.06,
                shadowRadius: 32,
                elevation: 4,
              }}
            >
              {/* Decorative blur circle */}
              <View
                style={{
                  position: 'absolute',
                  top: -20,
                  right: -20,
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: 'rgba(253,192,3,0.12)',
                }}
              />
              <Text
                style={{
                  fontFamily: Fonts.dmSans.bold,
                  fontSize: 9,
                  letterSpacing: 2,
                  color: '#464646',
                  textTransform: 'uppercase',
                  marginBottom: 16,
                }}
              >
                Word of the Day
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.notoSerifKannada.bold,
                  fontSize: 28,
                  color: '#91001B',
                  lineHeight: 44,
                  paddingTop: 4,
                  textAlign: 'center',
                  marginBottom: 6,
                }}
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                {wordOfDayKannadaForDisplay}
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.dmSans.bold,
                  fontSize: 14,
                  color: '#1B1D0E',
                  textAlign: 'center',
                  marginBottom: 4,
                }}
                numberOfLines={1}
              >
                {wordOfDay.transliteration}
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.lora.italic,
                  fontSize: 12,
                  color: '#464646',
                  textAlign: 'center',
                  marginBottom: 14,
                }}
                numberOfLines={1}
              >
                {wordOfDay.english}
              </Text>
              {/* Divider */}
              <View style={{ width: '100%', height: 1, backgroundColor: '#E5BDBB', opacity: 0.15, marginBottom: 16 }} />
              {/* Listen button */}
              <Pressable
                onPress={handleListenWordOfDay}
                accessibilityRole="button"
                accessibilityLabel="Listen to the phrase"
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, paddingHorizontal: 8 }}
              >
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"
                    stroke="#785900"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                <Text
                  style={{
                    fontFamily: Fonts.dmSans.bold,
                    fontSize: 10,
                    letterSpacing: 1.8,
                    color: '#785900',
                    textTransform: 'uppercase',
                  }}
                >
                  Listen
                </Text>
              </Pressable>
              {!hasCompletedPhrases && (
                <Pressable
                  onPress={handleStartNext}
                  accessibilityRole="link"
                  accessibilityLabel="Try your first lesson"
                  style={{ marginTop: 6, paddingVertical: 6, paddingHorizontal: 8, minHeight: 32, alignItems: 'center' }}
                >
                  <Text
                    style={{
                      fontFamily: Fonts.dmSans.medium,
                      fontSize: 11,
                      color: '#91001B',
                      textAlign: 'center',
                    }}
                  >
                    Try your first lesson →
                  </Text>
                </Pressable>
              )}
            </View>

            {/* RIGHT COLUMN — Goal + Next Lesson */}
            <View style={{ flex: 1, gap: 16 }}>
              {/* Daily Goal */}
              <View
                style={{
                  backgroundColor: '#F5F5DC',
                  borderRadius: 32,
                  padding: 20,
                  alignItems: 'center',
                }}
              >
                <View style={{ width: '100%', marginBottom: 12 }}>
                  <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 13, color: '#1B1D0E', letterSpacing: 0.3 }}>
                    Daily Goal
                  </Text>
                </View>
                {/* Progress ring */}
                <View style={{ width: goalSize, height: goalSize, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                  <Svg width={goalSize} height={goalSize} style={{ transform: [{ rotate: '-90deg' }] }}>
                    <Circle cx={goalSize / 2} cy={goalSize / 2} r={goalR} stroke="#E4E4CC" strokeWidth={goalStroke} fill="transparent" />
                    <Circle cx={goalSize / 2} cy={goalSize / 2} r={goalR} stroke="#FDC003" strokeWidth={goalStroke} fill="transparent" strokeDasharray={goalCirc} strokeDashoffset={goalOffset} strokeLinecap="round" />
                  </Svg>
                  <Text style={{ position: 'absolute', fontFamily: Fonts.dmSans.bold, fontSize: 17, color: '#785900' }}>
                    {Math.round(goalPercent * 100)}%
                  </Text>
                </View>
                {showDailyDone ? (
                  <Text style={{ fontFamily: Fonts.dmSans.medium, fontSize: 11, color: '#464646', textAlign: 'center' }}>
                    Done for today 🎉
                  </Text>
                ) : (
                  <Pressable
                    onPress={handleStartNext}
                    accessibilityRole="link"
                    accessibilityLabel="Start today's lesson"
                    style={{ paddingVertical: 4, paddingHorizontal: 4, minHeight: 32, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text style={{ fontFamily: Fonts.dmSans.medium, fontSize: 11, color: '#91001B', textAlign: 'center' }}>
                      Start today's lesson →
                    </Text>
                  </Pressable>
                )}
              </View>

              {/* Next Lesson — gradient red button or "all complete" message */}
              {nextLesson ? (
                <Pressable
                  onPress={handleStartNext}
                  style={({ pressed }) => ({
                    backgroundColor: pressed ? '#8D0020' : '#91001B',
                    borderRadius: 32,
                    padding: 20,
                    transform: [{ scale: pressed ? 0.96 : 1 }],
                    shadowColor: '#91001B',
                    shadowOffset: { width: 0, height: 12 },
                    shadowOpacity: 0.3,
                    shadowRadius: 20,
                    elevation: 8,
                  })}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 14,
                    }}
                  >
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                      <Path d="M8 5v14l11-7L8 5z" fill="#FFFFFF" />
                    </Svg>
                  </View>
                  <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 18, color: '#FFFFFF', marginBottom: 4 }}>
                    {copy('nextLesson')}
                  </Text>
                  <Text style={{ fontFamily: Fonts.dmSans.regular, fontSize: 12, color: '#FFFFFF', opacity: 0.85, marginBottom: 12 }} numberOfLines={2}>
                    {nextLesson.situation.title}
                  </Text>
                  <View style={{ alignSelf: 'flex-end' }}>
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                      <Path d="M5 12h14M12 5l7 7-7 7" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  </View>
                </Pressable>
              ) : (
                <View
                  style={{
                    backgroundColor: '#F5F5DC',
                    borderRadius: 32,
                    padding: 20,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: Fonts.dmSans.bold,
                      fontSize: 9,
                      letterSpacing: 2,
                      color: '#785900',
                      textTransform: 'uppercase',
                      marginBottom: 8,
                    }}
                  >
                    All Caught Up
                  </Text>
                  <Text style={{ fontFamily: Fonts.dmSans.medium, fontSize: 13, color: '#1B1D0E', lineHeight: 18 }}>
                    You've completed every lesson! More coming soon.
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* ── CONTINUE PRACTICE — review queue ── */}
        {/* TODO: Replace with SRS due-queue when SRS lands */}
        {hasReviewable && (
          <View style={{ marginBottom: 40 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 24, marginBottom: 16 }}>
              <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 22, color: '#1B1D0E' }}>
                {copy('continuePractice')}
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24, gap: 14 }}
            >
              {reviewableLessons.map((lesson) => (
                <Pressable
                  key={lesson.id}
                  onPress={() => router.push(`/lesson/${lesson.id}`)}
                  accessibilityRole="button"
                  accessibilityLabel={`Review: ${lesson.situation.title}`}
                  style={({ pressed }) => ({
                    width: reviewCardW,
                    backgroundColor: '#EAEAD1',
                    borderRadius: 24,
                    padding: 20,
                    transform: [{ scale: pressed ? 0.96 : 1 }],
                  })}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 16,
                      backgroundColor: '#FDC003',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 14,
                    }}
                  >
                    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"
                        stroke="#6C5000"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  </View>
                  <Text
                    style={{
                      fontFamily: Fonts.dmSans.bold,
                      fontSize: 10,
                      letterSpacing: 1.6,
                      color: '#785900',
                      textTransform: 'uppercase',
                      marginBottom: 4,
                    }}
                  >
                    Review
                  </Text>
                  <Text
                    style={{ fontFamily: Fonts.dmSans.bold, fontSize: 14, color: '#1B1D0E' }}
                    numberOfLines={2}
                  >
                    {lesson.situation.title}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── KARNATAKA HERITAGE — Full-width photo card ── */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <View
            style={{
              height: 200,
              borderRadius: 40,
              overflow: 'hidden',
              backgroundColor: '#5C1A1A',
            }}
          >
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 120,
                backgroundColor: 'transparent',
              }}
            />
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: '#7A2020',
                opacity: 0.6,
              }}
            />
            <View
              style={{
                position: 'absolute',
                top: 20,
                right: 30,
                width: 100,
                height: 140,
                borderRadius: 8,
                backgroundColor: '#A04030',
                opacity: 0.4,
              }}
            />
            <View
              style={{
                position: 'absolute',
                top: 30,
                left: 40,
                width: 60,
                height: 120,
                borderRadius: 6,
                backgroundColor: '#8B3025',
                opacity: 0.3,
              }}
            />
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: 28,
              }}
            >
              <Text
                style={{
                  fontFamily: Fonts.dmSans.bold,
                  fontSize: 9,
                  letterSpacing: 3,
                  color: '#FFFFFF',
                  opacity: 0.7,
                  textTransform: 'uppercase',
                  marginBottom: 6,
                }}
              >
                Karnataka Heritage
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.dmSans.bold,
                  fontSize: 20,
                  color: '#FFFFFF',
                }}
              >
                The Stones of Hampi
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  );
}
