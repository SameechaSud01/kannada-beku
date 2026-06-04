// ════════════════════════════════════════════════════════════════════════
// PLAYFUL SYSTEM — a warmer, more joyful take on Kannada Baa.
// Same IA + tokens as the real app (colors.ts / fonts.ts) but pushed to feel
// like LEARNING and FUN, not a corporate dashboard:
//   • Baloo Tamma 2 display type (rounded, friendly — and it speaks Kannada)
//   • watermark motifs on every surface (mandala dots / glyph confetti / rays)
//   • NO mascot — personality comes from type, motif, colour & motion
//   • big celebratory micro-interactions (correct burst, level-up, streak flame)
//   • ONE cohesive palette: Mysore red + turmeric gold + warm neutrals (no
//     off-brand hues) — the only choice is the watermark motif
// ════════════════════════════════════════════════════════════════════════

// ── Base palette (grounded in constants/colors.ts, warmed toward white) ────
function makeTokens(bright) {
  return {
    bg:      bright ? '#fffdf4' : '#fbfbe2',   // near-white, warm
    bgTint:  bright ? '#fdf6e3' : '#f7f4d8',
    card:    '#ffffff',
    low:     bright ? '#f6f2e2' : '#f5f5dc',
    high:    bright ? '#efe9d4' : '#eaead1',
    highest: bright ? '#e9e2c9' : '#e4e4cc',
    dim:     bright ? '#ded6bd' : '#dbdcc3',
    line:    'rgba(27,29,14,0.08)',

    // Mysore red
    red: '#a30420', redHi: '#c40029', redLip: '#6e0014', redWash: '#fdecee',
    // Turmeric gold
    gold: '#fdc003', goldHi: '#ffd24d', goldLip: '#c98a00', goldInk: '#5a4300', goldWash: '#fff5d6',
    // Brand dark gold (turmeric, dialed deep) — the only "extra" tone, used sparingly
    goldDeep: '#785900', goldDeepLip: '#5a4300', goldDeepWash: '#f1e7cd',

    // text
    ink: '#1b1d0e', sub: '#5b5947', faint: '#908d76', onRed: '#ffffff',
  };
}

// ── Theme — ONE cohesive identity for every page. Mysore red is the primary /
//    action / urgency colour; turmeric gold (and a deep gold) carries progress,
//    encouragement & success; everything else is warm neutral surface. The only
//    thing that varies is the watermark motif. ──────────────────────────────
const THEME = {
  hero: (t) => `linear-gradient(152deg, ${t.redHi} 0%, ${t.red} 82%)`,   // brand CTA gradient
  heroAccent: (t) => t.gold,
  // section accents, in order of appearance — red+gold family only
  accents: (t) => [t.gold, t.red, t.goldDeep, t.red],
  motifColor: (t) => t.gold,
  wash: (t) => t.goldWash,
};
const MOTIFS = [
  { value: 'mandala', label: 'Rangoli' },
  { value: 'glyphs',  label: 'Glyphs' },
  { value: 'rays',    label: 'Rays' },
];

// ── Fonts ──────────────────────────────────────────────────────────────────
const PLfont = {
  display: "'Baloo Tamma 2', system-ui, sans-serif", // rounded, playful headers + numbers
  ui:      "'DM Sans', system-ui, sans-serif",        // body / chrome
  italic:  "'Lora', Georgia, serif",                  // transliteration (always italic)
};
function kannadaFamily(kfont) {
  return kfont === 'noto'
    ? "'Noto Sans Kannada', sans-serif"
    : "'Baloo Tamma 2', 'Noto Sans Kannada', sans-serif";
}

// ── Context ──────────────────────────────────────────────────────────────
const PLCtx = React.createContext(null);
const usePL = () => React.useContext(PLCtx);

