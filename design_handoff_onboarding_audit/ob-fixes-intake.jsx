// Onboarding audit — shared chrome + intake "after" screens
const { Icon, LipButton } = window.KannadaBekuDesignSystem_28dc81;

const obDISPLAY = "var(--kb-font-display, 'Baloo Tamma 2'), sans-serif";
const obBODY = "var(--kb-font-body, 'DM Sans'), sans-serif";
const obKANNADA = "'Noto Sans Kannada', sans-serif";
const obKOLAM = 'radial-gradient(rgba(27,29,14,0.05) 1px, transparent 1px)';

/* ── Device chrome ─────────────────────────────────────────────── */
function ObStatusBar({ light = false }) {
  const c = light ? '#fff' : 'var(--kb-ink)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 26px 6px', height: 34 }}>
      <span style={{ fontFamily: obBODY, fontWeight: 700, fontSize: 15, color: c }}>9:44</span>
      <span style={{ width: 112, height: 30, borderRadius: 15, background: '#0b0b0b', marginLeft: 6 }}></span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><path d="M1.5 4.5a9.5 9.5 0 0 1 13 0M4 7a6 6 0 0 1 8 0M6.5 9.4a2.6 2.6 0 0 1 3 0" stroke={c} strokeWidth="1.7" strokeLinecap="round"></path><circle cx="8" cy="11" r="1" fill={c}></circle></svg>
        <svg width="22" height="11" viewBox="0 0 22 11" fill="none"><rect x="0.5" y="0.5" width="18" height="10" rx="3" stroke={c} opacity="0.5"></rect><rect x="2" y="2" width="15" height="7" rx="1.6" fill={c}></rect><path d="M20.5 3.5v4a2 2 0 0 0 0-4z" fill={c} opacity="0.5"></path></svg>
      </span>
    </div>
  );
}

function ObScreen({ children, bg = 'var(--kb-cream)', kolam = true, light = false, style }) {
  return (
    <div style={{
      width: 390, height: 844, background: bg,
      ...(kolam ? { backgroundImage: obKOLAM, backgroundSize: '24px 24px' } : {}),
      display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative',
      fontFamily: obBODY, ...style,
    }}>
      <ObStatusBar light={light} />
      {children}
    </div>
  );
}

/* ── Intake chrome: ONE progress system ────────────────────────── */
function ObStepProgress({ step, total = 4, onSkip }) {
  return (
    <div style={{ padding: '10px 24px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, display: 'flex', gap: 6 }}>
          {Array.from({ length: total }).map((_, i) => (
            <span key={i} style={{
              flex: 1, height: 6, borderRadius: 3,
              background: i < step ? 'var(--kb-gold)' : 'rgba(27,29,14,0.10)',
            }}></span>
          ))}
        </div>
        {onSkip ? (
          <span style={{ fontFamily: obBODY, fontWeight: 700, fontSize: 13.5, color: 'var(--kb-ink-faint)', letterSpacing: 0.2 }}>Skip</span>
        ) : null}
      </div>
    </div>
  );
}

function ObStepTitle({ step, title, sub }) {
  return (
    <div style={{ padding: '28px 24px 0' }}>
      <h1 style={{ margin: 0, fontFamily: obDISPLAY, fontWeight: 800, fontSize: 32, lineHeight: 1.12, color: 'var(--kb-ink)', letterSpacing: -0.3 }}>{title}</h1>
      {sub ? <p style={{ margin: '10px 0 0', fontFamily: obBODY, fontSize: 15.5, lineHeight: 1.45, color: 'var(--kb-ink-caption)' }}>{sub}</p> : null}
    </div>
  );
}

function ObFooter({ continueEnabled = true, continueLabel = 'Continue' }) {
  return (
    <div style={{ marginTop: 'auto', padding: '16px 24px 30px', display: 'flex', gap: 12 }}>
      <LipButton variant="white" size="lg" style={{ flex: '0 0 33%' }}>Back</LipButton>
      <LipButton variant="red" size="lg" icon="forward" disabled={!continueEnabled} style={{ flex: 1 }}>{continueLabel}</LipButton>
    </div>
  );
}

/* ── Welcome (after) ───────────────────────────────────────────── */
function ObValueCard({ icon, title, sub, tilt = 0 }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14, background: '#fff',
      borderRadius: 16, padding: '14px 18px', boxShadow: '0 5px 0 rgba(74,0,14,0.45)',
      transform: `rotate(${tilt}deg)`,
    }}>
      <span style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--kb-gold-fixed)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={icon} size={22} color="var(--kb-gold-ink)" strokeWidth={2}></Icon>
      </span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: 'block', fontFamily: obDISPLAY, fontWeight: 700, fontSize: 17, color: 'var(--kb-ink)' }}>{title}</span>
        <span style={{ display: 'block', fontFamily: obBODY, fontSize: 13.5, color: 'var(--kb-ink-caption)', marginTop: 1 }}>{sub}</span>
      </span>
    </div>
  );
}

