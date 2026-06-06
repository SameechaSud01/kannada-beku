// PLAYFUL AUTH — sample static screen showing the gradient treatment the
// designer asked for. Full-bleed vibe gradient + glyph watermark + big Baloo
// wordmark + warm welcome + sign-in actions. (One screen, as a sample.)

function AuthScreen({ onEnter }) {
  const { tokens, vibe, tw } = usePL();
  const t = tokens; const kf = kannadaFamily(tw.kfont);

  // floating glyphs over the gradient
  let s = 23; const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const floats = Array.from({ length: 9 }).map((_, i) => ({
    g: GLYPHS[(i * 3) % GLYPHS.length], x: rnd() * 100, y: 6 + rnd() * 56,
    sz: 26 + rnd() * 40, rot: -18 + rnd() * 36, dur: 4 + rnd() * 3, delay: rnd() * 2,
  }));

  return (
    <div style={{ height: '100%', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column',
      background: `linear-gradient(165deg, ${t.redHi} 0%, ${t.red} 52%, ${t.redLip} 100%)` }}>
      {/* soft colour bloom */}
      <div aria-hidden style={{ position: 'absolute', top: -90, right: -70, width: 280, height: 280, borderRadius: '50%',
        background: `radial-gradient(circle, ${vibe.heroAccent(t)}55, transparent 70%)`, pointerEvents: 'none' }} />
      <div aria-hidden style={{ position: 'absolute', bottom: 120, left: -90, width: 260, height: 260, borderRadius: '50%',
        background: `radial-gradient(circle, ${t.goldHi}3a, transparent 70%)`, pointerEvents: 'none' }} />

      {/* glyph watermark */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {floats.map((f, i) => (
          <span key={i} style={{ position: 'absolute', left: `${f.x}%`, top: `${f.y}%`, fontFamily: kf, fontSize: f.sz,
            color: '#fff', opacity: 0.08, fontWeight: 600, transform: `rotate(${f.rot}deg)`,
            animation: `pl-bob ${f.dur}s ease-in-out ${f.delay}s infinite` }}>{f.g}</span>
        ))}
      </div>

      {/* Hero */}
      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0 28px', textAlign: 'center' }}>
        <div style={{ fontFamily: kf, fontSize: 92, color: '#fff', fontWeight: 700, lineHeight: 1, textShadow: `0 8px 24px ${t.redLip}88` }}>ಬಾ</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 14 }}>
          <span style={{ fontFamily: PLfont.display, fontWeight: 800, fontSize: 38, letterSpacing: -0.8, color: '#fff' }}>Kannada</span>
          <span style={{ fontFamily: kf, fontWeight: 700, fontSize: 40, color: vibe.heroAccent(t), lineHeight: 1 }}>ಬಾ</span>
        </div>
        <div style={{ fontFamily: PLfont.italic, fontStyle: 'italic', fontSize: 16.5, color: 'rgba(255,255,255,0.9)', marginTop: 12, maxWidth: 280, lineHeight: 1.5 }}>
          “Come, Kannada.” Learn to speak it in five minutes a day.
        </div>
      </div>

      {/* Actions sheet */}
      <div style={{ position: 'relative', background: t.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: '24px 22px 34px', boxShadow: '0 -10px 40px rgba(110,0,20,0.3)' }}>
        {tw.watermark && <Watermark on />}
        <div style={{ position: 'relative' }}>
          <div style={{ fontFamily: PLfont.display, fontSize: 22, fontWeight: 800, color: t.ink, textAlign: 'center', letterSpacing: -0.3 }}>Let’s get you talking</div>
          <div style={{ fontFamily: PLfont.ui, fontSize: 13.5, color: t.sub, textAlign: 'center', marginTop: 3, fontWeight: 500 }}>Free · no card · works offline</div>

          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 11 }}>
            <LipButton color={t.red} lip={t.redLip} icon="arrow" onClick={onEnter}>Start learning</LipButton>
            <button onClick={onEnter} style={{ border: 'none', cursor: 'pointer', background: 'transparent', color: t.sub,
              borderRadius: 15, padding: '12px 20px', fontFamily: PLfont.ui, fontWeight: 700, fontSize: 14.5,
              width: '100%', WebkitTapHighlightColor: 'transparent' }}>
              I already have an account
            </button>
          </div>

          <div style={{ fontFamily: PLfont.ui, fontSize: 11.5, color: t.faint, textAlign: 'center', marginTop: 16, lineHeight: 1.5 }}>
            By continuing you agree to our <span style={{ color: t.sub, fontWeight: 600 }}>Terms</span> &amp; <span style={{ color: t.sub, fontWeight: 600 }}>Privacy</span>.
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AuthScreen });
