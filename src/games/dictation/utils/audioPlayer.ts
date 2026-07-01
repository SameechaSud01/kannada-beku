import * as Speech from 'expo-speech';
import { logger } from '../../../../lib/logger';
import { Audio } from 'expo-av';
import type { DictationWord } from '../types';
import { getBundledAudio } from '../../../../services/audio/bundledAudio';
import { isKannadaVoiceAvailable } from '../../../../services/audio/deviceTtsAudioService';

let currentSound: Audio.Sound | null = null;

/**
 * Play the word's audio. Returns whether it will actually be audible: true for
 * a bundled/asset clip or when the device has a Kannada TTS voice, false when
 * there's no clip and no voice — the caller reveals the word so dictation stays
 * playable (audit H7).
 */
export async function playWord(word: DictationWord): Promise<boolean> {
  try {
    // Prefer an explicit require()'d asset, then a bundled clip from the
    // manifest (DB-sourced items have no audioFile), then on-device TTS.
    const asset = word.audioFile ?? getBundledAudio(word.kn);
    if (asset !== undefined) {
      if (currentSound) {
        try {
          await currentSound.stopAsync();
          await currentSound.unloadAsync();
        } catch {
          // already unloaded
        }
        currentSound = null;
      }
      const { sound } = await Audio.Sound.createAsync(asset);
      currentSound = sound;
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync().catch(() => undefined);
          currentSound = null;
        }
      });
      return true;
    }

    // No bundled clip → on-device TTS, which is only audible with a Kannada voice.
    const hasVoice = await isKannadaVoiceAvailable();
    Speech.stop();
    if (!hasVoice) return false;
    Speech.speak(word.kn, {
      language: 'kn-IN',
      rate: 0.85,
      pitch: 1.0,
    });
    return true;
  } catch (err) {
    logger.warn('audio', 'dictation playback error', { err });
    return false;
  }
}

export function stopPlayback(): void {
  try {
    Speech.stop();
  } catch {
    // ignore
  }
  if (currentSound) {
    currentSound.stopAsync().catch(() => undefined);
    currentSound.unloadAsync().catch(() => undefined);
    currentSound = null;
  }
}