function ObWelcomeAfter() {
  return (
    <ObScreen bg="linear-gradient(152deg, #91001b 0%, #be0027 100%)" kolam={false} light={true}>
      <div style={{ padding: '26px 24px 0', textAlign: 'center' }}>
        <div style={{ fontFamily: obKANNADA, fontWeight: 700, fontSize: 64, lineHeight: 1, color: '#fff' }}>ಬೇ</div>
        <div style={{ marginTop: 18, fontFamily: obDISPLAY, fontWeight: 800, fontSize: 33, color: '#fff' }}>Kannada <span style={{ fontFamily: obKANNADA, color: 'var(--kb-gold)' }}>ಬೇಕು</span></div>
        <p style={{ margin: '10px auto 0', maxWidth: 280, fontFamily: obBODY, fontSize: 15.5, lineHeight: 1.45, color: 'rgba(255,255,255,0.92)' }}>Welcome! Let's learn Kannada together.</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '28px 26px 0' }}>
        <ObValueCard icon="target" title="Speak from day one" sub="Real phrases, not grammar drills" tilt={-0.8}></ObValueCard>
        <ObValueCard icon="sos" title="Never get stuck" sub="Survival phrases · works offline" tilt={0.8}></ObValueCard>
        <ObValueCard icon="flame" title="5 minutes a day" sub="Small streaks, real progress" tilt={-0.8}></ObValueCard>
      </div>
      <div style={{ marginTop: 'auto', background: '#fff', borderRadius: '28px 28px 0 0', padding: '26px 24px 30px', boxShadow: '0 -14px 34px rgba(0,0,0,0.22)' }}>
        <div style={{ textAlign: 'center', fontFamily: obDISPLAY, fontWeight: 800, fontSize: 25, color: 'var(--kb-ink)' }}>Let's get you talking</div>
        <div style={{ textAlign: 'center', fontFamily: obBODY, fontSize: 14.5, color: 'var(--kb-ink-caption)', margin: '4px 0 18px' }}>Free · no card · works offline</div>
        <LipButton variant="red" size="lg" icon="forward" fullWidth={true}>Get Started</LipButton>
      </div>
    </ObScreen>
  );
}

/* ── Step 1 · Name (after) ─────────────────────────────────────── */
function ObNameAfter() {
  return (
    <ObScreen>
      <ObStepProgress step={1}></ObStepProgress>
      <ObStepTitle step={1} title="What should we call you?" sub="So lessons can greet you properly — Namaskāra!"></ObStepTitle>
      <div style={{ padding: '26px 24px 0' }}>
        <div style={{
          display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 16,
          border: '1px solid var(--kb-hairline-strong)', boxShadow: '0 4px 0 var(--kb-card-lip)',
          padding: '17px 18px',
        }}>
          <span style={{ fontFamily: obDISPLAY, fontWeight: 700, fontSize: 19, color: 'var(--kb-ink)' }}>Aashmika</span>
          <span style={{ width: 2, height: 22, background: 'var(--kb-red)', marginLeft: 2, borderRadius: 1 }}></span>
        </div>
        <div style={{ marginTop: 10, fontFamily: obBODY, fontSize: 13.5, color: 'var(--kb-ink-faint)' }}>Just a first name is perfect.</div>
      </div>
      <ObFooter continueEnabled={true}></ObFooter>
    </ObScreen>
  );
}

