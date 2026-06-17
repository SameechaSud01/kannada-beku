// ════════════════════════════════════════════════════════════════════════
// SITE SYSTEM — brand tokens, icons, wordmark, store badges, phone frame and
// shared bits for the Kannada Beku marketing site. Mirrors the REAL app:
// constants/colors.ts + fonts.ts (Living Manuscript / playful redesign).
// Display = Baloo Tamma 2 · body = DM Sans · transliteration = Lora italic ·
// Kannada = Noto Sans Kannada · palette strictly red / gold / warm-neutral.
// ════════════════════════════════════════════════════════════════════════

const T = {
  // surfaces (warm cream ramp — chunky kit v3)
  surface: '#faf6ea',   // cream page background (canvas)
  card:    '#ffffff',
  low:     '#f3ecd9',   // recessed cream — alt section bg + recessed tiles
  high:    '#ececea',
  highest: '#e6e6e3',
  dim:     '#dcdcd9',
  hairline:'rgba(27,29,14,0.08)',
  hairStrong:'rgba(27,29,14,0.12)',
  cream:    '#faf6ea',
  creamLow: '#f3ecd9',

  // warm functional accents (v3) — locked/caution + secondary interactive
  warn:    '#d97b3a', warnLow: '#f7e4d3', onWarn: '#3a1d07',
  tan:     '#b8956a', tanLip:  '#7e6440',
  redLipDeep:'#4a000e',

  // Mysore red (primary)
  red:    '#91001b',
  redHi:  '#be0027',   // primary container / gradient end
  redLip: '#6e0014',
  errLow: '#f3dada',   // pale Mysore red — "stuck" card / soft red wash
  redSoft:'#fbeaec',

  // turmeric gold (secondary)
  gold:    '#fdc003',  // secondary container — bright
  goldBright:'#ffd24d',
  goldDark:'#785900',  // secondary — dark gold for fills/text
  goldInk: '#6c5000',  // on secondary container
  goldLip: '#c98a00',
  goldFixed:'#ffdf9e',
  goldSoft:'#fff6da',

  // ink (warm sandstone, never pure grey/black)
  ink:  '#1b1d0e',
  sub:  '#464646',
  faint:'#6f6c58',   // 4.9:1 on cream — was #908d76 (3.1:1, failed WCAG AA)
  onRed:'#ffffff',
};

const F = {
  display: "'Baloo Tamma 2', system-ui, sans-serif", // titles, big numbers, button labels
  ui:      "'DM Sans', system-ui, sans-serif",        // body + labels
  translit:"'DM Sans', system-ui, sans-serif",         // romanised Kannada — DM Sans bold (matches app v3)
};
const kannadaFamily = (kfont) =>
  kfont === 'baloo'
    ? "'Baloo Tamma 2', 'Noto Sans Kannada', sans-serif"
    : "'Noto Sans Kannada', sans-serif";

