// ck-basics.jsx — "Kannada basics" guide redesigned to be less overwhelming.
// Strategy vs codebase guide (constants/guide.ts, 4 dense swipe pages):
//   1. Lead with reassurance + 3 takeaways, not a chart.
//   2. Vowels shown as 5 short/long PAIRS (+2 oddballs) — 13 tiles feel like 7 sounds.
//   3. Consonants chunked into 5 mouth-position families, one family open at a time
//      ("wall of 34" becomes 5 rows of ≤5).
//   4. One sound-rule per card, full chart demoted to a "see all" reference row.

function CKBHeader({ step, total = 4, title }) {
  return (
    <div style={{ flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <CK lip={3} style={{
          width: 38, height: 38, borderRadius: '50%', background: '#fff',
          border: CK_HAIRLINE, display: 'grid', placeItems: 'center', color: 'var(--red2)', flexShrink: 0,
        }}>
          <CKIcon d={CKPaths.back} size={17} stroke={2.2} />
        </CK>
        <div style={{ flex: 1, fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 19 }}>Kannada basics</div>
        <span style={{ fontFamily: CK_BODY, fontWeight: 700, fontSize: 12, color: 'var(--faint)', fontVariantNumeric: 'tabular-nums' }}>{step}/{total}</span>
      </div>
      <div style={{ marginBottom: 16 }}><CKBar frac={step / total} color="var(--gold)" h={8} /></div>
      <div style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 23, lineHeight: 1.25, margin: '0 2px 14px' }}>{title}</div>
    </div>
  );
}

function CKBNext({ label = 'Next' }) {
  return (
    <div style={{ padding: '14px 0 24px', flexShrink: 0 }}>
      <CK as="button" lip={5} lipColor="var(--redLip)" style={{
        width: '100%', fontFamily: CK_DISPLAY, fontWeight: 700, fontSize: 16, color: '#fff',
        background: 'var(--red2)', border: 'none', borderRadius: 'var(--r)', padding: '16px 0 14px', whiteSpace: 'nowrap',
      }}>{label}</CK>
    </div>
  );
}

// ── 1 · Start: reassurance + the only 3 things to know ────
function CKBStart() {
  const points = [
    { n: '1', t: 'Say what you see', s: 'No silent letters — every glyph is one sound, always.' },
    { n: '2', t: 'Capitals curl your tongue', s: 'Ta, Da, Na = tongue curled back. Lowercase = tongue on teeth.' },
    { n: '3', t: 'Doubled letters linger', s: 'appa, amma — hold the sound a beat longer.' },
  ];
  return (
    <CKPhone pad="16px 20px 0" bg="var(--surface)">
      <CKBHeader step={1} title="Three things — that's it" />
      <div style={{ fontFamily: CK_BODY, fontWeight: 500, fontSize: 13.5, lineHeight: 1.55, color: 'var(--muted)', margin: '-6px 2px 16px' }}>
        You don't need to memorise anything here. Lessons always show romanised
        Kannada — this is just so the sounds make sense.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {points.map((p) => (
          <CK key={p.n} lip={4} style={{
            background: '#fff', border: CK_HAIRLINE, borderRadius: 'var(--r)',
            padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'flex-start',
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', background: 'var(--goldPale)',
              display: 'grid', placeItems: 'center', flexShrink: 0,
              fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 16, color: 'var(--goldDeep)', paddingTop: 2,
            }}>{p.n}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: CK_DISPLAY, fontWeight: 700, fontSize: 16, lineHeight: 1.25 }}>{p.t}</div>
              <div style={{ fontFamily: CK_BODY, fontWeight: 500, fontSize: 13, lineHeight: 1.5, color: 'var(--muted)', marginTop: 3 }}>{p.s}</div>
            </div>
          </CK>
        ))}
      </div>
      <div style={{ marginTop: 'auto' }}></div>
      <CKBNext label="Show me the vowels" />
    </CKPhone>
  );
}

// ── 2 · Vowels as short/long pairs ────────────────────────
const CKB_PAIRS = [
  { short: ['ಅ', 'a', 'up'], long: ['ಆ', 'ā', 'art'] },
  { short: ['ಇ', 'i', 'igloo'], long: ['ಈ', 'ī', 'seed'] },
  { short: ['ಉ', 'u', 'push'], long: ['ಊ', 'ū', 'moon'] },
  { short: ['ಎ', 'e', 'cake'], long: ['ಏ', 'ē', 'crane'] },
  { short: ['ಒ', 'o', 'opener'], long: ['ಓ', 'ō', 'go'] },
];

