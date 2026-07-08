// Onboarding audit — extra "after" screens: 3/7 short vs long, 6/7 rhythm, post-intake greeting
const { Icon, LipButton } = window.KannadaBekuDesignSystem_28dc81;

/* ── 3/7 Short vs. long (after) — answer feedback state ────────── */
function ObHearCard({ glyph, roman, gloss }) {
  return (
    <div style={{ flex: 1, background: '#fff', border: '1px solid var(--kb-hairline)', borderRadius: 16, boxShadow: '0 4px 0 var(--kb-card-lip)', padding: '18px 14px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <span style={{ fontFamily: obKANNADA, fontWeight: 700, fontSize: 34, lineHeight: 1.1, color: 'var(--kb-ink)' }}>{glyph}</span>
      <span style={{ fontFamily: obBODY, fontWeight: 700, fontSize: 15, color: 'var(--kb-ink)' }}>{roman}</span>
      <span style={{ fontFamily: obBODY, fontSize: 12.5, color: 'var(--kb-ink-faint)' }}>{gloss}</span>
      <span style={{ marginTop: 8, width: 40, height: 40, borderRadius: 20, background: 'var(--kb-gold)', boxShadow: '0 3px 0 var(--kb-gold-lip)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="play" size={16} color="var(--kb-gold-ink)" strokeWidth={2.4}></Icon>
      </span>
    </div>
  );
}

function ObAnswerChip({ label, state }) {
  // state: 'idle' | 'correct'
  const correct = state === 'correct';
  return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      background: correct ? 'var(--kb-success-low)' : '#fff',
      border: `2px solid ${correct ? 'var(--kb-success)' : 'var(--kb-hairline-strong)'}`,
      borderRadius: 14, padding: '13px 0',
      boxShadow: `0 4px 0 ${correct ? 'var(--kb-success-lip)' : 'var(--kb-card-lip)'}`,
    }}>
      {correct ? <Icon name="check" size={15} color="var(--kb-on-success)" strokeWidth={3}></Icon> : null}
      <span style={{ fontFamily: obDISPLAY, fontWeight: 700, fontSize: 16.5, color: correct ? 'var(--kb-on-success)' : 'var(--kb-ink)' }}>{label}</span>
    </div>
  );
}

function ObShortLongAfter() {
  return (
    <ObScreen>
      <ObLessonHeader step={3}></ObLessonHeader>
      <div style={{ padding: '26px 24px 0' }}>
        <h1 style={{ margin: 0, fontFamily: obDISPLAY, fontWeight: 800, fontSize: 30, color: 'var(--kb-ink)' }}>Short vs. long</h1>
        <p style={{ margin: '8px 0 0', fontFamily: obBODY, fontSize: 15.5, lineHeight: 1.45, color: 'var(--kb-ink-caption)' }}>Hold a vowel longer and the word changes. Listen:</p>
      </div>
      <div style={{ display: 'flex', gap: 12, padding: '20px 24px 0' }}>
        <ObHearCard glyph="ಕಲಿ" roman="kali" gloss="learn"></ObHearCard>
        <ObHearCard glyph="ಕಾಲಿ" roman="kaali" gloss="empty"></ObHearCard>
      </div>
      <div style={{ margin: '18px 24px 0', background: 'var(--kb-cream-low)', borderRadius: 16, padding: '14px 16px 16px' }}>
        <div style={{ fontFamily: obBODY, fontWeight: 700, fontSize: 12, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--kb-gold-dark)' }}>Which did you hear?</div>
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#fff', border: '1px solid var(--kb-hairline)', borderRadius: 12, boxShadow: '0 3px 0 var(--kb-card-lip)', padding: '11px 0' }}>
          <span style={{ width: 24, height: 24, borderRadius: 12, background: 'var(--kb-gold)', boxShadow: '0 2px 0 var(--kb-gold-lip)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="play" size={11} color="var(--kb-gold-ink)" strokeWidth={2.6}></Icon>
          </span>
          <span style={{ fontFamily: obDISPLAY, fontWeight: 700, fontSize: 15, color: 'var(--kb-ink)' }}>Play a sound</span>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          <ObAnswerChip label="kali" state="idle"></ObAnswerChip>
          <ObAnswerChip label="kaali" state="correct"></ObAnswerChip>
        </div>
        <div style={{ marginTop: 10, textAlign: 'center', fontFamily: obBODY, fontWeight: 700, fontSize: 13.5, color: 'var(--kb-on-success)' }}>Correct! Well done.</div>
      </div>
      <div style={{ marginTop: 'auto', padding: '16px 24px 30px' }}>
        <LipButton variant="red" size="lg" fullWidth={true}>Next</LipButton>
      </div>
    </ObScreen>
  );
}

/* ── 6/7 The rhythm (after) — play demoted from gold CTA ───────── */
function ObBeatChip({ label, active }) {
  return (
    <span style={{
      fontFamily: obBODY, fontWeight: 700, fontSize: 14.5,
      color: active ? 'var(--kb-gold-ink)' : 'var(--kb-ink)',
      background: active ? 'var(--kb-gold)' : 'var(--kb-cream-low)',
      boxShadow: active ? '0 2px 0 var(--kb-gold-lip)' : 'none',
      borderRadius: 10, padding: '7px 13px 6px',
    }}>{label}</span>
  );
}

function ObRhythmAfter() {
  return (
    <ObScreen>
      <ObLessonHeader step={6}></ObLessonHeader>
      <div style={{ padding: '26px 24px 0' }}>
        <h1 style={{ margin: 0, fontFamily: obDISPLAY, fontWeight: 800, fontSize: 30, color: 'var(--kb-ink)' }}>The rhythm</h1>
        <p style={{ margin: '8px 0 0', fontFamily: obBODY, fontSize: 15.5, lineHeight: 1.45, color: 'var(--kb-ink-caption)' }}>Kannada is even — every syllable gets its own beat. Tap to hear:</p>
      </div>
      <div style={{ margin: '20px 24px 0', background: '#fff', border: '1px solid var(--kb-hairline)', borderRadius: 16, boxShadow: '0 4px 0 var(--kb-card-lip)', padding: '22px 18px' }}>
        <div style={{ textAlign: 'center', fontFamily: obKANNADA, fontWeight: 700, fontSize: 26, color: 'var(--kb-ink)' }}>ನನಗೆ ಕನ್ನಡ ಬೇಕು</div>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
          <ObBeatChip label="na" active={true}></ObBeatChip>
          <ObBeatChip label="na" active={false}></ObBeatChip>
          <ObBeatChip label="ge" active={false}></ObBeatChip>
          <ObBeatChip label="kan" active={false}></ObBeatChip>
          <ObBeatChip label="na" active={false}></ObBeatChip>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 8 }}>
          <ObBeatChip label="da" active={false}></ObBeatChip>
          <ObBeatChip label="bē" active={false}></ObBeatChip>
          <ObBeatChip label="ku" active={false}></ObBeatChip>
        </div>
        <div style={{ marginTop: 16, textAlign: 'center', fontFamily: obBODY, fontSize: 13.5, color: 'var(--kb-ink-faint)' }}>"I want Kannada" — Nanage Kannada bēku</div>
        <div style={{ margin: '14px auto 0', width: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, background: '#fff', border: '1px solid var(--kb-hairline-strong)', borderRadius: 999, boxShadow: '0 3px 0 var(--kb-card-lip)', padding: '10px 0' }}>
          <span style={{ width: 26, height: 26, borderRadius: 13, background: 'var(--kb-gold)', boxShadow: '0 2px 0 var(--kb-gold-lip)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="play" size={12} color="var(--kb-gold-ink)" strokeWidth={2.6}></Icon>
          </span>
          <span style={{ fontFamily: obDISPLAY, fontWeight: 700, fontSize: 15.5, color: 'var(--kb-ink)' }}>Hear the beat</span>
        </div>
      </div>
      <div style={{ marginTop: 'auto', padding: '16px 24px 30px' }}>
        <LipButton variant="red" size="lg" fullWidth={true}>Next</LipButton>
      </div>
    </ObScreen>
  );
}

/* ── Post-intake greeting (new screen, after step 4) ───────────── */
function ObPlanChip({ icon, label }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#fff', border: '1px solid var(--kb-hairline)', borderRadius: 999, boxShadow: '0 3px 0 var(--kb-card-lip)', padding: '8px 15px 7px' }}>
      <Icon name={icon} size={15} color="var(--kb-gold-dark)" strokeWidth={2.2}></Icon>
      <span style={{ fontFamily: obBODY, fontWeight: 700, fontSize: 13.5, color: 'var(--kb-ink)' }}>{label}</span>
    </span>
  );
}

function ObGreetingAfter() {
  return (
    <ObScreen>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 30px', textAlign: 'center' }}>
        <span style={{ width: 96, height: 96, borderRadius: 26, background: 'var(--kb-gradient-red)', boxShadow: '0 6px 0 var(--kb-red-lip)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: obKANNADA, fontWeight: 700, fontSize: 48, lineHeight: 1, color: 'var(--kb-gold)' }}>ಕ</span>
        </span>
        <h1 style={{ margin: '24px 0 0', fontFamily: obDISPLAY, fontWeight: 800, fontSize: 34, lineHeight: 1.1, color: 'var(--kb-ink)' }}>Namaskāra, Aashmika!</h1>
        <p style={{ margin: '10px 0 0', maxWidth: 280, fontFamily: obBODY, fontSize: 15.5, lineHeight: 1.5, color: 'var(--kb-ink-caption)' }}>Your plan is ready — built around what you picked.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: 22 }}>
          <ObPlanChip icon="clock" label="10 min / day"></ObPlanChip>
          <ObPlanChip icon="globe" label="Daily life in Bengaluru"></ObPlanChip>
          <ObPlanChip icon="moodHappy" label="Belonging"></ObPlanChip>
        </div>
      </div>
      <div style={{ padding: '16px 24px 30px' }}>
        <LipButton variant="red" size="lg" icon="forward" fullWidth={true}>Start Kannada basics</LipButton>
      </div>
    </ObScreen>
  );
}

Object.assign(window, { ObShortLongAfter, ObRhythmAfter, ObGreetingAfter });
