import * as Linking from 'expo-linking';
import { supabase } from './supabase';

/**
 * Password recovery (spec_password_reset.md). Sends a reset email whose link
 * deep-links back to `(auth)/reset-password`.
 *
 * `resetPasswordForEmail` does NOT error on an unknown email — that's
 * intentional. Callers must show the same "check your email" confirmation
 * regardless of whether an account exists, so we never leak account existence.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const redirectTo = Linking.createURL('reset-password');
  const { error } = await supabase.auth.resetPasswordForEmail(
    email.trim().toLowerCase(),
    { redirectTo },
  );
  if (error) throw error;
}

/**
 * Sets a new password using the recovery session that `(auth)/reset-password`
 * established via `exchangeCodeForSession`. Throws on a weak password or a
 * missing/expired session.
 */
export async function setNewPassword(password: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}
