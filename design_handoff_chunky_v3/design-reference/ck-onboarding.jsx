// ck-onboarding.jsx — onboarding flow from app/onboarding/*.tsx in the chunky kit.
// welcome → name → goal → motivation → commitment → basics primer.

// Progress dots (ProgressDots: 6 steps)
function CKOBDots({ current = 0, total = 6 }) {
  return (
    <div style={{ display: 'flex', gap: 7, justifyContent: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} style={{
          width: i === current ? 22 : 8, height: 8, borderRadius: 5,
          background: i === current ? 'var(--red2)' : 'rgba(27,29,14,0.14)',
          transition: 'all 150ms ease',
        }}></span>
      ))}
    </div>
  );
}

function CKOBStep({ children }) {
  return <div style={{ fontFamily: CK_BODY, fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--faint)', marginBottom: 8 }}>{children}</div>;
}

function CKOBTitle({ children }) {
  return <div style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 27, lineHeight: 1.2, letterSpacing: -0.3 }}>{children}</div>;
}

function CKOBSub({ children, mb = 26 }) {
  return <div style={{ fontFamily: CK_BODY, fontWeight: 500, fontSize: 14.5, color: 'var(--muted)', marginTop: 6, marginBottom: mb }}>{children}</div>;
}

// Back (1fr neutral) + Continue (2fr red) — chunky versions of the codebase pair.
function CKOBFooter({ continueLabel = 'Continue', disabled = false }) {
  return (
    <div style={{ display: 'flex', gap: 10, paddingBottom: 24 }}>
      <CK as="button" lip={4} style={{
        flex: 1, fontFamily: CK_DISPLAY, fontWeight: 700, fontSize: 15, color: 'var(--ink)',
        background: '#fff', border: CK_HAIRLINE, borderRadius: 'var(--r)', padding: '15px 0 13px', whiteSpace: 'nowrap',
      }}>Back</CK>
      <CK as="button" lip={4} lipColor={disabled ? 'rgba(27,29,14,0.12)' : 'var(--redLip)'} style={{
        flex: 1, fontFamily: CK_DISPLAY, fontWeight: 700, fontSize: 15, color: '#fff',
        background: disabled ? '#c8c4b0' : 'var(--red2)', border: 'none', borderRadius: 'var(--r)', padding: '15px 0 13px', whiteSpace: 'nowrap',
      }}>{continueLabel}</CK>
    </div>
  );
}

