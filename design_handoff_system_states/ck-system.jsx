// ck-system.jsx — chunky kit system for the full app screens.
// Tokens come from CSS vars set by the host (Element Lab palette):
// --surface --surfaceLow --red --red2 --redLip --redPale --gold --goldHi
// --goldLip --goldPale --goldDeep --ink --muted --faint --hairline --r --lip

const CK_DISPLAY = "'Baloo Tamma 2', sans-serif";
const CK_BODY = "'DM Sans', sans-serif";
const CK_HAIRLINE = '1px solid var(--hairline)';

function ckUsePress() {
  const [pressed, setPressed] = React.useState(false);
  const down = () => setPressed(true);
  const up = () => setPressed(false);
  return [pressed, { onPointerDown: down, onPointerUp: up, onPointerLeave: up, onPointerCancel: up }];
}

// Chunky press wrapper: rests on a lip, sinks flat when pressed.
function CK({ lip, lipColor = 'rgba(27,29,14,0.10)', style, children, as = 'div', ...rest }) {
  const [pressed, handlers] = ckUsePress();
  const lipPx = lip != null ? lip : 'var(--lip)';
  const restShadow = lip != null ? `0 ${lip}px 0 ${lipColor}` : `0 calc(var(--lip) * 1px) 0 ${lipColor}`;
  const restY = lip != null ? `${lip}px` : 'calc(var(--lip) * 1px)';
  const El = as;
  // Belt-and-suspenders: ensure non-DOM kit props never reach the host element.
  const { lip: _lip, lipColor: _lipColor, lipcolor: _lc2, ...domRest } = rest;
  return (
    <El {...handlers} {...domRest} style={{
      cursor: 'pointer', userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'manipulation',
      boxShadow: pressed ? '0 0px 0 ' + lipColor : restShadow,
      transform: pressed ? `translateY(${restY})` : 'none',
      transition: 'transform 80ms ease, box-shadow 80ms ease',
      ...style,
    }}>{children}</El>
  );
}

// Static card in the kit base: white, hairline, hard lip (non-pressable).
function CKCard({ children, style, pad = '18px 20px' }) {
  return (
    <div style={{
      background: '#fff', border: CK_HAIRLINE, borderRadius: 'var(--r)',
      boxShadow: '0 calc(var(--lip) * 1px) 0 rgba(27,29,14,0.10)',
      padding: pad, boxSizing: 'border-box', ...style,
    }}>{children}</div>
  );
}

function CKIcon({ d, size = 22, stroke = 1.9, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
      {d}
    </svg>
  );
}

