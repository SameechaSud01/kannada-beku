// PLAYFUL APP — shell: tokens + vibe from tweaks, navigation, page transitions,
// app-level celebration overlay, and the Tweaks panel. The "Vibe" tweak is the
// few-options explorer for the fun direction (Festive / Playground / Sunrise).

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "motif": "mandala",
  "kfont": "baloo",
  "watermark": true,
  "bright": true
}/*EDITMODE-END*/;

function App() {
  const [tw, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const tokens = React.useMemo(() => makeTokens(tw.bright), [tw.bright]);
  const vibe = React.useMemo(() => ({ ...THEME, motif: tw.motif }), [tw.motif]);

  const [scale, setScale] = React.useState(1);
  React.useEffect(() => {
    const fit = () => setScale(Math.min((window.innerWidth - 24) / 390, (window.innerHeight - 24) / 844, 1));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  const [screen, setScreen] = React.useState('home');
  const [celebrate, setCelebrate] = React.useState(null); // null | 'lesson' | 'streak' | 'level'
  const TABS = ['home', 'learn', 'practice', 'profile'];
  const navVisible = TABS.includes(screen);

  const ctx = { tokens, tw, vibe };

  const renderScreen = () => {
    switch (screen) {
      case 'auth':     return <AuthScreen onEnter={() => setScreen('home')} />;
      case 'loading':  return <LoadingScreen onDone={() => setScreen('home')} />;
      case 'home':     return <Home onContinue={() => setScreen('lesson')} onEmergency={() => setScreen('emergency')} onNav={setScreen} onCelebrate={setCelebrate} />;
      case 'learn':    return <LearnTab onLesson={() => setScreen('lesson')} />;
      case 'practice': return <PracticeTab />;
      case 'profile':  return <ProfileTab onCelebrate={setCelebrate} />;
      case 'lesson':   return <Lesson onExit={() => setScreen('learn')} onDone={() => setScreen('learn')} />;
      case 'emergency':return <Emergency onBack={() => setScreen('home')} />;
      default:         return null;
    }
  };

  return (
    <PLCtx.Provider value={ctx}>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ zoom: scale }}>
        <IOSDevice width={390} height={844}>
          <div style={{ height: '100%', position: 'relative', background: tokens.bg }}>
            <div key={screen} style={{ height: '100%', animation: 'pl-page .32s cubic-bezier(.4,0,.2,1)' }}>
              {renderScreen()}
            </div>
            {navVisible && <BottomNav active={screen} onNav={setScreen} />}
            {celebrate && <Celebration kind={celebrate} onClose={() => setCelebrate(null)} />}
          </div>
        </IOSDevice>
        </div>
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Watermark motif" />
        <TweakRadio label="Motif" value={tw.motif}
          options={[{ label: 'Rangoli', value: 'mandala' }, { label: 'Glyphs', value: 'glyphs' }, { label: 'Rays', value: 'rays' }]}
          onChange={(v) => setTweak('motif', v)} />
        <TweakToggle label="Show watermark" value={tw.watermark} onChange={(v) => setTweak('watermark', v)} />

        <TweakSection label="Kannada script" />
        <TweakRadio label="Typeface" value={tw.kfont}
          options={[{ label: 'Baloo (rounded)', value: 'baloo' }, { label: 'Noto Sans', value: 'noto' }]}
          onChange={(v) => setTweak('kfont', v)} />

        <TweakSection label="Surface" />
        <TweakRadio label="Background" value={tw.bright ? 'near' : 'cream'}
          options={[{ label: 'Near-white', value: 'near' }, { label: 'Cream', value: 'cream' }]}
          onChange={(v) => setTweak('bright', v === 'near')} />

        <TweakSection label="Walk the flow" />
        <TweakButton label="🚪  Welcome / sign-in" onClick={() => setScreen('auth')} />
        <TweakButton label="🏠  Home" onClick={() => setScreen('home')} />
        <TweakButton label="📖  Learn path" onClick={() => setScreen('learn')} />
        <TweakButton label="✍️  Lesson runner (full flow)" onClick={() => setScreen('lesson')} />
        <TweakButton label="🆘  Emergency Kannada" onClick={() => setScreen('emergency')} />
        <TweakButton label="⏳  Loading screen" onClick={() => setScreen('loading')} />

        <TweakSection label="Celebrations" />
        <TweakButton label="🏆  Lesson complete" onClick={() => setCelebrate('lesson')} />
        <TweakButton label="🔥  Streak milestone" onClick={() => setCelebrate('streak')} />
        <TweakButton label="⭐  Level up" onClick={() => setCelebrate('level')} />
      </TweaksPanel>
    </PLCtx.Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
