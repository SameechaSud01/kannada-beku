// ck-tabs.jsx — Lessons, Games, Profile tabs in the chunky kit.

// ── LESSONS ───────────────────────────────────────────────
const CK_LESSONS = [
  { n: 1, t: 'Greetings', s: 'Hello and how are you', g: 'ನ', state: 'done' },
  { n: 2, t: 'Names', s: 'I, you, my name is', g: 'ಹ', state: 'current' },
  { n: 3, t: 'Wanting', s: 'I want, I don’t want', g: 'ಬೇ', state: 'locked' },
  { n: 4, t: 'Pointing', s: 'This, that, here, there', g: 'ಇ', state: 'locked' },
  { n: 5, t: 'Easy verbs', s: 'Come, eat, laugh', g: 'ಬ', state: 'locked' },
  { n: 6, t: 'Questions', s: 'Who, what, where', g: 'ಯಾ', state: 'locked' },
  { n: 7, t: 'Hard verbs', s: 'See, do, play', g: 'ನೋ', state: 'locked' },
  { n: 8, t: 'Putting it together', s: 'Combining it all', g: 'ಸ', state: 'locked' },
];

function CKLessonRow({ l }) {
  const done = l.state === 'done', current = l.state === 'current', locked = l.state === 'locked';
  const tileBg = done ? 'var(--goldPale)' : current ? 'var(--red2)' : 'rgba(27,29,14,0.06)';
  const tileFg = done ? 'var(--goldDeep)' : current ? '#fff' : 'var(--faint)';
  const inner = (
    <React.Fragment>
      <div style={{
        width: 46, height: 46, borderRadius: 14, background: tileBg, color: tileFg, flexShrink: 0,
        display: 'grid', placeItems: 'center', fontFamily: CK_DISPLAY, fontSize: 20, fontWeight: 800,
      }}>{l.g}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: CK_DISPLAY, fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>{l.n}. {l.t}</div>
        <div style={{ fontFamily: CK_BODY, fontSize: 12.5, fontWeight: 500, color: 'var(--muted)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.s}</div>
        {current && <div style={{ marginTop: 8, maxWidth: 140 }}><CKBar frac={0.66} color="var(--gold)" h={6} /></div>}
      </div>
      {done && <span style={{ color: 'var(--goldDeep)' }}><CKIcon d={CKPaths.check} size={21} stroke={2.4} /></span>}
      {current && (
        <CKRound size={42} bg="var(--red2)" lipColor="var(--redLip)">
          <CKPlay size={16} />
        </CKRound>
      )}
      {locked && <span style={{ color: 'var(--faint)' }}><CKIcon d={CKPaths.lock} size={19} stroke={1.9} /></span>}
    </React.Fragment>
  );
  if (locked) {
    return (
      <div style={{
        background: '#fff', border: CK_HAIRLINE, borderRadius: 'var(--r)',
        padding: '12px 16px', boxSizing: 'border-box', opacity: 0.62,
        display: 'flex', alignItems: 'center', gap: 13,
      }}>{inner}</div>
    );
  }
  return (
    <CK lip={current ? 5 : 4} lipColor={current ? 'var(--goldLip)' : 'rgba(27,29,14,0.10)'} style={{
      background: '#fff', borderRadius: 'var(--r)',
      border: current ? '1px solid var(--goldLip)' : CK_HAIRLINE,
      padding: '12px 16px', boxSizing: 'border-box',
      display: 'flex', alignItems: 'center', gap: 13,
    }}>{inner}</CK>
  );
}

function PageLessons() {
  return (
    <CKPhone>
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <CKAppBar />
        <div style={{ margin: '4px 2px 16px' }}>
          <div style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 34, lineHeight: 1.05 }}>Lessons</div>
          <div style={{ fontFamily: CK_BODY, fontWeight: 500, fontSize: 15, color: 'var(--muted)', marginTop: 4 }}>8 steps to speaking</div>
        </div>

        {/* Kannada basics — BasicsCard from codebase */}
        <CK lip={4} style={{
          background: 'var(--surfaceLow)', borderRadius: 'var(--r)', padding: 14,
          display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16,
        }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#fff', display: 'grid', placeItems: 'center', color: 'var(--red2)', flexShrink: 0 }}>
            <CKIcon d={CKPaths.book} size={20} stroke={2} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: CK_BODY, fontWeight: 700, fontSize: 15.5, lineHeight: 1.25 }}>Kannada basics</div>
            <div style={{ fontFamily: CK_BODY, fontWeight: 500, fontSize: 13, color: 'var(--faint)', marginTop: 1 }}>Vowels, consonants, how to read it</div>
          </div>
          <span style={{ color: 'var(--faint)' }}><CKIcon d={CKPaths.chevron} size={18} stroke={2.2} /></span>
        </CK>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {CK_LESSONS.map((l) => <CKLessonRow key={l.n} l={l} />)}
        </div>
        <div style={{ height: 92, flexShrink: 0 }}></div>
      </div>
      <CKTabBar active={1} />
    </CKPhone>
  );
}