// ── Icons — compact outline set (Tabler-ish, lightly hand-feel) ────────────
function Icon({ name, size = 22, color = 'currentColor', sw = 2, fill = false }) {
  const stroke = {
    home:    <path d="M3 11l9-8 9 8v9a2 2 0 0 1-2 2h-4v-6h-6v6H5a2 2 0 0 1-2-2z"/>,
    learn:   <><path d="M4 5a2 2 0 0 1 2-2h6v17H6a2 2 0 0 1-2-2z"/><path d="M20 5a2 2 0 0 0-2-2h-6v17h6a2 2 0 0 0 2-2z"/></>,
    practice:<><path d="M3 9v6M21 9v6M6 5v14M18 5v14M6 12h12"/></>,
    profile: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    flame:   <path d="M12 3c1.6 3 5 5 5 9a5 5 0 0 1-10 0c0-2 1-3.2 2-4.2.1 1.4.9 2 1.6 2.2.5-2.8 1-4.6-.2-9z"/>,
    play:    <path d="M7 5v14l12-7z"/>,
    audio:   <><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 8a5 5 0 0 1 0 8M19.5 5.5a9 9 0 0 1 0 13"/></>,
    chevron: <path d="M9 6l6 6-6 6"/>,
    menu:    <path d="M4 7h16M4 12h16M4 17h16"/>,
    forward: <path d="M5 12h14M13 6l6 6-6 6"/>,
    check:   <path d="M5 12l5 5L20 6"/>,
    x:       <path d="M6 6l12 12M18 6 6 18"/>,
    lock:    <><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></>,
    sos:     <><path d="M9 11V5a2 2 0 0 1 4 0v8M13 9a2 2 0 0 1 4 0v8a5 5 0 0 1-10 0v-1l-3-4a2 2 0 0 1 3-3l2 2"/></>,
    book:    <path d="M4 4h7v16H6a2 2 0 0 1-2-2zM20 4h-7v16h5a2 2 0 0 0 2-2z"/>,
    mic:     <><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></>,
    sparkle: <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z"/>,
    mail:    <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M4 7l8 6 8-6"/></>,
    insta:   <><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1" fill={color} stroke="none"/></>,
    globe:   <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18"/></>,
    chat:    <path d="M4 5h16v11H9l-4 4V5z"/>,
    grid:    <><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></>,
    target:  <><circle cx="12" cy="12" r="8.4"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="0.8" fill={color} stroke="none"/></>,
    wifi:    <><path d="M5 12.5a10 10 0 0 1 14 0M8 16a5 5 0 0 1 8 0"/><circle cx="12" cy="19.5" r="1" fill={color} stroke="none"/></>,
  };
  const filled = {
    home:    <path d="M3 11l9-8 9 8v9a2 2 0 0 1-2 2h-3.5v-6h-7v6H5a2 2 0 0 1-2-2z"/>,
    learn:   <path d="M5 3h6v18H6.5A2.5 2.5 0 0 1 4 18.5V4a1 1 0 0 1 1-1zm14 0h-6v18h5.5A2.5 2.5 0 0 0 21 18.5V5a2 2 0 0 0-2-2z"/>,
    practice:<path d="M2.5 9.5a1.5 1.5 0 0 1 3 0v5a1.5 1.5 0 0 1-3 0zm16 0a1.5 1.5 0 0 1 3 0v5a1.5 1.5 0 0 1-3 0zM6 5.5a1.5 1.5 0 0 1 3 0v13a1.5 1.5 0 0 1-3 0zm9 0a1.5 1.5 0 0 1 3 0v13a1.5 1.5 0 0 1-3 0zM8 10.5h8v3H8z"/>,
    profile: <><circle cx="12" cy="8" r="4.2"/><path d="M3.5 21a8.5 8.5 0 0 1 17 0z"/></>,
    flame:   stroke.flame, play: stroke.play, sparkle: stroke.sparkle,
  };
  if (fill) return <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>{filled[name] || stroke[name]}</svg>;
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">{stroke[name]}</svg>;
}

// ── Rangoli motif (matches the app's <Watermark motif="rangoli" />) ────────
function Rangoli({ size = 120, color = T.red, opacity = 1 }) {
  const sw = 1.2;
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ opacity }}>
      <g stroke={color} strokeWidth={sw}>
        <circle cx="16" cy="16" r="2" fill={color} />
        {[0, 45, 90, 135].map(a => (
          <g key={a} transform={`rotate(${a} 16 16)`}>
            <path d="M16 10 C 14 12, 14 14, 16 14 C 18 14, 18 12, 16 10 Z" />
            <path d="M16 22 C 14 20, 14 18, 16 18 C 18 18, 18 20, 16 22 Z" />
          </g>
        ))}
        {[0, 90].map(a => (
          <g key={'d' + a} transform={`rotate(${a + 22.5} 16 16)`}>
            <circle cx="16" cy="7" r="0.8" fill={color} />
            <circle cx="16" cy="25" r="0.8" fill={color} />
          </g>
        ))}
        <circle cx="16" cy="16" r="11" strokeDasharray="0.6 3" opacity="0.7" />
      </g>
    </svg>
  );
}

// ── Brand glyph svgs (Apple, Google Play) for store badges ─────────────────
function AppleGlyph({ size = 20, color = '#fff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.8-.8-3-.8-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.2.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.2 0 2-1.1 2.8-2.2.9-1.3 1.2-2.5 1.3-2.6-.1 0-2.5-1-2.5-3.9zM14.2 5.8c.6-.8 1-1.9.9-3-1 0-2.1.6-2.8 1.4-.6.7-1.1 1.8-1 2.9 1.1.1 2.2-.5 2.9-1.3z"/>
    </svg>
  );
}
function PlayGlyph({ size = 20 }) {
  // Official Google Play mark — four-segment play triangle in Google's core
  // brand colours (2022 redesign): blue · green · red · yellow.
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 12 L4 3 L9.5 12 Z" fill="#4285F4"/>
      <path d="M4 12 L9.5 12 L4 21 Z" fill="#34A853"/>
      <path d="M4 3 L20.5 12 L9.5 12 Z" fill="#EA4335"/>
      <path d="M4 21 L9.5 12 L20.5 12 Z" fill="#FBBC04"/>
    </svg>
  );
}

