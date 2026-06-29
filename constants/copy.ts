// Single-voice copy. The two-tone (classic/rowdy) system was removed 2026-06-28
// (CONTRADICTIONS C3 / TODO T001) — owner kept the "classic" voice. All new copy
// is a single string; do not reintroduce per-voice variants.
export const COPY = {
  // Onboarding
  onboardingWelcome: "Welcome! Let's learn Kannada together.",
  onboardingWelcomeSubtitle: 'Learn Kannada. Belong in Bengaluru.',

  // Lesson flow
  lessonComplete: 'Great work! You completed the lesson.',
  wrongAnswer: "Not quite. Let's try again!",
  correctAnswer: 'Correct! Well done.',

  // Streak
  streakReminder: 'Keep your streak going today.',
  streakCelebration: 'Amazing streak! Keep it up!',

  // Quiz
  quizIntro: "Let's test what you've learned.",
  quizComplete: 'Quiz complete! Great job.',

  // Daily goal
  dailyGoalComplete: "You've hit your daily goal!",
  dailyGoalIncomplete: "You're making progress. Keep going!",

  // Practice
  practiceTitle: 'Practice Daily',
  matchPairsTitle: 'Match the Pairs',

  // Profile
  profileTitle: 'Your Profile',

  // Settings
  learningModeUpdated: 'Learning mode updated. Your progress is saved.',
  modeUpdated: 'App style updated.',

  // Home
  homeGreeting: 'Ready to learn Kannada?',
  nextLesson: 'Next Lesson',
  continuePractice: 'Continue Practice',

  // Lesson navigation
  nextPhrase: 'ಮುಂದುವರಿಸಿ →',
  lessonDone: 'ಪೂರ್ಣಗೊಂಡಿದೆ ✓',
} as const;

export type CopyKey = keyof typeof COPY;
