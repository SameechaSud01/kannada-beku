import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { WordCard } from '../../components/lesson/WordCard';
import { QuizCard } from '../../components/lesson/QuizCard';
import { CultureCard } from '../../components/ui/CultureCard';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useProgressStore } from '../../stores/progressStore';
import { useCopy } from '../../hooks/useCopy';
import { playAudio, startRecording, stopRecording } from '../../services/audio/audioService';
import { ALL_LESSONS } from '../../constants/lessons';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const copy = useCopy();

  const {
    updateLessonProgress,
    completeLesson,
    updateStreak,
    recordActivity,
    lessonProgress,
  } = useProgressStore();

  const lesson = ALL_LESSONS.find((l) => l.id === id);
  if (!lesson) return null;

  const totalSteps = lesson.words.length + lesson.quiz.length;
  const savedIndex = lessonProgress[lesson.id] ?? 0;
  const [currentIndex, setCurrentIndex] = useState(savedIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(4)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, []);

  const isInWordPhase = currentIndex < lesson.words.length;
  const quizIndex = currentIndex - lesson.words.length;
  const progress = (currentIndex + 1) / totalSteps;

  const word = isInWordPhase ? lesson.words[currentIndex] : null;
  const quiz = !isInWordPhase && quizIndex < lesson.quiz.length ? lesson.quiz[quizIndex] : null;

  const handlePlay = useCallback(async () => {
    if (!word) return;
    setIsPlaying(true);
    await playAudio(word.audioUrl);
    setTimeout(() => setIsPlaying(false), 2000);
  }, [word?.audioUrl]);

  const handleRecord = useCallback(async () => {
    if (isRecording) {
      await stopRecording();
      setIsRecording(false);
    } else {
      await startRecording();
      setIsRecording(true);
      setTimeout(async () => {
        await stopRecording();
        setIsRecording(false);
      }, 3000);
    }
  }, [isRecording]);

  const handleNext = useCallback(() => {
    if (currentIndex < totalSteps - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      updateLessonProgress(lesson.id, nextIndex);
    } else {
      const scorePercent = lesson.quiz.length > 0 ? (quizScore / lesson.quiz.length) * 100 : 100;
      completeLesson(lesson.id, scorePercent, lesson.words.length, lesson.estimatedMinutes);
      updateStreak();
      recordActivity();
      router.back();
    }
  }, [currentIndex, totalSteps, lesson, quizScore]);

  const handleQuizAnswer = useCallback(
    (isCorrect: boolean) => {
      if (isCorrect) setQuizScore((s) => s + 1);
      setQuizAnswered((s) => s + 1);
      // Auto-advance after a short delay
      setTimeout(() => handleNext(), 800);
    },
    [handleNext]
  );

  const isLastStep = currentIndex >= totalSteps - 1;

  return (
    <Animated.View
      style={{
        flex: 1,
        backgroundColor: Colors.pageBg,
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      {/* App Bar */}
      <View
        style={{
          paddingTop: insets.top + Spacing.sm,
          backgroundColor: Colors.pageBg,
          paddingHorizontal: Spacing.lg,
          paddingBottom: Spacing.md,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Pressable onPress={() => router.back()}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M19 12H5M12 19l-7-7 7-7"
                stroke={Colors.textPrimary}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Pressable>

          <Text
            style={{
              fontFamily: Fonts.notoSerifKannada.medium,
              fontSize: 17,
              color: Colors.primary,
              lineHeight: 30,
              paddingTop: 4,
            }}
          >
            ಕನ್ನಡ ಬಾ
          </Text>

          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 2c.5 3.5 4 6 4 10a4 4 0 0 1-8 0c0-4 3.5-6.5 4-10z"
              fill={Colors.accent}
              stroke={Colors.accent}
              strokeWidth={1.5}
            />
          </Svg>
        </View>
      </View>

      {/* Progress strip */}
      <View style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.md }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: Spacing.sm,
          }}
        >
          <View style={{ flex: 1, marginRight: Spacing.md }}>
            <ProgressBar progress={progress} height={6} />
          </View>
          <Text
            style={{
              fontFamily: Fonts.dmSans.medium,
              fontSize: 12,
              color: Colors.textSecondary,
            }}
          >
            {currentIndex + 1} / {totalSteps}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={{ flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg }}>
        {word && (
          <>
            <WordCard
              kannadaScript={word.kannadaScript}
              transliteration={word.transliteration}
              meaning={word.meaning}
              onPlay={handlePlay}
              onRecord={handleRecord}
              onCheck={handleNext}
              isPlaying={isPlaying}
              isRecording={isRecording}
            />

            {lesson.culturalNote && (
              <View style={{ marginTop: Spacing.xl }}>
                <CultureCard
                  label="Cultural Note"
                  text={lesson.culturalNote}
                />
              </View>
            )}
          </>
        )}

        {quiz && (
          <QuizCard
            question={quiz.question}
            options={quiz.options}
            correctIndex={quiz.options.indexOf(quiz.correctAnswer)}
            onAnswer={handleQuizAnswer}
          />
        )}
      </View>

      {/* Bottom CTA */}
      <View style={{ padding: Spacing.lg, paddingBottom: insets.bottom + Spacing.lg }}>
        <Pressable
          onPress={handleNext}
          style={({ pressed }) => ({
            backgroundColor: pressed ? Colors.primaryDark : Colors.primary,
            borderRadius: Radius.md,
            paddingVertical: Spacing.md + 2,
            alignItems: 'center',
            transform: [{ scale: pressed ? 0.96 : 1 }],
          })}
        >
          <Text
            style={{
              fontFamily: Fonts.notoSerifKannada.medium,
              fontSize: 15,
              lineHeight: 26,
              paddingTop: 2,
              color: Colors.textOnRed,
            }}
          >
            {isLastStep ? copy('lessonDone') : copy('nextPhrase')}
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}