const CKPaths = {
  home: (
    <g>
      <path d="M4 11.2 12 4.5l8 6.7" />
      <path d="M6.2 9.8V19a.8.8 0 0 0 .8.8h10a.8.8 0 0 0 .8-.8V9.8" />
      <path d="M10 19.5v-4.6h4v4.6" />
    </g>
  ),
  book: (
    <g>
      <rect x="5" y="3.5" width="14" height="17" rx="2.2" />
      <path d="M8.5 8h7M8.5 11.5h7" />
    </g>
  ),
  dice: (
    <g>
      <rect x="4" y="4" width="16" height="16" rx="3.5" />
      <circle cx="9.2" cy="9.2" r="0.6" fill="currentColor" />
      <circle cx="14.8" cy="9.2" r="0.6" fill="currentColor" />
      <circle cx="9.2" cy="14.8" r="0.6" fill="currentColor" />
      <circle cx="14.8" cy="14.8" r="0.6" fill="currentColor" />
    </g>
  ),
  user: (
    <g>
      <circle cx="12" cy="8.6" r="3.4" />
      <path d="M5.6 19.6c1.2-3 3.6-4.5 6.4-4.5s5.2 1.5 6.4 4.5" />
    </g>
  ),
  speaker: (
    <g>
      <path d="M5 9.8v4.4h3l4 3.4V6.4l-4 3.4H5Z" />
      <path d="M15.5 9.2a4 4 0 0 1 0 5.6" />
    </g>
  ),
  chevron: <path d="m9.5 5.5 6 6.5-6 6.5" />,
  back: <path d="m14.5 5.5-6 6.5 6 6.5" />,
  close: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />,
  check: <path d="m5.5 12.5 4.2 4.2 8.8-9.4" />,
  lock: (
    <g>
      <rect x="6" y="10.5" width="12" height="9" rx="2.4" />
      <path d="M8.8 10.5V8.2a3.2 3.2 0 0 1 6.4 0v2.3" />
    </g>
  ),
  flame: <path d="M12 3.8c.4 3-1.3 4.4-2.7 6C7.9 11.4 7 12.9 7 15a5 5 0 0 0 10 0c0-1.6-.6-2.9-1.5-4.1-.5 1-1.1 1.6-2 2.1.4-2.9-.2-6.5-1.5-9.2Z" />,
  bolt: <path d="M13 3.5 5.5 13.5h5l-1.5 7L16.5 10h-5l1.5-6.5Z" />,
  image: (
    <g>
      <rect x="4" y="5" width="16" height="14" rx="2.5" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m5.5 17.5 4.5-4 3 2.6 3.5-3.4 2 1.8" />
    </g>
  ),
  ear: (
    <g>
      <path d="M7.5 9.5a4.5 4.5 0 1 1 9 0c0 2.6-2.2 3.4-2.6 5.3-.3 1.6-1 3-2.7 3-1.2 0-2-.7-2.3-1.7" />
      <path d="M10.4 9.6a2 2 0 0 1 3.9.5c0 1-.8 1.6-1.3 2.4" />
    </g>
  ),
  chat: (
    <g>
      <path d="M4 6.8A2.3 2.3 0 0 1 6.3 4.5h8.4A2.3 2.3 0 0 1 17 6.8v4.4a2.3 2.3 0 0 1-2.3 2.3H9l-3.4 2.8v-2.8H6.3A2.3 2.3 0 0 1 4 11.2V6.8Z" />
      <path d="M19.8 10.2c.7.4 1.2 1.1 1.2 2v3.6a2 2 0 0 1-2 2h-.4v2.4l-2.9-2.4" />
    </g>
  ),
  swap: (
    <g>
      <path d="M8 4.5 4.5 8 8 11.5M4.8 8h12.7" />
      <path d="m16 12.5 3.5 3.5-3.5 3.5M19.2 16H6.5" />
    </g>
  ),
  alert: (
    <g>
      <path d="M12 4.2 3.6 19h16.8L12 4.2Z" />
      <path d="M12 10v4.2" />
      <circle cx="12" cy="16.8" r="0.4" fill="currentColor" />
    </g>
  ),
  bell: (
    <g>
      <path d="M12 4.5a5 5 0 0 1 5 5c0 4 1.5 5.2 1.5 5.2h-13S7 13.5 7 9.5a5 5 0 0 1 5-5Z" />
      <path d="M10.2 18.2a1.9 1.9 0 0 0 3.6 0" />
    </g>
  ),
  help: (
    <g>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M9.8 9.6a2.4 2.4 0 0 1 4.6.9c0 1.5-2.2 1.8-2.2 3.2" />
      <circle cx="12.1" cy="16.6" r="0.4" fill="currentColor" />
    </g>
  ),
  mic: (
    <g>
      <rect x="9.4" y="3.6" width="5.2" height="10" rx="2.6" />
      <path d="M6.4 11.4a5.6 5.6 0 0 0 11.2 0M12 17v3.4" />
    </g>
  ),
  auto: (
    <g>
      <path d="M4.5 16.5V10a3 3 0 0 1 3-3h6.2l4.3 4.5h1.5v5h-1.6" />
      <circle cx="8.4" cy="17" r="1.9" />
      <circle cx="16.2" cy="17" r="1.9" />
      <path d="M10.3 17h4M7.5 10.5h5.2" />
    </g>
  ),
};