function CKBVowelCell({ g, big }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px' }}>
      <span style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 28, lineHeight: 1.4, color: big ? 'var(--red2)' : 'var(--ink)' }}>{g[0]}</span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: 'block', fontFamily: CK_BODY, fontWeight: 800, fontSize: 13.5 }}>{g[1]}</span>
        <span style={{ display: 'block', fontFamily: CK_BODY, fontWeight: 500, fontSize: 10.5, color: 'var(--faint)' }}>{g[2]}</span>
      </span>
    </div>
  );
}

function CKBVowels() {
  return (
    <CKPhone pad="16px 20px 0" bg="var(--surface)">
      <CKBHeader step={2} title="Vowels come in pairs" />
      <div style={{ fontFamily: CK_BODY, fontWeight: 500, fontSize: 13.5, lineHeight: 1.55, color: 'var(--muted)', margin: '-6px 2px 14px' }}>
        Five sounds, each with a short and a <b>looong</b> twin (the bar on ā means stretch it).
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {CKB_PAIRS.map((p, i) => (
          <CK key={i} lip={3} style={{
            background: '#fff', border: CK_HAIRLINE, borderRadius: 'var(--r)',
            display: 'flex', alignItems: 'stretch', padding: '2px 4px',
          }}>
            <CKBVowelCell g={p.short} />
            <span style={{ alignSelf: 'center', color: 'var(--goldLip)' }}><CKIcon d={CKPaths.chevron} size={14} stroke={2.6} /></span>
            <CKBVowelCell g={p.long} big />
            <CKRound size={32} bg="var(--goldPale)" lipColor="var(--goldLip)" style={{ alignSelf: 'center', marginRight: 8 }}>
              <CKIcon d={CKPaths.speaker} size={14} stroke={2} color="var(--goldDeep)" />
            </CKRound>
          </CK>
        ))}
      </div>
      <div style={{ fontFamily: CK_BODY, fontWeight: 600, fontSize: 12, color: 'var(--faint)', margin: '12px 2px 0' }}>
        + three loners you'll meet later: ಐ ai · ಔ au · ಋ ṛ
      </div>
      <div style={{ marginTop: 'auto' }}></div>
      <CKBNext label="Next — consonants" />
    </CKPhone>
  );
}

// ── 3 · Consonants by mouth position, one family open ─────
const CKB_FAMILIES = [
  { name: 'Throat', hint: 'back of the mouth', glyphs: [['ಕ', 'ka'], ['ಖ', 'kha'], ['ಗ', 'ga'], ['ಘ', 'gha']], open: true },
  { name: 'Palate', hint: 'tongue on the roof', glyphs: [['ಚ', 'cha'], ['ಜ', 'ja']] },
  { name: 'Curled tongue', hint: 'the capital letters', glyphs: [['ಟ', 'Ta'], ['ಡ', 'Da'], ['ಣ', 'Na']] },
  { name: 'Teeth', hint: 'tongue on the teeth', glyphs: [['ತ', 'ta'], ['ದ', 'da'], ['ನ', 'na']] },
  { name: 'Lips', hint: 'lips together', glyphs: [['ಪ', 'pa'], ['ಬ', 'ba'], ['ಮ', 'ma']] },
];

