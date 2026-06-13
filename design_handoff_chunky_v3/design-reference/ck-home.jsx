// ck-home.jsx — Home screen in the chunky kit, layout per the user's mock:
// greeting → daily goal rings card → words-learnt gold banner →
// emergency phrases (3 colored cards) → culture image card → tab bar.

const CK_PHRASES = [
  { kn: 'ದಯವಿಟ್ಟು ಸಹಾಯ ಮಾಡಿ', roman: 'Dayavittu sahaaya maadi', en: 'Please help!', color: 'var(--red2)', lip: 'var(--redLip)' },
  { kn: 'ಬಸ್ ಎಲ್ಲಿದೆ?', roman: 'Bus ellide?', en: 'Where is the bus?', color: 'var(--gold)', lip: 'var(--goldLip)', fg: 'var(--goldDeep)' },
  { kn: 'ನನಗೆ ಕನ್ನಡ ಬರಲ್ಲ', roman: 'Nanage Kannada baralla', en: 'I don\u2019t know Kannada', color: 'var(--red)', lip: '#4a000e' },
];

function CKPhraseCard({ p }) {
  return (
    <CK lip={4} style={{
      background: '#fff', border: CK_HAIRLINE, borderRadius: 'var(--r)',
      borderTop: `5px solid ${p.color}`,
      padding: '14px 16px 13px', boxSizing: 'border-box',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: CK_DISPLAY, fontWeight: 700, fontSize: 18, lineHeight: 1.25, color: p.fg || p.color }}>{p.kn}</div>
        <div style={{ fontFamily: CK_BODY, fontWeight: 700, fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{p.roman} · {p.en}</div>
      </div>
      <CKRound size={38} bg={p.color} lipColor={p.lip}>
        <CKIcon d={CKPaths.speaker} size={17} stroke={2} color={p.fg ? 'var(--goldDeep)' : '#fff'} />
      </CKRound>
    </CK>
  );
}

function PageHome() {
  return (
    <CKPhone>
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <CKAppBar />

        {/* Greeting */}
        <div style={{ margin: '4px 2px 16px' }}>
          <div style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 34, lineHeight: 1.05, color: 'var(--ink)' }}>
            Namaskāra, Sameecha!
          </div>
          <div style={{ fontFamily: CK_BODY, fontWeight: 500, fontSize: 15, color: 'var(--muted)', marginTop: 4 }}>
            Let’s build your Kannada fluency today.
          </div>
        </div>

        {/* Daily goal rings — rings left, Apple-Watch-style stats right */}
        <CKCard style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 14 }} pad="18px 20px">
          <CKRings size={150} sw={12} gap={5} rings={[
            { frac: 0.78, color: 'var(--red2)' },
            { frac: 0.52, color: 'var(--gold)' },
            { frac: 0.3, color: 'var(--red)' },
          ]} center={
            <div>
              <div style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 17, lineHeight: 1 }}>Daily</div>
              <div style={{ fontFamily: CK_BODY, fontWeight: 700, fontSize: 10, letterSpacing: 1.5, color: 'var(--faint)', textTransform: 'uppercase', marginTop: 2 }}>goal</div>
            </div>
          } />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13, flex: 1 }}>
            {[
              { l: 'Listen', v: 7, t: 9, c: 'var(--red2)', dot: 'var(--red2)' },
              { l: 'Speak', v: 5, t: 10, c: 'var(--goldLip)', dot: 'var(--gold)' },
              { l: 'Practice', v: 3, t: 10, c: 'var(--red)', dot: 'var(--red)' },
            ].map((s) => (
              <div key={s.l}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.dot, flexShrink: 0 }}></span>
                  <span style={{ fontFamily: CK_BODY, fontWeight: 700, fontSize: 13, color: 'var(--muted)' }}>{s.l}</span>
                </div>
                <div style={{ lineHeight: 1.1, marginTop: 1, paddingLeft: 14, fontVariantNumeric: 'tabular-nums' }}>
                  <span style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 22, color: s.c }}>{s.v}</span>
                  <span style={{ fontFamily: CK_DISPLAY, fontWeight: 700, fontSize: 14, color: 'var(--faint)' }}>/{s.t}</span>
                </div>
              </div>
            ))}
          </div>
        </CKCard>

        {/* Continue where you left off */}
        <CK lip={5} lipColor="var(--redLip)" style={{
          background: 'var(--red2)', borderRadius: 'var(--r)',
          padding: 16, display: 'flex', alignItems: 'center', gap: 13, marginBottom: 14,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%', background: '#fff',
            display: 'grid', placeItems: 'center', flexShrink: 0,
          }}>
            <CKPlay size={17} color="var(--red2)" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: CK_DISPLAY, fontWeight: 700, fontSize: 17, color: '#fff', letterSpacing: -0.2, lineHeight: 1.25 }}>Continue where you left off</div>
            <div style={{ fontFamily: CK_BODY, fontWeight: 600, fontSize: 12.5, color: 'rgba(255,255,255,0.85)', marginTop: 1 }}>Lesson 3 · Wanting · ~5 min</div>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.9)' }}><CKIcon d={CKPaths.chevron} size={18} stroke={2.2} /></span>
        </CK>

        {/* Words learnt banner */}
        <CK lip={5} lipColor="var(--goldLip)" style={{
          background: 'linear-gradient(180deg, var(--goldHi), var(--gold))',
          borderRadius: 'var(--r)', padding: '16px 18px 14px', marginBottom: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 19, color: '#6c5000' }}>Words learnt: 124</span>
            <span style={{ fontFamily: CK_BODY, fontWeight: 800, fontSize: 14, color: '#6c5000' }}>65%</span>
          </div>
          <div style={{ margin: '10px 0 7px' }}>
            <CKBar frac={0.65} color="var(--red2)" track="rgba(108,80,0,0.22)" h={9} />
          </div>
          <div style={{ fontFamily: CK_BODY, fontWeight: 700, fontSize: 11.5, color: '#6c5000', opacity: 0.8 }}>of your weekly target achieved</div>
        </CK>

        {/* Stuck right now? — as in codebase (tabs)/index.tsx */}
        <CK lip={4} lipColor="rgba(145,0,27,0.25)" style={{
          background: 'var(--redPale)', borderRadius: 'var(--r)',
          padding: 16, display: 'flex', alignItems: 'center', gap: 13, marginBottom: 20,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14, background: 'var(--red2)',
            boxShadow: '0 3px 0 var(--redLip)', display: 'grid', placeItems: 'center', flexShrink: 0,
          }}>
            <CKIcon d={CKPaths.alert} size={22} stroke={2.3} color="#fff" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: CK_DISPLAY, fontWeight: 700, fontSize: 17, color: 'var(--red)', letterSpacing: -0.2, lineHeight: 1.25 }}>Stuck right now?</div>
            <div style={{ fontFamily: CK_BODY, fontWeight: 500, fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.35, marginTop: 1 }}>
              Survival phrases for the auto, shop &amp; street · works offline.
            </div>
          </div>
          <span style={{ color: 'var(--red)' }}><CKIcon d={CKPaths.chevron} size={18} stroke={2.2} /></span>
        </CK>

        <div style={{ height: 92, flexShrink: 0 }}></div>
      </div>
      <CKTabBar active={0} />
    </CKPhone>
  );
}

Object.assign(window, { PageHome, CK_PHRASES, CKPhraseCard });
