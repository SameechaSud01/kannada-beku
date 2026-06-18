// ════════════════════════════════════════════════════════════════════════
// SITE SCREENS — pixel-faithful recreations of the real Kannada Beku app
// screens in the CHUNKY KIT v3 language, sized to a true ~390px iPhone screen
// so type/spacing match the app 1:1. Cream canvas + kolam dots, lip-pressed
// cards & buttons (16px radius), white-pill tab bar with a solid-red active
// circle. Display = Baloo · body = DM Sans · Kannada = Noto. Placeholder = Rohan.
// ════════════════════════════════════════════════════════════════════════

const SCREEN_BG = T.surface;          // cream #faf6ea
const SCREEN_DOTS = 'rgba(27,29,14,0.05)';

// ── Streak pill — goldPale oval, gold lip, red flame ────────────────────────
function StreakPill({ days = 1 }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: T.goldFixed,
      border: `1.5px solid ${T.goldLip}`, color: T.goldInk, borderRadius: 999, padding: '10px 18px 9px',
      boxShadow: `0 3px 0 ${T.goldLip}` }}>
      <Icon name="flame" size={18} color={T.redHi} fill />
      <span style={{ fontFamily: F.display, fontWeight: 800, fontSize: 17, color: T.goldDark, lineHeight: 1, paddingTop: 1, fontVariantNumeric: 'tabular-nums' }}>{days}</span>
    </div>
  );
}

// ── Top app bar — stacked wordmark (Latin primary + Kannada), streak right ───
function TopBar({ kfont = 'noto', streak = 1 }) {
  return (
    <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '2px 24px 14px', borderBottom: `1px solid ${T.hairline}` }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span style={{ fontFamily: F.display, fontWeight: 800, fontSize: 25, color: T.red, letterSpacing: -0.4, lineHeight: 1 }}>Kannada Beku</span>
        <span style={{ fontFamily: kannadaFamily(kfont), fontWeight: 700, fontSize: 14, color: T.red, opacity: 0.82, lineHeight: 1 }}>ಕನ್ನಡ ಬೇಕು</span>
      </div>
      <StreakPill days={streak} />
    </div>
  );
}

