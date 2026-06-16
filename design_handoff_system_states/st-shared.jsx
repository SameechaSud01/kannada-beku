// st-shared.jsx — shared primitives for the system-state screens.
// Builds on ck-system.jsx (CK, CKIcon, CKPaths, CKPhone, buttons, tab bar).
// Tone: a global classic/rowdy copy switch threaded via context.

const ToneContext = React.createContext('classic');
// Returns a picker: T('classic copy', 'rowdy copy') -> the active string.
function useTone() {
  const tone = React.useContext(ToneContext);
  return React.useCallback((classic, rowdy) => (tone === 'rowdy' && rowdy != null ? rowdy : classic), [tone]);
}

// ── Brand mark: the "coffee ಕ" (Kannada ka as a steaming filter-coffee cup) ──
// Faithful to icons/Coffee Ka Master: green glyph, gold spiral, gold steam + bindu.
const KA_GREEN = '#13513a';
const KA_GOLD  = '#cf9a1c';

function spiralPath(cx, cy, rStart, rEnd, turns, steps, squash) {
  let d = '';
  const total = turns * 2 * Math.PI;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, ang = -Math.PI / 2 + t * total, r = rStart + (rEnd - rStart) * t;
    const x = cx + r * Math.cos(ang), y = cy + r * Math.sin(ang) * squash;
    d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1) + ' ';
  }
  return d;
}

// glyphColor / swirlColor let the red-brand splash recolor the same mark.
function CoffeeKa({ size = 180, animate = true, glyphColor = KA_GREEN, swirlColor = KA_GOLD }) {
  const W = size, H = size * 1.34;
  const spiral = spiralPath(120, 214, 58, 9, 2.1, 120, 0.9);
  const wisps = [
    'M92 116 C82 100 108 90 96 70 C86 54 106 44 96 26',
    'M120 122 C110 104 138 94 124 72 C112 54 134 44 122 22',
    'M148 116 C138 100 164 90 152 70 C142 54 162 44 152 26',
  ];
  const a = animate ? ' ka-anim' : '';
  return (
    <div className={'ka-wrap' + a} style={{ width: W, height: H, position: 'relative' }}>
      <svg viewBox="0 0 240 322" width={W} height={H} fill="none"
        stroke={swirlColor} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round"
        style={{ position: 'absolute', inset: 0 }}>
        {/* steam (floats gently as a group) */}
        <g className="ka-steam-grp">
          {wisps.map((d, i) => <path key={i} d={d} />)}
          <circle cx="120" cy="12" r="9" fill={swirlColor} stroke="none" />
        </g>
        {/* coffee swirl */}
        <path d={spiral} strokeWidth={17} />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, top: '21%',
        display: 'grid', placeItems: 'center',
        fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: W * 0.86, lineHeight: 1,
        color: glyphColor,
      }}>ಕ</div>
    </div>
  );
}

// ── Real shipped app icon (assets/icon.png — gold ಕ + chunky lip on Mysore red) ──
// Rendered as a rounded app-icon tile; scale-in via .ka-anim.
function AppIcon({ size = 176, radius, ring, shadow }) {
  const r = radius != null ? radius : Math.round(size * 0.225);
  return (
    <div className="ka-anim" style={{
      width: size, height: size, borderRadius: r, overflow: 'hidden',
      boxShadow: shadow || '0 22px 46px rgba(110,0,20,0.30), 0 6px 14px rgba(0,0,0,0.14)',
      border: ring || 'none', flexShrink: 0,
    }}>
      <img src="../assets/icon.png" alt="Kannada Beku app icon" width={size} height={size}
        style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }} />
    </div>
  );
}

// ── Chunky ring spinner (the in-app loading mark; matches ActivityIndicator) ──
function CKSpinner({ size = 46, color = 'var(--red2)', track = 'rgba(27,29,14,0.10)', sw = 5 }) {
  const c = size / 2, r = c - sw / 2, circ = 2 * Math.PI * r;
  return (
    <svg className="st-spin" width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      <circle cx={c} cy={c} r={r} fill="none" stroke={track} strokeWidth={sw} />
      <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
        strokeDasharray={`${circ * 0.28} ${circ}`} />
    </svg>
  );
}

// Three bouncing dots (splash loader — quieter than a spinner).
function CKDots({ color = 'var(--gold)' }) {
  return (
    <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
      {[0, 1, 2].map((i) => (
        <span key={i} className="st-dot" style={{ ['--i']: i, width: 8, height: 8, borderRadius: 99, background: color, display: 'block' }}></span>
      ))}
    </div>
  );
}

// ── Skeleton shimmer block ──
function Skel({ w = '100%', h = 14, r = 8, style }) {
  return <div className="st-skel" style={{ width: w, height: h, borderRadius: r, ...style }}></div>;
}

// ── Icon well: a soft tinted circle holding a glyph (empty / error / success heroes) ──
function IconWell({ size = 84, bg, ring, children, style }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: bg,
      border: ring ? `1.5px solid ${ring}` : 'none',
      display: 'grid', placeItems: 'center', flexShrink: 0, ...style,
    }}>{children}</div>
  );
}

// ── Full-screen state scaffold: centred well + title + body + actions ──
// Used by empty + full-screen success/failure. Optional back chip top-left.
function StateScaffold({ back = false, well, title, body, note, actions, bg = 'var(--surfaceLow)', children }) {
  return (
    <CKPhone bg={bg} pad="0">
      {back && (
        <div style={{ position: 'absolute', top: 18, left: 18, zIndex: 2 }}>
          <CKRound size={40} bg="#fff" lipColor="rgba(27,29,14,0.10)" lip={3}>
            <span style={{ color: 'var(--red)', display: 'flex' }}><CKIcon d={CKPaths.back} size={20} stroke={2} /></span>
          </CKRound>
        </div>
      )}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 34px' }}>
        <div className="st-rise" style={{ ['--d']: '0ms' }}>{well}</div>
        {title && <div className="st-rise" style={{ ['--d']: '80ms', fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 24, lineHeight: 1.18, letterSpacing: -0.3, marginTop: 22, color: 'var(--ink)', textWrap: 'balance' }}>{title}</div>}
        {body && <div className="st-rise" style={{ ['--d']: '140ms', fontFamily: CK_BODY, fontWeight: 500, fontSize: 14.5, lineHeight: 1.5, color: 'var(--muted)', marginTop: 10, maxWidth: 290, textWrap: 'pretty' }}>{body}</div>}
        {children}
      </div>
      {actions && (
        <div className="st-rise" style={{ ['--d']: '220ms', padding: '0 24px 30px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {actions}
          {note && <div style={{ fontFamily: CK_BODY, fontWeight: 600, fontSize: 12, color: 'var(--faint)', textAlign: 'center', marginTop: 2 }}>{note}</div>}
        </div>
      )}
    </CKPhone>
  );
}

Object.assign(window, {
  ToneContext, useTone, CoffeeKa, AppIcon, KA_GREEN, KA_GOLD,
  CKSpinner, CKDots, Skel, IconWell, StateScaffold,
});
