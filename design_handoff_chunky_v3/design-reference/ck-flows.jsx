// ck-flows.jsx — Lesson player, Emergency phrases, Culture (heritage) screens
// in the chunky kit.

// ── LESSON PLAYER ─────────────────────────────────────────
function PageLesson() {
  const [sel, setSel] = React.useState(1);
  const words = ['ಹೆಸರು', 'ನನ್ನ', 'ಸಮೀಕ್ಷಾ'];
  return (
    <CKPhone bg="var(--surface)">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar: close + progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 26 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'grid', placeItems: 'center', color: 'var(--faint)', cursor: 'pointer', border: CK_HAIRLINE, background: '#fff' }}>
            <CKIcon d={CKPaths.close} size={16} stroke={2.2} />
          </div>
          <div style={{ flex: 1 }}><CKBar frac={0.4} color="var(--gold)" h={10} /></div>
          <div style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 15, color: 'var(--goldDeep)' }}>2/5</div>
        </div>

        <div style={{ fontFamily: CK_BODY, fontWeight: 700, fontSize: 12, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--red2)', margin: '0 2px' }}>Lesson 2 · Names</div>
        <div style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 26, lineHeight: 1.15, margin: '6px 2px 18px' }}>Say “My name is Sameecha”</div>

        {/* Listen card */}
        <CKCard style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }} pad="16px 18px">
          <CKRound size={46} bg="var(--red2)" lipColor="var(--redLip)">
            <CKIcon d={CKPaths.speaker} size={21} stroke={2} color="#fff" />
          </CKRound>
          <div>
            <div style={{ fontFamily: CK_DISPLAY, fontWeight: 700, fontSize: 19, lineHeight: 1.25 }}>ನನ್ನ ಹೆಸರು ಸಮೀಕ್ಷಾ</div>
            <div style={{ fontFamily: CK_BODY, fontWeight: 700, fontSize: 12.5, color: 'var(--muted)', marginTop: 1 }}>nanna hesaru Sameecha</div>
          </div>
        </CKCard>

        {/* Word chips */}
        <div style={{ fontFamily: CK_BODY, fontWeight: 700, fontSize: 12.5, color: 'var(--muted)', margin: '0 2px 10px' }}>Tap the words in order</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 'auto' }}>
          {words.map((w, i) => {
            const on = sel === i;
            return (
              <CK key={w} lip={3} lipColor={on ? 'var(--goldLip)' : 'rgba(27,29,14,0.10)'}
                onClick={() => setSel(i)}
                style={{
                  fontFamily: CK_DISPLAY, fontWeight: 700, fontSize: 17,
                  color: on ? '#6c5000' : 'var(--ink)',
                  background: on ? 'var(--goldPale)' : '#fff',
                  border: on ? '1px solid var(--goldLip)' : CK_HAIRLINE,
                  borderRadius: 99, padding: '11px 20px 9px',
                }}>{w}</CK>
            );
          })}
        </div>

        {/* Speak + Next */}
        <div style={{ display: 'flex', gap: 12, paddingBottom: 24 }}>
          <CK as="button" lip={5} lipColor="var(--goldLip)" style={{
            flex: 1, fontFamily: CK_DISPLAY, fontWeight: 700, fontSize: 15, color: '#6c5000',
            background: 'linear-gradient(180deg, var(--goldHi), var(--gold))',
            border: 'none', borderRadius: 'var(--r)', padding: '15px 0 13px', whiteSpace: 'nowrap',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          }}>
            <span style={{ flexShrink: 0 }}><CKIcon d={CKPaths.mic} size={18} stroke={2} /></span> Speak it
          </CK>
          <CK as="button" lip={5} lipColor="var(--redLip)" style={{
            flex: 1, fontFamily: CK_DISPLAY, fontWeight: 700, fontSize: 15, color: '#fff',
            background: 'var(--red2)', border: 'none', borderRadius: 'var(--r)', padding: '15px 0 13px', whiteSpace: 'nowrap',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          }}>
            ಮುಂದೆ <span style={{ fontFamily: CK_BODY, fontWeight: 700, fontSize: 13, opacity: 0.85 }}>Next</span>
          </CK>
        </div>
      </div>
    </CKPhone>
  );
}

// ── EMERGENCY PHRASES ─────────────────────────────────────
const CK_EMERGENCY = [
  {
    label: 'Auto / cab', icon: 'auto', color: 'var(--gold)', lip: 'var(--goldLip)', fg: 'var(--goldDeep)', chipBg: 'var(--goldPale)',
    items: [
      { kn: 'ಇಲ್ಲಿ ನಿಲ್ಲಿಸಿ', roman: 'Illi nillisi', en: 'Stop here' },
      { kn: 'ಮೀಟರ್ ಹಾಕಿ', roman: 'Meter haaki', en: 'Put the meter on' },
      { kn: 'ಎಷ್ಟು?', roman: 'Eshtu?', en: 'How much is it?' },
    ],
  },
  {
    label: 'In trouble', icon: 'alert', color: 'var(--red2)', lip: 'var(--redLip)', fg: 'var(--red2)', chipBg: 'var(--redPale)',
    items: [
      { kn: 'ದಯವಿಟ್ಟು ಸಹಾಯ ಮಾಡಿ', roman: 'Dayavittu sahaaya maadi', en: 'Please help' },
      { kn: 'ನನಗೆ ಕನ್ನಡ ಬರಲ್ಲ', roman: 'Nanage Kannada baralla', en: 'I don’t know Kannada' },
      { kn: 'ಸ್ವಲ್ಪ ನಿಧಾನವಾಗಿ', roman: 'Swalpa nidhanavagi', en: 'Slowly, please' },
    ],
  },
];

