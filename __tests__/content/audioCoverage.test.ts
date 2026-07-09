/**
 * Content integrity: bundled audio coverage.
 *
 * Importing AUDIO_MANIFEST is itself a test — every `require('...mp3')` must
 * resolve, so a manifest entry pointing at a deleted/renamed asset fails the
 * suite at load time. The assertions below then check the reverse direction:
 * every Kannada string the app can play has a pre-generated clip, so the
 * offline bundles stay complete and the device-TTS fallback stays a fallback.
 */
import { AUDIO_MANIFEST } from '../../constants/audioManifest';
import { getBundledAudio } from '../../services/audio/bundledAudio';
import { CONVERSATION_SCENARIOS_BY_LESSON } from '../../constants/games/conversationScenarios';
import { DICTATION_ITEMS_BY_LESSON } from '../../constants/games/dictationItems';
import { TS_LESSONS } from '../../constants/lessons/lessonContent';

/** Collect strings that have no bundled clip, labelled for the failure message. */
function missing(entries: { label: string; text: string }[]): string[] {
  return entries
    .filter(({ text }) => getBundledAudio(text) === undefined)
    .map(({ label, text }) => `${label}: ${text}`);
}

describe('audio manifest', () => {
  it('is non-empty and every entry resolved to a bundled asset', () => {
    const entries = Object.entries(AUDIO_MANIFEST);
    expect(entries.length).toBeGreaterThan(0);
    for (const [key, asset] of entries) {
      expect(key.trim()).not.toBe('');
      expect(asset).toBeDefined();
    }
  });
});

describe('bundled audio coverage', () => {
  it('every lesson word and phrase has a pre-generated clip', () => {
    const entries = TS_LESSONS.flatMap((l) => [
      ...l.words.map((w) => ({ label: `L${l.lessonNo} word`, text: w.kannada })),
      ...l.phrases.map((p) => ({ label: `L${l.lessonNo} phrase`, text: p.kannada })),
    ]);
    expect(missing(entries)).toEqual([]);
  });

  it('every dictation expected answer has a pre-generated clip', () => {
    const entries = Object.values(DICTATION_ITEMS_BY_LESSON)
      .flat()
      .map((i) => ({ label: `dictation L${i.lessonNo}`, text: i.expectedAnswer }));
    expect(missing(entries)).toEqual([]);
  });

  it('every conversation speaker line has a pre-generated clip', () => {
    const entries = Object.values(CONVERSATION_SCENARIOS_BY_LESSON)
      .flat()
      .flatMap((s) =>
        s.turns.map((t) => ({ label: `conversation "${s.title}"`, text: t.speakerLineKn })),
      );
    expect(missing(entries)).toEqual([]);
  });
});
