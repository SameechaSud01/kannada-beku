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
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: T.goldFixed,
      border: `1px solid ${T.goldLip}`, color: T.goldInk, borderRadius: 999, padding: '7px 13px 6px 10px',
      boxShadow: `0 2px 0 ${T.goldLip}` }}>
      <Icon name="flame" size={17} color={T.redHi} fill />
      <span style={{ fontFamily: F.display, fontWeight: 800, fontSize: 16, color: T.goldDark, lineHeight: 1, paddingTop: 1, fontVariantNumeric: 'tabular-nums' }}>{days} {days === 1 ? 'day' : 'days'}</span>
    </div>
  );
}

// ── Top app bar — stacked wordmark (Latin primary + Kannada), streak right ───
function TopBar({ kfont = 'noto', streak = 1 }) {
  return (
    <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '2px 24px 14px', borderBottom: `1px solid ${T.hairline}` }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span style={{ fontFamily: F.display, fontWeight: 700, fontSize: 22, color: T.red, letterSpacing: -0.3, lineHeight: 1 }}>Kannada Beku</span>
        <span style={{ fontFamily: kannadaFamily(kfont), fontWeight: 700, fontSize: 12, color: T.red, lineHeight: 1 }}>ಕನ್ನಡ ಬೇಕು</span>
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
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 20, display: 'flex', justifyContent: 'center', zIndex: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: T.card, borderRadius: 999, padding: 7,
          border: `1px solid ${T.hairline}`, boxShadow: '0 4px 0 rgba(27,29,14,0.18), 0 14px 30px rgba(27,29,14,0.12)' }}>
          {tabs.map(tab => {
            const on = tab.id === active;
            return on ? (
              <div key={tab.id} style={{ width: 46, height: 46, borderRadius: 999, background: T.redHi,
                display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 3px 0 ${T.redLip}` }}>
                <Icon name={tab.icon} size={20} color="#fff" sw={2} />
              </div>
            ) : (
              <div key={tab.id} style={{ width: 46, height: 46, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={tab.icon} size={20} color={T.sub} sw={2} />
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
    { l: 'Practice', v: 0, t: 10, c: T.tanLip, dot: T.tan },
  ];
  return (
    <div style={{ height: '100%', background: SCREEN_BG, position: 'relative', overflow: 'hidden' }}>
      <KolamBg color={SCREEN_DOTS} />
      <ScreenWatermark />
      <StatusBar />
      <TopBar kfont={kfont} streak={1} />

      <div style={{ position: 'relative', zIndex: 2, padding: '18px 22px 0' }}>
        {/* greeting */}
        <div style={{ fontFamily: F.display, fontSize: 32, fontWeight: 800, color: T.ink, letterSpacing: -0.5, lineHeight: 1.05 }}>Namaskāra, Rohan!</div>
        <div style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 500, color: T.sub, marginTop: 5 }}>Let’s build your Kannada fluency today.</div>

        {/* daily-goal card — "Daily Goal" header + info, rings left (matches app) */}
        <div style={{ marginTop: 18, background: '#fff', border: `1px solid ${T.hairline}`, borderRadius: 16,
          boxShadow: '0 4px 0 rgba(27,29,14,0.18)', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: F.display, fontWeight: 800, fontSize: 22, color: T.ink, letterSpacing: -0.3, lineHeight: 1.2 }}>Daily Goal</span>
            <Icon name="info" size={20} color={T.sub} sw={2} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Rings size={120} sw={9} gap={6}
              rings={[{ frac: 0.97, color: T.redHi }, { frac: 0.62, color: T.gold }, { frac: 0.0, color: T.tan }]} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
              {stats.map((s) => (
                <div key={s.l}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
                    <span style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 13, color: T.sub }}>{s.l}</span>
                  </div>
                  <div style={{ lineHeight: 1, marginTop: 2, paddingLeft: 14, fontVariantNumeric: 'tabular-nums' }}>
                    <span style={{ fontFamily: F.display, fontWeight: 800, fontSize: 22, letterSpacing: -0.3, color: s.c }}>{s.v}/{s.t}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* continue — the one action-red moment */}
        <div style={{ marginTop: 14, background: T.redHi, borderRadius: 16, padding: '16px 16px',
          display: 'flex', alignItems: 'center', gap: 12, boxShadow: `0 5px 0 ${T.redLip}` }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 3px 0 ${T.redLip}` }}>
            <Icon name="play" size={20} color={T.redHi} fill />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 17, color: '#fff', letterSpacing: -0.2, lineHeight: 1.15, whiteSpace: 'nowrap' }}>Continue where you left off</div>
            <div style={{ fontFamily: F.ui, fontWeight: 500, fontSize: 12.5, color: 'rgba(255,255,255,0.85)', marginTop: 3 }}>Lesson 2 · Names · ~5 min</div>
          </div>
          <Icon name="chevron" size={20} color="#fff" sw={2.2} />
        </div>

        {/* words-learnt — white archive card with a gold count badge (matches app) */}
        <div style={{ marginTop: 12, background: '#fff', border: `1px solid ${T.hairline}`, borderRadius: 16,
          boxShadow: '0 4px 0 rgba(27,29,14,0.18)', padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, flexShrink: 0,
            background: `linear-gradient(160deg, ${T.goldBright} 30%, ${T.gold} 60%)`, boxShadow: `0 4px 0 ${T.goldLip}`,
            display: 'grid', placeItems: 'center' }}>
            <span style={{ fontFamily: F.display, fontWeight: 800, fontSize: 20, color: T.goldInk, fontVariantNumeric: 'tabular-nums' }}>14</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontFamily: F.display, fontWeight: 800, fontSize: 19, color: T.ink, letterSpacing: -0.2 }}>Words learnt</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
            <span style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 14, color: T.goldLip }}>See all</span>
            <Icon name="chevron" size={15} color={T.goldLip} sw={2.4} />
          </div>
        </div>

        {/* stuck — urgent (stays red) */}
        <div style={{ marginTop: 12, background: T.errLow, borderRadius: 16, padding: 16,
          display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 4px 0 rgba(110,0,20,0.18)' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: T.redHi, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 3px 0 ${T.redLip}` }}>
            <Icon name="sos" size={23} color="#fff" sw={2.3} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 18, color: T.red, letterSpacing: -0.2, lineHeight: 1.15 }}>Stuck right now?</div>
            <div style={{ fontFamily: F.ui, fontSize: 12.5, fontWeight: 400, color: T.sub, marginTop: 2, lineHeight: 1.35 }}>Survival phrases for the auto, shop &amp; street · works offline.</div>
          </div>
          <Icon name="chevron" size={18} color={T.red} sw={2.2} />
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

      {/* floating exit chip — white chunky circle, red X (matches app ExitBackButton) */}
      <div style={{ position: 'absolute', zIndex: 3, top: 62, left: 22, width: 38, height: 38, borderRadius: '50%',
        background: '#fff', border: `1px solid ${T.hairline}`, boxShadow: '0 3px 0 rgba(27,29,14,0.18)',
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="x" size={20} color={T.red} sw={2.2} />
      </div>

      {/* progress — label above a gold bar (matches app LessonProgressBar) */}
      <div style={{ position: 'relative', zIndex: 2, padding: '56px 22px 0' }}>
        <div style={{ fontFamily: F.ui, fontSize: 11.5, fontWeight: 700, color: T.faint, textAlign: 'center', marginBottom: 8, letterSpacing: 0.4 }}>Word 1 of 3 — Learn</div>
        <Bar frac={0.33} color={T.gold} track="rgba(27,29,14,0.10)" h={9} />
      </div>

      {/* teaching block — flows from below the bar (matches app) */}
      <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 22px 0' }}>
        <div style={{ background: T.creamLow, borderRadius: 16, padding: '32px 16px', width: '100%', textAlign: 'center', boxShadow: '0 4px 0 rgba(27,29,14,0.18)' }}>
          <div style={{ fontFamily: F.translit, fontWeight: 700, fontSize: 40, lineHeight: 1.3, color: T.ink }}>Nānu</div>
          <div style={{ fontFamily: F.ui, fontWeight: 500, fontSize: 18, color: T.sub, marginTop: 12 }}>I</div>
          <div style={{ fontFamily: kf, fontSize: 14, color: T.faint, marginTop: 16 }}>ನಾನು</div>
        </div>
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: T.goldFixed, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 0 ${T.goldLip}` }}>
            <Icon name="audio" size={27} color={T.goldDark} sw={2} />
          </div>
          <div style={{ fontFamily: F.ui, fontSize: 14, fontWeight: 500, color: T.faint }}>Tap to hear it</div>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 3, padding: '14px 22px 30px', background: `linear-gradient(0deg, ${SCREEN_BG} 72%, transparent)` }}>
        <button style={{ width: '100%', border: 'none', cursor: 'pointer', background: T.redHi, color: '#fff', borderRadius: 15, padding: '13px 20px',
          fontFamily: F.display, fontWeight: 700, fontSize: 16.5, letterSpacing: 0.1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: `0 4px 0 ${T.redLip}` }}>
          Continue <Icon name="chevron" size={18} color="#fff" sw={2.4} />
        </button>
      </div>
    </div>
  );
}

// ── GAMES (Practice) — "Game Street": four tilted shop signboards ───────────
function GamesScreen({ kfont = 'noto' }) {
  const kf = kannadaFamily(kfont);
  const signs = [
    { t: 'Quick quiz', k: 'ವೇಗ', d: 'Test your speed.', glyph: 'ಪ', tilt: -1.2, bg: T.gold, lip: T.goldLip, ink: T.goldInk, tile: 'rgba(255,255,255,0.45)' },
    { t: 'Dictation', k: 'ಕೇಳಿ', d: 'Hear it. Type it.', glyph: 'ಕ', tilt: 1, bg: T.redHi, lip: T.redLip, ink: '#fff', tile: 'rgba(255,255,255,0.18)' },
    { t: 'Conversations', k: 'ಮಾತು', d: 'Roleplay real scenes.', glyph: 'ಮ', tilt: -0.8, bg: T.red, lip: T.redLipDeep, ink: '#fff', tile: 'rgba(255,255,255,0.16)' },
    { t: 'Opposites', k: 'ವಿರುದ್ಧ', d: 'Match contrasts.', glyph: 'ವ', tilt: 1.1, bg: T.goldFixed, lip: T.goldLip, ink: T.goldInk, tile: 'rgba(255,255,255,0.6)' },
  ];
  return (
    <div style={{ height: '100%', background: SCREEN_BG, position: 'relative', overflow: 'hidden' }}>
      <KolamBg color={SCREEN_DOTS} />
      <ScreenWatermark />
      <StatusBar />
      <TopBar kfont={kfont} streak={1} />

      <div style={{ position: 'relative', zIndex: 2, padding: '16px 22px 0' }}>
        <div style={{ fontFamily: F.display, fontSize: 32, fontWeight: 800, color: T.ink, letterSpacing: -0.5, marginBottom: 16 }}>Games</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {signs.map(sign => (
            <div key={sign.t} style={{ position: 'relative', background: sign.bg, borderRadius: 16, transform: `rotate(${sign.tilt}deg)`,
              padding: '15px 16px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: `0 5px 0 ${sign.lip}` }}>
              {/* painted inner outline, inset from the board edge */}
              <div aria-hidden style={{ position: 'absolute', inset: 6, border: '1px solid rgba(255,255,255,0.35)', borderRadius: 10, pointerEvents: 'none' }} />
              {/* glyph tile */}
              <div style={{ width: 54, height: 54, borderRadius: 12, background: sign.tile, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: kf, fontWeight: 700, fontSize: 27, lineHeight: 1, color: sign.ink }}>{sign.glyph}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontFamily: F.display, fontWeight: 800, fontSize: 21, color: sign.ink, letterSpacing: -0.3, lineHeight: 1.15, whiteSpace: 'nowrap' }}>{sign.t}</span>
                  <span style={{ fontFamily: kf, fontSize: 13, color: sign.ink, opacity: 0.75, lineHeight: 1 }}>{sign.k}</span>
                </div>
                <div style={{ fontFamily: F.ui, fontWeight: 500, fontSize: 12.5, color: sign.ink, opacity: 0.82, marginTop: 2, whiteSpace: 'nowrap' }}>{sign.d}</div>
                <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 11.5, color: sign.ink, opacity: 0.65, marginTop: 4, letterSpacing: 0.3 }}>2 LESSONS READY</div>
              </div>
              <Icon name="chevron" size={19} color={sign.ink} sw={2.2} />
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16, fontFamily: F.ui, fontSize: 12, color: T.sub, lineHeight: 1.5 }}>
          Each game draws only from phrases you’ve already learned.
        </div>
      </div>

      <BottomNav active="practice" />
    </div>
  );
}

Object.assign(window, { HomeScreen, LessonScreen, GamesScreen, BottomNav, StreakPill, TopBar });
