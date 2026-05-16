import { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, Animated, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { useProgressStore } from '../../stores/progressStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useUserStore } from '../../stores/useUserStore';
import { useCopy } from '../../hooks/useCopy';
import { supabase } from '../../services/api/supabase';
import { ALL_LESSONS } from '../../constants/lessons/legacy';
import { useStreak, useWordsLearned, useCompletedLessons } from '../../hooks/progress';
import { formatFirstName } from '../../utils/formatName';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const copy = useCopy();
  const streak = useStreak();
  const totalPhrasesLearned = useWordsLearned();
  const completedLessons = useCompletedLessons();
  const lessonProgress = useProgressStore((s) => s.lessonProgress);
  const user = useAuthStore((s) => s.user);
  const learningMode = useUserStore((s) => s.learningMode);
  const appMode = useUserStore((s) => s.mode);
  const setLearningMode = useUserStore((s) => s.setLearningMode);
  const setAppMode = useUserStore((s) => s.setMode);

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
    || 'Learner';
  const userName = formatFirstName(rawName, 'Learner');

  const journeyLessons = ALL_LESSONS.slice(0, 3);

  const handleLearningModeChange = (mode: 'spoken' | 'written' | 'both') => {
    setLearningMode(mode);
    Alert.alert('', copy('learningModeUpdated'));
  };

  const handleAppModeChange = (mode: 'rowdy' | 'classic') => {
    setAppMode(mode);
    Alert.alert('', copy('modeUpdated'));
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
      {/* GLASS HEADER */}
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
        <Pressable
          onPress={() => router.push('/')}
          accessibilityRole="button"
          accessibilityLabel="Back to home"
          hitSlop={8}
        >
          <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
            <Path d="M3 6h18M3 12h18M3 18h18" stroke="#91001B" strokeWidth={2.2} strokeLinecap="round" />
          </Svg>
        </Pressable>
        <Text style={{ fontFamily: Fonts.notoSerifKannada.bold, fontSize: 22, color: '#91001B', letterSpacing: -0.3, lineHeight: 36, paddingTop: 4 }}>
          ಕನ್ನಡ ಬಾ
        </Text>
        <View
          style={{
            width: 40, height: 40, borderRadius: 20,
            backgroundColor: Colors.primaryContainer, borderWidth: 2, borderColor: 'rgba(145,0,27,0.15)',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#FFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx={12} cy={7} r={4} stroke="#FFF" strokeWidth={2} />
          </Svg>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* USER PROFILE HEADER */}
        <View style={{ alignItems: 'center', paddingTop: 28, marginBottom: 36 }}>
          <View
            style={{
              width: 128, height: 128, borderRadius: 64,
              backgroundColor: '#91001B',
              alignItems: 'center', justifyContent: 'center',
              marginBottom: 8,
            }}
          >
            <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 40, color: '#FFFFFF' }}>
              {userName[0]?.toUpperCase()}
            </Text>
          </View>
          <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 28, color: '#1B1D0E', letterSpacing: -0.5, marginTop: 8 }}>
            {userName}
          </Text>
          <Text style={{ fontFamily: Fonts.dmSans.medium, fontSize: 14, color: '#464646' }}>
            Linguistic Enthusiast
          </Text>
        </View>

        {/* STATS BENTO GRID */}
        <View style={{ paddingHorizontal: 24, marginBottom: 36 }}>
          <View style={{ flexDirection: 'row', gap: 14 }}>
            {/* Streak */}
            <View style={{ flex: 1, backgroundColor: '#F5F5DC', borderRadius: 16, padding: 24 }}>
              <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" style={{ marginBottom: 12 }}>
                <Path d="M12 2c.5 3.5 4 6 4 10a4 4 0 0 1-8 0c0-4 3.5-6.5 4-10z" fill="#91001B" stroke="#91001B" strokeWidth={1} />
              </Svg>
              <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 36, color: '#1B1D0E', lineHeight: 40 }}>
                {streak}
              </Text>
              <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 10, letterSpacing: 2, color: '#464646', textTransform: 'uppercase', marginTop: 4 }}>
                Day Streak
              </Text>
            </View>
            {/* Words */}
            <View style={{ flex: 1, backgroundColor: '#E4E4CC', borderRadius: 16, padding: 24 }}>
              <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" style={{ marginBottom: 12 }}>
                <Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="#785900" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="#785900" stroke="#785900" strokeWidth={1} />
              </Svg>
              <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 36, color: '#1B1D0E', lineHeight: 40 }}>
                {totalPhrasesLearned}
              </Text>
              <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 10, letterSpacing: 2, color: '#464646', textTransform: 'uppercase', marginTop: 4 }}>
                Words Learned
              </Text>
            </View>
          </View>

        </View>

        {/* LANGUAGE JOURNEY MAP */}
        {/* TODO: replace with completed-lessons list OR weekly activity heatmap — pending design call */}
        <View style={{ paddingHorizontal: 24, marginBottom: 36 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 20, color: '#1B1D0E' }}>
              Language Journey
            </Text>
            <Pressable
              onPress={() => router.push('/learn')}
              accessibilityRole="link"
              accessibilityLabel="View full learning path"
              hitSlop={8}
              style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
            >
              <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 11, letterSpacing: 2, color: '#91001B', textTransform: 'uppercase' }}>
                View Path
              </Text>
            </Pressable>
          </View>

          <View
            style={{
              backgroundColor: '#F5F5DC', borderRadius: 24, padding: 28, overflow: 'hidden',
              minHeight: 320, position: 'relative',
            }}
          >
            <View style={{ position: 'absolute', top: 20, right: -10, opacity: 0.06 }}>
              <Text style={{ fontFamily: Fonts.notoSerifKannada.bold, fontSize: 160, color: '#464646', lineHeight: 240 }}>ಕ</Text>
            </View>

            <View
              style={{
                position: 'absolute', left: 51, top: 56, bottom: 56, width: 2,
                borderLeftWidth: 2, borderLeftColor: 'rgba(145,0,27,0.15)', borderStyle: 'dotted',
              }}
            />

            <View style={{ gap: 32, position: 'relative', zIndex: 10 }}>
              {journeyLessons.map((lesson, idx) => {
                const isCompleted = completedLessons.includes(lesson.id);
                const isActive = !isCompleted && idx === (completedLessons.length > 0 ? completedLessons.length : 0);
                const isLocked = !isCompleted && !isActive;
                const phrasesDone = lessonProgress[lesson.id] ?? 0;

                return (
                  <View key={lesson.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 18, opacity: isLocked ? 0.4 : 1 }}>
                    <View
                      style={{
                        width: isActive ? 56 : 48,
                        height: isActive ? 56 : 48,
                        borderRadius: 28,
                        backgroundColor: isCompleted ? '#91001B' : isActive ? '#BE0027' : '#DBDCC3',
                        alignItems: 'center', justifyContent: 'center',
                        borderWidth: isActive ? 4 : 0,
                        borderColor: '#FBFBE2',
                        shadowColor: isActive || isCompleted ? '#91001B' : 'transparent',
                        shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: isActive ? 6 : 2,
                      }}
                    >
                      {isCompleted ? (
                        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                          <Path d="M5 12l5 5L20 7" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                      ) : isActive ? (
                        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                          <Path d="M8 5v14l11-7L8 5z" fill="#FFFFFF" />
                        </Svg>
                      ) : (
                        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                          <Path d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4" stroke="#464646" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                      )}
                    </View>

                    <View
                      style={{
                        flex: 1,
                        backgroundColor: isActive ? '#E4E4CC' : 'rgba(255,255,255,0.7)',
                        borderRadius: 20, padding: 16,
                        borderWidth: isActive ? 2 : 0,
                        borderColor: isActive ? 'rgba(145,0,27,0.15)' : 'transparent',
                        shadowColor: '#1B1D0E', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
                      }}
                    >
                      <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 14, color: '#1B1D0E', marginBottom: 3 }}>
                        {lesson.title}
                      </Text>
                      <Text style={{ fontFamily: Fonts.dmSans.regular, fontSize: 12, color: isActive ? '#5C3F3F' : '#464646' }}>
                        {isCompleted
                          ? 'Completed'
                          : isActive
                          ? `${phrasesDone}/${lesson.words.length} Words Finished`
                          : 'Locked'}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* SETTINGS — App Mode (Rowdy / Classic) */}
        <View style={{ paddingHorizontal: 24, marginBottom: 28 }}>
          <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 20, color: '#1B1D0E', marginBottom: 16 }}>
            Settings
          </Text>

          <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 11, letterSpacing: 2, color: '#464646', textTransform: 'uppercase', marginBottom: 12 }}>
            App Style
          </Text>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
            {/* Classic card */}
            <Pressable
              onPress={() => handleAppModeChange('classic')}
              style={({ pressed }) => ({
                flex: 1,
                backgroundColor: '#FFFFFF',
                borderWidth: 2,
                borderColor: appMode === 'classic' ? Colors.primaryContainer : '#E0DDD0',
                borderRadius: 16,
                padding: 18,
                alignItems: 'center',
                transform: [{ scale: pressed ? 0.97 : 1 }],
              })}
            >
              <Text style={{ fontSize: 28, marginBottom: 8 }}>
                {/* Teacher icon */}
                {'\u{1F393}'}
              </Text>
              <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 15, color: '#1B1D0E', marginBottom: 4 }}>
                Classic
              </Text>
              <Text style={{ fontFamily: Fonts.dmSans.regular, fontSize: 12, color: '#464646', textAlign: 'center' }}>
                Structured and encouraging
              </Text>
              {appMode === 'classic' && (
                <View style={{ position: 'absolute', top: 10, right: 10, width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.primaryContainer, alignItems: 'center', justifyContent: 'center' }}>
                  <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                    <Path d="M5 12l5 5L20 7" stroke="#FFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
              )}
            </Pressable>
            {/* Rowdy card */}
            <Pressable
              onPress={() => handleAppModeChange('rowdy')}
              style={({ pressed }) => ({
                flex: 1,
                backgroundColor: '#FFFFFF',
                borderWidth: 2,
                borderColor: appMode === 'rowdy' ? Colors.primaryContainer : '#E0DDD0',
                borderRadius: 16,
                padding: 18,
                alignItems: 'center',
                transform: [{ scale: pressed ? 0.97 : 1 }],
              })}
            >
              <Text style={{ fontSize: 28, marginBottom: 8 }}>
                {'\u{1F525}'}
              </Text>
              <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 15, color: '#1B1D0E', marginBottom: 4 }}>
                Rowdy
              </Text>
              <Text style={{ fontFamily: Fonts.dmSans.regular, fontSize: 12, color: '#464646', textAlign: 'center' }}>
                Slang, humour, zero filter
              </Text>
              {appMode === 'rowdy' && (
                <View style={{ position: 'absolute', top: 10, right: 10, width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.primaryContainer, alignItems: 'center', justifyContent: 'center' }}>
                  <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                    <Path d="M5 12l5 5L20 7" stroke="#FFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
              )}
            </Pressable>
          </View>

          {/* Learning Mode Segmented Control */}
          <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 11, letterSpacing: 2, color: '#464646', textTransform: 'uppercase', marginBottom: 12 }}>
            Learning Mode
          </Text>
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: '#E4E4CC',
              borderRadius: 12,
              padding: 4,
            }}
          >
            {(['spoken', 'written', 'both'] as const).map((mode) => (
              <Pressable
                key={mode}
                onPress={() => handleLearningModeChange(mode)}
                style={{
                  flex: 1,
                  backgroundColor: learningMode === mode ? '#FFFFFF' : 'transparent',
                  borderRadius: 10,
                  paddingVertical: 12,
                  alignItems: 'center',
                  ...(learningMode === mode && {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 4,
                    elevation: 2,
                  }),
                }}
              >
                <Text
                  style={{
                    fontFamily: learningMode === mode ? Fonts.dmSans.bold : Fonts.dmSans.medium,
                    fontSize: 13,
                    color: learningMode === mode ? Colors.primaryContainer : '#464646',
                    textTransform: 'capitalize',
                  }}
                >
                  {mode}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* EARNED BADGES */}
        <View style={{ marginBottom: 36 }}>
          <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 20, color: '#1B1D0E', paddingHorizontal: 24, marginBottom: 18 }}>
            Earned Badges
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
          >
            {BADGES.map((badge) => {
              const earned = badge.isEarned({
                streak,
                completedCount: completedLessons.length,
                totalPhrasesLearned,
              });
              return (
                <Pressable
                  key={badge.id}
                  onPress={() =>
                    Alert.alert(
                      badge.title,
                      earned ? `${badge.description}\n\nEarned ✓` : `${badge.description}\n\nHow to earn: ${badge.howToEarn}`
                    )
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`${badge.title}, ${earned ? 'earned' : 'locked'}`}
                  style={({ pressed }) => ({
                    width: 100,
                    alignItems: 'center',
                    transform: [{ scale: pressed ? 0.96 : 1 }],
                  })}
                >
                  {earned ? (
                    <View
                      style={{
                        width: 88, height: 88, borderRadius: 44,
                        backgroundColor: badge.bottomColor, alignItems: 'center', justifyContent: 'center',
                        shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4,
                        overflow: 'hidden',
                      }}
                    >
                      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '60%', backgroundColor: badge.topColor }} />
                      <Svg width={36} height={36} viewBox="0 0 24 24" fill="none" style={{ zIndex: 1 }}>
                        <Path d={badge.iconPath} fill="#FFFFFF" stroke="#FFFFFF" strokeWidth={1} />
                      </Svg>
                    </View>
                  ) : (
                    <View
                      style={{
                        width: 88, height: 88, borderRadius: 44,
                        backgroundColor: '#EAEAD1', alignItems: 'center', justifyContent: 'center',
                        borderWidth: 2, borderStyle: 'dashed', borderColor: 'rgba(70,70,70,0.15)',
                      }}
                    >
                      <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
                        <Path d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4" stroke="rgba(70,70,70,0.25)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                    </View>
                  )}
                  <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 9, letterSpacing: 1.2, color: '#464646', textTransform: 'uppercase', marginTop: 10, textAlign: 'center' }}>
                    {badge.title}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Sign out */}
        <View style={{ paddingHorizontal: 24 }}>
          <View style={{ height: 0.5, backgroundColor: '#E5BDBB', opacity: 0.3, marginBottom: 4 }} />
          <Pressable
            onPress={() => supabase.auth.signOut()}
            style={({ pressed }) => ({
              paddingVertical: 18, alignItems: 'center',
              transform: [{ scale: pressed ? 0.96 : 1 }],
            })}
          >
            <Text style={{ fontFamily: Fonts.dmSans.regular, fontSize: 14, color: '#91001B' }}>
              Sign out
            </Text>
          </Pressable>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </Animated.View>
  );
}

