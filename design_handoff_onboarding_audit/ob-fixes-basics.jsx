// Onboarding audit — Kannada basics "after" screens (vowels + ready)
const { Icon, LipButton, RoundIconButton, ProgressBar } = window.KannadaBekuDesignSystem_28dc81;

/* ── Lesson chrome ─────────────────────────────────────────────── */
function ObLessonHeader({ step, total = 7 }) {
  return (
    <div style={{ padding: '8px 24px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 40, height: 40, borderRadius: 20, background: '#fff', border: '1px solid var(--kb-hairline)', boxShadow: '0 3px 0 var(--kb-card-lip)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="back" size={18} color="var(--kb-red-deep)" strokeWidth={2.4}></Icon>
        </span>
        <span style={{ flex: 1, fontFamily: obDISPLAY, fontWeight: 700, fontSize: 18, color: 'var(--kb-ink)' }}>Kannada basics</span>
        <span style={{ fontFamily: obBODY, fontWeight: 700, fontSize: 14, color: 'var(--kb-ink-caption)' }}>{step}/{total}</span>
      </div>
      <div style={{ marginTop: 12, height: 8, borderRadius: 4, background: 'rgba(27,29,14,0.08)', overflow: 'hidden' }}>
        <span style={{ display: 'block', width: `${(step / total) * 100}%`, height: '100%', borderRadius: 4, background: 'var(--kb-gold)' }}></span>
      </div>
    </div>
  );
}

/* ── 2/7 Vowel sounds (after) ──────────────────────────────────── */
function ObVowelTile({ glyph, roman, heard }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
      background: heard ? 'var(--kb-gold-soft)' : '#fff',
      border: `1px solid ${heard ? 'var(--kb-gold-lip)' : 'var(--kb-hairline)'}`,
      borderRadius: 16, padding: '12px 0 9px',
      boxShadow: `0 4px 0 ${heard ? 'var(--kb-gold-lip)' : 'var(--kb-card-lip)'}`,
      position: 'relative',
    }}>
      <span style={{ fontFamily: obKANNADA, fontWeight: 700, fontSize: 30, lineHeight: 1.1, color: 'var(--kb-ink)' }}>{glyph}</span>
      <span style={{ fontFamily: obBODY, fontWeight: 700, fontSize: 13, color: heard ? 'var(--kb-gold-ink)' : 'var(--kb-ink)' }}>{roman}</span>
      <span style={{ position: 'absolute', top: 6, right: 7, display: 'inline-flex' }}>
        <Icon name={heard ? 'check' : 'audio'} size={12} color={heard ? 'var(--kb-gold-dark)' : 'rgba(27,29,14,0.35)'} strokeWidth={2.6}></Icon>
      </span>
    </div>
  );
}

function ObVowelsAfter() {
  const vowels = [
    ['ಅ', 'a', true], ['ಆ', 'aa', true], ['ಇ', 'i', true], ['ಈ', 'ee', false],
    ['ಉ', 'u', false], ['ಊ', 'oo', false], ['ಎ', 'e', false], ['ಒ', 'o', false],
  ];
  return (
    <ObScreen>
      <ObLessonHeader step={2}></ObLessonHeader>
      <div style={{ padding: '26px 24px 0' }}>
        <h1 style={{ margin: 0, fontFamily: obDISPLAY, fontWeight: 800, fontSize: 30, color: 'var(--kb-ink)' }}>The vowel sounds</h1>
        <p style={{ margin: '8px 0 0', fontFamily: obBODY, fontSize: 15.5, lineHeight: 1.45, color: 'var(--kb-ink-caption)' }}>Hear it first, then say it. Tap each one.</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '20px 24px 0', background: '#fff', border: '1px solid var(--kb-hairline)', borderRadius: 16, boxShadow: '0 4px 0 var(--kb-card-lip)', padding: '12px 16px' }}>
        <img src="assets/tongue-a.png" alt="Mouth position: relaxed, tongue flat" style={{ width: 76, height: 106, objectFit: 'cover', borderRadius: 12, flexShrink: 0 }}></img>
        <span style={{ fontFamily: obBODY, fontSize: 14.5, lineHeight: 1.45, color: 'var(--kb-ink-caption)' }}>Vowels stay open — mouth relaxed, tongue flat.</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, padding: '20px 24px 0' }}>
        {vowels.map(([g, r, h]) => <ObVowelTile key={r} glyph={g} roman={r} heard={h}></ObVowelTile>)}
      </div>
      <div style={{ padding: '14px 24px 0', textAlign: 'center', fontFamily: obBODY, fontWeight: 700, fontSize: 13, color: 'var(--kb-gold-dark)' }}>3 of 8 heard</div>
      <div style={{ marginTop: 'auto', padding: '16px 24px 30px' }}>
        <LipButton variant="red" size="lg" fullWidth={true}>Next</LipButton>
      </div>
    </ObScreen>
  );
}

/* ── 7/7 You're ready (after) ──────────────────────────────────── */
function ObReadyRow({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#fff', border: '1px solid var(--kb-hairline)', borderRadius: 16, boxShadow: '0 4px 0 var(--kb-card-lip)', padding: '14px 16px' }}>
      <span style={{ width: 30, height: 30, borderRadius: 15, flexShrink: 0, background: 'var(--kb-gold)', boxShadow: '0 2px 0 var(--kb-gold-lip)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="check" size={15} color="var(--kb-gold-ink)" strokeWidth={3}></Icon>
      </span>
      <span style={{ fontFamily: obBODY, fontWeight: 500, fontSize: 15, lineHeight: 1.4, color: 'var(--kb-ink)' }}>{children}</span>
    </div>
  );
}

function ObReadyAfter() {
  return (
    <ObScreen>
      <ObLessonHeader step={7}></ObLessonHeader>
      <div style={{ textAlign: 'center', padding: '34px 24px 0' }}>
        <span style={{ width: 92, height: 92, borderRadius: 46, background: 'linear-gradient(180deg, #ffd24d 0%, #fdc003 100%)', boxShadow: '0 6px 0 var(--kb-gold-lip)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="check" size={44} color="var(--kb-gold-ink)" strokeWidth={3}></Icon>
        </span>
        <h1 style={{ margin: '20px 0 0', fontFamily: obDISPLAY, fontWeight: 800, fontSize: 32, color: 'var(--kb-ink)' }}>You're ready!</h1>
        <p style={{ margin: '8px 0 0', fontFamily: obBODY, fontSize: 15.5, color: 'var(--kb-ink-caption)' }}>Keep these four in your pocket:</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '24px 24px 0' }}>
        <ObReadyRow>Kannada is phonetic — say what you see.</ObReadyRow>
        <ObReadyRow>Long vowels change the word (kali vs kaali).</ObReadyRow>
        <ObReadyRow>Capital letters (Ta, Da, Na, La) mean curl your tongue.</ObReadyRow>
        <ObReadyRow>Double letters are held slightly longer.</ObReadyRow>
      </div>
      <div style={{ marginTop: 'auto', padding: '16px 24px 30px' }}>
        <LipButton variant="red" size="lg" icon="forward" fullWidth={true}>Start Lesson 1 · Greetings</LipButton>
      </div>
    </ObScreen>
  );
}

Object.assign(window, { ObVowelsAfter, ObReadyAfter });