// ── White-pill tab bar — active tab = solid red circle with a lip ───────────
function BottomNav({ active = 'home' }) {
  const tabs = [
    { id: 'home', icon: 'home' }, { id: 'learn', icon: 'learn' },
    { id: 'practice', icon: 'target' }, { id: 'profile', icon: 'profile' },
  ];
  return (
    <>
      {/* scrim — fades scrolling content out behind the floating pill */}
      <div aria-hidden style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 130, zIndex: 25,
        background: `linear-gradient(180deg, transparent, ${SCREEN_BG} 62%)`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 20, display: 'flex', justifyContent: 'center', zIndex: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: T.card, borderRadius: 999, padding: 9,
          border: `1px solid ${T.hairline}`, boxShadow: '0 4px 0 rgba(27,29,14,0.10), 0 14px 30px rgba(27,29,14,0.12)' }}>
          {tabs.map(tab => {
            const on = tab.id === active;
            return on ? (
              <div key={tab.id} style={{ width: 54, height: 54, borderRadius: 999, background: T.redHi,
                display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 3px 0 ${T.redLip}` }}>
                <Icon name={tab.icon} size={25} color="#fff" sw={2} />
              </div>
            ) : (
              <div key={tab.id} style={{ width: 54, height: 54, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={tab.icon} size={26} color={T.faint} sw={1.9} />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function ScreenWatermark() {
  return (
    <div aria-hidden style={{ position: 'absolute', right: -34, top: 150, zIndex: 0, pointerEvents: 'none' }}>
      <Rangoli size={240} color={T.goldDark} opacity={0.05} />
    </div>
  );
}

// ── Concentric daily-goal rings ─────────────────────────────────────────────
function Rings({ size = 150, sw = 12, gap = 6, rings, center }) {
  const c = size / 2;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
        {rings.map((rg, i) => {
          const r = c - sw / 2 - i * (sw + gap);
          const circ = 2 * Math.PI * r;
          return (
            <g key={i}>
              <circle cx={c} cy={c} r={r} fill="none" stroke={`color-mix(in srgb, ${rg.color} 16%, #fff)`} strokeWidth={sw} />
              <circle cx={c} cy={c} r={r} fill="none" stroke={rg.color} strokeWidth={sw} strokeLinecap="round"
                strokeDasharray={`${rg.frac * circ} ${circ}`} transform={`rotate(-90 ${c} ${c})`} />
            </g>
          );
        })}
      </svg>
      {center && <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>{center}</div>}
    </div>
  );
}

function Bar({ frac, color = T.redHi, track = 'rgba(27,29,14,0.10)', h = 11 }) {
  return (
    <div style={{ height: h, borderRadius: 99, background: track, overflow: 'hidden' }}>
      <div style={{ width: `${frac * 100}%`, height: '100%', borderRadius: 99, background: color }} />
    </div>
  );
}

// ── HOME ───────────────────────────────────────────────────────────────────
function HomeScreen({ kfont = 'noto' }) {
  const stats = [
    { l: 'Listen', v: 9, t: 10, c: T.redHi, dot: T.redHi },
    { l: 'Speak', v: 5, t: 8, c: T.goldDark, dot: T.gold },
    { l: 'Practice', v: 0, t: 10, c: T.red, dot: T.red },
  ];
  return (
    <div style={{ height: '100%', background: SCREEN_BG, position: 'relative', overflow: 'hidden' }}>
      <KolamBg color={SCREEN_DOTS} />
      <ScreenWatermark />
      <StatusBar />
      <TopBar kfont={kfont} streak={1} />

      <div style={{ position: 'relative', zIndex: 2, padding: '18px 22px 0' }}>
        {/* greeting */}
        <div style={{ fontFamily: F.display, fontSize: 34, fontWeight: 800, color: T.ink, letterSpacing: -0.7, lineHeight: 1.05 }}>Namaskāra, Rohan!</div>
        <div style={{ fontFamily: F.ui, fontSize: 16, fontWeight: 500, color: T.sub, marginTop: 5 }}>Let’s build your Kannada fluency today.</div>

        {/* daily-goal rings card — soft lifted shadow (matches app) */}
        <div style={{ marginTop: 18, background: '#fff', border: `1px solid ${T.hairline}`, borderRadius: 26,
          boxShadow: '0 14px 30px -12px rgba(27,29,14,0.18)', padding: '22px 20px', display: 'flex', alignItems: 'center', gap: 18 }}>
          <Rings size={150} sw={12} gap={6}
            rings={[{ frac: 0.97, color: T.redHi }, { frac: 0.62, color: T.gold }, { frac: 0.0, color: T.red }]}
            center={
              <div>
                <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 18, lineHeight: 1, color: T.ink }}>Daily</div>
                <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 10.5, letterSpacing: 1.6, color: T.faint, textTransform: 'uppercase', marginTop: 3 }}>goal</div>
              </div>
            } />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, flex: 1 }}>
            {stats.map((s) => (
              <div key={s.l}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
                  <span style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 16.5, color: T.ink }}>{s.l}</span>
                </div>
                <div style={{ lineHeight: 1, marginTop: 4, paddingLeft: 18, fontVariantNumeric: 'tabular-nums' }}>
                  <span style={{ fontFamily: F.display, fontWeight: 800, fontSize: 27, color: s.c }}>{s.v}</span>
                  <span style={{ fontFamily: F.display, fontWeight: 800, fontSize: 27, color: s.c, opacity: 0.92 }}>/{s.t}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* continue — the one action-red moment */}
        <div style={{ marginTop: 18, background: T.redHi, borderRadius: 18, padding: '16px 16px',
          display: 'flex', alignItems: 'center', gap: 12, boxShadow: `0 6px 0 ${T.redLip}` }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 3px 0 ${T.redLipDeep}` }}>
            <Icon name="play" size={20} color={T.redHi} fill />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 17, color: '#fff', letterSpacing: -0.3, lineHeight: 1.15, whiteSpace: 'nowrap' }}>Continue where you left off</div>
            <div style={{ fontFamily: F.ui, fontWeight: 600, fontSize: 13.5, color: 'rgba(255,255,255,0.85)', marginTop: 3 }}>Lesson 2 · Names · ~5 min</div>
          </div>
          <Icon name="chevron" size={20} color="rgba(255,255,255,0.9)" sw={2.2} />
        </div>

        {/* words-learnt — gold reward */}
        <div style={{ marginTop: 16, background: `linear-gradient(180deg, ${T.goldBright}, ${T.gold})`,
          borderRadius: 18, padding: '18px 20px 16px', boxShadow: `0 6px 0 ${T.goldLip}` }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: F.display, fontWeight: 800, fontSize: 21, color: T.goldInk }}>Words learnt: 14</span>
            <span style={{ fontFamily: F.display, fontWeight: 800, fontSize: 21, color: T.goldInk }}>40%</span>
          </div>
          <div style={{ margin: '13px 0 9px' }}>
            <Bar frac={0.40} color={T.redHi} track="rgba(108,80,0,0.22)" h={11} />
          </div>
          <div style={{ fontFamily: F.ui, fontWeight: 600, fontSize: 13.5, color: T.goldInk, opacity: 0.85 }}>of your weekly target achieved</div>
        </div>

        {/* stuck — urgent (stays red) */}
        <div style={{ marginTop: 16, background: T.errLow, borderRadius: 18, padding: '18px',
          display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 5px 0 rgba(145,0,27,0.22)' }}>
          <div style={{ width: 50, height: 50, borderRadius: 15, background: T.redHi, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 3px 0 ${T.redLip}` }}>
            <Icon name="sos" size={25} color="#fff" sw={2.3} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 18.5, color: T.red, letterSpacing: -0.3, lineHeight: 1.15 }}>Stuck right now?</div>
            <div style={{ fontFamily: F.ui, fontSize: 14, fontWeight: 500, color: T.sub, marginTop: 2, lineHeight: 1.32 }}>Survival phrases for the auto, shop &amp; street · works offline.</div>
          </div>
          <Icon name="chevron" size={22} color={T.red} sw={2.2} />
        </div>

        <div style={{ height: 40 }} />
      </div>

      <BottomNav active="home" />
    </div>
  );
}