type BadgeContext = { streak: number; completedCount: number; totalPhrasesLearned: number };
type BadgeDef = {
  id: string;
  title: string;
  description: string;
  howToEarn: string;
  topColor: string;
  bottomColor: string;
  iconPath: string;
  isEarned: (ctx: BadgeContext) => boolean;
};

const BADGES: BadgeDef[] = [
  {
    id: 'early-bird',
    title: 'Early Bird',
    description: 'Started learning Kannada and built your first day-streak.',
    howToEarn: 'Reach a 1-day streak by completing any lesson.',
    topColor: '#FDC003',
    bottomColor: '#785900',
    iconPath: 'M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 7 7 7 7M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 17 7 17 7M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22M18 2H6v7a6 6 0 0 0 12 0V2Z',
    isEarned: ({ streak, completedCount }) => streak >= 1 || completedCount >= 1,
  },
  {
    id: 'quiz-master',
    title: 'Quiz Master',
    description: 'Cleared three full lessons end-to-end. The drills don\'t scare you.',
    howToEarn: 'Complete 3 lessons.',
    topColor: '#91001B',
    bottomColor: '#BE0027',
    iconPath: 'M12 15l-3.5 2 1-4L6 10l4-.5L12 6l2 3.5 4 .5-3.5 3 1 4z',
    isEarned: ({ completedCount }) => completedCount >= 3,
  },
  {
    id: 'polyglot',
    title: 'Polyglot',
    description: 'Learned 50+ Kannada phrases. Real conversations are within reach.',
    howToEarn: 'Learn 50 phrases across all lessons.',
    topColor: '#6C5000',
    bottomColor: '#785900',
    iconPath: 'M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
    isEarned: ({ totalPhrasesLearned }) => totalPhrasesLearned >= 50,
  },
];