// ── GAMES ─────────────────────────────────────────────────
const CK_GAMES = [
  { key: 'dictation', title: 'Dictation', tag: 'Hear it. Type it.', icon: 'ear', glyph: 'ಕ', bg: 'var(--red2)', lip: 'var(--redLip)', fg: '#fff' },
  { key: 'conversations', title: 'Conversations', tag: 'Roleplay real scenes.', icon: 'chat', glyph: 'ಮ', bg: 'var(--red)', lip: '#4a000e', fg: '#fff' },
  { key: 'opposites', title: 'Opposites', tag: 'Match contrasts.', icon: 'swap', glyph: 'ವ', bg: 'var(--goldPale)', lip: 'var(--goldLip)', fg: 'var(--goldDeep)' },
];

function PageGames() {
  return (
    <CKPhone>
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <CKAppBar />
        <div style={{ margin: '4px 2px 16px' }}>
          <div style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 34, lineHeight: 1.05 }}>Games</div>
          <div style={{ fontFamily: CK_BODY, fontWeight: 500, fontSize: 15, color: 'var(--muted)', marginTop: 4 }}>Play with what you’ve learned</div>
        </div>

        {/* Featured: Quick quiz — gold, as in codebase */}
        <CK lip={5} lipColor="var(--goldLip)" style={{
          background: 'linear-gradient(180deg, var(--goldHi), var(--gold))',
          borderRadius: 'var(--r)', color: '#6c5000',
          padding: '20px 20px 18px', marginBottom: 12, position: 'relative', overflow: 'hidden',
        }}>
          <span aria-hidden="true" style={{
            position: 'absolute', top: -6, right: 10,
            fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 88, lineHeight: 1.2,
            color: 'rgba(120,89,0,0.18)', pointerEvents: 'none',
          }}>ಪ</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(255,255,255,0.45)', display: 'grid', placeItems: 'center', color: 'var(--goldDeep)', flexShrink: 0 }}>
              <CKIcon d={CKPaths.bolt} size={26} stroke={2} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 21, lineHeight: 1.1 }}>Quick quiz</div>
              <div style={{ fontFamily: CK_BODY, fontSize: 13, fontWeight: 600, opacity: 0.85, marginTop: 2 }}>Test your speed.</div>
            </div>
            <CKRound size={46} bg="var(--red2)" lipColor="var(--redLip)">
              <CKPlay size={18} />
            </CKRound>
          </div>
        </CK>

        {/* Remaining games — 2-up + full-width */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {CK_GAMES.map((g, i) => (
            <CK key={g.key} lip={5} lipColor={g.lip} style={{
              gridColumn: i === 2 ? '1 / -1' : 'auto',
              minHeight: i === 2 ? 96 : 150, borderRadius: 'var(--r)', background: g.bg,
              position: 'relative', overflow: 'hidden', padding: 16, boxSizing: 'border-box',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
            }}>
              <span aria-hidden="true" style={{
                position: 'absolute', top: 0, right: 12,
                fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 64, lineHeight: 1.2,
                color: g.fg === '#fff' ? 'rgba(255,255,255,0.22)' : 'rgba(120,89,0,0.20)', pointerEvents: 'none',
              }}>{g.glyph}</span>
              <span style={{ color: g.fg, opacity: 0.9, marginBottom: 'auto' }}><CKIcon d={CKPaths[g.icon]} size={22} stroke={2} /></span>
              <div style={{ fontFamily: CK_DISPLAY, fontWeight: 700, fontSize: 18, letterSpacing: -0.2, color: g.fg, marginTop: i === 2 ? 10 : 26 }}>{g.title}</div>
              <div style={{ fontFamily: CK_BODY, fontWeight: 500, fontSize: 12, color: g.fg, opacity: 0.85, marginTop: 1 }}>{g.tag}</div>
            </CK>
          ))}
        </div>

        <div style={{ fontFamily: CK_BODY, fontWeight: 400, fontSize: 12, lineHeight: 1.5, color: 'var(--faint)', marginTop: 14 }}>
          Each game draws only from phrases you’ve already learned.
        </div>

        <div style={{ height: 92, flexShrink: 0 }}></div>
      </div>
      <CKTabBar active={2} />
    </CKPhone>
  );
}