function PageEmergency() {
  return (
    <CKPhone>
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Header with back */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <CK lip={3} style={{
            width: 38, height: 38, borderRadius: '50%', background: '#fff',
            border: CK_HAIRLINE, display: 'grid', placeItems: 'center', color: 'var(--ink)',
          }}>
            <CKIcon d={CKPaths.back} size={18} stroke={2.2} />
          </CK>
          <div>
            <div style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 24, lineHeight: 1 }}>Emergency phrases</div>
            <div style={{ fontFamily: CK_BODY, fontWeight: 500, fontSize: 12.5, color: 'var(--muted)', marginTop: 3 }}>Works offline · tap any card to hear it</div>
          </div>
        </div>

        {CK_EMERGENCY.map((g) => (
          <div key={g.label} style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 2px 10px' }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: g.chipBg, display: 'grid', placeItems: 'center', color: g.fg }}>
                <CKIcon d={CKPaths[g.icon]} size={17} stroke={2} />
              </div>
              <span style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 17 }}>{g.label}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {g.items.map((p) => (
                <CK key={p.en} lip={4} style={{
                  background: '#fff', border: CK_HAIRLINE, borderRadius: 'var(--r)',
                  borderLeft: `5px solid ${g.color}`,
                  padding: '12px 14px 11px', boxSizing: 'border-box',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: CK_DISPLAY, fontWeight: 700, fontSize: 17, lineHeight: 1.25 }}>{p.kn}</div>
                    <div style={{ fontFamily: CK_BODY, fontWeight: 700, fontSize: 11.5, color: 'var(--muted)', marginTop: 1 }}>{p.roman} · {p.en}</div>
                  </div>
                  <CKRound size={36} bg={g.color} lipColor={g.lip}>
                    <CKIcon d={CKPaths.speaker} size={16} stroke={2} color={g.color === 'var(--gold)' ? 'var(--goldDeep)' : '#fff'} />
                  </CKRound>
                </CK>
              ))}
            </div>
          </div>
        ))}
        <div style={{ height: 16, flexShrink: 0 }}></div>
      </div>
    </CKPhone>
  );
}

// ── CULTURE / HERITAGE ────────────────────────────────────
function PageCulture() {
  return (
    <CKPhone pad="0" bg="var(--surfaceLow)">
      {/* Hero image */}
      <div style={{ position: 'relative', height: 280, flexShrink: 0 }}>
        <img src="../assets/mono/mysore-palace-ink.jpg" alt="Mysore Palace"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(27,29,14,0.18), rgba(27,29,14,0) 38%, rgba(244,244,240,1) 97%)' }}></div>
        <CK lip={3} style={{
          position: 'absolute', top: 20, left: 20,
          width: 38, height: 38, borderRadius: '50%', background: '#fff',
          border: CK_HAIRLINE, display: 'grid', placeItems: 'center', color: 'var(--ink)',
        }}>
          <CKIcon d={CKPaths.back} size={18} stroke={2.2} />
        </CK>
      </div>

      <div style={{ padding: '0 20px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ fontFamily: CK_BODY, fontWeight: 700, fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase', color: 'var(--red2)' }}>Karnataka culture · 4 of 12</div>
        <div style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 27, lineHeight: 1.12, margin: '6px 0 14px' }}>Mysuru Dasara, the festival of a city</div>

        <CKCard pad="16px 18px" style={{ marginBottom: 12 }}>
          <div style={{ fontFamily: CK_BODY, fontWeight: 500, fontSize: 14.5, lineHeight: 1.55, color: 'var(--muted)' }}>
            Every autumn, Mysore Palace glows with nearly 100,000 lights for ten nights.
            The Dasara procession — elephants, dancers and the golden howdah — has run
            for over 400 years, since the Wadiyar kings.
          </div>
        </CKCard>

        {/* Word to keep */}
        <CK lip={5} lipColor="var(--goldLip)" style={{
          background: 'linear-gradient(180deg, var(--goldHi), var(--gold))',
          borderRadius: 'var(--r)', padding: '14px 18px 12px',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: CK_BODY, fontWeight: 700, fontSize: 10.5, letterSpacing: 1.4, textTransform: 'uppercase', color: '#6c5000', opacity: 0.8 }}>Word to keep</div>
            <div style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 20, color: '#6c5000', lineHeight: 1.2, marginTop: 2 }}>ಹಬ್ಬ · habba</div>
            <div style={{ fontFamily: CK_BODY, fontWeight: 700, fontSize: 12, color: '#6c5000', opacity: 0.8 }}>festival</div>
          </div>
          <CKRound size={42} bg="#fff" lipColor="rgba(108,80,0,0.45)">
            <CKIcon d={CKPaths.speaker} size={19} stroke={2} color="var(--goldDeep)" />
          </CKRound>
        </CK>

        <div style={{ marginTop: 'auto', paddingBottom: 24 }}>
          <CK as="button" lip={5} lipColor="var(--redLip)" style={{
            width: '100%', fontFamily: CK_DISPLAY, fontWeight: 700, fontSize: 16, color: '#fff',
            background: 'var(--red2)', border: 'none', borderRadius: 'var(--r)', padding: '15px 0 13px',
          }}>Next story</CK>
        </div>
      </div>
    </CKPhone>
  );
}

Object.assign(window, { PageLesson, PageEmergency, PageCulture });
