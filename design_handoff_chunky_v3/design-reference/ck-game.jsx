// ck-game.jsx — game flow from app/(games)/[game]/* + src/games/quickquiz:
// lesson selector → quiz round (timer, options, score) → shared result screen.

// ── 1 · Lesson selector (LessonSelector.tsx) ──────────────
function CKGSelector() {
  const rows = [
    { n: 1, t: 'Greetings', g: 'ನ', unlocked: true },
    { n: 2, t: 'Names', g: 'ಹ', unlocked: true },
    { n: 3, t: 'Wanting', g: 'ಬೇ', unlocked: false },
    { n: 4, t: 'Pointing', g: 'ಇ', unlocked: false },
  ];
  return (
    <CKPhone pad="16px 20px 0" bg="var(--surface)">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <CK lip={3} style={{
          width: 38, height: 38, borderRadius: '50%', background: '#fff',
          border: CK_HAIRLINE, display: 'grid', placeItems: 'center', color: 'var(--ink)', flexShrink: 0,
        }}>
          <CKIcon d={CKPaths.back} size={17} stroke={2.2} />
        </CK>
        <div>
          <div style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 22, lineHeight: 1.15 }}>Quick quiz</div>
          <div style={{ fontFamily: CK_BODY, fontWeight: 500, fontSize: 12.5, color: 'var(--faint)', marginTop: 2 }}>Pick a lesson to play with</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rows.map((r) => r.unlocked ? (
          <CK key={r.n} lip={4} style={{
            background: '#fff', border: CK_HAIRLINE, borderRadius: 'var(--r)',
            padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 13,
          }}>
            <div style={{ width: 42, height: 42, borderRadius: 13, background: 'var(--goldPale)', display: 'grid', placeItems: 'center', fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 19, color: 'var(--goldDeep)', flexShrink: 0 }}>{r.g}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: CK_DISPLAY, fontWeight: 700, fontSize: 16, lineHeight: 1.25 }}>Lesson {r.n}</div>
              <div style={{ fontFamily: CK_BODY, fontWeight: 500, fontSize: 12.5, color: 'var(--muted)' }}>{r.t}</div>
            </div>
            <span style={{ color: 'var(--faint)' }}><CKIcon d={CKPaths.chevron} size={18} stroke={2.2} /></span>
          </CK>
        ) : (
          <div key={r.n} style={{
            background: 'var(--surfaceLow)', borderRadius: 'var(--r)', opacity: 0.65,
            padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 13,
          }}>
            <div style={{ width: 42, height: 42, borderRadius: 13, background: 'rgba(27,29,14,0.06)', flexShrink: 0 }}></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: CK_DISPLAY, fontWeight: 700, fontSize: 16, lineHeight: 1.25, color: 'var(--muted)' }}>Lesson {r.n}</div>
              <div style={{ fontFamily: CK_BODY, fontWeight: 500, fontSize: 12.5, color: 'var(--faint)' }}>{r.t}</div>
            </div>
            <span style={{ color: 'var(--faint)' }}><CKIcon d={CKPaths.lock} size={17} stroke={1.9} /></span>
          </div>
        ))}
      </div>
      <div style={{ fontFamily: CK_BODY, fontWeight: 500, fontSize: 12, color: 'var(--faint)', marginTop: 14, lineHeight: 1.5 }}>
        Finish a lesson on the Learn tab to unlock it here.
      </div>
    </CKPhone>
  );
}

