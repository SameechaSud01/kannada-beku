// PLAYFUL HOME — page shell w/ watermark, top bar (left logo · streak pill ·
// hairline border), demoted fun-fact banner, the playful Home, slim icon-only
// nav, and colour-coded Learn / Practice / Profile tabs. No mascot — energy
// comes from Baloo type, motif, colour and motion.

// ── Page shell: background + watermark motif layer ─────────────────────────
function PageShell({ children, bg, scroll = true, motif = true }) {
  const { tokens, tw } = usePL();
  const t = tokens;
  return (
    <div style={{ height: '100%', position: 'relative', background: bg || t.bg, overflow: 'hidden' }}>
      {tw.watermark && motif && <Watermark on />}
      <div style={{ position: 'relative', height: '100%', zIndex: 1, overflowY: scroll ? 'auto' : 'hidden' }}>
        {children}
      </div>
    </div>
  );
}

// ── Wordmark (left-aligned) ────────────────────────────────────────────────
function Wordmark({ size = 1 }) {
  const { tokens, tw } = usePL();
  const t = tokens;
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
      <span style={{ fontFamily: PLfont.display, fontWeight: 800, fontSize: 21 * size, letterSpacing: -0.4, color: t.ink }}>Kannada</span>
      <span style={{ fontFamily: kannadaFamily(tw.kfont), fontWeight: 700, fontSize: 23 * size, color: t.red, lineHeight: 1 }}>ಬಾ</span>
    </div>
  );
}

// ── Streak pill — own clickable pill, taps open a celebration ──────────────
function StreakPill({ days = 12, onCelebrate }) {
  const { tokens } = usePL();
  const t = tokens;
  const [ping, setPing] = React.useState(0);
  return (
    <button onClick={() => { setPing(p => p + 1); onCelebrate && onCelebrate(); }} style={{
      border: 'none', cursor: 'pointer', background: t.goldWash, color: t.goldInk,
      borderRadius: 999, padding: '6px 12px 6px 9px', display: 'inline-flex', alignItems: 'center', gap: 4,
      boxShadow: `inset 0 0 0 1.5px ${t.gold}`, WebkitTapHighlightColor: 'transparent' }}>
      <span key={ping} style={{ display: 'inline-flex', animation: 'pl-flame .5s ease' }}>
        <PLIcon name="flame" size={17} color={t.red} fill />
      </span>
      <span style={{ fontFamily: PLfont.display, fontWeight: 800, fontSize: 16, color: t.ink, lineHeight: 1 }}>{days}</span>
    </button>
  );
}

// ── Top bar — left logo, streak pill right, hairline bottom border ─────────
function TopBar({ days = 12, onCelebrate }) {
  const { tokens } = usePL();
  const t = tokens;
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 20,
      paddingTop: 50, paddingBottom: 11, paddingLeft: 18, paddingRight: 16,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: t.bg, borderBottom: `1px solid ${t.line}` }}>
      <Wordmark />
      <StreakPill days={days} onCelebrate={onCelebrate} />
    </div>
  );
}

// ── Demoted fun-fact banner (Discord-style, slim, dismissible, cycles) ─────
function FunFactBanner() {
  const { tokens, vibe } = usePL();
  const t = tokens;
  const [i, setI] = React.useState(2);
  const [show, setShow] = React.useState(true);
  if (!show) return null;
  const fact = FUN_FACTS[i % FUN_FACTS.length];
  const acc = t.goldDeep;
  return (
    <div style={{ padding: '11px 16px 0' }}>
      <div onClick={() => setI(v => v + 1)} style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer',
        background: t.card, borderRadius: 12, padding: '8px 10px', boxShadow: `inset 0 0 0 1px ${t.line}` }}>
        <div style={{ width: 24, height: 24, borderRadius: 7, background: acc, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <PLIcon name="sparkle" size={14} color="#fff" fill />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: PLfont.ui, fontSize: 12.5, color: t.sub, lineHeight: 1.3,
            overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
            <b style={{ color: acc, fontWeight: 800 }}>Did you know?</b> {fact.f}
          </div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); setShow(false); }} style={{ border: 'none', background: 'transparent',
          cursor: 'pointer', padding: 3, flexShrink: 0, color: t.faint }}>
          <PLIcon name="x" size={14} color={t.faint} sw={2.2} />
        </button>
      </div>
    </div>
  );
}

