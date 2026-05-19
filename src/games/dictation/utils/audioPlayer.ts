import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import type { DictationWord } from '../types';

let currentSound: Audio.Sound | null = null;

export async function playWord(word: DictationWord): Promise<void> {
  try {
    if (word.audioFile !== undefined) {
      if (currentSound) {
        try {
          await currentSound.stopAsync();
          await currentSound.unloadAsync();
        } catch {
          // already unloaded
        }
        currentSound = null;
      }
      const { sound } = await Audio.Sound.createAsync(word.audioFile);
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
