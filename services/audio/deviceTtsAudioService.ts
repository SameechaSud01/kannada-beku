import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import type { AudioService, PlayOptions } from './AudioService';
import { getBundledAudio } from './bundledAudio';
import { useUserStore } from '../../stores/useUserStore';

const DEFAULT_LANGUAGE = 'kn-IN';
const MIN_RATE = 0.5;
const MAX_RATE = 1.5;

function resolveRate(explicit?: number): number {
  const raw = explicit ?? useUserStore.getState().ttsRate ?? 1.0;
  return Math.max(MIN_RATE, Math.min(MAX_RATE, raw));
}

let currentRecording: Audio.Recording | null = null;
let currentPlaybackSound: Audio.Sound | null = null;

// Cached result of the voice probe — voices don't change within a session, and
// the dictation fallback (audit H7) checks this on every word play.
let knVoiceAvailable: boolean | null = null;

/**
 * Checks if a Kannada voice is available on this device. Call once at app
 * startup; surface a warning to the user if false. Result is cached after the
 * first successful probe (a thrown probe is not cached, so it can recover).
 */
export async function isKannadaVoiceAvailable(): Promise<boolean> {
  if (knVoiceAvailable !== null) return knVoiceAvailable;
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    knVoiceAvailable = voices.some((v) => v.language.toLowerCase().startsWith('kn'));
    return knVoiceAvailable;
  } catch (err) {
    console.warn('[audio] getAvailableVoicesAsync threw', err);
    return false;
  }
}

export const deviceTtsAudioService: AudioService = {
  async play(text: string, options?: PlayOptions) {
    const language = options?.language ?? DEFAULT_LANGUAGE;
    const rate = resolveRate(options?.rate);

    // Prefer the pre-generated, bundled neural-TTS clip when one exists; this is
    // natural-sounding, instant, and offline. Falls through to on-device TTS for
    // any string without a bundled clip (and any dynamic text).
    const asset = getBundledAudio(text);
    if (asset !== undefined) {
      // Stop both engines so we never overlap with a previous play.
      Speech.stop();
      if (currentPlaybackSound) {
        try {
          await currentPlaybackSound.stopAsync();
          await currentPlaybackSound.unloadAsync();
        } catch {
          // sound may already be unloaded
        }
        currentPlaybackSound = null;
      }
      // The user's speed setting still applies, with pitch correction so slowed
      // clips don't drop in pitch.
      const { sound } = await Audio.Sound.createAsync(asset, {
        shouldPlay: true,
        rate,
        shouldCorrectPitch: true,
      });
      currentPlaybackSound = sound;
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync().catch(() => undefined);
          if (currentPlaybackSound === sound) currentPlaybackSound = null;
        }
      });
      return;
    }

    Speech.stop();
    return new Promise<void>((resolve, reject) => {
      let settled = false;
      Speech.speak(text, {
        language,
        rate,
        onDone: () => {
          if (settled) return;
          settled = true;
          resolve();
        },
        onError: (err) => {
          if (settled) return;
          settled = true;
          console.warn('[audio] onError', { text, err });
          reject(err);
        },
        onStopped: () => {
          if (settled) return;
          settled = true;
          resolve();
        },
      });
    });
  },

  async stop() {
    Speech.stop();
    if (currentPlaybackSound) {
      try {
        await currentPlaybackSound.stopAsync();
        await currentPlaybackSound.unloadAsync();
      } catch {
        // sound may already be unloaded
      }
      currentPlaybackSound = null;
    }
  },

  async startRecording() {
    const perm = await Audio.requestPermissionsAsync();
    if (!perm.granted) {
      throw new Error('Microphone permission denied');
    }
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await recording.startAsync();
    currentRecording = recording;
  },

  async stopRecording() {
    if (!currentRecording) {
      return { uri: '', durationMs: 0 };
    }
    await currentRecording.stopAndUnloadAsync();
    const uri = currentRecording.getURI() ?? '';
    const status = await currentRecording.getStatusAsync();
    const durationMs = status.durationMillis ?? 0;
    currentRecording = null;
    return { uri, durationMs };
  },

  async playRecording(uri: string) {
    if (!uri) return;
    if (currentPlaybackSound) {
      try {
        await currentPlaybackSound.unloadAsync();
      } catch {
        // ignore
      }
      currentPlaybackSound = null;
    }
    const { sound } = await Audio.Sound.createAsync({ uri });
    currentPlaybackSound = sound;
    await sound.playAsync();
  },
};