function CKPlay({ size = 16, color = '#fff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block' }}>
      <path d="M8 5.2v13.6L19.2 12 8 5.2Z" fill={color} />
    </svg>
  );
}

// ── Phone shell ───────────────────────────────────────────
function CKPhone({ children, pad = '22px 20px 0', bg = 'var(--surfaceLow)' }) {
  const isGradient = typeof bg === 'string' && bg.includes('gradient');
  const dots = 'radial-gradient(circle, rgba(27,29,14,var(--wmA, 0)) 1.2px, transparent 1.4px)';
  return (
    <div style={{
      width: '100%', height: '100%', boxSizing: 'border-box',
      backgroundColor: isGradient ? 'var(--red)' : bg,
      backgroundImage: isGradient ? `${dots}, ${bg}` : dots,
      backgroundSize: isGradient ? '24px 24px, auto' : '24px 24px',
      padding: pad,
      display: 'flex', flexDirection: 'column',
      fontFamily: CK_BODY, color: 'var(--ink)',
      overflow: 'hidden', position: 'relative',
    }}>{children}</div>
  );
}

// Round chunky icon button (speaker / play / back …)
function CKRound({ size = 40, bg = 'var(--red2)', lipColor = 'var(--redLip)', lip = 3, children, style, ...rest }) {
  return (
    <CK lip={lip} lipColor={lipColor} {...rest} style={{
      width: size, height: size, borderRadius: '50%', background: bg,
      display: 'grid', placeItems: 'center', flexShrink: 0, ...style,
    }}>{children}</CK>
  );
}

// ── Top app bar (wordmark only) ──────────────────────────
function CKAppBar({ title = 'ಕನ್ನಡ ಬಾ', streak = 6 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, minHeight: 40, paddingBottom: 10, borderBottom: '1px solid var(--hairline)' }}>
      <div style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 22, color: 'var(--red)', lineHeight: 1.3, whiteSpace: 'nowrap' }}>{title}</div>
      <CK lip={3} lipColor="var(--goldLip)" style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'var(--goldPale)', border: '1px solid var(--goldLip)',
        borderRadius: 99, padding: '6px 12px 5px',
      }}>
        <span style={{ color: 'var(--red2)', display: 'flex' }}><CKIcon d={CKPaths.flame} size={15} stroke={2.1} /></span>
        <span style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 14, lineHeight: 1, color: 'var(--goldDeep)', paddingTop: 2, fontVariantNumeric: 'tabular-nums' }}>{streak}</span>
      </CK>
    </div>
  );
}

// ── Section header ────────────────────────────────────────
function CKSectionHead({ title, action, style }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '0 2px 12px', ...style }}>
      <div style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 21, lineHeight: 1.1 }}>{title}</div>
      {action && <div style={{ fontFamily: CK_BODY, fontWeight: 700, fontSize: 13, color: 'var(--red2)' }}>{action}</div>}
    </div>
  );
}

// ── Concentric rings ─────────────────────────────────────
function CKRings({ size = 168, rings, sw = 13, gap = 6, center }) {
  const c = size / 2;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
        {rings.map((rg, i) => {
          const r = c - sw / 2 - i * (sw + gap);
          const circ = 2 * Math.PI * r;
          return (
            <g key={i}>
              <circle cx={c} cy={c} r={r} fill="none" stroke={`color-mix(in srgb, ${rg.color} 16%, #fff)`} strokeWidth={sw} />
              <circle cx={c} cy={c} r={r} fill="none" stroke={rg.color} strokeWidth={sw}
                strokeLinecap="round" strokeDasharray={`${rg.frac * circ} ${circ}`}
                transform={`rotate(-90 ${c} ${c})`} />
            </g>
          );
        })}
      </svg>
      {center && <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>{center}</div>}
    </div>
  );
}