// Option card (OptionCard.tsx): selected = pale red wash + 2px red border + check.
function CKOptionCard({ label, sub, selected, info }) {
  return (
    <CK lip={selected ? 4 : 3} lipColor={selected ? 'rgba(145,0,27,0.25)' : 'rgba(27,29,14,0.10)'} style={{
      background: selected ? '#fff5f5' : '#fff',
      border: selected ? '2px solid var(--red2)' : '2px solid rgba(27,29,14,0.10)',
      borderRadius: 'var(--r)', padding: sub ? '14px 16px' : '15px 16px 13px',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: CK_DISPLAY, fontWeight: 700, fontSize: 15.5, lineHeight: 1.25 }}>{label}</div>
        {sub && <div style={{ fontFamily: CK_BODY, fontWeight: 500, fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>{sub}</div>}
      </div>
      {selected ? (
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--red2)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <CKIcon d={CKPaths.check} size={13} stroke={3} color="#fff" />
        </div>
      ) : info ? (
        <span style={{ color: 'var(--faint)', flexShrink: 0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="8.4"></circle><path d="M12 11v5M12 7.8v.2"></path></svg>
        </span>
      ) : null}
    </CK>
  );
}

// ── 1 · Welcome ───────────────────────────────────────────
const CKOB_GLYPHS = [
  { g: 'ಅ', top: '6%', left: '8%', size: 34, rot: -12 },
  { g: 'ಕ', top: '4%', right: '24%', size: 26, rot: 9 },
  { g: 'ಮ', top: '16%', right: '7%', size: 38, rot: 14 },
  { g: 'ನ', top: '30%', left: '4%', size: 28, rot: -8 },
  { g: 'ಹ', top: '44%', right: '5%', size: 30, rot: -14 },
  { g: 'ಬ', top: '52%', left: '10%', size: 24, rot: 10 },
];

const CKOB_HOOKS = [
  { icon: 'mic', t: 'Speak from day one', s: 'Real phrases, not grammar drills', rot: -3 },
  { icon: 'alert', t: 'Never get stuck', s: 'Survival phrases · works offline', rot: 2.5 },
  { icon: 'flame', t: '5 minutes a day', s: 'Small streaks, real progress', rot: -1.5 },
];

function CKOBWelcome() {
  return (
    <CKPhone pad="0" bg="linear-gradient(160deg, var(--red2), var(--red))">
      {/* gold bloom */}
      <div style={{ position: 'absolute', top: -90, right: -70, width: 260, height: 260, borderRadius: '50%', background: 'var(--gold)', opacity: 0.18, pointerEvents: 'none' }}></div>
      {/* floating glyphs (Watermark motif="glyphs") */}
      {CKOB_GLYPHS.map((w, i) => (
        <span key={i} aria-hidden="true" style={{
          position: 'absolute', top: w.top, left: w.left, right: w.right,
          fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: w.size, lineHeight: 1.4,
          color: 'rgba(255,255,255,0.10)', transform: `rotate(${w.rot}deg)`, pointerEvents: 'none',
        }}>{w.g}</span>
      ))}

      {/* hero */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '54px 36px 0' }}>
        <div style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 64, lineHeight: 1.4, color: '#fff', textShadow: '0 2px 8px rgba(110,0,20,0.35)' }}>ಬಾ</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
          <span style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 33, letterSpacing: -0.8, color: '#fff' }}>Kannada</span>
          <span style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 34, color: 'var(--gold)' }}>ಬಾ</span>
        </div>
        <div style={{ fontFamily: CK_BODY, fontWeight: 500, fontSize: 14.5, lineHeight: 1.5, color: 'rgba(255,255,255,0.92)', marginTop: 8, maxWidth: 270 }}>
          Speak enough Kannada to feel at home in Bengaluru.
        </div>
      </div>

      {/* fanned hook cards filling the gradient */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 13, padding: '18px 44px 22px' }}>
        {CKOB_HOOKS.map((f) => (
          <div key={f.t} style={{
            background: '#fff', borderRadius: 'var(--r)',
            boxShadow: '0 4px 0 rgba(0,0,0,0.30)', padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
            transform: `rotate(${f.rot}deg)`,
          }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--goldPale)', display: 'grid', placeItems: 'center', color: 'var(--goldDeep)', flexShrink: 0 }}>
              <CKIcon d={CKPaths[f.icon]} size={19} stroke={2} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: CK_DISPLAY, fontWeight: 700, fontSize: 15, lineHeight: 1.2, color: 'var(--ink)' }}>{f.t}</div>
              <div style={{ fontFamily: CK_BODY, fontWeight: 600, fontSize: 11.5, color: 'var(--muted)', marginTop: 1 }}>{f.s}</div>
            </div>
          </div>
        ))}
      </div>

      {/* actions sheet */}
      <div style={{
        background: 'var(--surface)', borderRadius: '28px 28px 0 0',
        padding: '24px 28px 28px', flexShrink: 0, position: 'relative', zIndex: 2,
        backgroundImage: 'radial-gradient(circle, rgba(27,29,14,var(--wmA, 0)) 1.2px, transparent 1.4px)', backgroundSize: '24px 24px',
      }}>
        <CKOBDots current={0} />
        <div style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 22, letterSpacing: -0.3, textAlign: 'center', marginTop: 14 }}>Let’s get you talking</div>
        <div style={{ fontFamily: CK_BODY, fontWeight: 500, fontSize: 13.5, color: 'var(--muted)', textAlign: 'center', margin: '3px 0 16px' }}>Free · no card · works offline</div>
        <CK as="button" lip={5} lipColor="var(--redLip)" style={{
          width: '100%', fontFamily: CK_DISPLAY, fontWeight: 700, fontSize: 16, color: '#fff',
          background: 'var(--red2)', border: 'none', borderRadius: 'var(--r)', padding: '16px 0 14px', whiteSpace: 'nowrap',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>Get Started <CKIcon d={CKPaths.chevron} size={17} stroke={2.4} /></CK>
      </div>
    </CKPhone>
  );
}

// ── 2 · Name ──────────────────────────────────────────────
function CKOBName() {
  return (
    <CKPhone pad="26px 28px 0">
      <CKOBDots current={1} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <CKOBStep>Step 1 of 5</CKOBStep>
        <CKOBTitle>What should we<br />call you?</CKOBTitle>
        <CKOBSub>We’ll use this throughout the app.</CKOBSub>
        <div style={{
          background: '#fff', border: '2px solid var(--red2)', borderRadius: 'var(--r)',
          boxShadow: '0 4px 0 rgba(145,0,27,0.20)', padding: '17px 18px',
          fontFamily: CK_BODY, fontWeight: 500, fontSize: 16, display: 'flex', alignItems: 'center',
        }}>
          Sameecha<span style={{ width: 2, height: 20, background: 'var(--red2)', marginLeft: 2, borderRadius: 1 }}></span>
        </div>
      </div>
      <CKOBFooter />
    </CKPhone>
  );
}

