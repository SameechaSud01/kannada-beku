import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { supabase } from './supabase';

// `@react-native-google-signin/google-signin` resolves its native module with
// TurboModuleRegistry.getEnforcing at *import* time, which throws in Expo Go
// (the RNGoogleSignin binary only exists in a dev/production build). A static
// import would therefore crash this whole module on load — taking every (auth)
// route that imports it down with it. Load it lazily so only an actual Google
// sign-in (which only runs in a real build) touches the native module.
type GoogleSigninModule = typeof import('@react-native-google-signin/google-signin');
let googleModule: GoogleSigninModule | null = null;
function getGoogleModule(): GoogleSigninModule {
  if (!googleModule) {
    // Lazy native require keeps this module out of the web/SSR bundle.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    googleModule = require('@react-native-google-signin/google-signin');
  }
  return googleModule!;
}

// ---------------------------------------------------------------------------
// Password recovery (spec_password_reset.md)
// ---------------------------------------------------------------------------

/**
 * Sends a reset email whose link deep-links back to `(auth)/reset-password`.
 *
 * `resetPasswordForEmail` does NOT error on an unknown email — that's
 * intentional. Callers must show the same "check your email" confirmation
 * regardless of whether an account exists, so we never leak account existence.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const redirectTo = Linking.createURL('reset-password');
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo,
  });
  if (error) throw error;
}

/**
 * Sets a new password using the recovery session that `(auth)/reset-password`
 * established. Throws on a weak password or a missing/expired session.
 */
export async function setNewPassword(password: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Social sign-in (spec_social_login.md)
//
// Native id-token flow: the platform SDK returns a signed OIDC token, which we
// hand to supabase.auth.signInWithIdToken. Once a session exists, AppGate owns
// routing + hydration exactly as for email/password. The only module that
// calls signInWithIdToken is this file.
// ---------------------------------------------------------------------------

export type SocialResult =
  { status: 'signedIn' } | { status: 'cancelled' } | { status: 'error'; error: unknown };

let googleConfigured = false;
function configureGoogle(): void {
  if (googleConfigured) return;
  // Client IDs are public (not secrets); sourced from env via EXPO_PUBLIC_*.
  // The Web client ID is the audience Supabase validates the id-token against.
  getGoogleModule().GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });
  googleConfigured = true;
}

export async function signInWithGoogle(): Promise<SocialResult> {
  try {
    const { GoogleSignin, isSuccessResponse } = getGoogleModule();
    configureGoogle();
    if (Platform.OS === 'android') {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    }
    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response)) return { status: 'cancelled' };

    const idToken = response.data.idToken;
    if (!idToken) {
      return { status: 'error', error: new Error('Google sign-in returned no idToken') };
    }
    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });
    if (error) throw error;
    return { status: 'signedIn' };
  } catch (e) {
    const { isErrorWithCode, statusCodes } = getGoogleModule();
    if (isErrorWithCode(e) && e.code === statusCodes.SIGN_IN_CANCELLED) {
      return { status: 'cancelled' };
    }
    return { status: 'error', error: e };
  }
}

export async function signInWithApple(): Promise<SocialResult> {
  try {
    // Apple requires a nonce: hand it the SHA-256 hash, hand Supabase the raw.
    const rawNonce = Crypto.randomUUID();
    const hashedNonce = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      rawNonce,
    );
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });
    if (!credential.identityToken) {
      return {
        status: 'error',
        error: new Error('Apple sign-in returned no identity token'),
      };
    }
    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
      nonce: rawNonce,
    });
    if (error) throw error;
    return { status: 'signedIn' };
  } catch (e) {
    if (
      e &&
      typeof e === 'object' &&
      'code' in e &&
      (e as { code?: string }).code === 'ERR_REQUEST_CANCELED'
    ) {
      return { status: 'cancelled' };
    }
    return { status: 'error', error: e };
  }
}
