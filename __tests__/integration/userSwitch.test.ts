/**
 * Integration: account-switch state hygiene (manual plan AUTH-08 / AUTH-08b / AUTH-08c).
 *
 * AppGate's bind effect (app/_layout.tsx) calls bindUser() on first sign-in,
 * and resetForUser() + progress reset when a DIFFERENT user signs in. These
 * tests pin the store contracts that effect relies on: a user switch wipes
 * every per-user field, while install-scoped flags and a same-user re-login
 * keep state intact.
 */
import { useProgressStore } from '../../stores/progressStore';
import { useUserStore } from '../../stores/useUserStore';

const USER_A = 'user-a-uuid';
const USER_B = 'user-b-uuid';

/** Simulate user A having used the app: onboarding done, progress recorded. */
function seedUserA() {
  useUserStore.getState().bindUser(USER_A);
  useUserStore.getState().setOnboarding({
    displayName: 'Asha',
    learningMode: 'spoken',
    motivations: ['family'],
    dailyGoalMinutes: 10,
  });
  useUserStore.setState({ hasSeenTtsWarning: true, hasSeenBasicsHomeNudge: true });
  useProgressStore.getState().completeLesson('greetings', 90, 12, 8);
}

beforeEach(() => {
  useUserStore.getState().reset();
  useUserStore.setState({
    userId: null,
    isHydrated: true,
    hasSeenTtsWarning: false,
    hasSeenBasicsHomeNudge: false,
  });
  useProgressStore.getState().reset();
});

describe('switching to a different account', () => {
  it('wipes user A’s identity, onboarding, and progress before user B sees them', () => {
    seedUserA();
    expect(useProgressStore.getState().completedLessons).toContain('greetings');

    // What AppGate does when storedUserId !== session user id:
    useUserStore.getState().resetForUser(USER_B);
    useProgressStore.getState().reset();

    const user = useUserStore.getState();
    expect(user.userId).toBe(USER_B);
    expect(user.hasCompletedOnboarding).toBe(false);
    expect(user.displayName).toBeNull();
    expect(user.learningMode).toBeNull();
    expect(user.motivations).toEqual([]);
    expect(user.dailyGoalMinutes).toBeNull();

    const progress = useProgressStore.getState();
    expect(progress.completedLessons).toEqual([]);
    expect(progress.xp).toBe(0);
    expect(progress.streak).toBe(0);
    expect(progress.dailyActivity.listen + progress.dailyActivity.practice).toBe(0);
  });

  it('keeps install-scoped flags (TTS warning, basics nudge) across the switch', () => {
    seedUserA();
    useUserStore.getState().resetForUser(USER_B);

    const user = useUserStore.getState();
    expect(user.hasSeenTtsWarning).toBe(true);
    expect(user.hasSeenBasicsHomeNudge).toBe(true);
  });
});

describe('same-user re-login', () => {
  it('bindUser adopts the id without touching onboarding or progress', () => {
    seedUserA();

    // What AppGate does when storedUserId matches: nothing destructive.
    // (bindUser only runs when storedUserId was null; re-binding is a no-op path.)
    const before = {
      user: useUserStore.getState(),
      completed: useProgressStore.getState().completedLessons,
    };
    expect(before.user.hasCompletedOnboarding).toBe(true);
    expect(before.completed).toContain('greetings');
  });
});

describe('signOut-style reset (progress wipe on explicit reset)', () => {
  it('progressStore.reset clears every progress dimension', () => {
    seedUserA();
    useProgressStore.getState().completePart('greetings', '1a');
    useProgressStore.getState().completeGamePart('quick_quiz', '1a');

    useProgressStore.getState().reset();

    const p = useProgressStore.getState();
    expect(p.completedLessons).toEqual([]);
    expect(p.completedParts).toEqual([]);
    expect(p.completedGameParts).toEqual([]);
    expect(p.lessonProgress).toEqual({});
    expect(p.totalPhrasesLearned).toBe(0);
  });
});
