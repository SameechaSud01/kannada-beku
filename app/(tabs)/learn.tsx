import { useEffect, useRef } from 'react';
import { View, Text, ScrollView, Pressable, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { useProgressStore } from '../../stores/progressStore';
import lessonsData from '../../data/lessons.json';
import { deviceTtsAudioService } from '../../services/audio/deviceTtsAudioService';

export default function LearnScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { lessonProgress, completedLessons } = useProgressStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(4)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, []);

  const lessons = lessonsData.lessons;
  const totalLessons = lessons.length;
  const completedCount = completedLessons.length;

  // Current active lesson
  const currentIdx = lessons.findIndex((l) => !completedLessons.includes(l.id));
  const activeIdx = currentIdx >= 0 ? currentIdx : 0;
  const activeLesson = lessons[activeIdx];
  const activeChar = activeLesson.thumbnailChar;
  const activePhrase = activeLesson.phrases[0];

  // Progress ring
  const ringSize = 56;
  const ringStroke = 5;
  const ringR = (ringSize - ringStroke) / 2;
  const ringCirc = 2 * Math.PI * ringR;
  const ringProgress = totalLessons > 0 ? completedCount / totalLessons : 0;
  const ringOffset = ringCirc * (1 - ringProgress);

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
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
            <Path d="M3 6h18M3 12h18M3 18h18" stroke="#91001B" strokeWidth={2.2} strokeLinecap="round" />
          </Svg>
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
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#FFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx={12} cy={7} r={4} stroke="#FFF" strokeWidth={2} />
          </Svg>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* ── MODULE HEADER with progress ring ── */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            paddingHorizontal: 24,
            paddingTop: 20,
            marginBottom: 32,
          }}
        >
          <View>
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: 11,
                letterSpacing: 3,
                color: '#464646',
                textTransform: 'uppercase',
                marginBottom: 4,
              }}
            >
              Module {String(activeIdx + 1).padStart(2, '0')}
            </Text>
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: 28,
                color: '#1B1D0E',
                letterSpacing: -0.5,
              }}
            >
              {activeLesson.title}
            </Text>
          </View>
          {/* Progress mandala */}
          <View style={{ width: ringSize, height: ringSize, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={ringSize} height={ringSize} style={{ transform: [{ rotate: '-90deg' }] }}>
              <Circle cx={ringSize / 2} cy={ringSize / 2} r={ringR} stroke="#EAEAD1" strokeWidth={4} fill="transparent" />
              <Circle cx={ringSize / 2} cy={ringSize / 2} r={ringR} stroke="#785900" strokeWidth={5} fill="transparent" strokeDasharray={ringCirc} strokeDashoffset={ringOffset} strokeLinecap="round" />
            </Svg>
            <Text
              style={{
                position: 'absolute',
                fontFamily: Fonts.dmSans.bold,
                fontSize: 13,
                color: '#785900',
              }}
            >
              {completedCount}/{totalLessons}
            </Text>
          </View>
        </View>

        {/* ── CHARACTER DISPLAY CARD (The Living Manuscript) ── */}
        <View style={{ paddingHorizontal: 24, marginBottom: 32 }}>
          {/* Decorative blur */}
          <View
            style={{
              position: 'absolute',
              top: -16,
              right: 8,
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: 'rgba(253,192,3,0.08)',
            }}
          />
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 40,
              paddingTop: 0,
              paddingBottom: 36,
              paddingHorizontal: 32,
              alignItems: 'center',
              shadowColor: '#1B1D0E',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.04,
              shadowRadius: 32,
              elevation: 3,
              overflow: 'hidden',
            }}
          >
            {/* Top gradient bar */}
            <View
              style={{
                width: '110%',
                height: 3,
                flexDirection: 'row',
                marginBottom: 24,
              }}
            >
              <View style={{ flex: 1, backgroundColor: '#91001B' }} />
              <View style={{ flex: 1, backgroundColor: '#BE0027' }} />
              <View style={{ flex: 1, backgroundColor: '#FDC003' }} />
            </View>

            {/* Vowel sound label */}
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: 10,
                letterSpacing: 2.5,
                color: 'rgba(145,0,27,0.5)',
                textTransform: 'uppercase',
                marginBottom: 20,
              }}
            >
              Sound: "{activePhrase.roman.split(/[\s·]/)[0]}"
            </Text>

            {/* Main character display */}
            <View style={{ marginBottom: 28, position: 'relative' }}>
              <Text
                style={{
                  fontFamily: Fonts.notoSerifKannada.bold,
                  fontSize: 160,
                  color: '#91001B',
                  lineHeight: 240,
                  paddingTop: 20,
                  textAlign: 'center',
                }}
              >
                {activeChar}
              </Text>
              {/* Stroke guide indicator 1 */}
              <View
                style={{
                  position: 'absolute',
                  top: 10,
                  left: '50%',
                  marginLeft: -14,
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: '#FDC003',
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 13, color: '#FFFFFF' }}>1</Text>
              </View>
              {/* Stroke guide indicator 2 */}
              <View
                style={{
                  position: 'absolute',
                  bottom: 30,
                  right: 0,
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: '#E4E4CC',
                  borderWidth: 1,
                  borderColor: 'rgba(120,89,0,0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 13, color: '#785900' }}>2</Text>
              </View>
            </View>

            {/* Action buttons */}
            <View style={{ flexDirection: 'row', gap: 14, width: '100%' }}>
              {/* Pronounce button */}
              <Pressable
                onPress={() => {
                  deviceTtsAudioService
                    .play(activeChar)
                    .catch((err) => console.warn('[audio] learn-tab pronounce failed', err));
                }}
                style={({ pressed }) => ({
                  flex: 1,
                  backgroundColor: pressed ? '#8D0020' : '#91001B',
                  borderRadius: 16,
                  paddingVertical: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  shadowColor: 'rgba(145,0,27,0.2)',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 1,
                  shadowRadius: 16,
                  elevation: 4,
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                })}
              >
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path d="M11 5L6 9H2v6h4l5 4V5z" fill="#FFFFFF" />
                  <Path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 15, color: '#FFFFFF' }}>
                  Pronounce
                </Text>
              </Pressable>

              {/* Replay button */}
              <Pressable
                onPress={() => {
                  deviceTtsAudioService
                    .play(activeChar)
                    .catch((err) => console.warn('[audio] learn-tab replay failed', err));
                }}
                style={({ pressed }) => ({
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  backgroundColor: '#FDC003',
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: 'rgba(120,89,0,0.1)',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 1,
                  shadowRadius: 16,
                  elevation: 3,
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                })}
              >
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                  <Path d="M1 4v6h6M23 20v-6h-6" stroke="#6C5000" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                  <Path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="#6C5000" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </Pressable>
            </View>
          </View>
        </View>

        {/* ── DECORATIVE DIVIDER ── */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, marginBottom: 28 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(229,189,187,0.25)' }} />
          <View style={{ paddingHorizontal: 14 }}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path
                d="M3 21h18M3 7v1a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4V7M6 21V12M18 21V12M6 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"
                stroke="#E5BDBB"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
          <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(229,189,187,0.25)' }} />
        </View>

        {/* ── WRITING TIP CARD ── */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <View
            style={{
              backgroundColor: '#F5F5DC',
              borderRadius: 24,
              padding: 28,
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: 18,
                color: '#1B1D0E',
                marginBottom: 12,
              }}
            >
              Writing Tip
            </Text>
            <Text
              style={{
                fontFamily: Fonts.dmSans.regular,
                fontSize: 14,
                color: '#464646',
                lineHeight: 22,
                marginBottom: 20,
              }}
            >
              Start from the center circle and move outwards in a clockwise motion. The top stroke is added last, representing the head of the character.
            </Text>

            {/* Syllable + Example boxes */}
            <View style={{ flexDirection: 'row', gap: 14 }}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: '#E4E4CC',
                  borderRadius: 20,
                  padding: 16,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: Fonts.dmSans.bold,
                    fontSize: 9,
                    letterSpacing: 1.5,
                    color: '#464646',
                    textTransform: 'uppercase',
                    marginBottom: 8,
                  }}
                >
                  Syllable
                </Text>
                <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 24, color: '#91001B' }}>
                  {activePhrase.roman.split(/[\s·]/)[0]}
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  backgroundColor: '#E4E4CC',
                  borderRadius: 20,
                  padding: 16,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: Fonts.dmSans.bold,
                    fontSize: 9,
                    letterSpacing: 1.5,
                    color: '#464646',
                    textTransform: 'uppercase',
                    marginBottom: 8,
                  }}
                >
                  Example
                </Text>
                <Text style={{ fontFamily: Fonts.notoSerifKannada.bold, fontSize: 24, color: '#91001B', lineHeight: 38, paddingTop: 4 }}>
                  {activePhrase.script.split(/\s/)[0]}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── READY TO PRACTICE CARD (Gold bordered) ── */}
        <View style={{ paddingHorizontal: 24, marginBottom: 32 }}>
          <View
            style={{
              borderRadius: 32,
              padding: 3,
              backgroundColor: '#FDC003',
              shadowColor: 'rgba(120,89,0,0.15)',
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 1,
              shadowRadius: 24,
              elevation: 6,
            }}
          >
            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 30,
                padding: 20,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: 'rgba(253,192,3,0.15)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 14,
                }}
              >
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                  <Path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke="#785900" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 15, color: '#1B1D0E' }}>
                  Ready to Practice?
                </Text>
                <Text style={{ fontFamily: Fonts.dmSans.regular, fontSize: 13, color: '#464646' }}>
                  Draw '{activeChar}' on the screen
                </Text>
              </View>
              <Pressable
                onPress={() => router.push(`/lesson/${activeLesson.id}`)}
                style={({ pressed }) => ({
                  backgroundColor: pressed ? '#303221' : '#1B1D0E',
                  borderRadius: 14,
                  paddingVertical: 12,
                  paddingHorizontal: 22,
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                })}
              >
                <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 14, color: '#FBFBE2' }}>
                  Start
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* ── ALL LESSONS LIST ── */}
        <View style={{ paddingHorizontal: 24 }}>
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: 11,
              letterSpacing: 2.5,
              color: '#464646',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            All Lessons
          </Text>

          {lessons.map((lesson, index) => {
            const isCompleted = completedLessons.includes(lesson.id);
            const isActive = index === activeIdx;
            const isLocked = index > activeIdx && !isCompleted;
            const progress = isCompleted
              ? 1
              : (lessonProgress[lesson.id] ?? 0) / lesson.totalPhrases;

            return (
              <Pressable
                key={lesson.id}
                onPress={() => router.push(`/lesson/${lesson.id}`)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: isActive ? '#FFFFFF' : '#EFEFD7',
                  borderWidth: isActive ? 1.5 : 0,
                  borderColor: isActive ? '#91001B' : 'transparent',
                  borderRadius: 20,
                  padding: 16,
                  marginBottom: 10,
                  opacity: isLocked ? 0.5 : 1,
                  shadowColor: isActive ? '#1B1D0E' : 'transparent',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: isActive ? 0.06 : 0,
                  shadowRadius: 12,
                  elevation: isActive ? 2 : 0,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                })}
              >
                {/* Status icon */}
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: isCompleted
                      ? '#FDC003'
                      : isActive
                      ? '#FFDAD8'
                      : '#E4E4CC',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 14,
                  }}
                >
                  {isCompleted ? (
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                      <Path d="M5 12l5 5L20 7" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  ) : isLocked ? (
                    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                      <Path d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4" stroke="#5C3F3F" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  ) : (
                    <Text
                      style={{
                        fontFamily: Fonts.notoSerifKannada.bold,
                        fontSize: 18,
                        color: '#91001B',
                        lineHeight: 30,
                        paddingTop: 2,
                      }}
                    >
                      {lesson.thumbnailChar}
                    </Text>
                  )}
                </View>

                {/* Info */}
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: Fonts.dmSans.bold,
                      fontSize: 14,
                      color: isLocked ? '#9C8E7A' : '#1B1D0E',
                      marginBottom: 3,
                    }}
                  >
                    {lesson.title}
                  </Text>
                  <Text
                    style={{
                      fontFamily: Fonts.dmSans.regular,
                      fontSize: 12,
                      color: '#464646',
                    }}
                  >
                    {isCompleted
                      ? 'Completed'
                      : isLocked
                      ? 'Locked'
                      : `${lesson.totalPhrases} phrases · ${lesson.estimatedMinutes} min`}
                  </Text>
                  {/* Progress bar for active lesson */}
                  {isActive && progress > 0 && (
                    <View
                      style={{
                        height: 3,
                        backgroundColor: '#E0DDD0',
                        borderRadius: 2,
                        marginTop: 8,
                        overflow: 'hidden',
                      }}
                    >
                      <View
                        style={{
                          width: `${Math.round(progress * 100)}%`,
                          height: '100%',
                          backgroundColor: '#FFC107',
                          borderRadius: 2,
                        }}
                      />
                    </View>
                  )}
                </View>

                {/* Arrow for active */}
                {isActive && !isCompleted && (
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ marginLeft: 8 }}>
                    <Path d="M5 12h14M12 5l7 7-7 7" stroke="#91001B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                )}
              </Pressable>
            );
          })}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </Animated.View>
  );
}