function CKBConsonants() {
  return (
    <CKPhone pad="16px 20px 0" bg="var(--surface)">
      <CKBHeader step={3} title="Consonants live in 5 places" />
      <div style={{ fontFamily: CK_BODY, fontWeight: 500, fontSize: 13.5, lineHeight: 1.55, color: 'var(--muted)', margin: '-6px 2px 14px' }}>
        All 34 are just these five mouth positions. Open one family at a time.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {CKB_FAMILIES.map((f) => (
          <CK key={f.name} lip={f.open ? 4 : 3} lipColor={f.open ? 'var(--goldLip)' : 'rgba(27,29,14,0.10)'} style={{
            background: '#fff', border: f.open ? '1px solid var(--goldLip)' : CK_HAIRLINE,
            borderRadius: 'var(--r)', padding: '12px 14px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ flex: 1 }}>
                <span style={{ fontFamily: CK_DISPLAY, fontWeight: 700, fontSize: 15.5 }}>{f.name}</span>
                <span style={{ fontFamily: CK_BODY, fontWeight: 500, fontSize: 12, color: 'var(--faint)', marginLeft: 8 }}>{f.hint}</span>
              </span>
              <span style={{ color: 'var(--faint)', transform: f.open ? 'rotate(90deg)' : 'none' }}>
                <CKIcon d={CKPaths.chevron} size={15} stroke={2.4} />
              </span>
            </div>
            {f.open && (
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                {f.glyphs.map((g) => (
                  <div key={g[1]} style={{
                    flex: 1, background: 'var(--goldPale)', borderRadius: 'calc(var(--r) - 5px)',
                    boxShadow: '0 2px 0 var(--goldLip)', padding: '10px 4px 8px', textAlign: 'center', cursor: 'pointer',
                  }}>
                    <div style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 24, lineHeight: 1.4, color: 'var(--goldDeep)' }}>{g[0]}</div>
                    <div style={{ fontFamily: CK_BODY, fontWeight: 800, fontSize: 12, color: 'var(--goldDeep)' }}>{g[1]}</div>
                  </div>
                ))}
              </div>
            )}
          </CK>
        ))}
      </div>
      <div style={{ fontFamily: CK_BODY, fontWeight: 700, fontSize: 12.5, color: 'var(--red2)', margin: '12px 2px 0', cursor: 'pointer' }}>
        See the full 34-letter chart →
      </div>
      <div style={{ marginTop: 'auto' }}></div>
      <CKBNext label="Last one — reading" />
    </CKPhone>
  );
}

// ── 4 · Reading transliteration: 1 rule, then done ────────
function CKBReading() {
  return (
    <CKPhone pad="16px 20px 0" bg="var(--surface)">
      <CKBHeader step={4} title="Reading the romanised words" />
      <div style={{ fontFamily: CK_BODY, fontWeight: 500, fontSize: 13.5, lineHeight: 1.55, color: 'var(--muted)', margin: '-6px 2px 14px' }}>
        One convention to remember, side by side:
      </div>
      <CK lip={4} style={{ background: '#fff', border: CK_HAIRLINE, borderRadius: 'var(--r)', padding: '4px 0', marginBottom: 14 }}>
        {[
          ['Ta', 'Top', 'tongue curled', true],
          ['ta', 'Bharath', 'tongue on teeth', false],
          ['Da', 'Dark', 'tongue curled', true],
          ['da', 'the', 'tongue on teeth', false],
        ].map(([sym, ex, hint, caps], i) => (
          <div key={sym} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 18px', borderTop: i ? '1px solid var(--hairline)' : 'none' }}>
            <span style={{
              width: 40, textAlign: 'center', fontFamily: CK_BODY, fontWeight: 800, fontSize: 17,
              color: caps ? 'var(--red2)' : 'var(--goldDeep)',
            }}>{sym}</span>
            <span style={{ flex: 1, fontFamily: CK_BODY, fontWeight: 700, fontSize: 14 }}>as in {ex}</span>
            <span style={{ fontFamily: CK_BODY, fontWeight: 500, fontSize: 11.5, color: 'var(--faint)' }}>{hint}</span>
          </div>
        ))}
      </CK>
      {/* try it */}
      <CK lip={5} lipColor="var(--goldLip)" style={{ background: 'var(--goldPale)', borderRadius: 'var(--r)', padding: '16px 18px' }}>
        <div style={{ fontFamily: CK_BODY, fontWeight: 700, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--goldDeep)', opacity: 0.85 }}>Try it</div>
        <div style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 20, color: 'var(--goldDeep)', marginTop: 4 }}>haLLi · ಹಳ್ಳಿ</div>
        <div style={{ fontFamily: CK_BODY, fontWeight: 600, fontSize: 12.5, color: 'var(--goldDeep)', marginTop: 2 }}>
          village — capital L, so curl the tongue · double L, so hold it
        </div>
      </CK>
      <div style={{ marginTop: 'auto' }}></div>
      <CKBNext label="Done — start Lesson 1" />
    </CKPhone>
  );
}

Object.assign(window, { CKBStart, CKBVowels, CKBConsonants, CKBReading });
