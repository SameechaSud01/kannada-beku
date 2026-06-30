import { useEffect, useState } from 'react';
import { useIsMounted } from '../../hooks/useIsMounted';
import { deviceTtsAudioService } from '../../services/audio/deviceTtsAudioService';
import { useUserStore } from '../../stores/useUserStore';
import { Toasts } from '../modals/instances/toastCatalog';

/**
 * Basics is the learner's very first exposure to each sound, so it plays slower
 * than the rest of the app to give time to listen properly. Capped against the
 * user's own rate so anyone who set it slower globally keeps their slower speed.
 */
const GUIDE_TTS_RATE = 0.9;

/**
 * Play-one-at-a-time audio shared by the listen-first guide steps. Tracks which
 * key is mid-playback (so only one AudioOrb/tile pings), speaks Kannada via
 * device TTS, and surfaces a retry toast on failure. Stops playback on unmount.
 */
export function useGuideAudio() {
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const mounted = useIsMounted();

  useEffect(() => {
    return () => {
      deviceTtsAudioService.stop().catch(() => undefined);
    };
  }, []);

  const play = (key: string, text: string) => {
    setPlayingKey(key);
    const userRate = useUserStore.getState().ttsRate ?? 1.0;
    deviceTtsAudioService
      .play(text, { rate: Math.min(GUIDE_TTS_RATE, userRate) })
      .catch((err) => {
        console.warn('[guide_audio] play failed', err);
        Toasts.audioFailed(() => play(key, text));
      })
      .finally(() => {
        if (mounted.current) setPlayingKey((cur) => (cur === key ? null : cur));
      });
  };

  return { playingKey, play };
}
