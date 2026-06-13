// ck-lessonflow.jsx — lesson runner flow from components/lesson/*.tsx
// in the chunky kit: situation → teach word → practice (listen MCQ) →
// summary → done card. Lesson 3 · Wanting.

// Exit chip + progress header used by every phase.
function CKLFHeader({ label, frac }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexShrink: 0 }}>
      <CK lip={3} style={{
        width: 38, height: 38, borderRadius: '50%', background: '#fff',
        border: CK_HAIRLINE, display: 'grid', placeItems: 'center', color: 'var(--ink)', flexShrink: 0,
      }}>
        <CKIcon d={CKPaths.back} size={17} stroke={2.2} />
      </CK>
      {label != null && (
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: CK_BODY, fontWeight: 700, fontSize: 11.5, letterSpacing: 0.4, color: 'var(--faint)', marginBottom: 7 }}>{label}</div>
          <CKBar frac={frac} color="var(--gold)" h={9} />
        </div>
      )}
    </div>
  );
}

function CKLFCta({ label, gold = false }) {
  return (
    <div style={{ padding: '16px 0 24px', flexShrink: 0 }}>
      <CK as="button" lip={5} lipColor={gold ? 'var(--goldLip)' : 'var(--redLip)'} style={{
        width: '100%', fontFamily: CK_DISPLAY, fontWeight: 700, fontSize: 16,
        color: gold ? '#6c5000' : '#fff',
        background: gold ? 'linear-gradient(180deg, var(--goldHi), var(--gold))' : 'var(--red2)',
        border: 'none', borderRadius: 'var(--r)', padding: '16px 0 14px', whiteSpace: 'nowrap',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>{label} <CKIcon d={CKPaths.chevron} size={17} stroke={2.4} /></CK>
    </div>
  );
}

// ── 1 · Situation ─────────────────────────────────────────
function CKLFSituation() {
  return (
    <CKPhone pad="16px 20px 0" bg="var(--surface)">
      <CKLFHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: 8 }}>
        <CK lip={5} lipColor="var(--goldLip)" style={{
          background: 'var(--goldPale)', borderRadius: 'var(--r)',
          minHeight: 170, display: 'grid', placeItems: 'center', textAlign: 'center',
          padding: '34px 20px', marginBottom: 24,
        }}>
          <div>
            <div style={{ fontFamily: CK_BODY, fontWeight: 700, fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase', color: 'var(--goldDeep)' }}>Situation</div>
            <div style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 21, color: 'var(--goldDeep)', marginTop: 6 }}>Wanting</div>
          </div>
        </CK>
        <div style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 24, letterSpacing: -0.3, lineHeight: 1.3, marginBottom: 10 }}>Wanting</div>
        <div style={{ fontFamily: CK_BODY, fontWeight: 400, fontSize: 15.5, lineHeight: 1.55, color: 'var(--ink)' }}>
          You’re at a street-side stall in Bengaluru. The vendor holds up two things —
          one you want, one you don’t. Two little words sort the whole exchange out:
          <b> beku</b> and <b>beda</b>.
        </div>
      </div>
      <CKLFCta label="Let’s start" />
    </CKPhone>
  );
}

// ── 2 · Teach word ────────────────────────────────────────
function CKLFTeach() {
  return (
    <CKPhone pad="16px 20px 0" bg="var(--surface)">
      <CKLFHeader label="Word 1 of 4" frac={0.25} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26 }}>
        <CK lip={4} style={{
          width: '100%', background: 'var(--surfaceLow)', borderRadius: 'var(--r)',
          padding: '44px 20px', boxSizing: 'border-box', textAlign: 'center',
        }}>
          <div style={{ fontFamily: CK_BODY, fontWeight: 700, fontSize: 40, lineHeight: 1.2, letterSpacing: -0.5 }}>beku</div>
          <div style={{ fontFamily: CK_BODY, fontWeight: 500, fontSize: 18, color: 'var(--muted)', marginTop: 10 }}>want / need</div>
          <div style={{ fontFamily: CK_DISPLAY, fontWeight: 500, fontSize: 14, color: 'var(--faint)', marginTop: 14 }}>ಬೇಕು</div>
        </CK>
        <CKRound size={64} bg="var(--red2)" lipColor="var(--redLip)" lip={4}>
          <CKIcon d={CKPaths.speaker} size={26} stroke={2} color="#fff" />
        </CKRound>
      </div>
      <CKLFCta label="Got it" />
    </CKPhone>
  );
}