// ── Button system ─────────────────────────────────────────
// One ladder used everywhere:
//   Primary   — filled burgundy, the single most-wanted action on a screen.
//   Secondary — white + hairline, equal weight alternative.
//   Tertiary  — quiet text, dismiss / "not now". Still a real ≥44px target.
function CKBtnPrimary({ children, style, lip = 5, ...rest }) {
  return (
    <CK as="button" lip={lip} lipColor="var(--redLip)" {...rest} style={{
      width: '100%', minHeight: 50, boxSizing: 'border-box',
      fontFamily: CK_DISPLAY, fontWeight: 700, fontSize: 16, color: '#fff',
      background: 'var(--red2)', border: 'none', borderRadius: 'var(--r)', padding: '15px 22px 13px',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, ...style,
    }}>{children}</CK>
  );
}
function CKBtnSecondary({ children, style, lip = 4, ...rest }) {
  return (
    <CK as="button" lip={lip} {...rest} style={{
      width: '100%', minHeight: 50, boxSizing: 'border-box',
      fontFamily: CK_DISPLAY, fontWeight: 700, fontSize: 15, color: 'var(--ink)',
      background: '#fff', border: CK_HAIRLINE, borderRadius: 'var(--r)', padding: '14px 22px 12px',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, ...style,
    }}>{children}</CK>
  );
}
function CKBtnTertiary({ children, style, ...rest }) {
  return (
    <button {...rest} style={{
      width: '100%', minHeight: 46, boxSizing: 'border-box',
      fontFamily: CK_DISPLAY, fontWeight: 700, fontSize: 14.5, color: 'var(--muted)',
      background: 'transparent', border: 'none', borderRadius: 'var(--r)', cursor: 'pointer', padding: '12px 18px',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, ...style,
    }}>{children}</button>
  );
}

// ── Progress bar ──────────────────────────────────────────
function CKBar({ frac, color = 'var(--red2)', track = 'rgba(27,29,14,0.10)', h = 8 }) {
  return (
    <div style={{ height: h, borderRadius: 99, background: track, overflow: 'hidden' }}>
      <div style={{ width: `${frac * 100}%`, height: '100%', borderRadius: 99, background: color }}></div>
    </div>
  );
}

// ── Tab bar: white pill, hairline + lip, active red circle ─
const CK_TABS = [
  { label: 'Home', icon: 'home' },
  { label: 'Lessons', icon: 'book' },
  { label: 'Games', icon: 'dice' },
  { label: 'Profile', icon: 'user' },
];

function CKTabBar({ active = 0 }) {
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 16, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
      {/* scrim — fades scrolling content out behind the floating pill */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: -16, height: 110, background: 'linear-gradient(180deg, transparent, var(--surfaceLow) 62%)', pointerEvents: 'none' }}></div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4, pointerEvents: 'auto', position: 'relative',
        background: '#fff', border: CK_HAIRLINE, borderRadius: 99,
        boxShadow: '0 4px 0 rgba(27,29,14,0.10), 0 12px 28px rgba(27,29,14,0.10)', padding: 7,
      }}>
        {CK_TABS.map((t, i) => {
          const on = i === active;
          return on ? (
            <CK key={t.label} lip={3} lipColor="var(--redLip)" title={t.label} style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'var(--red2)', color: '#fff',
              display: 'grid', placeItems: 'center',
            }}>
              <CKIcon d={CKPaths[t.icon]} size={20} stroke={2} />
            </CK>
          ) : (
            <div key={t.label} style={{ width: 44, height: 44, borderRadius: '50%', display: 'grid', placeItems: 'center', color: 'var(--faint)', cursor: 'pointer' }}>
              <CKIcon d={CKPaths[t.icon]} size={21} stroke={1.9} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, {
  CK_DISPLAY, CK_BODY, CK_HAIRLINE,
  ckUsePress, CK, CKCard, CKIcon, CKPaths, CKPlay, CKPhone, CKRound,
  CKBtnPrimary, CKBtnSecondary, CKBtnTertiary,
  CKAppBar, CKSectionHead, CKRings, CKBar, CKTabBar,
});
