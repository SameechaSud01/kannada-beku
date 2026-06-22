// ════════════════════════════════════════════════════════════════════════
// SITE ABOUT — the human story behind Kannada Beku, in two movements:
//   Story  (#about) — two sides of modern Bengaluru, one app
//   Vision (#vision) — more than an app: a bridge  (red gradient band)
// Uses the shared system (T, F, Icon, Rangoli, Eyebrow, Wordmark, kannadaFamily).
// ════════════════════════════════════════════════════════════════════════

// ── A "side of Bengaluru" card used in the Story visual ─────────────────────
function SideCard({ accent, ink, label, name, role, note, glyph, kfont }) {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', background: T.card, borderRadius: 16,
      padding: '20px 22px', border: `1px solid ${T.hairline}`, boxShadow: '0 4px 0 rgba(27,29,14,0.10)' }}>
      <div aria-hidden style={{ position: 'absolute', right: -6, top: -22, fontFamily: kannadaFamily(kfont),
        fontSize: 116, lineHeight: 1, fontWeight: 700, color: accent, opacity: 0.08 }}>{glyph}</div>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: accent, color: ink, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.display, fontWeight: 800, fontSize: 24,
          boxShadow: '0 4px 0 rgba(27,29,14,0.22)' }}>{name[0]}</div>
        <div>
          <div style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: accent }}>{label}</div>
          <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 20, color: T.ink, letterSpacing: -0.3, marginTop: 2 }}>{name}</div>
        </div>
      </div>
      <div style={{ position: 'relative', fontFamily: F.ui, fontSize: 13.5, color: T.sub, lineHeight: 1.5, marginTop: 13 }}>{note}</div>
    </div>
  );
}

// ── STORY ───────────────────────────────────────────────────────────────────
function Story({ tw }) {
  const kf = tw.kfont;
  return (
    <div id="about" style={{ scrollMarginTop: 68, position: 'relative', overflow: 'hidden' }}>
      <KolamBg />
      {tw.motif && (
        <div aria-hidden style={{ position: 'absolute', left: -90, bottom: -60, zIndex: 0, pointerEvents: 'none' }}>
          <Rangoli size={300} color={T.red} opacity={0.05} />
        </div>
      )}
      <div className="kb-wrap" style={{ maxWidth: 1180, margin: '0 auto', padding: '92px 28px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <Eyebrow color={T.red} style={{ whiteSpace: 'nowrap' }}>Our story</Eyebrow>
          <p style={{ fontFamily: F.display, fontWeight: 800, letterSpacing: -0.4,
            fontSize: 'clamp(24px, 3.2vw, 38px)', lineHeight: 1.18, color: T.ink, margin: '18px 0 0', textWrap: 'balance' }}>
            The founding team is two sides of modern Bengaluru: one who grew up speaking it,
            one who <span style={{ color: T.red }}>struggled to learn it</span>. So they built the app they wished had existed.
          </p>
        </div>

        {/* the two founders */}
        <div className="kb-bridges" style={{ marginTop: 44 }}>
          <SideCard accent={T.red} ink="#fff" kfont={kf} glyph="ಕ"
            label="Grew up speaking it" name="Sameecha"
            note="A Kannadiga raised in the UK, learning Kannada from his parents. For him, the language is culture, identity and heritage." />
          <SideCard accent={T.gold} ink={T.goldInk} kfont={kf} glyph="ಬ"
            label="Always wanted to learn it" name="Aashmika"
            note="Bengaluru-born and Bangalorean at heart, she could never find an approachable way in. So she became the reason to build one." />
        </div>
      </div>
    </div>
  );
}

// ── VISION  (red gradient band) ──────────────────────────────────────────────
function Vision({ tw }) {
  const pairs = [
    ['North India', 'South India'],
    ['Newcomers', 'Locals'],
    ['Heritage', 'Technology'],
    ['Wanting to belong', 'The confidence to start'],
  ];
  return (
    <div id="vision" style={{ scrollMarginTop: 68, background: BRAND_GRADIENT, color: '#fff', position: 'relative', overflow: 'hidden' }}>
      {tw.motif && (
        <>
          <div aria-hidden style={{ position: 'absolute', right: -70, top: -50, zIndex: 0, pointerEvents: 'none' }}>
            <Rangoli size={340} color="#fff" opacity={0.07} />
          </div>
          <div aria-hidden style={{ position: 'absolute', left: -90, bottom: -90, zIndex: 0, pointerEvents: 'none' }}>
            <Rangoli size={300} color={T.goldBright} opacity={0.08} />
          </div>
        </>
      )}
      <div className="kb-wrap" style={{ maxWidth: 1080, margin: '0 auto', padding: '88px 28px 92px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 720 }}>
          <Eyebrow color={T.goldBright} style={{ whiteSpace: 'nowrap' }}>Our vision</Eyebrow>
          <h2 style={{ fontFamily: F.display, fontWeight: 800, letterSpacing: -0.6,
            fontSize: 'clamp(30px, 4.2vw, 50px)', lineHeight: 1.04, color: '#fff', margin: '18px 0 0', textWrap: 'balance' }}>
            More than a language app. <span style={{ color: T.goldBright }}>A bridge.</span>
          </h2>
          <p style={{ fontFamily: F.ui, fontSize: 'clamp(16px, 1.5vw, 18.5px)', lineHeight: 1.55, color: 'rgba(255,255,255,0.84)', margin: '18px 0 0' }}>
            Built around real conversations and the language people actually speak, not memorisation and
            textbooks. We want Kannada Beku to connect the two halves of a fast-changing city.
          </p>
        </div>

        {/* the bridges */}
        <div className="kb-bridges">
          {pairs.map(([a, b], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(255,255,255,0.08)',
              borderRadius: 16, padding: '16px 18px', border: '1px solid rgba(255,255,255,0.14)' }}>
              <span style={{ flex: 1, fontFamily: F.display, fontWeight: 700, fontSize: 'clamp(15px, 1.7vw, 18px)', color: '#fff', letterSpacing: -0.2, lineHeight: 1.15 }}>{a}</span>
              <Icon name="forward" size={20} color={T.goldBright} sw={2.4} />
              <span style={{ flex: 1, textAlign: 'right', fontFamily: F.display, fontWeight: 700, fontSize: 'clamp(15px, 1.7vw, 18px)', color: T.goldBright, letterSpacing: -0.2, lineHeight: 1.15 }}>{b}</span>
            </div>
          ))}
        </div>

        {/* mission pull-quote */}
        <div style={{ marginTop: 44, paddingTop: 38, borderTop: '1px solid rgba(255,255,255,0.16)', textAlign: 'center', maxWidth: 860, marginLeft: 'auto', marginRight: 'auto' }}>
          <div style={{ fontFamily: F.ui, fontSize: 12, fontWeight: 700, letterSpacing: 1.8, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>The mission is simple</div>
          <p style={{ fontFamily: F.display, fontWeight: 700, fontSize: 'clamp(24px, 3.2vw, 38px)', lineHeight: 1.22, color: '#fff', letterSpacing: -0.4, margin: 0, textWrap: 'balance' }}>
            Help everyone learn Kannada,{' '}
            <span style={{ color: T.goldBright }}>swalpa swalpa</span>
            , little by little, one conversation at a time.
          </p>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Story, Vision });