// ── 3 · Practice (listen MCQ) ─────────────────────────────
function CKLFPractice() {
  const opts = [
    { label: 'want / need', state: 'correct' },
    { label: 'don’t want', state: 'idle' },
    { label: 'give me', state: 'idle' },
  ];
  return (
    <CKPhone pad="16px 20px 0" bg="var(--surface)">
      <CKLFHeader label="Word 1 of 4 — Listen" frac={0.25} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: 18 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 26 }}>
          <CKRound size={72} bg="var(--red2)" lipColor="var(--redLip)" lip={5}>
            <CKIcon d={CKPaths.speaker} size={30} stroke={2} color="#fff" />
          </CKRound>
          {/* speed control */}
          <div style={{ display: 'flex', gap: 6 }}>
            {['0.75×', '1×'].map((s, i) => (
              <span key={s} style={{
                fontFamily: CK_BODY, fontWeight: 700, fontSize: 11.5,
                color: i === 1 ? '#6c5000' : 'var(--faint)',
                background: i === 1 ? 'var(--goldPale)' : 'transparent',
                border: i === 1 ? '1px solid var(--goldLip)' : '1px solid rgba(27,29,14,0.12)',
                borderRadius: 99, padding: '5px 12px 4px',
              }}>{s}</span>
            ))}
          </div>
        </div>
        <div style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 20, textAlign: 'center', marginBottom: 18 }}>What does this mean?</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {opts.map((o) => (
            <CK key={o.label} lip={o.state === 'correct' ? 4 : 3}
              lipColor={o.state === 'correct' ? 'var(--goldLip)' : 'rgba(27,29,14,0.10)'}
              style={{
                background: o.state === 'correct' ? 'var(--goldPale)' : '#fff',
                border: o.state === 'correct' ? '2px solid var(--goldLip)' : '2px solid rgba(27,29,14,0.10)',
                borderRadius: 'var(--r)', padding: '16px 18px 14px',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
              <span style={{ flex: 1, fontFamily: CK_DISPLAY, fontWeight: 700, fontSize: 16, color: o.state === 'correct' ? 'var(--goldDeep)' : 'var(--ink)' }}>{o.label}</span>
              {o.state === 'correct' && (
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--gold)', boxShadow: '0 2px 0 var(--goldLip)', display: 'grid', placeItems: 'center' }}>
                  <CKIcon d={CKPaths.check} size={13} stroke={3} color="#6c5000" />
                </div>
              )}
            </CK>
          ))}
        </div>
      </div>
    </CKPhone>
  );
}

// ── 4 · Summary ───────────────────────────────────────────
const CKLF_SUMMARY = {
  words: [
    { tr: 'beku', kn: 'ಬೇಕು', en: 'want / need' },
    { tr: 'beda', kn: 'ಬೇಡ', en: 'don’t want' },
    { tr: 'idu', kn: 'ಇದು', en: 'this' },
    { tr: 'kodi', kn: 'ಕೊಡಿ', en: 'give (please)' },
  ],
  phrases: [
    { tr: 'idu beku', kn: 'ಇದು ಬೇಕು', en: 'I want this' },
    { tr: 'adu beda', kn: 'ಅದು ಬೇಡ', en: 'Not that one' },
    { tr: 'swalpa kodi', kn: 'ಸ್ವಲ್ಪ ಕೊಡಿ', en: 'Give me a little' },
  ],
};

function CKLFRow({ r }) {
  return (
    <CK lip={3} style={{
      background: '#fff', border: CK_HAIRLINE, borderRadius: 'calc(var(--r) - 2px)',
      padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: CK_BODY, fontWeight: 700, fontSize: 14.5 }}>{r.tr}</div>
        <div style={{ fontFamily: CK_DISPLAY, fontWeight: 500, fontSize: 12, color: 'var(--faint)', marginTop: 1 }}>{r.kn}</div>
      </div>
      <span style={{ fontFamily: CK_BODY, fontWeight: 500, fontSize: 12.5, color: 'var(--muted)', textAlign: 'right', maxWidth: '38%' }}>{r.en}</span>
      <CKRound size={34} bg="var(--goldPale)" lipColor="var(--goldLip)">
        <CKIcon d={CKPaths.speaker} size={15} stroke={2} color="var(--goldDeep)" />
      </CKRound>
    </CK>
  );
}

