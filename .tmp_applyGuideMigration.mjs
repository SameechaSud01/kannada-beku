// One-off: apply the Lesson 0 redesign guide payload to the DB (Phase 2),
// mirroring services/api/migrations/2026-06-30_lesson0_redesign_guide.sql.
// Read-modify-write so only reference.guide changes; everything else is preserved.
import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');

const db = createClient(url, key, { auth: { persistSession: false } });

const GUIDE = {
  welcomePoints: [
    { n: 1, text: 'It is spoken almost exactly as it is written.' },
    { n: 2, text: 'Every vowel is pronounced — nothing stays silent.' },
    { n: 3, text: 'Even stress: syllables share the weight.' },
  ],
  vowels: [
    { kannada: 'ಅ', transliteration: 'a' },
    { kannada: 'ಆ', transliteration: 'aa' },
    { kannada: 'ಇ', transliteration: 'i' },
    { kannada: 'ಈ', transliteration: 'ee' },
    { kannada: 'ಉ', transliteration: 'u' },
    { kannada: 'ಊ', transliteration: 'oo' },
    { kannada: 'ಎ', transliteration: 'e' },
    { kannada: 'ಒ', transliteration: 'o' },
  ],
  shortLong: {
    short: { kannada: 'ಕಲಿ', transliteration: 'kali', english: 'learn' },
    long: { kannada: 'ಕಾಲಿ', transliteration: 'kaali', english: 'empty' },
  },
  retroflexRows: [
    { curled: { kannada: 'ಟ', transliteration: 'Ta' }, dental: { kannada: 'ತ', transliteration: 'ta' } },
    { curled: { kannada: 'ಡ', transliteration: 'Da' }, dental: { kannada: 'ದ', transliteration: 'da' } },
  ],
  doubles: [
    { kannada: 'ಅಪ್ಪ', transliteration: 'appa', english: 'father' },
    { kannada: 'ಅಮ್ಮ', transliteration: 'amma', english: 'mother' },
    { kannada: 'ಹಳ್ಳಿ', transliteration: 'haLLi', english: 'village' },
  ],
  rhythm: {
    kannada: 'ನನಗೆ ಕನ್ನಡ ಬೇಕು',
    syllables: ['na', 'na', 'ge', 'kan', 'na', 'da', 'bē', 'ku'],
    transliteration: 'Nanage Kannada bēku',
    english: '“I want Kannada”',
  },
  recap: [
    'Kannada is phonetic — say what you see.',
    'Long vowels change the word (kali vs kaali).',
    'Capital letters (Ta, Da, Na, La) mean curl your tongue.',
    'Double letters are held slightly longer.',
  ],
};

const { data: before, error: e1 } = await db
  .from('lessons')
  .select('content_json')
  .eq('slug', 'basics')
  .single();
if (e1) throw e1;

const cj = before.content_json ?? {};
const ref = (cj.reference && typeof cj.reference === 'object') ? cj.reference : {};
const oldGuideShape = ref.guide ? Object.keys(ref.guide).sort().join(',') : '(none)';
const next = { ...cj, reference: { ...ref, guide: GUIDE } };

const { error: e2 } = await db.from('lessons').update({ content_json: next }).eq('slug', 'basics');
if (e2) throw e2;

const { data: after, error: e3 } = await db
  .from('lessons')
  .select('content_json')
  .eq('slug', 'basics')
  .single();
if (e3) throw e3;

const g = after.content_json?.reference?.guide;
console.log('--- before ---');
console.log('  old guide keys:', oldGuideShape);
console.log('--- after ---');
console.log('  new guide keys:', g ? Object.keys(g).sort().join(',') : '(none)');
console.log('  welcomePoints :', g?.welcomePoints?.length);
console.log('  vowels        :', g?.vowels?.length);
console.log('  shortLong     :', g?.shortLong ? `${g.shortLong.short?.transliteration}/${g.shortLong.long?.transliteration}` : '(none)');
console.log('  retroflexRows :', g?.retroflexRows?.length);
console.log('  doubles       :', g?.doubles?.length);
console.log('  rhythm        :', g?.rhythm?.kannada);
console.log('  recap         :', g?.recap?.length);
console.log('  sections kept :', Array.isArray(after.content_json?.reference?.sections), `(${after.content_json?.reference?.sections?.length ?? 0} sections)`);
console.log('  source kept   :', after.content_json?.reference?.source);