// ── Wordmark — "Kannada Beku" (Latin, leading) with the Kannada mark beside it ──
//   Matches the privacy header: English first in the Baloo display face, then the
//   Kannada script "ಕನ್ನಡ ಬೇಕು" smaller alongside. With latin=false (tight spaces
//   like the mobile nav) it falls back to the full-size Kannada mark on its own.
function Wordmark({ size = 22, color = T.red, kfont = 'noto', latin = false, latinColor }) {
  const kn = (
    <span lang="kn" style={{ fontFamily: kannadaFamily(kfont), fontWeight: 700,
      fontSize: latin ? size * 0.66 : size * 1.12, color, lineHeight: 1, letterSpacing: -0.3,
      opacity: latin ? 0.82 : 1 }}>ಕನ್ನಡ ಬೇಕು</span>
  );
  if (!latin) return <div style={{ display: 'flex', alignItems: 'baseline' }}>{kn}</div>;
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: size * 0.45 }}>
      <span style={{ fontFamily: F.display, fontWeight: 800, fontSize: size * 1.04,
        color: latinColor || color, lineHeight: 1, letterSpacing: -0.3, whiteSpace: 'nowrap' }}>Kannada Beku</span>
      {kn}
    </div>
  );
}

// ── Store badge — "coming soon" state, app-styled (rounded, gold label) ────
function StoreBadge({ platform }) {
  const apple = platform === 'apple';
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 12,
      background: T.ink, color: '#fff', borderRadius: 16,
      padding: '11px 18px 11px 16px', minWidth: 190,
      boxShadow: `0 5px 0 rgba(0,0,0,0.30)`, cursor: 'default', userSelect: 'none',
    }}>
      {apple ? <AppleGlyph size={26} /> : <PlayGlyph size={24} />}
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 9.5, letterSpacing: 1.5, textTransform: 'uppercase', color: T.goldBright, marginBottom: 4, whiteSpace: 'nowrap' }}>Coming soon</span>
        <span style={{ fontFamily: F.display, fontWeight: 700, fontSize: 17, letterSpacing: -0.2, whiteSpace: 'nowrap' }}>{apple ? 'App Store' : 'Google Play'}</span>
      </div>
    </div>
  );
}

// ── Chunky "lip" button (app's primary/secondary action) ───────────────────
// bg may be a solid colour or a gradient string. lip is the hard bottom edge.
function LipBtn({ children, bg = T.red, lip = T.redLip, fg = '#fff', icon, onClick, type = 'button', style }) {
  const shadow = `0 5px 0 ${lip}`;
  return (
    <button type={type} onClick={onClick} style={{
      border: 'none', cursor: 'pointer', background: bg, color: fg,
      borderRadius: 16, padding: '15px 26px',
      fontFamily: F.display, fontWeight: 700, fontSize: 16.5, letterSpacing: 0.1,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9,
      boxShadow: shadow, transition: 'transform .08s, box-shadow .08s', whiteSpace: 'nowrap', ...(style || {}),
    }}
      onPointerDown={(e) => { e.currentTarget.style.transform = 'translateY(3px)'; e.currentTarget.style.boxShadow = `0 2px 0 ${lip}`; }}
      onPointerUp={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = shadow; }}
      onPointerLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = shadow; }}>
      {children}{icon && <Icon name={icon} size={18} color={fg} sw={2.4} />}
    </button>
  );
}

// ── Eyebrow label (DM Sans bold, uppercase, tracked — matches app eyebrow) ──
function Eyebrow({ children, color = T.red, style }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', ...(style || {}) }}>
      <span style={{ fontFamily: F.ui, fontSize: 12, letterSpacing: 1.8, textTransform: 'uppercase', fontWeight: 700, color }}>{children}</span>
    </div>
  );
}

const BRAND_GRADIENT = `linear-gradient(135deg, ${T.red} 0%, ${T.redHi} 100%)`;