// ── Icons (compact outline + a few filled for the tab bar) ─────────────────
function PLIcon({ name, size = 22, color = 'currentColor', sw = 2, fill = false }) {
  const stroke = {
    home:    <path d="M3 11l9-8 9 8v9a2 2 0 0 1-2 2h-4v-6h-6v6H5a2 2 0 0 1-2-2z"/>,
    learn:   <><path d="M4 5a2 2 0 0 1 2-2h6v17H6a2 2 0 0 1-2-2z"/><path d="M20 5a2 2 0 0 0-2-2h-6v17h6a2 2 0 0 0 2-2z"/></>,
    practice:<><path d="M3 9v6M21 9v6M6 5v14M18 5v14M6 12h12"/></>,
    profile: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    flame:   <path d="M12 3c1.6 3 5 5 5 9a5 5 0 0 1-10 0c0-2 1-3.2 2-4.2.1 1.4.9 2 1.6 2.2.5-2.8 1-4.6-.2-9z"/>,
    play:    <path d="M7 5v14l12-7z"/>,
    pause:   <><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></>,
    audio:   <><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 8a5 5 0 0 1 0 8M19.5 5.5a9 9 0 0 1 0 13"/></>,
    chevron: <path d="M9 6l6 6-6 6"/>,
    back:    <path d="M15 6l-6 6 6 6"/>,
    arrow:   <path d="M5 12h14M13 6l6 6-6 6"/>,
    check:   <path d="M5 12l5 5L20 6"/>,
    x:       <path d="M6 6l12 12M18 6 6 18"/>,
    lock:    <><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></>,
    bell:    <><path d="M18 16v-5a6 6 0 1 0-12 0v5l-2 2v1h16v-1z"/><path d="M9.5 21a2.5 2.5 0 0 0 5 0"/></>,
    mic:     <><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></>,
    star:    <path d="M12 3.5l2.6 5.6 6 .7-4.4 4.2 1.1 6L12 17.3 6.7 20l1.1-6L3.4 9.8l6-.7z"/>,
    sos:     <><path d="M9 11V5a2 2 0 0 1 4 0v8M13 9a2 2 0 0 1 4 0v8a5 5 0 0 1-10 0v-1l-3-4a2 2 0 0 1 3-3l2 2"/></>,
    auto:    <><path d="M3 16v-4l3-5h11l3 5v4"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M12 7v9"/></>,
    compass: <><circle cx="12" cy="12" r="9"/><path d="M14.5 9.5l-2 5-4-3z"/></>,
    book:    <path d="M4 4h7v16H6a2 2 0 0 1-2-2zM20 4h-7v16h5a2 2 0 0 0 2-2z"/>,
    target:  <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4"/></>,
    info:    <><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></>,
    sparkle: <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z"/>,
    trophy:  <><path d="M7 4h10v4a5 5 0 0 1-10 0z"/><path d="M7 5H4v1a3 3 0 0 0 3 3M17 5h3v1a3 3 0 0 1-3 3M9 16h6M12 13v3M9 20h6"/></>,
    bolt:    <path d="M13 2 4 14h6l-1 8 9-12h-6z"/>,
    google:  <path d="M21 12.2c0-.6-.1-1.2-.2-1.7H12v3.4h5.1a4.4 4.4 0 0 1-1.9 2.9v2.4h3.1c1.8-1.7 2.7-4.1 2.7-7z"/>,
  };
  const filled = {
    home:    <path d="M3 11l9-8 9 8v9a2 2 0 0 1-2 2h-3.5v-6h-7v6H5a2 2 0 0 1-2-2z"/>,
    learn:   <path d="M5 3h6v18H6.5A2.5 2.5 0 0 1 4 18.5V4a1 1 0 0 1 1-1zm14 0h-6v18h5.5A2.5 2.5 0 0 0 21 18.5V5a2 2 0 0 0-2-2z"/>,
    practice:<path d="M2.5 9.5a1.5 1.5 0 0 1 3 0v5a1.5 1.5 0 0 1-3 0zm16 0a1.5 1.5 0 0 1 3 0v5a1.5 1.5 0 0 1-3 0zM6 5.5a1.5 1.5 0 0 1 3 0v13a1.5 1.5 0 0 1-3 0zm9 0a1.5 1.5 0 0 1 3 0v13a1.5 1.5 0 0 1-3 0zM8 10.5h8v3H8z"/>,
    profile: <><circle cx="12" cy="8" r="4.2"/><path d="M3.5 21a8.5 8.5 0 0 1 17 0z"/></>,
    flame:   stroke.flame, play: stroke.play, star: stroke.star, trophy: stroke.trophy,
  };
  if (fill) return <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>{filled[name] || stroke[name]}</svg>;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
         strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">{stroke[name]}</svg>
  );
}