// ── LESSON (teach-word card) ────────────────────────────────────────────────
function LessonScreen({ kfont = 'noto' }) {
  const kf = kannadaFamily(kfont);
  return (
    <div style={{ height: '100%', background: SCREEN_BG, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <KolamBg color={SCREEN_DOTS} />
      <ScreenWatermark />
      <StatusBar />

      {/* progress row */}
      <div style={{ position: 'relative', zIndex: 2, padding: '6px 24px 0', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: T.card, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${T.hairline}`, boxShadow: '0 3px 0 rgba(27,29,14,0.10)', flexShrink: 0 }}>
          <Icon name="x" size={19} color={T.sub} sw={2.4} />
        </div>
        <div style={{ flex: 1 }}>
          <Bar frac={0.33} color={T.gold} track="rgba(27,29,14,0.10)" h={11} />
        </div>
      </div>
      <div style={{ position: 'relative', zIndex: 2, fontFamily: F.ui, fontSize: 13, fontWeight: 700, color: T.faint, textAlign: 'center', marginTop: 16, letterSpacing: 0.8, textTransform: 'uppercase' }}>Word 1 of 3</div>

      {/* centered teaching block */}
      <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, padding: '0 24px' }}>
        <div style={{ background: T.creamLow, borderRadius: 18, padding: '46px 24px', width: '100%', textAlign: 'center', boxShadow: '0 5px 0 rgba(27,29,14,0.10)', border: `1px solid ${T.hairline}` }}>
          <div style={{ fontFamily: F.translit, fontWeight: 700, fontSize: 52, lineHeight: 1.05, color: T.ink, letterSpacing: -0.6 }}>Nānu</div>
          <div style={{ fontFamily: F.ui, fontWeight: 500, fontSize: 21, color: T.sub, marginTop: 16 }}>I</div>
          <div style={{ fontFamily: kf, fontSize: 19, color: T.faint, marginTop: 16 }}>ನಾನು</div>
        </div>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: T.redHi, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 6px 0 ${T.redLip}` }}>
          <Icon name="audio" size={34} color="#fff" sw={2.2} />
        </div>
        <div style={{ fontFamily: F.ui, fontSize: 14.5, fontWeight: 500, color: T.faint }}>Tap to hear it</div>
      </div>

      <div style={{ position: 'relative', zIndex: 3, padding: '14px 24px 34px', background: `linear-gradient(0deg, ${SCREEN_BG} 72%, transparent)` }}>
        <button style={{ width: '100%', border: 'none', cursor: 'pointer', background: T.redHi, color: '#fff', borderRadius: 18, padding: '18px 20px',
          fontFamily: F.display, fontWeight: 700, fontSize: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: `0 6px 0 ${T.redLip}` }}>
          Got it <Icon name="check" size={19} color="#fff" sw={2.6} />
        </button>
      </div>
    </div>
  );
}

// ── GAMES (Practice) ────────────────────────────────────────────────────────
function GamesScreen({ kfont = 'noto' }) {
  const kf = kannadaFamily(kfont);
  return (
    <div style={{ height: '100%', background: SCREEN_BG, position: 'relative', overflow: 'hidden' }}>
      <KolamBg color={SCREEN_DOTS} />
      <ScreenWatermark />
      <StatusBar />
      <TopBar kfont={kfont} streak={1} />

      <div style={{ position: 'relative', zIndex: 2, padding: '16px 22px 0' }}>
        <div style={{ fontFamily: F.display, fontSize: 34, fontWeight: 800, color: T.ink, letterSpacing: -0.7 }}>Games</div>
        <div style={{ fontFamily: F.ui, fontSize: 16, fontWeight: 500, color: T.sub, marginTop: 3 }}>Play with what you’ve learned.</div>

        {/* featured — Quick quiz (gold reward card) */}
        <div style={{ position: 'relative', overflow: 'hidden', marginTop: 18, background: `linear-gradient(180deg, ${T.goldBright}, ${T.gold})`,
          borderRadius: 18, padding: '18px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: `0 6px 0 ${T.goldLip}` }}>
          <div aria-hidden style={{ position: 'absolute', right: -4, top: -22, fontFamily: kf, fontSize: 108, lineHeight: 1, fontWeight: 700, color: 'rgba(120,89,0,0.18)' }}>ಪ</div>
          <div style={{ width: 58, height: 58, borderRadius: 16, background: 'rgba(255,255,255,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="sparkle" size={29} color={T.goldInk} fill />
          </div>
          <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 23, color: T.goldInk, letterSpacing: -0.3 }}>Quick quiz</div>
            <div style={{ fontFamily: F.ui, fontWeight: 500, fontSize: 14.5, color: T.goldInk, opacity: 0.82, marginTop: 2 }}>Test your speed.</div>
          </div>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: T.redHi, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 3px 0 ${T.redLip}` }}>
            <Icon name="play" size={20} color="#fff" fill />
          </div>
        </div>

        {/* grid 2-up */}
        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
          {[
            { t: 'Dictation', s: 'Hear it. Type it.', bg: T.redHi, lip: T.redLip, fg: '#fff', glyph: 'ಕ' },
            { t: 'Conversations', s: 'Roleplay real scenes.', bg: T.red, lip: T.redLipDeep, fg: '#fff', glyph: 'ಮ' },
          ].map(g => (
            <div key={g.t} style={{ position: 'relative', overflow: 'hidden', background: g.bg, borderRadius: 18, padding: 16, minHeight: 150,
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', boxShadow: `0 6px 0 ${g.lip}` }}>
              <div aria-hidden style={{ position: 'absolute', top: 8, right: 10, fontFamily: kf, fontSize: 76, lineHeight: 1, color: 'rgba(255,255,255,0.22)', fontWeight: 700 }}>{g.glyph}</div>
              <div style={{ position: 'relative' }}>
                <div style={{ fontFamily: F.display, fontSize: 20, fontWeight: 700, color: g.fg, letterSpacing: -0.2 }}>{g.t}</div>
                <div style={{ fontFamily: F.ui, fontSize: 13.5, color: g.fg, opacity: 0.84, marginTop: 2, fontWeight: 500 }}>{g.s}</div>
              </div>
            </div>
          ))}
        </div>

        {/* opposites — full width gold-pale */}
        <div style={{ position: 'relative', overflow: 'hidden', marginTop: 13, background: T.goldFixed, borderRadius: 18, padding: '18px 20px', minHeight: 100,
          display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: `0 6px 0 ${T.goldLip}` }}>
          <div aria-hidden style={{ position: 'absolute', top: -12, right: 8, fontFamily: kf, fontSize: 86, lineHeight: 1, color: 'rgba(120,89,0,0.20)', fontWeight: 700 }}>ವ</div>
          <div style={{ position: 'relative' }}>
            <div style={{ fontFamily: F.display, fontSize: 20, fontWeight: 700, color: T.goldInk, letterSpacing: -0.2 }}>Opposites</div>
            <div style={{ fontFamily: F.ui, fontSize: 13.5, color: T.goldInk, opacity: 0.82, marginTop: 2, fontWeight: 500 }}>Match contrasts, fast.</div>
          </div>
        </div>

        <div style={{ marginTop: 16, fontFamily: F.ui, fontSize: 13.5, color: T.sub, lineHeight: 1.4 }}>
          Each game draws only from phrases you’ve already learned.
        </div>
      </div>

      <BottomNav active="practice" />
    </div>
  );
}

Object.assign(window, { HomeScreen, LessonScreen, GamesScreen, BottomNav, StreakPill, TopBar });