// ── Phone frame — clean device shell; 390×870 logical screen (iPhone-accurate) ──
function PhoneFrame({ children, scale = 1, screenBg = T.surface, glow = false }) {
  const W = 412, H = 892;
  return (
    <div style={{ width: W * scale, height: H * scale, flexShrink: 0 }}>
      <div style={{
        width: W, height: H, transform: `scale(${scale})`, transformOrigin: 'top left',
        borderRadius: 58, background: '#15160c', padding: 11,
        boxShadow: glow
          ? '0 40px 90px -30px rgba(110,0,20,0.40), 0 18px 40px rgba(27,29,14,0.20), inset 0 0 0 1.5px rgba(255,255,255,0.08)'
          : '0 28px 60px -28px rgba(27,29,14,0.4), inset 0 0 0 1.5px rgba(255,255,255,0.08)',
        position: 'relative',
      }}>
        <div style={{ width: '100%', height: '100%', borderRadius: 48, overflow: 'hidden', background: screenBg, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 13, left: '50%', transform: 'translateX(-50%)', width: 124, height: 35, borderRadius: 18, background: '#15160c', zIndex: 50 }} />
          {children}
        </div>
      </div>
    </div>
  );
}

function StatusBar({ color = T.ink }) {
  return (
    <div style={{ height: 54, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 26px 7px', position: 'relative', zIndex: 10 }}>
      <span style={{ fontFamily: F.display, fontWeight: 700, fontSize: 15.5, color }}>10:54</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width="18" height="12" viewBox="0 0 17 11" fill={color}><rect x="0" y="7" width="3" height="4" rx="1"/><rect x="4.5" y="5" width="3" height="6" rx="1"/><rect x="9" y="2.5" width="3" height="8.5" rx="1"/><rect x="13.5" y="0" width="3" height="11" rx="1"/></svg>
        <Icon name="wifi" size={16} color={color} sw={2.2} />
        <svg width="26" height="13" viewBox="0 0 24 12" fill="none"><rect x="0.5" y="0.5" width="20" height="11" rx="3" stroke={color} opacity="0.5"/><rect x="2" y="2" width="16" height="8" rx="1.5" fill={color}/><rect x="21.5" y="3.5" width="1.5" height="5" rx="0.75" fill={color} opacity="0.5"/></svg>
      </div>
    </div>
  );
}

// ── Chunky card — white face, hairline, hard "lip" bottom edge (no blur) ────
function ChunkyCard({ children, style, pad = '18px 20px', lip = 4, radius = 16 }) {
  return (
    <div style={{
      background: '#fff', border: `1px solid ${T.hairline}`, borderRadius: radius,
      boxShadow: `0 ${lip}px 0 rgba(27,29,14,0.10)`, padding: pad, boxSizing: 'border-box', ...(style || {}),
    }}>{children}</div>
  );
}

// ── Kolam dot grid — the app's page texture (subtle, "felt not seen") ───────
function KolamBg({ color = 'rgba(27,29,14,0.05)', radius = 1.2, grid = 24, style }) {
  return (
    <div aria-hidden style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      backgroundImage: `radial-gradient(circle, ${color} ${radius}px, transparent ${radius + 0.3}px)`,
      backgroundSize: `${grid}px ${grid}px`, ...(style || {}),
    }} />
  );
}

// ── Viewport hooks — match-media driven, no layout flash on first paint ─────
// Initial state is read synchronously so the first render is already correct
// (no desktop→mobile flicker). Listens for breakpoint crossings after mount.
function useMediaQuery(query) {
  const get = () => typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false;
  const [matches, setMatches] = React.useState(get);
  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia(query);
    const on = () => setMatches(mq.matches);
    on();
    mq.addEventListener ? mq.addEventListener('change', on) : mq.addListener(on);
    return () => { mq.removeEventListener ? mq.removeEventListener('change', on) : mq.removeListener(on); };
  }, [query]);
  return matches;
}
const useIsMobile = (max = 767) => useMediaQuery(`(max-width: ${max}px)`);

Object.assign(window, {
  T, F, kannadaFamily, Icon, Rangoli, AppleGlyph, PlayGlyph, Wordmark,
  StoreBadge, LipBtn, Eyebrow, BRAND_GRADIENT, PhoneFrame, StatusBar,
  ChunkyCard, KolamBg, useMediaQuery, useIsMobile,
});
