import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import type { DictationWord } from '../types';
import { getBundledAudio } from '../../../../services/audio/bundledAudio';
import { useProgressStore } from '../../../../stores/progressStore';

let currentSound: Audio.Sound | null = null;

export async function playWord(word: DictationWord): Promise<void> {
  // Daily-goal "Listen": dictation prompts use this path instead of the TTS service.
  useProgressStore.getState().recordListen();
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
    } else {
      Speech.stop();
      Speech.speak(word.kn, {
        language: 'kn-IN',
        rate: 0.85,
        pitch: 1.0,
      });
    }
  } catch (err) {
    console.warn('DictationAudio error:', err);
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