// ── Section label (colour bar from the vibe) ───────────────────────────────
function SectionLabel({ children, color }) {
  const { tokens } = usePL();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, margin: '18px 4px 10px' }}>
      <div style={{ width: 4, height: 13, borderRadius: 2, background: color, flexShrink: 0 }} />
      <span style={{ fontFamily: PLfont.ui, fontSize: 11.5, fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase', color: tokens.sub }}>{children}</span>
    </div>
  );
}

// ── HOME ───────────────────────────────────────────────────────────────────
function Home({ onContinue, onEmergency, onNav, onCelebrate, name = 'Samee', days = 12, completed = 1, total = 8 }) {
  const { tokens, vibe, tw } = usePL();
  const t = tokens;
  const pct = Math.round((completed / total) * 100);
  const kf = kannadaFamily(tw.kfont);
  const A = vibe.accents(t);
  const ring = 58, stroke = 6.5, r = (ring - stroke) / 2, circ = 2 * Math.PI * r;

  return (
    <PageShell>
      <TopBar days={days} onCelebrate={() => onCelebrate && onCelebrate('streak')} />
      <FunFactBanner />

      <div style={{ padding: '12px 16px 118px' }}>
        <div style={{ fontFamily: PLfont.display, fontSize: 24, fontWeight: 700, color: t.ink, padding: '4px 2px 0', letterSpacing: -0.3 }}>
          Namaskāra, {name}! <span style={{ display: 'inline-block', animation: 'pl-wave 2.6s ease-in-out infinite', transformOrigin: '70% 70%' }}>👋</span>
        </div>
        <div style={{ fontFamily: PLfont.ui, fontSize: 13.5, color: t.sub, padding: '2px 2px 0', fontWeight: 500 }}>
          Pick up where you left off — 5 minutes today keeps the streak.
        </div>

        {/* HOOK — continue the next lesson (vibe hero gradient) */}
        <div style={{ marginTop: 14, position: 'relative', overflow: 'hidden', borderRadius: 22,
          background: vibe.hero(t), padding: 18, boxShadow: `0 12px 28px ${t.redLip}33` }}>
          <div aria-hidden style={{ position: 'absolute', right: -16, top: -34, fontFamily: kf, fontSize: 150,
            lineHeight: 1, color: 'rgba(255,255,255,0.12)', fontWeight: 700, pointerEvents: 'none' }}>ನ</div>
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.18)',
              borderRadius: 8, padding: '4px 9px' }}>
              <PLIcon name="play" size={11} color="#fff" fill />
              <span style={{ fontFamily: PLfont.ui, fontSize: 11, fontWeight: 800, letterSpacing: 0.5, color: '#fff' }}>CONTINUE · LESSON 2</span>
            </div>
            <div style={{ fontFamily: PLfont.display, fontSize: 30, fontWeight: 800, color: '#fff', letterSpacing: -0.5, lineHeight: 1.05, marginTop: 12 }}>Names</div>
            <div style={{ fontFamily: PLfont.ui, fontSize: 13.5, color: 'rgba(255,255,255,0.9)', fontWeight: 500, marginTop: 5 }}>
              I, you, my name is · <span style={{ fontFamily: PLfont.italic, fontStyle: 'italic' }}>~5 min</span>
            </div>
            {/* mini step dots */}
            <div style={{ display: 'flex', gap: 5, marginTop: 14 }}>
              {[1,1,0,0,0].map((on, i) => (
                <div key={i} style={{ width: on ? 22 : 8, height: 8, borderRadius: 5,
                  background: on ? vibe.heroAccent(t) : 'rgba(255,255,255,0.3)', transition: 'width .3s' }} />
              ))}
            </div>
            <div style={{ marginTop: 15, maxWidth: 240 }}>
              <LipButton color={vibe.heroAccent(t)} lip={t.goldLip} fg={t.goldInk} icon="arrow" onClick={onContinue} style={{ whiteSpace: 'nowrap' }}>Continue lesson</LipButton>
            </div>
          </div>
        </div>

        {/* YOUR PROGRESS — encouraging, gold ring */}
        <div onClick={() => onNav('learn')} style={{ marginTop: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 15,
          background: t.card, borderRadius: 18, padding: '14px 16px', boxShadow: `inset 0 0 0 1px ${t.line}` }}>
          <div style={{ position: 'relative', width: ring, height: ring, flexShrink: 0 }}>
            <svg width={ring} height={ring} style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={ring/2} cy={ring/2} r={r} fill="none" stroke={t.high} strokeWidth={stroke} />
              <circle cx={ring/2} cy={ring/2} r={r} fill="none" stroke={t.goldLip} strokeWidth={stroke} strokeLinecap="round"
                strokeDasharray={circ} strokeDashoffset={circ * (1 - completed/total)} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: PLfont.display, fontWeight: 800, fontSize: 16, color: t.goldInk }}>{pct}%</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: PLfont.display, fontSize: 19, fontWeight: 700, color: t.ink, letterSpacing: -0.2 }}>{completed} of {total} lessons</div>
            <div style={{ fontFamily: PLfont.ui, fontSize: 12.5, color: t.sub, marginTop: 2, lineHeight: 1.4 }}>
              You’re on a roll — <b style={{ color: t.goldInk }}>Names</b> is next.
            </div>
          </div>
          <PLIcon name="chevron" size={18} color={t.goldLip} sw={2.4} />
        </div>

        {/* STUCK — the single urgent red accent */}
        <div onClick={onEmergency} style={{ marginTop: 11, cursor: 'pointer', position: 'relative', overflow: 'hidden',
          display: 'flex', alignItems: 'center', gap: 13, background: t.redWash, borderRadius: 18, padding: '14px 16px',
          boxShadow: `inset 0 0 0 1px ${t.red}28` }}>
          <div style={{ width: 42, height: 42, borderRadius: 13, background: t.red, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 12px ${t.redLip}44`, animation: 'pl-pulse 2.4s ease-in-out infinite' }}>
            <PLIcon name="sos" size={23} color="#fff" sw={2.3} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: PLfont.display, fontSize: 18, fontWeight: 700, color: t.red, letterSpacing: -0.2 }}>Stuck right now?</div>
            <div style={{ fontFamily: PLfont.ui, fontSize: 12.5, color: t.sub, marginTop: 1, lineHeight: 1.35 }}>
              Survival phrases for the auto, shop &amp; street · works offline.
            </div>
          </div>
          <PLIcon name="arrow" size={18} color={t.red} sw={2.4} />
        </div>

        {/* QUICK LINKS — colour-coded */}
        <div style={{ marginTop: 11, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
          {[
            { l: 'Practice', s: '2 games', icon: 'practice', acc: A[1], to: 'practice' },
            { l: 'Heritage', s: '4 reads', icon: 'book', acc: A[2], to: 'learn' },
          ].map(c => (
            <div key={c.l} onClick={() => onNav(c.to)} style={{ cursor: 'pointer', background: t.card, borderRadius: 16,
              padding: 13, display: 'flex', alignItems: 'center', gap: 11, boxShadow: `inset 0 0 0 1px ${t.line}` }}>
              <div style={{ width: 36, height: 36, borderRadius: 11, background: `${c.acc}1c`, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PLIcon name={c.icon} size={18} color={c.acc} fill />
              </div>
              <div>
                <div style={{ fontFamily: PLfont.display, fontSize: 16, fontWeight: 700, color: t.ink, letterSpacing: -0.2 }}>{c.l}</div>
                <div style={{ fontFamily: PLfont.ui, fontSize: 11.5, color: t.faint, fontWeight: 600, marginTop: 0 }}>{c.s}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

// ── Slim icon-only bottom nav ───────────────────────────────────────────────
function BottomNav({ active = 'home', onNav }) {
  const { tokens } = usePL();
  const t = tokens;
  const tabs = [
    { id: 'home', icon: 'home', label: 'Home' },
    { id: 'learn', icon: 'learn', label: 'Learn' },
    { id: 'practice', icon: 'practice', label: 'Practice' },
    { id: 'profile', icon: 'profile', label: 'Profile' },
  ];
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 30, paddingBottom: 24,
      display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
      <div style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: 4,
        background: t.card, borderRadius: 999, padding: 5,
        boxShadow: '0 8px 24px rgba(27,29,14,0.16), inset 0 0 0 1px rgba(27,29,14,0.05)' }}>
        {tabs.map(tab => {
          const on = tab.id === active;
          return (
            <button key={tab.id} onClick={() => onNav(tab.id)} aria-label={tab.label} style={{
              border: 'none', cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
              width: 44, height: 44, borderRadius: 999, background: on ? t.red : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background .18s', boxShadow: on ? `0 4px 12px ${t.red}52` : 'none' }}>
              <PLIcon name={tab.icon} size={22} color={on ? '#fff' : t.faint} fill={on} sw={2} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Learn tab ────────────────────────────────────────────────────────────────
function LearnTab({ onLesson }) {
  const { tokens, tw } = usePL();
  const t = tokens; const kf = kannadaFamily(tw.kfont);
  const lessons = [
    { k: 'ನ', t: 'Greetings', s: 'done', sub: 'Hello and how are you' },
    { k: 'ಹ', t: 'Names', s: 'current', sub: 'I, you, my name is' },
    { k: 'ಬೇ', t: 'Wanting', s: 'locked', sub: "I want, I don't want" },
    { k: 'ಇ', t: 'Pointing', s: 'locked', sub: 'This, that, here, there' },
    { k: 'ಬ', t: 'Easy verbs', s: 'locked', sub: 'Come, eat, laugh' },
  ];
  return (
    <PageShell>
      <div style={{ paddingTop: 50, paddingLeft: 18, paddingRight: 16, paddingBottom: 11,
        borderBottom: `1px solid ${t.line}`, position: 'sticky', top: 0, background: t.bg, zIndex: 20 }}>
        <div style={{ fontFamily: PLfont.display, fontSize: 25, fontWeight: 800, color: t.ink, letterSpacing: -0.4 }}>Your journey</div>
        <div style={{ fontFamily: PLfont.italic, fontStyle: 'italic', fontSize: 13, color: t.sub, marginTop: 0 }}>Swalpa swalpa — one step at a time.</div>
      </div>
      <div style={{ padding: '15px 16px 118px', display: 'flex', flexDirection: 'column', gap: 9, position: 'relative' }}>
        {lessons.map((l, i) => {
          const done = l.s === 'done', cur = l.s === 'current', locked = l.s === 'locked';
          return (
            <div key={i} onClick={() => cur && onLesson && onLesson()} style={{ display: 'flex', alignItems: 'center', gap: 13,
              background: cur ? t.card : t.low, borderRadius: 18, padding: 12, cursor: cur ? 'pointer' : 'default',
              opacity: locked ? 0.62 : 1, boxShadow: cur ? `0 8px 20px ${t.red}1f, inset 0 0 0 2px ${t.red}` : 'none' }}>
              <div style={{ width: 50, height: 50, borderRadius: 15, flexShrink: 0,
                background: done ? t.goldWash : cur ? t.red : t.high,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: kf, fontSize: 25, fontWeight: 600, color: done ? t.goldInk : cur ? '#fff' : t.faint }}>{l.k}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: PLfont.display, fontSize: 17, fontWeight: 700, color: t.ink, letterSpacing: -0.2 }}>{l.t}</div>
                <div style={{ fontFamily: PLfont.ui, fontSize: 12.5, color: t.sub, marginTop: 0 }}>{l.sub}</div>
              </div>
              {done ? <div style={{ width: 26, height: 26, borderRadius: 13, background: t.goldDeep, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PLIcon name="check" size={15} color="#fff" sw={2.6} /></div>
                : cur ? <div style={{ width: 32, height: 32, borderRadius: 999, background: t.red, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 10px ${t.red}44` }}><PLIcon name="play" size={15} color="#fff" fill /></div>
                : <PLIcon name="lock" size={17} color={t.faint} />}
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}