// ── PROFILE ───────────────────────────────────────────────
function CKSettingsRow({ icon, label, last }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '14px 18px', borderBottom: last ? 'none' : CK_HAIRLINE, cursor: 'pointer' }}>
      <span style={{ color: 'var(--red2)' }}><CKIcon d={icon} size={21} stroke={1.9} /></span>
      <span style={{ flex: 1, fontFamily: CK_BODY, fontSize: 15, fontWeight: 700 }}>{label}</span>
      <span style={{ color: 'var(--faint)' }}><CKIcon d={CKPaths.chevron} size={17} stroke={2.2} /></span>
    </div>
  );
}

function PageProfile() {
  return (
    <CKPhone>
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <CKAppBar />

        {/* Identity + streak medallion */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '6px 2px 18px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 30, lineHeight: 1.05 }}>Sameecha</div>
            <div style={{ fontFamily: CK_BODY, fontWeight: 500, fontSize: 14, color: 'var(--muted)', marginTop: 3 }}>Learning since May 2026</div>
          </div>
          <CK lip={5} lipColor="var(--goldLip)" style={{
            width: 78, height: 78, borderRadius: '50%',
            background: 'linear-gradient(180deg, var(--goldHi), var(--gold))',
            display: 'grid', placeItems: 'center', textAlign: 'center', flexShrink: 0,
          }}>
            <div>
              <div style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 27, lineHeight: 1, color: '#6c5000' }}>6</div>
              <div style={{ fontFamily: CK_BODY, fontWeight: 700, fontSize: 8.5, letterSpacing: 1, textTransform: 'uppercase', color: '#6c5000', opacity: 0.75 }}>day streak</div>
            </div>
          </CK>
        </div>

        {/* Overall progress */}
        <CKCard style={{ marginBottom: 12 }} pad="16px 18px 14px">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontFamily: CK_BODY, fontSize: 11, fontWeight: 700, letterSpacing: 1.4, color: 'var(--faint)', textTransform: 'uppercase' }}>Overall progress</span>
            <span style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 21 }}>21%</span>
          </div>
          <div style={{ margin: '10px 0 7px' }}><CKBar frac={0.21} color="var(--gold)" h={9} /></div>
          <div style={{ fontFamily: CK_BODY, fontSize: 12, fontWeight: 500, color: 'var(--muted)' }}>Lessons and games combined</div>
        </CKCard>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <CKCard pad="14px 16px">
            <span style={{ color: 'var(--red2)' }}><CKIcon d={CKPaths.flame} size={21} stroke={1.9} /></span>
            <div style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 28, lineHeight: 1.1, marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>6</div>
            <div style={{ fontFamily: CK_BODY, fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, color: 'var(--faint)', textTransform: 'uppercase', marginTop: 2 }}>Day streak</div>
          </CKCard>
          <CKCard pad="14px 16px">
            <span style={{ color: 'var(--goldDeep)' }}><CKIcon d={CKPaths.book} size={21} stroke={1.9} /></span>
            <div style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 28, lineHeight: 1.1, marginTop: 6 }}>124</div>
            <div style={{ fontFamily: CK_BODY, fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, color: 'var(--faint)', textTransform: 'uppercase', marginTop: 2 }}>Words learnt</div>
          </CKCard>
        </div>

        {/* Settings */}
        <CKCard pad="2px 0" style={{ marginBottom: 14 }}>
          <CKSettingsRow icon={CKPaths.bell} label="Reminders" />
          <CKSettingsRow icon={CKPaths.speaker} label="Audio & pronunciation" />
          <CKSettingsRow icon={CKPaths.help} label="Help & feedback" last />
        </CKCard>

        <CK as="button" lip={4} style={{
          fontFamily: CK_DISPLAY, fontWeight: 700, fontSize: 15, color: 'var(--red2)',
          background: '#fff', border: CK_HAIRLINE, borderRadius: 'var(--r)',
          padding: '13px 0 11px', width: '100%',
        }}>Sign out</CK>

        <div style={{ height: 92, flexShrink: 0 }}></div>
      </div>
      <CKTabBar active={3} />
    </CKPhone>
  );
}

Object.assign(window, { PageLessons, PageGames, PageProfile, CK_LESSONS });
