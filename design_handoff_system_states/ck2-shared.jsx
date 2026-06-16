// ck2-shared.jsx — shared bits matching the REAL app structure
// (components/ui/TabBar.tsx, StreakPill.tsx, top bars with hairline).
// Loads after ck-system.jsx; chunky-kit styling throughout.

// Streak pill (StreakPill.tsx): gold-pale pill, flame + count.
function CK2StreakPill({ streak = 6 }) {
  return (
    <CK lip={3} lipColor="var(--goldLip)" style={{
      display: 'flex', alignItems: 'center', gap: 6,
      background: 'var(--goldPale)', border: '1px solid var(--goldLip)',
      borderRadius: 99, padding: '7px 13px 6px',
    }}>
      <span style={{ color: 'var(--red2)', display: 'flex' }}><CKIcon d={CKPaths.flame} size={16} stroke={2} /></span>
      <span style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 15, lineHeight: 1, color: 'var(--goldDeep)', paddingTop: 2 }}>{streak}</span>
    </CK>
  );
}

// Top bar — wordmark left, streak pill right, hairline bottom (Home/Profile).
function CK2TopBar({ streak = 6 }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 20px 10px', borderBottom: '1px solid var(--hairline)', flexShrink: 0,
    }}>
      <div style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 21, color: 'var(--red)', lineHeight: 1.4, whiteSpace: 'nowrap' }}>ಕನ್ನಡ ಬೇಕು</div>
      <CK2StreakPill streak={streak} />
    </div>
  );
}

// Page header — big title + subtitle, hairline bottom (Learn/Practice).
function CK2PageHeader({ title, sub }) {
  return (
    <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--hairline)', flexShrink: 0 }}>
      <div style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 25, lineHeight: 1.15, letterSpacing: -0.4 }}>{title}</div>
      <div style={{ fontFamily: CK_BODY, fontWeight: 600, fontSize: 13, color: 'var(--faint)', marginTop: 1 }}>{sub}</div>
    </div>
  );
}

// Floating icon-only tab bar (TabBar.tsx): centred pill, active = red circle.
const CK2_TABS = [
  { name: 'Home', icon: 'home' },
  { name: 'Learn', icon: 'book' },
  { name: 'Practice', icon: 'dice' },
  { name: 'Profile', icon: 'user' },
];

function CK2TabBar({ active = 0 }) {
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      display: 'flex', justifyContent: 'center',
      padding: '8px 0 18px', background: 'var(--surface)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        background: '#fff', border: CK_HAIRLINE, borderRadius: 99,
        boxShadow: '0 4px 0 rgba(27,29,14,0.10)', padding: 7,
      }}>
        {CK2_TABS.map((t, i) => {
          const on = i === active;
          return on ? (
            <CK key={t.name} lip={3} lipColor="var(--redLip)" title={t.name} style={{
              width: 46, height: 46, borderRadius: '50%', background: 'var(--red2)',
              color: '#fff', display: 'grid', placeItems: 'center',
            }}>
              <CKIcon d={CKPaths[t.icon]} size={20} stroke={2} />
            </CK>
          ) : (
            <div key={t.name} title={t.name} style={{ width: 46, height: 46, borderRadius: '50%', display: 'grid', placeItems: 'center', color: 'var(--faint)', cursor: 'pointer' }}>
              <CKIcon d={CKPaths[t.icon]} size={20} stroke={1.9} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Scrollable page body under a fixed header.
function CK2Body({ children, pad = '14px 20px 0' }) {
  return (
    <div style={{ flex: 1, overflow: 'hidden', padding: pad, display: 'flex', flexDirection: 'column' }}>
      {children}
    </div>
  );
}

// Lesson progress bar (LessonProgressBar): label + gold bar.
function CK2LessonProgress({ current, total, label }) {
  return (
    <div>
      <div style={{ fontFamily: CK_BODY, fontWeight: 700, fontSize: 11.5, letterSpacing: 0.4, color: 'var(--faint)', marginBottom: 7 }}>{label}</div>
      <CKBar frac={current / total} color="var(--gold)" h={9} />
    </div>
  );
}

// Section label with gold tick (profile.tsx SectionLabel).
function CK2SectionLabel({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
      <span style={{ width: 4, height: 13, borderRadius: 2, background: 'var(--gold)' }}></span>
      <span style={{ fontFamily: CK_BODY, fontWeight: 700, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--faint)' }}>{children}</span>
    </div>
  );
}

// Single progress ring (ProgressRing).
function CK2Ring({ size = 58, sw = 6.5, frac, color = 'var(--goldLip)', children }) {
  const c = size / 2, r = c - sw / 2, circ = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
        <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(27,29,14,0.08)" strokeWidth={sw} />
        <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={`${frac * circ} ${circ}`} transform={`rotate(-90 ${c} ${c})`} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>{children}</div>
    </div>
  );
}

Object.assign(window, { CK2StreakPill, CK2TopBar, CK2PageHeader, CK2TabBar, CK2Body, CK2LessonProgress, CK2SectionLabel, CK2Ring, CK2_TABS });