// ── Practice tab ─────────────────────────────────────────────────────────────
function PracticeTab() {
  const { tokens, vibe, tw } = usePL();
  const t = tokens; const kf = kannadaFamily(tw.kfont);
  const games = [
    { k: 'ಕೇಳಿ', t: 'Dictation', s: 'Hear it. Type it.', bg: t.red, fg: '#fff', lip: t.redLip, big: true },
    { k: 'ವಿರುದ್ಧ', t: 'Opposites', s: 'Match contrasts.', bg: t.gold, fg: t.goldInk, lip: t.goldLip },
    { k: '?', t: 'Quick Quiz', s: 'Soon', bg: t.goldDeep, fg: '#fff', lip: t.goldDeepLip, soon: true },
    { k: 'ಚಿತ್ರ', t: 'Image Match', s: 'Soon', bg: t.redLip, fg: '#fff', lip: '#4a000d', soon: true },
  ];
  return (
    <PageShell>
      <div style={{ paddingTop: 50, paddingLeft: 18, paddingRight: 16, paddingBottom: 11,
        borderBottom: `1px solid ${t.line}`, position: 'sticky', top: 0, background: t.bg, zIndex: 20 }}>
        <div style={{ fontFamily: PLfont.display, fontSize: 25, fontWeight: 800, color: t.ink, letterSpacing: -0.4 }}>Practice</div>
        <div style={{ fontFamily: PLfont.ui, fontSize: 13, color: t.sub, marginTop: 0 }}>Play with the phrases you’ve met.</div>
      </div>
      <div style={{ padding: '15px 16px 118px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
        {games.map(g => (
          <div key={g.t} style={{ gridColumn: g.big ? 'span 2' : 'span 1', position: 'relative', overflow: 'hidden',
            background: g.bg, borderRadius: 20, padding: 15, minHeight: g.big ? 116 : 126, display: 'flex', flexDirection: 'column',
            boxShadow: `0 5px 0 ${g.lip}`, opacity: g.soon ? 0.94 : 1, cursor: g.soon ? 'default' : 'pointer' }}>
            <div aria-hidden style={{ position: 'absolute', right: -6, bottom: -22, fontFamily: kf, fontSize: g.big ? 108 : 82,
              color: 'rgba(255,255,255,0.18)', fontWeight: 700, lineHeight: 1 }}>{g.k}</div>
            {g.soon && <div style={{ position: 'absolute', top: 12, right: 12, fontFamily: PLfont.ui, fontSize: 9.5, fontWeight: 800,
              letterSpacing: 1, textTransform: 'uppercase', color: g.fg, opacity: 0.8, background: 'rgba(255,255,255,0.18)', padding: '3px 7px', borderRadius: 6 }}>Soon</div>}
            <div style={{ position: 'relative', marginTop: 'auto' }}>
              <div style={{ fontFamily: PLfont.display, fontSize: g.big ? 22 : 18, fontWeight: 700, color: g.fg, letterSpacing: -0.2 }}>{g.t}</div>
              <div style={{ fontFamily: PLfont.ui, fontSize: 12, color: g.fg, opacity: 0.84, marginTop: 0, fontWeight: 600 }}>{g.s}</div>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

// ── Profile tab (faithful IA to app/(tabs)/profile.tsx) ─────────────────────
function ProfileTab({ days = 12, name = 'Samee', words = 37, overallPct = 18, onCelebrate }) {
  const { tokens, vibe } = usePL();
  const t = tokens; const A = vibe.accents(t);
  const settings = [
    { id: 'reminders', label: 'Reminders', icon: 'bell' },
    { id: 'audio', label: 'Audio & pronunciation', icon: 'audio' },
    { id: 'help', label: 'Help & feedback', icon: 'info' },
  ];
  return (
    <PageShell>
      <TopBar days={days} onCelebrate={() => onCelebrate && onCelebrate('streak')} />
      <div style={{ padding: '0 16px 118px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 22, paddingBottom: 20 }}>
          <div style={{ width: 84, height: 84, borderRadius: 999, background: vibe.hero(t), display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 10px 24px ${t.redLip}38`, marginBottom: 12 }}>
            <span style={{ fontFamily: PLfont.display, fontSize: 36, fontWeight: 800, color: '#fff' }}>{name[0]}</span>
          </div>
          <div style={{ fontFamily: PLfont.display, fontSize: 24, fontWeight: 800, color: t.ink, letterSpacing: -0.3 }}>{name}</div>
          <div style={{ fontFamily: PLfont.italic, fontStyle: 'italic', fontSize: 13, color: t.sub, marginTop: 1 }}>Level 2 · Friendly Beginner</div>
        </div>

        {/* Overall progress band */}
        <div onClick={() => onCelebrate && onCelebrate('level')} style={{ cursor: 'pointer', background: t.goldWash, borderRadius: 20, padding: '16px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 9 }}>
            <span style={{ fontFamily: PLfont.ui, fontSize: 11, fontWeight: 800, letterSpacing: 1.4, textTransform: 'uppercase', color: t.goldLip }}>Overall progress</span>
            <span style={{ fontFamily: PLfont.display, fontSize: 22, fontWeight: 800, color: t.ink }}>{overallPct}%</span>
          </div>
          <div style={{ height: 9, borderRadius: 5, background: 'rgba(201,138,0,0.22)', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 5, background: t.goldLip, width: `${overallPct}%` }} />
          </div>
          <div style={{ fontFamily: PLfont.ui, fontSize: 12, color: t.sub, marginTop: 8, fontWeight: 500 }}>Lessons + games combined</div>
        </div>

        {/* Two stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11, marginTop: 11 }}>
          {[
            { v: days, l: 'Day streak', ic: 'flame', c: t.red },
            { v: words, l: 'Words learned', ic: 'learn', c: t.gold },
          ].map(s => (
            <div key={s.l} style={{ background: t.card, borderRadius: 18, padding: 16, boxShadow: `inset 0 0 0 1px ${t.line}` }}>
              <PLIcon name={s.ic} size={20} color={s.c} fill={s.ic === 'flame'} />
              <div style={{ fontFamily: PLfont.display, fontSize: 30, fontWeight: 800, color: t.ink, letterSpacing: -0.8, marginTop: 7, lineHeight: 1 }}>{s.v}</div>
              <div style={{ fontFamily: PLfont.ui, fontSize: 10.5, fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase', color: t.faint, marginTop: 5 }}>{s.l}</div>
            </div>
          ))}
        </div>

        <SectionLabel color={A[3]}>Your goal</SectionLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: t.card, borderRadius: 16, padding: '14px 16px',
          cursor: 'pointer', boxShadow: `inset 0 0 0 1px ${t.line}` }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: `${A[3]}1c`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <PLIcon name="target" size={20} color={A[3]} sw={2.2} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: PLfont.display, fontSize: 16, fontWeight: 700, color: t.ink, letterSpacing: -0.2 }}>Spoken only</div>
            <div style={{ fontFamily: PLfont.ui, fontSize: 12.5, color: t.sub, marginTop: 0 }}>10 min / day · 2 reasons</div>
          </div>
          <PLIcon name="chevron" size={17} color={t.faint} sw={2.4} />
        </div>

        <SectionLabel color={A[2]}>Settings</SectionLabel>
        <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: `inset 0 0 0 1px ${t.line}` }}>
          {settings.map((s, idx) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '14px 16px', cursor: 'pointer',
              background: idx % 2 === 0 ? t.card : t.low }}>
              <PLIcon name={s.icon} size={20} color={t.red} sw={2.1} />
              <span style={{ flex: 1, fontFamily: PLfont.ui, fontSize: 14.5, fontWeight: 600, color: t.ink }}>{s.label}</span>
              <PLIcon name="chevron" size={17} color={t.faint} sw={2.4} />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
          <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '12px 24px',
            fontFamily: PLfont.ui, fontSize: 14, fontWeight: 700, color: t.red }}>Sign out</button>
        </div>
      </div>
    </PageShell>
  );
}

Object.assign(window, { PageShell, Wordmark, StreakPill, TopBar, FunFactBanner, SectionLabel, Home, BottomNav, LearnTab, PracticeTab, ProfileTab });