// ── 2 · Quiz round (QuickQuizGame.tsx) ────────────────────
function CKGRound() {
  const opts = [
    { t: 'how are you?', state: 'idle' },
    { t: 'hello', state: 'correct' },
    { t: 'thank you', state: 'wrong' },
    { t: 'see you', state: 'idle' },
  ];
  return (
    <CKPhone pad="16px 20px 0" bg="var(--surface)">
      {/* header: exit · question · score */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
        <CK lip={3} style={{
          width: 38, height: 38, borderRadius: '50%', background: '#fff',
          border: CK_HAIRLINE, display: 'grid', placeItems: 'center', color: 'var(--ink)', flexShrink: 0,
        }}>
          <CKIcon d={CKPaths.close} size={15} stroke={2.2} />
        </CK>
        <span style={{ fontFamily: CK_BODY, fontWeight: 500, fontSize: 13.5, color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>Question 3 / 10</span>
        <span style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 15, fontVariantNumeric: 'tabular-nums' }}>Score 2</span>
      </div>
      {/* timer bar */}
      <div style={{ marginBottom: 18 }}><CKBar frac={0.6} color="var(--gold)" h={8} /></div>

      {/* prompt */}
      <CK lip={4} style={{
        background: '#fff', border: CK_HAIRLINE, borderRadius: 'var(--r)',
        padding: '32px 20px', textAlign: 'center', marginBottom: 18,
      }}>
        <div style={{ fontFamily: CK_BODY, fontWeight: 700, fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase', color: 'var(--faint)' }}>What does this mean?</div>
        <div style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 38, lineHeight: 1.4, color: 'var(--ink)', marginTop: 6 }}>ನಮಸ್ಕಾರ</div>
        <div style={{ fontFamily: CK_BODY, fontWeight: 700, fontSize: 14, color: 'var(--muted)' }}>namaskāra</div>
      </CK>

      {/* 2×2 option grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
        {opts.map((o) => {
          const correct = o.state === 'correct', wrong = o.state === 'wrong';
          return (
            <CK key={o.t} lip={correct ? 4 : 3}
              lipColor={correct ? 'var(--goldLip)' : wrong ? 'rgba(145,0,27,0.30)' : 'rgba(27,29,14,0.10)'}
              style={{
                background: correct ? 'var(--goldPale)' : wrong ? 'var(--redPale)' : '#fff',
                border: correct ? '2px solid var(--goldLip)' : wrong ? '2px solid var(--red2)' : '2px solid rgba(27,29,14,0.10)',
                borderRadius: 'var(--r)', padding: '18px 14px 16px', textAlign: 'center',
                fontFamily: CK_DISPLAY, fontWeight: 700, fontSize: 15,
                color: correct ? 'var(--goldDeep)' : wrong ? 'var(--red)' : 'var(--ink)',
              }}>{o.t}</CK>
          );
        })}
      </div>

      {/* feedback banner */}
      <div style={{
        marginTop: 'auto', marginBottom: 24,
        background: 'var(--goldPale)', border: '1px solid var(--goldLip)', borderRadius: 'var(--r)',
        boxShadow: '0 4px 0 var(--goldLip)', padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gold)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <CKIcon d={CKPaths.check} size={16} stroke={3} color="#6c5000" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: CK_DISPLAY, fontWeight: 700, fontSize: 15, color: 'var(--goldDeep)' }}>Correct! · streak ×3</div>
          <div style={{ fontFamily: CK_BODY, fontWeight: 600, fontSize: 12, color: 'var(--goldDeep)', opacity: 0.8 }}>ನಮಸ್ಕಾರ means hello</div>
        </div>
        <span style={{ fontFamily: CK_DISPLAY, fontWeight: 700, fontSize: 13, color: 'var(--goldDeep)' }}>Next ▸</span>
      </div>
    </CKPhone>
  );
}

// ── 3 · Result (shared/ResultScreen.tsx) ──────────────────
function CKGResult() {
  // generative rangoli stand-in: concentric dotted rings, fill ∝ score
  const ringDots = (r, n, color, size = 5) => Array.from({ length: n }).map((_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return <circle key={r + '-' + i} cx={90 + r * Math.cos(a)} cy={90 + r * Math.sin(a)} r={size / 2} fill={color} />;
  });
  return (
    <CKPhone pad="16px 20px 0" bg="var(--surface)">
      <CK lip={3} style={{
        width: 38, height: 38, borderRadius: '50%', background: '#fff',
        border: CK_HAIRLINE, display: 'grid', placeItems: 'center', color: 'var(--ink)', flexShrink: 0,
      }}>
        <CKIcon d={CKPaths.close} size={15} stroke={2.2} />
      </CK>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 10 }}>
        <svg width="180" height="180" viewBox="0 0 180 180" style={{ display: 'block' }}>
          {ringDots(28, 8, 'var(--red2)')}
          {ringDots(48, 14, 'var(--gold)')}
          {ringDots(68, 20, 'var(--goldLip)', 4)}
          {ringDots(84, 26, 'rgba(27,29,14,0.18)', 3)}
          <circle cx="90" cy="90" r="14" fill="var(--red2)" />
        </svg>
        <div style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 22 }}>Well done!</div>
        <div style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 52, lineHeight: 1, color: 'var(--red2)', fontVariantNumeric: 'tabular-nums' }}>8</div>
        <div style={{ fontFamily: CK_BODY, fontWeight: 500, fontSize: 13.5, color: 'var(--muted)' }}>out of 10 correct</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--goldPale)', border: '1px solid var(--goldLip)', borderRadius: 99, padding: '6px 13px 5px' }}>
          <span style={{ color: 'var(--red2)', display: 'flex' }}><CKIcon d={CKPaths.flame} size={14} stroke={2.1} /></span>
          <span style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 13, color: 'var(--goldDeep)' }}>Best streak 5</span>
        </div>
      </div>
      <div style={{ padding: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0 }}>
        <CK as="button" lip={5} lipColor="var(--redLip)" style={{
          width: '100%', fontFamily: CK_DISPLAY, fontWeight: 700, fontSize: 16, color: '#fff',
          background: 'var(--red2)', border: 'none', borderRadius: 'var(--r)', padding: '16px 0 14px',
        }}>Play again</CK>
        <CK as="button" lip={4} style={{
          width: '100%', fontFamily: CK_DISPLAY, fontWeight: 700, fontSize: 14, color: 'var(--ink)',
          background: '#fff', border: CK_HAIRLINE, borderRadius: 'var(--r)', padding: '13px 0 11px',
        }}>Back to Practice</CK>
      </div>
    </CKPhone>
  );
}

Object.assign(window, { CKGSelector, CKGRound, CKGResult });
