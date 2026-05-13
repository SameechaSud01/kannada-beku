import { useEffect, useRef } from 'react';
import { View, Text, ScrollView, Pressable, Animated, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { useProgressStore } from '../../stores/progressStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useCopy } from '../../hooks/useCopy';
import { ALL_LESSONS } from '../../constants/lessons/legacy';
import { useUserStore } from '../../stores/useUserStore';

function parseFirstName(raw: string): string {
  const segment = raw.split(/[\s_.\-]/)[0] || raw;
  return segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase();
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { streak, lessonProgress, completedLessons } = useProgressStore();
  const user = useAuthStore((s) => s.user);
  const copy = useCopy();
  const learningMode = useUserStore((s) => s.learningMode) ?? 'both';

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(4)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, []);

  const lessons = ALL_LESSONS;
  const currentLessonIndex = lessons.findIndex((l) => !completedLessons.includes(l.id));
  const activeLessonIdx = currentLessonIndex >= 0 ? currentLessonIndex : 0;
  const activeLesson = lessons[activeLessonIdx];
  const showScript = learningMode !== 'spoken';
  const showTransliteration = learningMode !== 'written';

  const rawName = user?.user_metadata?.full_name
    || user?.user_metadata?.name
    || user?.email?.split('@')[0]
    || 'there';
  const firstSegment = rawName.split(/[\s_.\-]+/)[0] || rawName;
  const userName = firstSegment.charAt(0).toUpperCase() + firstSegment.slice(1).toLowerCase();

  // Word of the day
  const wordOfDay = activeLesson.words[0];

  // Daily goal
  const dailyGoalTarget = 3;
  const dailyGoalDone = Math.min(completedLessons.length, dailyGoalTarget);
  const dailyGoalPercent = dailyGoalDone / dailyGoalTarget;
  const goalSize = 80;
  const goalStroke = 6;
  const goalR = (goalSize - goalStroke) / 2;
  const goalCirc = 2 * Math.PI * goalR;
  const goalOffset = goalCirc * (1 - dailyGoalPercent);

  // Practice scroll card width
  const cardW = screenWidth * 0.42;

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
              fontFamily: Fonts.dmSans.bold,
              fontSize: 11,
              letterSpacing: 2,
              color: '#464646',
              textTransform: 'uppercase',
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
              {/* Decorative blur circle (simulated) */}
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
                  fontSize: 48,
                  color: '#91001B',
                  lineHeight: 72,
                  paddingTop: 8,
                  marginBottom: 4,
                }}
              >
                {wordOfDay.kannadaScript.charAt(0)}
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.dmSans.bold,
                  fontSize: 16,
                  color: '#1B1D0E',
                  marginBottom: 2,
                }}
                numberOfLines={1}
              >
                {wordOfDay.transliteration.split(/[\s·]/)[0]}
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.lora.italic,
                  fontSize: 12,
                  color: '#464646',
                  marginBottom: 14,
                }}
                numberOfLines={1}
              >
                {wordOfDay.meaning}
              </Text>
              {/* Divider */}
              <View style={{ width: '100%', height: 1, backgroundColor: '#E5BDBB', opacity: 0.15, marginBottom: 16 }} />
              {/* Listen button */}
              <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
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
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 12 }}>
                  <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 13, color: '#1B1D0E', letterSpacing: 0.3 }}>
                    Daily Goal
                  </Text>
                  <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 13, color: '#785900' }}>
                    {Math.round(dailyGoalPercent * 100)}%
                  </Text>
                </View>
                {/* Progress ring */}
                <View style={{ width: goalSize, height: goalSize, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                  <Svg width={goalSize} height={goalSize} style={{ transform: [{ rotate: '-90deg' }] }}>
                    <Circle cx={goalSize / 2} cy={goalSize / 2} r={goalR} stroke="#E4E4CC" strokeWidth={goalStroke} fill="transparent" />
                    <Circle cx={goalSize / 2} cy={goalSize / 2} r={goalR} stroke="#FDC003" strokeWidth={goalStroke} fill="transparent" strokeDasharray={goalCirc} strokeDashoffset={goalOffset} strokeLinecap="round" />
                  </Svg>
                  {/* Medal icon center */}
                  <View style={{ position: 'absolute' }}>
                    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M12 15l-3.5 2 1-4L6 10l4-.5L12 6l2 3.5 4 .5-3.5 3 1 4z"
                        fill="#FDC003"
                        stroke="#785900"
                        strokeWidth={1}
                      />
                    </Svg>
                  </View>
                </View>
                <Text style={{ fontFamily: Fonts.dmSans.regular, fontSize: 11, color: '#464646', textAlign: 'center' }}>
                  {dailyGoalTarget - dailyGoalDone} more lessons{'\n'}to reach your streak!
                </Text>
              </View>

              {/* Next Lesson — gradient red button */}
              <Pressable
                onPress={() => router.push(`/lesson/${activeLesson.id}`)}
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
                <Text style={{ fontFamily: Fonts.dmSans.regular, fontSize: 12, color: '#FFFFFF', opacity: 0.8, marginBottom: 12 }}>
                  {activeLesson.title}
                </Text>
                <View style={{ alignSelf: 'flex-end' }}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Path d="M5 12h14M12 5l7 7-7 7" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
              </Pressable>
            </View>
          </View>
        </View>

        {/* ── CONTINUE PRACTICE — Horizontal carousel ── */}
        <View style={{ marginBottom: 40 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 24, marginBottom: 16 }}>
            <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 22, color: '#1B1D0E' }}>
              {copy('continuePractice')}
            </Text>
            <Pressable onPress={() => router.push('/(tabs)/practice')}>
              <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 12, letterSpacing: 1.5, color: '#91001B', textTransform: 'uppercase' }}>
                See All
              </Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 14 }}
          >
            {/* Card 1: Alphabet Trace */}
            <Pressable
              onPress={() => router.push('/(tabs)/practice')}
              style={({ pressed }) => ({
                width: cardW,
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
                  <Path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke="#6C5000" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
              <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 14, color: '#1B1D0E', marginBottom: 4 }}>
                Alphabet Trace
              </Text>
              <Text style={{ fontFamily: Fonts.dmSans.regular, fontSize: 12, color: '#464646' }}>
                12 Characters
              </Text>
            </Pressable>

            {/* Card 2: Common Phrases */}
            <Pressable
              onPress={() => router.push('/(tabs)/practice')}
              style={({ pressed }) => ({
                width: cardW,
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
                  backgroundColor: '#FFDAD8',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 14,
                }}
              >
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                  <Path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0 0 14.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" fill="#91001B" />
                </Svg>
              </View>
              <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 14, color: '#1B1D0E', marginBottom: 4 }}>
                Common Phrases
              </Text>
              <Text style={{ fontFamily: Fonts.dmSans.regular, fontSize: 12, color: '#464646' }}>
                Greetings & Food
              </Text>
            </Pressable>

            {/* Card 3: Sentence Build */}
            <Pressable
              onPress={() => router.push('/(tabs)/practice')}
              style={({ pressed }) => ({
                width: cardW,
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
                  backgroundColor: '#E4E4CC',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 14,
                }}
              >
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M20.5 11H19V7a2 2 0 0 0-2-2h-4V3.5a2.5 2.5 0 0 0-5 0V5H4a2 2 0 0 0-2 2v3.8h1.5a2.5 2.5 0 0 1 0 5H2V20a2 2 0 0 0 2 2h3.8v-1.5a2.5 2.5 0 0 1 5 0V22H17a2 2 0 0 0 2-2v-4h1.5a2.5 2.5 0 0 0 0-5z"
                    stroke="#5C3F3F"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
              <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 14, color: '#1B1D0E', marginBottom: 4 }}>
                Sentence Build
              </Text>
              <Text style={{ fontFamily: Fonts.dmSans.regular, fontSize: 12, color: '#464646' }}>
                Game Mode
              </Text>
            </Pressable>
          </ScrollView>
        </View>

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
            {/* Gradient overlay simulation — dark at bottom */}
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
            {/* Decorative warm tones to simulate temple photo */}
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
            {/* Text overlay */}
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