function CKLFSummary() {
  return (
    <CKPhone pad="16px 20px 0" bg="var(--surface)">
      <CKLFHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: 6 }}>
        <div style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 24, letterSpacing: -0.3, marginBottom: 16 }}>What you learned</div>
        <div style={{ fontFamily: CK_BODY, fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--faint)', marginBottom: 10 }}>Words</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 20 }}>
          {CKLF_SUMMARY.words.map((r) => <CKLFRow key={r.tr} r={r} />)}
        </div>
        <div style={{ fontFamily: CK_BODY, fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--faint)', marginBottom: 10 }}>Phrases</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {CKLF_SUMMARY.phrases.map((r) => <CKLFRow key={r.tr} r={r} />)}
        </div>
      </div>
      <CKLFCta label="Continue" />
    </CKPhone>
  );
}

// ── 5 · Done card ─────────────────────────────────────────
function CKLFDone() {
  return (
    <CKPhone pad="16px 20px 0" bg="var(--surface)">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: 26 }}>
        <div style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 24, letterSpacing: -0.3, textAlign: 'center', lineHeight: 1.3, marginBottom: 20 }}>
          Nice — that’s the lesson done.
        </div>
        {/* stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, alignSelf: 'center', marginBottom: 22 }}>
          {[
            { icon: 'book', t: '4 words learned' },
            { icon: 'chat', t: '3 phrases learned' },
            { icon: 'mic', t: 'You spoke Kannada today' },
          ].map((s) => (
            <div key={s.t} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{ color: 'var(--red2)' }}><CKIcon d={CKPaths[s.icon]} size={18} stroke={2} /></span>
              <span style={{ fontFamily: CK_BODY, fontWeight: 500, fontSize: 14.5 }}>{s.t}</span>
            </div>
          ))}
        </div>
        {/* real-world prompt */}
        <CK lip={5} lipColor="var(--goldLip)" style={{
          background: 'var(--goldPale)', borderRadius: 'var(--r)', padding: '20px 22px', marginBottom: 18,
        }}>
          <div style={{ fontFamily: CK_BODY, fontWeight: 700, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--goldDeep)', opacity: 0.85 }}>Take it outside</div>
          <div style={{ fontFamily: CK_DISPLAY, fontWeight: 700, fontSize: 16.5, lineHeight: 1.45, color: 'var(--goldDeep)', marginTop: 6 }}>
            Next time you buy fruit, point and say “idu beku” — watch the vendor light up.
          </div>
        </CK>
        {/* keep practising */}
        <div style={{ fontFamily: CK_BODY, fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--faint)', marginBottom: 10 }}>Keep practising</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {[
            { t: 'Quick quiz', s: 'Test your speed.' },
            { t: 'Dictation', s: 'Hear it. Type it.' },
          ].map((g) => (
            <div key={g.t} style={{
              background: '#fff', border: CK_HAIRLINE, borderRadius: 'calc(var(--r) - 2px)',
              boxShadow: '0 3px 0 rgba(27,29,14,0.08)', padding: '11px 14px',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: CK_DISPLAY, fontWeight: 700, fontSize: 14.5 }}>{g.t}</div>
                <div style={{ fontFamily: CK_BODY, fontWeight: 500, fontSize: 12, color: 'var(--muted)' }}>{g.s}</div>
              </div>
              <CK as="button" lip={3} lipColor="var(--redLip)" style={{
                fontFamily: CK_DISPLAY, fontWeight: 700, fontSize: 12, letterSpacing: 0.4, color: '#fff',
                background: 'var(--red2)', border: 'none', borderRadius: 99, padding: '8px 18px 6px',
              }}>Play</CK>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '16px 0 24px', display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0 }}>
        <CK as="button" lip={5} lipColor="var(--redLip)" style={{
          width: '100%', fontFamily: CK_DISPLAY, fontWeight: 700, fontSize: 16, color: '#fff',
          background: 'var(--red2)', border: 'none', borderRadius: 'var(--r)', padding: '16px 0 14px',
        }}>I’ll try this in real life</CK>
        <div style={{ textAlign: 'center', fontFamily: CK_BODY, fontWeight: 600, fontSize: 13.5, color: 'var(--muted)', padding: '4px 0', cursor: 'pointer' }}>Back to lessons</div>
      </div>
    </CKPhone>
  );
}

Object.assign(window, { CKLFSituation, CKLFTeach, CKLFPractice, CKLFSummary, CKLFDone });
