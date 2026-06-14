import * as Application from 'expo-application';
import * as Device from 'expo-device';
import { supabase } from './supabase';

/**
 * Persist an in-app feedback message to public.user_feedback.
 * RLS (feedback_insert_own) enforces user_id = auth.uid(); the build + device
 * context mirror what the old mailto bug-report body captured.
 */
export async function submitFeedback(
  userId: string,
  input: { message: string; category?: string | null },
): Promise<void> {
  const { error } = await supabase.from('user_feedback').insert({
    user_id: userId,
    message: input.message.trim(),
    category: input.category ?? null,
    app_version: Application.nativeApplicationVersion ?? null,
    device: Device.modelName ?? null,
  });
  if (error) throw error;
}