// ── 3 · Goal ──────────────────────────────────────────────
function CKOBGoal() {
  return (
    <CKPhone pad="26px 28px 0">
      <CKOBDots current={2} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <CKOBStep>Step 2 of 5</CKOBStep>
        <CKOBTitle>What do you want to learn?</CKOBTitle>
        <CKOBSub>Choose your learning focus</CKOBSub>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <CKOptionCard label="Spoken only" sub="I want to speak and understand Kannada" selected />
          <CKOptionCard label="Written only" sub="I want to read and write Kannada script" />
          <CKOptionCard label="Both" sub="I want the full experience" />
        </div>
      </div>
      <CKOBFooter />
    </CKPhone>
  );
}

// ── 4 · Motivation ────────────────────────────────────────
const CK_MOTIVATIONS = [
  ["Don't want to feel like an outsider", true],
  ['Connect better with Kannadiga friends', false],
  ['Navigate daily life in Bengaluru', true],
  ['Stop getting overcharged (auto, markets)', false],
  ['Impress someone special', false],
  ['Understand Kannada slang and humour', false],
  ['Read signboards and menus', false],
  ['Career / professional reasons', false],
  ['Other', false],
];

function CKOBMotivation() {
  return (
    <CKPhone pad="26px 28px 0">
      <CKOBDots current={3} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <CKOBStep>Step 3 of 5</CKOBStep>
        <CKOBTitle>Why are you learning Kannada?</CKOBTitle>
        <CKOBSub mb={18}>Pick up to 3 (2/3 selected)</CKOBSub>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {CK_MOTIVATIONS.map(([m, sel]) => <CKOptionCard key={m} label={m} selected={sel} />)}
        </div>
      </div>
      <div style={{ height: 18, flexShrink: 0 }}></div>
      <CKOBFooter />
    </CKPhone>
  );
}

// ── 5 · Commitment ────────────────────────────────────────
function CKOBCommitment() {
  return (
    <CKPhone pad="26px 28px 0">
      <CKOBDots current={4} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <CKOBStep>Step 4 of 5</CKOBStep>
        <CKOBTitle>How much time can<br />you commit?</CKOBTitle>
        <CKOBSub>Set your daily learning goal</CKOBSub>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <CKOptionCard label="5 min / day" sub="Quick daily habit" info />
          <CKOptionCard label="10 min / day" sub="Steady progress" selected />
          <CKOptionCard label="20 min / day" sub="Serious learner" info />
        </div>
      </div>
      <CKOBFooter />
    </CKPhone>
  );
}

// ── 6 · Basics primer (guide pager) ───────────────────────
function CKOBBasics() {
  return (
    <CKPhone pad="26px 28px 0">
      <CKOBDots current={5} />
      <div style={{ marginTop: 22 }}><CKOBStep>Step 5 of 5</CKOBStep></div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16 }}>
        <CK lip={4} style={{
          background: '#fff', border: CK_HAIRLINE, borderRadius: 'var(--r)',
          padding: '26px 22px', textAlign: 'center',
        }}>
          <div style={{ fontFamily: CK_BODY, fontWeight: 700, fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase', color: 'var(--goldDeep)' }}>Kannada basics</div>
          <div style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 22, letterSpacing: -0.3, marginTop: 6 }}>How Kannada works</div>
          <div style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 64, lineHeight: 1.4, color: 'var(--red2)', margin: '10px 0 2px' }}>ಅ</div>
          <div style={{ fontFamily: CK_BODY, fontWeight: 700, fontSize: 15, color: 'var(--ink)' }}>"a" — like the u in <i>up</i></div>
          <div style={{ fontFamily: CK_BODY, fontWeight: 500, fontSize: 13, lineHeight: 1.55, color: 'var(--muted)', marginTop: 10, textWrap: 'pretty' }}>
            Every letter carries its own vowel sound. No silent letters — say what you see.
          </div>
        </CK>
        {/* guide dots */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} style={{ width: i === 0 ? 18 : 7, height: 7, borderRadius: 4, background: i === 0 ? 'var(--goldLip)' : 'rgba(27,29,14,0.14)' }}></span>
          ))}
        </div>
      </div>
      <div style={{ paddingBottom: 24 }}>
        <CK as="button" lip={5} lipColor="var(--redLip)" style={{
          width: '100%', fontFamily: CK_DISPLAY, fontWeight: 700, fontSize: 16, color: '#fff',
          background: 'var(--red2)', border: 'none', borderRadius: 'var(--r)', padding: '16px 0 14px',
        }}>Next</CK>
      </div>
    </CKPhone>
  );
}

Object.assign(window, { CKOBWelcome, CKOBName, CKOBGoal, CKOBMotivation, CKOBCommitment, CKOBBasics, CKOptionCard, CKOBDots });
