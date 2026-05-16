import { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { Fonts } from '../../constants/fonts';
import { useProgressStore } from '../../stores/progressStore';
import lessonsData from '../../data/lessons.json';

// Static match pairs data (English ↔ Kannada)
const MATCH_DATA = [
  { id: 'w1', english: 'Water', kannada: 'ನೀರು', roman: 'Nīru' },
  { id: 'w2', english: 'House', kannada: 'ಮನೆ', roman: 'Mane' },
  { id: 'w3', english: 'Tree', kannada: 'ಮರ', roman: 'Mara' },
  { id: 'w4', english: 'Friend', kannada: 'ಸ್ನೇಹಿತ', roman: 'Snēhita' },
];

export default function PracticeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { completedLessons } = useProgressStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(4)).current;

  // Match game state
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const [shaking, setShaking] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const allMatched = matched.size === MATCH_DATA.length;

  // Shuffle right column deterministically
  const shuffledRight = [...MATCH_DATA].sort((a, b) => a.kannada.localeCompare(b.kannada));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (allMatched) return;
    const handle = setInterval(() => setElapsedSec((s) => s + 1), 1000);
    return () => clearInterval(handle);
  }, [allMatched]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleReset = () => {
    setMatched(new Set());
    setSelectedLeft(null);
    setSelectedRight(null);
    setElapsedSec(0);
  };

  // Daily goal
  const goalTarget = 20;
  const goalDone = Math.min(completedLessons.length * 5, goalTarget);
  const goalPercent = Math.round((goalDone / goalTarget) * 100);

  // Goal ring
  const mSize = 56;
  const mStroke = 5;
  const mR = (mSize - mStroke) / 2;
  const mCirc = 2 * Math.PI * mR;
  const mOffset = mCirc * (1 - goalDone / goalTarget);

  const doShake = () => {
    setShaking(true);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start(() => setShaking(false));
  };

  const handleLeftTap = (id: string) => {
    if (matched.has(id)) return;
    setSelectedLeft(id);
    if (selectedRight) {
      if (selectedRight === id) {
        setMatched((prev) => new Set([...prev, id]));
      } else {
        doShake();
      }
      setTimeout(() => { setSelectedLeft(null); setSelectedRight(null); }, 400);
    }
  };

  const handleRightTap = (id: string) => {
    if (matched.has(id)) return;
    setSelectedRight(id);
    if (selectedLeft) {
      if (selectedLeft === id) {
        setMatched((prev) => new Set([...prev, id]));
      } else {
        doShake();
      }
      setTimeout(() => { setSelectedLeft(null); setSelectedRight(null); }, 400);
    }
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
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Pressable
            onPress={() => router.push('/profile')}
            accessibilityRole="button"
            accessibilityLabel="Open profile and settings"
            hitSlop={8}
          >
            <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
              <Path d="M3 6h18M3 12h18M3 18h18" stroke="#91001B" strokeWidth={2.2} strokeLinecap="round" />
            </Svg>
          </Pressable>
          <Text style={{ fontFamily: Fonts.notoSerifKannada.bold, fontSize: 22, color: '#91001B', letterSpacing: -0.3, lineHeight: 36, paddingTop: 4 }}>
            ಕನ್ನಡ ಬಾ
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/profile')}
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          style={({ pressed }) => ({
            width: 40, height: 40, borderRadius: 20,
            backgroundColor: '#E4E4CC', borderWidth: 2, borderColor: 'rgba(145,0,27,0.15)',
            alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
            transform: [{ scale: pressed ? 0.94 : 1 }],
          })}
        >
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#5C3F3F" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx={12} cy={7} r={4} stroke="#5C3F3F" strokeWidth={2} />
          </Svg>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── HEADER WITH PROGRESS MANDALA ── */}
        <View
          style={{
            marginHorizontal: 24,
            marginTop: 20,
            marginBottom: 36,
            backgroundColor: '#F5F5DC',
            borderRadius: 24,
            padding: 24,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 28, color: '#1B1D0E', letterSpacing: -0.5, marginBottom: 4 }}>
              Practice Daily
            </Text>
            <Text style={{ fontFamily: Fonts.dmSans.medium, fontSize: 14, color: '#464646' }}>
              Daily Goal: {goalDone} / {goalTarget} Points
            </Text>
          </View>

          {/* Progress Ring */}
          <View style={{ width: mSize, height: mSize, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={mSize} height={mSize} style={{ transform: [{ rotate: '-90deg' }] }}>
              <Circle cx={mSize / 2} cy={mSize / 2} r={mR} stroke="#E0DDD0" strokeWidth={mStroke} fill="transparent" />
              <Circle cx={mSize / 2} cy={mSize / 2} r={mR} stroke="#FFC107" strokeWidth={mStroke} fill="transparent" strokeDasharray={mCirc} strokeDashoffset={mOffset} strokeLinecap="round" />
            </Svg>
            <Text style={{ position: 'absolute', fontFamily: Fonts.dmSans.bold, fontSize: 11, color: '#8D6000' }}>
              {goalPercent}%
            </Text>
          </View>
        </View>

        {/* ── MATCH THE PAIRS ── */}
        <View style={{ paddingHorizontal: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 18, letterSpacing: 2, color: '#91001B', textTransform: 'uppercase' }}>
              Match the pairs
            </Text>
            {allMatched ? (
              <Pressable
                onPress={handleReset}
                accessibilityRole="button"
                accessibilityLabel="Play again"
                style={({ pressed }) => ({
                  backgroundColor: '#91001B', borderRadius: 20,
                  paddingHorizontal: 14, paddingVertical: 6,
                  flexDirection: 'row', alignItems: 'center', gap: 6,
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                })}
              >
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                  <Path d="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="#FFFFFF" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 13, color: '#FFFFFF' }}>
                  {formatTime(elapsedSec)} · Replay
                </Text>
              </Pressable>
            ) : (
              <View
                style={{
                  backgroundColor: '#FDC003', borderRadius: 20,
                  paddingHorizontal: 14, paddingVertical: 5,
                  flexDirection: 'row', alignItems: 'center', gap: 5,
                }}
              >
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                  <Circle cx={12} cy={12} r={10} stroke="#6C5000" strokeWidth={2} />
                  <Path d="M12 6v6l4 2" stroke="#6C5000" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 13, color: '#6C5000' }}>
                  {formatTime(elapsedSec)}
                </Text>
              </View>
            )}
          </View>

          {/* Two-column grid */}
          <View style={{ flexDirection: 'row', gap: 16 }}>
            {/* LEFT — English */}
            <Animated.View style={{ flex: 1, gap: 12, transform: [{ translateX: shaking ? shakeAnim : 0 }] }}>
              {MATCH_DATA.map((item) => {
                const isSelected = selectedLeft === item.id;
                const isMatched = matched.has(item.id);

                return (
                  <Pressable
                    key={`left-${item.id}`}
                    onPress={() => handleLeftTap(item.id)}
                    style={({ pressed }) => ({
                      padding: 20,
                      borderRadius: 16,
                      backgroundColor: isMatched
                        ? '#EFEFD7'
                        : isSelected
                        ? '#91001B'
                        : '#E4E4CC',
                      opacity: isMatched ? 0.5 : 1,
                      borderBottomWidth: isSelected || isMatched ? 0 : 4,
                      borderBottomColor: 'rgba(145,0,27,0.12)',
                      ...(isSelected && {
                        shadowColor: '#91001B',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 12,
                        elevation: 4,
                      }),
                      transform: [{ scale: pressed ? 0.96 : 1 }],
                    })}
                  >
                    {isSelected && (
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 17, color: '#FFFFFF' }}>
                          {item.english}
                        </Text>
                        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                          <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                          <Path d="M22 4L12 14.01l-3-3" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                      </View>
                    )}
                    {!isSelected && (
                      <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 17, color: '#1B1D0E' }}>
                        {item.english}
                      </Text>
                    )}
                    <Text
                      style={{
                        fontFamily: Fonts.dmSans.bold,
                        fontSize: 10,
                        letterSpacing: 0.8,
                        color: isSelected ? 'rgba(255,255,255,0.7)' : '#464646',
                        textTransform: 'uppercase',
                        marginTop: 4,
                      }}
                    >
                      {isSelected ? 'Selected' : 'English'}
                    </Text>
                  </Pressable>
                );
              })}
            </Animated.View>

            {/* RIGHT — Kannada */}
            <View style={{ flex: 1, gap: 12 }}>
              {shuffledRight.map((item) => {
                const isSelected = selectedRight === item.id;
                const isMatched = matched.has(item.id);

                return (
                  <Pressable
                    key={`right-${item.id}`}
                    onPress={() => handleRightTap(item.id)}
                    style={({ pressed }) => ({
                      padding: 20,
                      borderRadius: 16,
                      backgroundColor: isMatched
                        ? '#EFEFD7'
                        : isSelected
                        ? '#FDC003'
                        : '#E4E4CC',
                      opacity: isMatched ? 0.5 : 1,
                      alignItems: 'flex-end',
                      borderBottomWidth: isSelected || isMatched ? 0 : 4,
                      borderBottomColor: 'rgba(120,89,0,0.12)',
                      ...(isSelected && {
                        shadowColor: '#785900',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 12,
                        elevation: 4,
                      }),
                      transform: [{ scale: pressed ? 0.96 : 1 }],
                    })}
                  >
                    {isSelected && (
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                          <Path d="M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm12-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" stroke="#6C5000" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                        <Text style={{ fontFamily: Fonts.notoSerifKannada.bold, fontSize: 22, color: '#6C5000', lineHeight: 36, paddingTop: 4 }}>
                          {item.kannada}
                        </Text>
                      </View>
                    )}
                    {!isSelected && (
                      <Text style={{ fontFamily: Fonts.notoSerifKannada.bold, fontSize: 22, color: '#1B1D0E', lineHeight: 36, paddingTop: 4 }}>
                        {item.kannada}
                      </Text>
                    )}
                    <Text
                      style={{
                        fontFamily: Fonts.dmSans.bold,
                        fontSize: 10,
                        letterSpacing: 0.8,
                        color: isSelected ? 'rgba(108,80,0,0.7)' : '#464646',
                        textTransform: 'uppercase',
                        marginTop: 4,
                      }}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.7}
                    >
                      {item.roman}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {/* ── ILLUSTRATION BREAK — Hampi chariot ── */}
        <View style={{ paddingHorizontal: 24, marginTop: 48, opacity: 0.8 }}>
          <View
            style={{
              height: 180,
              borderRadius: 24,
              backgroundColor: '#EFEFD7',
              overflow: 'hidden',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {/* Simulated silhouette */}
            <View style={{ position: 'absolute', bottom: 20, alignItems: 'center' }}>
              {/* Chariot body */}
              <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                <View style={{ width: 8, height: 50, backgroundColor: '#1B1D0E', opacity: 0.08, borderTopLeftRadius: 4, borderTopRightRadius: 4 }} />
                <View style={{ width: 60, height: 35, backgroundColor: '#1B1D0E', opacity: 0.08, borderTopLeftRadius: 12, borderTopRightRadius: 12, marginHorizontal: 4 }} />
                <View style={{ width: 8, height: 50, backgroundColor: '#1B1D0E', opacity: 0.08, borderTopLeftRadius: 4, borderTopRightRadius: 4 }} />
              </View>
              {/* Wheels */}
              <View style={{ flexDirection: 'row', gap: 30, marginTop: -4 }}>
                <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 3, borderColor: 'rgba(27,29,14,0.08)' }} />
                <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 3, borderColor: 'rgba(27,29,14,0.08)' }} />
              </View>
            </View>
            {/* Sun */}
            <View
              style={{
                position: 'absolute', top: 24, right: 40,
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: 'rgba(253,192,3,0.15)',
              }}
            />
          </View>
          <Text
            style={{
              fontFamily: Fonts.lora.italic,
              fontSize: 14,
              color: '#464646',
              textAlign: 'center',
              marginTop: 16,
            }}
          >
            "Knowledge is the greatest treasure."
          </Text>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </Animated.View>
  );
}