/* ── Step 2 · Why (after) ──────────────────────────────────────── */
function ObWhyOption({ icon, label, selected }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, width: '100%',
      background: selected ? 'var(--kb-red-soft)' : '#fff',
      border: `2px solid ${selected ? 'var(--kb-red)' : 'rgba(27,29,14,0.10)'}`,
      borderRadius: 16, padding: '12px 14px', boxShadow: selected ? 'none' : '0 3px 0 var(--kb-card-lip)',
    }}>
      <span style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: selected ? '#fff' : 'var(--kb-cream-low)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={19} color={selected ? 'var(--kb-red)' : 'var(--kb-ink-caption)'} strokeWidth={2}></Icon>
      </span>
      <span style={{ flex: 1, fontFamily: obDISPLAY, fontWeight: 700, fontSize: 15.5, lineHeight: 1.2, color: 'var(--kb-ink)' }}>{label}</span>
      <span style={{
        width: 22, height: 22, borderRadius: 7, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: selected ? 'var(--kb-red)' : 'transparent', border: selected ? 'none' : '2px solid rgba(27,29,14,0.18)',
      }}>
        {selected ? <Icon name="check" size={13} color="#fff" strokeWidth={3}></Icon> : null}
      </span>
    </div>
  );
}

function ObWhyAfter() {
  return (
    <ObScreen>
      <ObStepProgress step={2} onSkip={true}></ObStepProgress>
      <ObStepTitle step={2} title="Why are you learning Kannada?" sub="Pick what fits — we'll shape your lessons around it."></ObStepTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '22px 24px 0' }}>
        <ObWhyOption icon="moodHappy" label="Don't want to feel like an outsider" selected={true}></ObWhyOption>
        <ObWhyOption icon="chat" label="Connect better with Kannadiga friends" selected={false}></ObWhyOption>
        <ObWhyOption icon="globe" label="Navigate daily life in Bengaluru" selected={true}></ObWhyOption>
        <ObWhyOption icon="bolt" label="Stop getting overcharged (auto, markets)" selected={false}></ObWhyOption>
        <ObWhyOption icon="sparkle" label="Impress someone special" selected={false}></ObWhyOption>
        <ObWhyOption icon="home" label="Talk to family and in-laws" selected={false}></ObWhyOption>
      </div>
      <div style={{ padding: '12px 24px 0', fontFamily: obBODY, fontWeight: 700, fontSize: 13, color: 'var(--kb-gold-dark)' }}>2 of 3 picked</div>
      <ObFooter continueEnabled={true}></ObFooter>
    </ObScreen>
  );
}

/* ── Step 3 · Time (after) ─────────────────────────────────────── */
function ObTimeOption({ title, sub, badge, selected }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14, width: '100%',
      background: selected ? 'var(--kb-red-soft)' : '#fff',
      border: `2px solid ${selected ? 'var(--kb-red)' : 'rgba(27,29,14,0.10)'}`,
      borderRadius: 16, padding: '16px 18px', boxShadow: selected ? 'none' : '0 3px 0 var(--kb-card-lip)',
    }}>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: obDISPLAY, fontWeight: 700, fontSize: 18, color: 'var(--kb-ink)' }}>{title}</span>
          {badge ? <span style={{ fontFamily: obBODY, fontWeight: 700, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase', color: 'var(--kb-gold-ink)', background: 'var(--kb-gold-fixed)', borderRadius: 999, padding: '3px 9px 2px', whiteSpace: 'nowrap' }}>{badge}</span> : null}
        </span>
        <span style={{ display: 'block', fontFamily: obBODY, fontSize: 13.5, color: 'var(--kb-ink-caption)', marginTop: 3 }}>{sub}</span>
      </span>
      <span style={{
        width: 24, height: 24, borderRadius: 12, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: selected ? 'var(--kb-red)' : 'transparent', border: selected ? 'none' : '2px solid rgba(27,29,14,0.18)',
      }}>
        {selected ? <span style={{ width: 8, height: 8, borderRadius: 4, background: '#fff' }}></span> : null}
      </span>
    </div>
  );
}

function ObTimeAfter() {
  return (
    <ObScreen>
      <ObStepProgress step={3} onSkip={true}></ObStepProgress>
      <ObStepTitle step={3} title="How much time can you commit?" sub="Your daily goal — you can change it anytime in Profile."></ObStepTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '24px 24px 0' }}>
        <ObTimeOption title="5 min / day" sub="Quick daily habit · about one scenario" selected={false}></ObTimeOption>
        <ObTimeOption title="10 min / day" sub="Steady progress · scenario + practice" badge="Most popular" selected={true}></ObTimeOption>
        <ObTimeOption title="20 min / day" sub="Serious learner · everything, daily" selected={false}></ObTimeOption>
      </div>
      <ObFooter continueEnabled={true}></ObFooter>
    </ObScreen>
  );
}

Object.assign(window, { ObScreen, ObStatusBar, ObWelcomeAfter, ObNameAfter, ObWhyAfter, ObTimeAfter, obDISPLAY, obBODY, obKANNADA });
