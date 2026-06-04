// PLAYFUL EMERGENCY — English-first hierarchy so a panicking non-speaker finds
// the phrase fast: big English, transliteration second (how to say it), Kannada
// small & muted as reference. Tap a card to hear it.

function Emergency({ onBack }) {
  const { tokens, tw } = usePL();
  const t = tokens; const kf = kannadaFamily(tw.kfont);
  const [tab, setTab] = React.useState('auto');
  const [playing, setPlaying] = React.useState(null);
  const group = EMERGENCY.find(g => g.id === tab);

  const playPhrase = (key) => {
    setPlaying(key);
    setTimeout(() => setPlaying(p => (p === key ? null : p)), 1100);
  };

  return (
    <PageShell bg={t.bg}>
      {/* Red SOS header */}
      <div style={{ position: 'relative', overflow: 'hidden', paddingTop: 52, paddingBottom: 20, paddingLeft: 16, paddingRight: 20,
        background: `linear-gradient(150deg, ${t.redHi}, ${t.red})`, borderBottomLeftRadius: 26, borderBottomRightRadius: 26 }}>
        <div aria-hidden style={{ position: 'absolute', right: -10, top: -16, fontFamily: kf, fontSize: 150, color: 'rgba(255,255,255,0.12)', fontWeight: 700, lineHeight: 1 }}>!</div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onBack} aria-label="Back" style={{ border: 'none', cursor: 'pointer', width: 40, height: 40, borderRadius: 13,
            background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <PLIcon name="back" size={20} color={t.red} sw={2.5} />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: PLfont.display, fontSize: 25, fontWeight: 800, color: '#fff', letterSpacing: -0.4 }}>Emergency Kannada</div>
            <div style={{ fontFamily: PLfont.ui, fontSize: 12.5, color: 'rgba(255,255,255,0.85)', marginTop: 1, fontWeight: 500 }}>Tap a phrase to play it out loud · works offline</div>
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 9, padding: '14px 16px 4px' }}>
        {EMERGENCY.map(g => {
          const on = g.id === tab;
          return (
            <button key={g.id} onClick={() => setTab(g.id)} style={{ border: 'none', cursor: 'pointer', flex: 1,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 6px', borderRadius: 13,
              background: on ? t.red : t.card, color: on ? '#fff' : t.ink, fontFamily: PLfont.display, fontWeight: 700, fontSize: 13.5,
              boxShadow: on ? `0 4px 0 ${t.redLip}` : `inset 0 0 0 1px ${t.line}`, transition: 'background .15s' }}>
              <PLIcon name={g.icon} size={15} color={on ? '#fff' : t.red} sw={2.2} />{g.label}
            </button>
          );
        })}
      </div>

      {/* Phrase cards — ENGLISH FIRST */}
      <div style={{ padding: '12px 16px 40px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {group.items.map((it, i) => {
          const key = tab + i;
          const isPlaying = playing === key;
          return (
            <div key={key} onClick={() => playPhrase(key)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
              background: t.card, borderRadius: 18, padding: '14px 16px',
              boxShadow: isPlaying ? `inset 0 0 0 2px ${t.red}` : `inset 0 0 0 1px ${t.line}`, transition: 'box-shadow .15s' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* English — the hero */}
                <div style={{ fontFamily: PLfont.display, fontSize: 20, fontWeight: 700, color: t.ink, letterSpacing: -0.3, lineHeight: 1.2 }}>{it.en}</div>
                {/* Transliteration — say it like this */}
                <div style={{ fontFamily: PLfont.italic, fontStyle: 'italic', fontSize: 15.5, color: t.red, marginTop: 3 }}>{it.roman}</div>
                {/* Kannada — small & muted reference */}
                <div style={{ fontFamily: kf, fontSize: 13.5, color: t.faint, marginTop: 2, fontWeight: 500 }}>{it.kn}</div>
              </div>
              <div style={{ position: 'relative', width: 50, height: 50, borderRadius: 16, flexShrink: 0, background: isPlaying ? t.red : t.redWash,
                display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isPlaying ? `0 4px 0 ${t.redLip}` : 'none', transition: 'background .15s' }}>
                {isPlaying && <span style={{ position: 'absolute', inset: 0, borderRadius: 16, border: `2px solid ${t.red}`, animation: 'pl-ping 1s ease-out infinite' }} />}
                <PLIcon name={isPlaying ? 'pause' : 'audio'} size={22} color={isPlaying ? '#fff' : t.red} sw={2.2} fill={isPlaying} />
              </div>
            </div>
          );
        })}

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 10, padding: '0 4px' }}>
          <PLIcon name="info" size={14} color={t.faint} sw={2} />
          <div style={{ fontFamily: PLfont.italic, fontStyle: 'italic', fontSize: 12, color: t.faint, lineHeight: 1.4 }}>
            Audio uses your device’s voice. Romanisation pending a Kannada-speaker review.
          </div>
        </div>
      </div>
    </PageShell>
  );
}

Object.assign(window, { Emergency });