// ── Watermark — the motif layer behind every surface ───────────────────────
// mandala = concentric rangoli dots (CSS radial dots)
// glyphs  = scattered Kannada letters (text confetti)
// rays    = soft concentric arcs from a corner
const GLYPHS = ['ಕ', 'ನ', 'ಡ', 'ಬಾ', 'ಮ', 'ಹ', 'ಸ', 'ಲ', 'ಗ', 'ರ', 'ತ', 'ಪ', 'ಎ', 'ಜ'];
function Watermark({ on = true }) {
  const { tokens, vibe, tw } = usePL();
  const t = tokens;
  if (!on) return null;
  const col = vibe.motifColor(t);

  if (vibe.motif === 'glyphs') {
    // deterministic scatter
    let s = 11; const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    const items = Array.from({ length: 16 }).map((_, i) => ({
      g: GLYPHS[i % GLYPHS.length], x: rnd() * 100, y: rnd() * 100,
      sz: 20 + rnd() * 30, rot: -20 + rnd() * 40,
    }));
    return (
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        {items.map((it, i) => (
          <span key={i} style={{ position: 'absolute', left: `${it.x}%`, top: `${it.y}%`,
            fontFamily: kannadaFamily(tw.kfont), fontSize: it.sz, color: col, opacity: 0.05,
            transform: `rotate(${it.rot}deg)`, fontWeight: 600 }}>{it.g}</span>
        ))}
      </div>
    );
  }
  if (vibe.motif === 'rays') {
    return (
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.5,
        backgroundImage: `repeating-radial-gradient(circle at 86% -6%, ${col}14 0 1.5px, transparent 1.5px 26px)` }} />
    );
  }
  // mandala dots (default)
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.55,
      backgroundImage: `radial-gradient(${col}1f 1.4px, transparent 1.5px)`, backgroundSize: '22px 22px' }} />
  );
}

// ── Confetti burst ─────────────────────────────────────────────────────────
function Confetti({ count = 40, run = true }) {
  const { tokens } = usePL();
  const T = tokens;
  const cols = [T.gold, T.redHi, T.goldHi, T.red, T.goldDeep];
  const bits = React.useMemo(() => {
    let s = 7; const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    return Array.from({ length: count }).map(() => ({
      x: rnd() * 100, d: rnd() * 0.5, dur: 1.5 + rnd() * 1.4,
      sz: 6 + rnd() * 8, c: cols[Math.floor(rnd() * cols.length)], round: rnd() > 0.5,
    }));
  }, [count]);
  if (!run) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 60 }}>
      {bits.map((b, i) => (
        <div key={i} style={{ position: 'absolute', left: `${b.x}%`, top: -20, width: b.sz,
          height: b.round ? b.sz : b.sz * 0.5, background: b.c, borderRadius: b.round ? '50%' : 2,
          animation: `pl-fall ${b.dur}s ${b.d}s cubic-bezier(.4,.1,.6,1) forwards` }} />
      ))}
    </div>
  );
}

