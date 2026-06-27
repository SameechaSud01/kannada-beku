import { supabase } from './supabase';

export type LearningMode = 'spoken' | 'written' | 'both';
export type DailyGoalMinutes = 5 | 10 | 20;

export type UserRow = {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  learning_mode: LearningMode | null;
  motivations: string[];
  daily_goal_minutes: DailyGoalMinutes | null;
  current_streak: number;
  /** Local calendar day (YYYY-MM-DD) of the most recent qualifying activity. */
  last_active_date: string | null;
  onboarding_completed_at: string | null;
  created_at: string;
  daily_reminder_time: string | null;
  tts_rate: number;
  auto_replay: boolean;
};

const USER_SELECT =
  'id, email, name, avatar_url, learning_mode, motivations, daily_goal_minutes, current_streak, last_active_date, onboarding_completed_at, created_at, daily_reminder_time, tts_rate, auto_replay';

export async function fetchUserRow(userId: string): Promise<UserRow | null> {
  const { data, error } = await supabase
    .from('users')
    .select(USER_SELECT)
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return (data as UserRow | null) ?? null;
}

export async function completeOnboarding(
  userId: string,
  input: {
    name?: string | null;
    learning_mode: LearningMode;
    motivations: string[];
    daily_goal_minutes: DailyGoalMinutes;
  },
): Promise<UserRow> {
  const update: Record<string, unknown> = {
    learning_mode: input.learning_mode,
    motivations: input.motivations,
    daily_goal_minutes: input.daily_goal_minutes,
    onboarding_completed_at: new Date().toISOString(),
  };
  if (input.name !== undefined) update.name = input.name;

  const { data, error } = await supabase
    .from('users')
    .update(update)
    .eq('id', userId)
    .select(USER_SELECT)
    .single();

  if (error) throw error;
  return data as UserRow;
}

/**
 * Persist the learning streak (audit B4). Fire-and-forget from the client —
 * the local store is the live source of truth; this just mirrors it so the
 * streak survives reinstall / a new device. Writes both columns together so a
 * restored streak knows whether it's still live. Returns nothing; callers
 * swallow/warn on error rather than block the UI.
 */
export async function updateStreakOnServer(
  userId: string,
  streak: number,
  lastActiveDate: string,
): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ current_streak: streak, last_active_date: lastActiveDate })
    .eq('id', userId);
  if (error) throw error;
}

export async function updateLearningMode(userId: string, mode: LearningMode): Promise<UserRow> {
  const { data, error } = await supabase
    .from('users')
    .update({ learning_mode: mode })
    .eq('id', userId)
    .select(USER_SELECT)
    .single();
  if (error) throw error;
  return data as UserRow;
}

export async function updateDailyReminderTime(
  userId: string,
  time: string | null,
): Promise<UserRow> {
  const { data, error } = await supabase
    .from('users')
    .update({ daily_reminder_time: time })
    .eq('id', userId)
    .select(USER_SELECT)
    .single();
  if (error) throw error;
  return data as UserRow;
}

export async function updateTtsRate(userId: string, rate: number): Promise<UserRow> {
  const { data, error } = await supabase
    .from('users')
    .update({ tts_rate: rate })
    .eq('id', userId)
    .select(USER_SELECT)
    .single();
  if (error) throw error;
  return data as UserRow;
}

export async function updateAutoReplay(userId: string, value: boolean): Promise<UserRow> {
  const { data, error } = await supabase
    .from('users')
    .update({ auto_replay: value })
    .eq('id', userId)
    .select(USER_SELECT)
    .single();
  if (error) throw error;
  return data as UserRow;
}