// ── Level-up / milestone celebration overlay ───────────────────────────────
// A reusable full-frame moment: dimmed backdrop, confetti, a Baloo badge that
// pops in with a ring sweep, a headline, a sub, and a CTA. Used on lesson
// complete and streak milestones — polish on the existing systems, no new XP.
function Celebration({ kind = 'lesson', onClose }) {
  const { tokens } = usePL();
  const t = tokens;
  const cfg = {
    lesson:  { icon: 'trophy', accent: t.gold, ink: t.goldInk, lip: t.goldLip, ring: t.gold,
               eyebrow: 'Lesson complete', title: 'Lesson 2 done!', sub: 'Names unlocked. You can introduce yourself in Kannada now.', cta: 'Keep going' },
    streak:  { icon: 'flame', accent: t.red, ink: t.red, lip: t.redLip, ring: t.redHi,
               eyebrow: 'Milestone', title: '12-day streak!', sub: 'Your best run yet. A little every day adds up — keep the flame alive.', cta: 'Nice!' },
    level:   { icon: 'star', accent: t.goldDeep, ink: '#fff', lip: t.goldDeepLip, ring: t.gold,
               eyebrow: 'Level up', title: 'You reached Level 3', sub: 'Everyday Talker. New phrases are now open in Practice.', cta: 'Let’s go' },
  }[kind];
  const ring = 132, sw = 9, r = (ring - sw) / 2, circ = 2 * Math.PI * r;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 70, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 28,
      background: 'rgba(27,29,14,0.46)', backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)',
      animation: 'pl-fade .25s ease' }}>
      <Confetti count={46} run />
      <div style={{ position: 'relative', width: ring, height: ring, marginBottom: 26,
        animation: 'pl-pop .5s cubic-bezier(.3,1.5,.5,1) both' }}>
        <svg width={ring} height={ring} style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
          <circle cx={ring/2} cy={ring/2} r={r} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={sw} />
          <circle cx={ring/2} cy={ring/2} r={r} fill="none" stroke={cfg.ring} strokeWidth={sw} strokeLinecap="round"
            strokeDasharray={circ} style={{ '--from': circ, '--to': 0, animation: 'pl-ring 1s .25s cubic-bezier(.4,0,.2,1) both' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 14, borderRadius: '50%', background: cfg.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 12px 30px ${cfg.lip}66`, animation: 'pl-bob 2.4s ease-in-out infinite' }}>
          <PLIcon name={cfg.icon} size={56} color={cfg.icon === 'flame' || cfg.icon === 'star' ? '#fff' : cfg.ink} fill sw={1.8} />
        </div>
      </div>
      <div style={{ fontFamily: PLfont.ui, fontSize: 12, fontWeight: 800, letterSpacing: 2,
        textTransform: 'uppercase', color: cfg.accent, marginBottom: 8, animation: 'pl-rise .4s .15s both' }}>{cfg.eyebrow}</div>
      <div style={{ fontFamily: PLfont.display, fontSize: 34, fontWeight: 800, color: '#fff',
        textAlign: 'center', lineHeight: 1.05, letterSpacing: -0.3, animation: 'pl-rise .4s .25s both' }}>{cfg.title}</div>
      <div style={{ fontFamily: PLfont.ui, fontSize: 14.5, color: 'rgba(255,255,255,0.86)', textAlign: 'center',
        lineHeight: 1.5, marginTop: 12, maxWidth: 280, animation: 'pl-rise .4s .35s both' }}>{cfg.sub}</div>
      <button onClick={onClose} style={{ marginTop: 26, border: 'none', cursor: 'pointer', background: cfg.accent,
        color: cfg.icon === 'flame' || cfg.icon === 'star' ? '#fff' : cfg.ink, fontFamily: PLfont.display, fontWeight: 700,
        fontSize: 17, padding: '13px 40px', borderRadius: 16, boxShadow: `0 5px 0 ${cfg.lip}`,
        animation: 'pl-rise .4s .45s both', WebkitTapHighlightColor: 'transparent' }}>{cfg.cta}</button>
    </div>
  );
}

// ── Shared data ─────────────────────────────────────────────────────────────
const FUN_FACTS = [
  { c: 'Food',    f: 'Mysore Pak was invented in the kitchens of the Mysore Palace by a royal cook, Kakasura Madappa.' },
  { c: 'Food',    f: '“Benne Dosa” from Davangere means butter dosa — benne is Kannada for butter.' },
  { c: 'Culture', f: 'Bengaluru reportedly comes from “Benda Kaaluru” — the town of boiled beans.' },
  { c: 'Food',    f: 'Chikmagalur is the birthplace of Indian coffee — legend says Baba Budan smuggled seven beans from Yemen.' },
  { c: 'History', f: 'Hampi was the capital of the Vijayanagara Empire, once among the richest cities in the world.' },
  { c: 'Nature',  f: 'Jog Falls drops about 253 metres — one of the highest plunge waterfalls in India.' },
];

const EMERGENCY = [
  { id: 'auto', label: 'Auto / cab', icon: 'auto', items: [
    { en: 'Stop here',               roman: 'Illi nillisi',  kn: 'ಇಲ್ಲಿ ನಿಲ್ಲಿಸಿ' },
    { en: 'Please put the meter on', roman: 'Meter haaki',   kn: 'ಮೀಟರ್ ಹಾಕಿ' },
    { en: 'How much is it?',         roman: 'Eshtu?',        kn: 'ಎಷ್ಟು?' },
  ]},
  { id: 'trouble', label: 'In trouble', icon: 'sos', items: [
    { en: 'Please help me',       roman: 'Dayavittu sahaaya maadi', kn: 'ದಯವಿಟ್ಟು ಸಹಾಯ ಮಾಡಿ' },
    { en: "I don't know Kannada", roman: 'Nanage Kannada baralla',  kn: 'ನನಗೆ ಕನ್ನಡ ಬರಲ್ಲ' },
    { en: 'Slowly, please',       roman: 'Swalpa nidhaanavaagi',    kn: 'ಸ್ವಲ್ಪ ನಿಧಾನವಾಗಿ' },
  ]},
  { id: 'basics', label: 'Basics', icon: 'compass', items: [
    { en: 'Where is it?',     roman: 'Elli ide?',   kn: 'ಎಲ್ಲಿ ಇದೆ?' },
    { en: "No, I don't want", roman: 'Beda',        kn: 'ಬೇಡ' },
    { en: "It's okay",        roman: 'Paravaagilla', kn: 'ಪರವಾಗಿಲ್ಲ' },
  ]},
];

// ── Chunky tactile button with a solid lip (tighter than the old one) ──────
function LipButton({ children, color, lip, fg = '#fff', icon, onClick, style, small = false, display = true }) {
  return (
    <button onClick={onClick} style={{
      border: 'none', cursor: 'pointer', background: color, color: fg,
      borderRadius: small ? 13 : 15, padding: small ? '10px 16px' : '13px 20px',
      fontFamily: display ? PLfont.display : PLfont.ui, fontWeight: 700, fontSize: small ? 14.5 : 16.5, letterSpacing: 0.1,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', whiteSpace: 'nowrap',
      boxShadow: `0 4px 0 ${lip}`, transition: 'transform .08s, box-shadow .08s',
      WebkitTapHighlightColor: 'transparent', ...(style || {}),
    }}
      onPointerDown={(e) => { e.currentTarget.style.transform = 'translateY(2px)'; e.currentTarget.style.boxShadow = `0 2px 0 ${lip}`; }}
      onPointerUp={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 4px 0 ${lip}`; }}
      onPointerLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 4px 0 ${lip}`; }}>
      {children}{icon && <PLIcon name={icon} size={18} color={fg} sw={2.4} />}
    </button>
  );
}

Object.assign(window, {
  makeTokens, THEME, MOTIFS, PLfont, kannadaFamily, PLCtx, usePL, PLIcon,
  Watermark, Confetti, Celebration, FUN_FACTS, EMERGENCY, LipButton, GLYPHS,
});
