// ════════════════════════════════════════════════════════════════════════
// SITE APP — the Kannada Beku marketing page: nav · hero (+ email capture) ·
// app screenshots · about · contact · footer. Mirrors the real app's design
// language (Living Manuscript / playful redesign): Baloo display, red→gold
// gradient CTAs, gold accents, rangoli watermark, warm near-white surfaces.
// ════════════════════════════════════════════════════════════════════════

const { useState } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "kfont": "noto",
  "motif": true,
  "showcase": "walk"
}/*EDITMODE-END*/;

const DOMAIN = 'kannadabeku.com';
const EMAIL = 'kannadabeku@gmail.com';
const INSTA = 'kannada.beku';

// ── Nav ──────────────────────────────────────────────────────────────────────
function Nav({ tw, onJoin }) {
  const isMobile = useIsMobile(620);
  const join = () => onJoin('');

  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 100,
      background: 'color-mix(in srgb, #faf6ea 86%, transparent)',
      backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderBottom: `1px solid ${T.hairline}` }}>
      <div className="kb-wrap" style={{ maxWidth: 1180, margin: '0 auto', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Latin-first wordmark at every width; shrink it on mobile so the CTA + burger fit */}
        <a href="#top" style={{ textDecoration: 'none' }}><Wordmark size={isMobile ? 16 : 20} kfont={tw.kfont} latin /></a>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 28 }}>
          {/* primary CTA stays visible at every width */}
          <LipBtn onClick={join} bg={BRAND_GRADIENT} lip={T.redLip}
            style={{ padding: isMobile ? '10px 14px' : '11px 18px', fontSize: isMobile ? 14 : 15 }}>
            {isMobile ? 'Join' : 'Join the waitlist'}</LipBtn>
        </div>
      </div>
    </div>
  );
}

// ── Floating chip used to dress the hero phone ───────────────────────────────
function FloatChip({ children, style, delay = 0, ...rest }) {
  return (
    <div {...rest} style={{ position: 'absolute', display: 'flex', alignItems: 'center', gap: 9, background: T.card, whiteSpace: 'nowrap',
      borderRadius: 16, padding: '10px 14px', border: '1px solid rgba(27,29,14,0.08)',
      boxShadow: '0 4px 0 rgba(27,29,14,0.10), 0 16px 34px -16px rgba(27,29,14,0.30)',
      animation: `kb-bob 3.6s ease-in-out ${delay}s infinite`, ...style }}>
      {children}
    </div>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────
function Hero({ tw, onJoin }) {
  return (
    <div id="top" style={{ position: 'relative', overflow: 'hidden' }}>
      <KolamBg />
      {tw.motif && (
        <>
          <div aria-hidden style={{ position: 'absolute', left: -90, top: -40, zIndex: 0, pointerEvents: 'none' }}>
            <Rangoli size={360} color={T.red} opacity={0.05} />
          </div>
          <div aria-hidden style={{ position: 'absolute', right: 120, bottom: -120, zIndex: 0, pointerEvents: 'none' }}>
            <Rangoli size={300} color={T.goldDark} opacity={0.06} />
          </div>
        </>
      )}
      <div className="kb-wrap" style={{ maxWidth: 1180, margin: '0 auto', padding: '36px 28px 64px', position: 'relative', zIndex: 1 }}>
        <div className="kb-hero">
          {/* copy */}
          <div>
            <h1 style={{ fontFamily: F.display, fontWeight: 800, letterSpacing: -0.8,
              fontSize: 'clamp(40px, 5.6vw, 62px)', lineHeight: 1.02, color: T.ink, margin: '18px 0 0', textWrap: 'balance' }}>
              Learn the <span style={{ color: T.red }}>Kannada</span> that Bengaluru actually speaks.
            </h1>
            <p style={{ fontFamily: F.ui, fontSize: 'clamp(16px, 1.5vw, 19px)', lineHeight: 1.55, color: T.sub, margin: '20px 0 0', maxWidth: 500 }}>
              Short lessons, real survival phrases, and the culture behind the words,
              so you can speak from day one, not just translate.
            </p>

            <div style={{ fontFamily: F.ui, fontSize: 'clamp(15px, 1.4vw, 17px)', fontWeight: 700, color: T.red, marginTop: 22, letterSpacing: 0.2 }}>
              Listen → Speak → Practice
            </div>

            <div id="notify" style={{ marginTop: 30, scrollMarginTop: 92 }}>
              <LipBtn onClick={() => onJoin('')} bg={BRAND_GRADIENT} lip={T.redLip} icon="forward"
                style={{ padding: '15px 26px', fontSize: 16.5 }}>Join the waitlist</LipBtn>
              <div style={{ fontFamily: F.ui, fontSize: 12.5, color: T.faint, marginTop: 12 }}>
                Be first to know when we launch · takes 2 minutes · a few quick questions help us build it for you. No spam, ever.
              </div>
            </div>

            <div style={{ fontFamily: F.ui, fontSize: 14, fontWeight: 600, color: T.sub, marginTop: 26 }}>
              Available on iOS &amp; Android at launch
            </div>
          </div>

          {/* phone — interactive screen carousel */}
          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <ScreenCarousel kfont={tw.kfont} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── What's inside — numbers band + how-it-works (walkthrough OR cards) ────────
const STATS = [
  { n: '8',    label: 'Conversational lessons', sub: 'scenario → intake → drill → output' },
  { n: '5',    label: 'Practice games',         sub: 'match, dictation, opposites & more' },
  { n: '200+', label: 'Everyday phrases',       sub: 'auto, market, home, in-laws' },
];

const STEPS = [
  { icon: 'audio', title: 'Hear it in context', sub: 'A real Bengaluru moment (the auto, the counter, the in-laws) with the word and the culture behind it.' },
  { icon: 'mic',   title: 'Say it out loud',    sub: 'Practise the sounds until they feel natural, not robotic. Then a quick game locks it in.' },
  { icon: 'chat',  title: 'Use it today',       sub: 'Walk away with the exact line you needed, ready the next time you’re at the counter.' },
];

const CARDS = [
  { icon: 'audio', tint: T.redSoft,  ic: T.red,      title: 'Listen, then speak', sub: 'Every word is taught, then practised out loud, so it lands in your mouth, not just your notes.' },
  { icon: 'grid',  tint: T.goldSoft, ic: T.goldDark, title: 'Games that drill',   sub: 'Match, dictation and opposites turn the words you just met into ones you won’t forget.' },
  { icon: 'chat',  tint: T.redSoft,  ic: T.red,      title: 'Real survival lines', sub: 'The exact phrases for the auto, the market and the in-laws, there when you actually need them.' },
];

function StatsBand() {
  return (
    <div>
      <div style={{ background: T.card, borderRadius: 20, padding: '38px 10px', border: `1px solid ${T.hairline}`,
        boxShadow: '0 5px 0 rgba(27,29,14,0.10)' }}>
        <div className="kb-stats">
          {STATS.map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 'clamp(46px, 5vw, 60px)', lineHeight: 0.92, color: T.red, letterSpacing: -1 }}>{s.n}</div>
              <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 18, color: T.ink, marginTop: 16, letterSpacing: -0.2 }}>{s.label}</div>
              <div style={{ fontFamily: F.ui, fontSize: 14, color: T.sub, marginTop: 4, lineHeight: 1.45 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepRow({ s, last }) {
  return (
    <div style={{ display: 'flex', gap: 18 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: 15, background: T.redSoft, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={s.icon} size={23} color={T.red} sw={2} />
        </div>
        {!last && <div style={{ width: 2, flex: 1, background: T.hairStrong, margin: '8px 0', borderRadius: 2 }} />}
      </div>
      <div style={{ paddingBottom: last ? 0 : 26 }}>
        <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 21, color: T.ink, letterSpacing: -0.3 }}>{s.title}</div>
        <div style={{ fontFamily: F.ui, fontSize: 14.5, color: T.sub, lineHeight: 1.52, marginTop: 5, maxWidth: 360 }}>{s.sub}</div>
      </div>
    </div>
  );
}

// ── Phone carousel — click through the real app screens ──────────────────────
function ScreenCarousel({ kfont }) {
  const isMobile = useIsMobile();
  const screens = [
    { Comp: HomeScreen,   k: 'ನಮಸ್ಕಾರ', e: 'hello',     label: 'Home' },
    { Comp: LessonScreen, k: 'ಎಷ್ಟು',     e: 'how much?', label: 'Lesson' },
    { Comp: GamesScreen,  k: 'ಆಟ',         e: 'game time', label: 'Practice' },
  ];
  const [i, setI] = useState(0);
  const go = (d) => setI((p) => (p + d + screens.length) % screens.length);
  const S = screens[i];

  const Arrow = ({ dir }) => (
    <button type="button" onClick={() => go(dir === 'next' ? 1 : -1)} aria-label={dir === 'next' ? 'Next screen' : 'Previous screen'}
      style={{ width: 48, height: 48, borderRadius: 999, flexShrink: 0, cursor: 'pointer',
        background: T.card, border: `1px solid ${T.hairline}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 0 rgba(27,29,14,0.10)', transition: 'transform .12s, box-shadow .12s' }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 5px 0 rgba(27,29,14,0.10)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 0 rgba(27,29,14,0.10)'; }}>
      <span style={{ display: 'flex', transform: dir === 'prev' ? 'scaleX(-1)' : 'none' }}>
        <Icon name="chevron" size={23} color={T.red} sw={2.4} />
      </span>
    </button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 16 }}>
        <Arrow dir="prev" />
        <div style={{ position: 'relative' }}>
          <PhoneFrame scale={isMobile ? 0.5 : 0.58} glow>
            <S.Comp kfont={kfont} />
          </PhoneFrame>
        </div>
        <Arrow dir="next" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {screens.map((s, j) => (
          <button key={j} type="button" onClick={() => setI(j)} aria-label={s.label}
            style={{ width: j === i ? 24 : 9, height: 9, borderRadius: 999, border: 'none', padding: 0, cursor: 'pointer',
              background: j === i ? T.red : T.hairStrong, transition: 'width .2s, background .2s' }} />
        ))}
      </div>
      <div style={{ fontFamily: F.ui, fontSize: 13, fontWeight: 600, letterSpacing: 0.4, color: T.faint }}>
        {S.label} · {i + 1} of {screens.length}
      </div>
    </div>
  );
}

function Inside({ tw }) {
  return (
    <div id="screens" style={{ background: T.low, scrollMarginTop: 68, position: 'relative', overflow: 'hidden' }}>
      <KolamBg />
      {tw.motif && (
        <div aria-hidden style={{ position: 'absolute', right: -80, top: 40, zIndex: 0, pointerEvents: 'none' }}>
          <Rangoli size={300} color={T.goldDark} opacity={0.05} />
        </div>
      )}
      <div className="kb-wrap" style={{ maxWidth: 1180, margin: '0 auto', padding: '82px 28px 90px', position: 'relative', zIndex: 1 }}>
        {/* header */}
        <Eyebrow color={T.goldDark}>Yenu ide olage · what’s inside</Eyebrow>
        <h2 style={{ fontFamily: F.display, fontWeight: 800, letterSpacing: -0.6,
          fontSize: 'clamp(30px, 4vw, 50px)', lineHeight: 1.04, color: T.ink, margin: '18px 0 0', maxWidth: 760, textWrap: 'balance' }}>
          Everything you need to stop saying <span style={{ color: T.red }}>“gothilla”</span>.
        </h2>
        <p style={{ fontFamily: F.ui, fontSize: 'clamp(16px, 1.5vw, 18.5px)', lineHeight: 1.55, color: T.sub, margin: '18px 0 0', maxWidth: 560 }}>
          Built for anyone caught without the right words at the auto, the shop, the counter.
        </p>

        {/* numbers band */}
        <div style={{ marginTop: 40 }}>
          <StatsBand />
        </div>
      </div>
    </div>
  );
}

// ── Contact ──────────────────────────────────────────────────────────────────
function Contact({ tw }) {
  const cards = [
    { icon: 'mail', label: 'Email us', value: EMAIL, href: `mailto:${EMAIL}`, tint: T.errLow, ic: T.red },
    { icon: 'insta', label: 'On Instagram', value: `@${INSTA}`, href: `https://instagram.com/${INSTA}`, tint: T.goldSoft, ic: T.goldDark },
  ];
  return (
    <div id="contact" style={{ background: T.low, scrollMarginTop: 68 }}>
      <div className="kb-wrap" style={{ maxWidth: 1180, margin: '0 auto', padding: '80px 28px 88px' }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, marginBottom: 40 }}>
          <Eyebrow color={T.red}>Contact</Eyebrow>
          <h2 style={{ fontFamily: F.display, fontWeight: 800, letterSpacing: -0.5,
            fontSize: 'clamp(28px, 3.6vw, 44px)', lineHeight: 1.06, color: T.ink, margin: 0 }}>
            Say namaskāra.
          </h2>
          <p style={{ fontFamily: F.ui, fontSize: 16.5, color: T.sub, lineHeight: 1.55, margin: 0, maxWidth: 520 }}>
            Questions, ideas, want to help us launch? We’d genuinely love to hear from you.
          </p>
        </div>
        <div className="kb-contact" style={{ maxWidth: 720, margin: '0 auto' }}>
          {cards.map((c) => (
            <a key={c.label} href={c.href} target={c.icon === 'insta' ? '_blank' : undefined} rel="noreferrer"
              style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 16, minWidth: 0, background: T.card,
                borderRadius: 16, padding: '20px 22px', border: `1px solid ${T.hairline}`, boxShadow: '0 4px 0 rgba(27,29,14,0.10)', transition: 'transform .12s, box-shadow .12s' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 0 rgba(27,29,14,0.10)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 0 rgba(27,29,14,0.10)'; }}>
              <div style={{ width: 50, height: 50, borderRadius: 15, background: c.tint, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={c.icon} size={24} color={c.ic} sw={2} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: F.ui, fontSize: 11.5, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: T.faint }}>{c.label}</div>
                <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: c.value.length > 16 ? 15 : 18, color: T.ink, marginTop: 3, overflowWrap: 'anywhere' }}>{c.value}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Footer ───────────────────────────────────────────────────────────────────
function Footer({ tw, onJoin }) {
  return (
    <div style={{ background: T.ink, color: '#fff' }}>
      <div className="kb-wrap" style={{ maxWidth: 1180, margin: '0 auto', padding: '54px 28px 42px' }}>
        <div className="kb-foot">
          <div style={{ maxWidth: 360 }}>
            <Wordmark size={22} kfont={tw.kfont} color={T.goldBright} latin latinColor="rgba(255,255,255,0.92)" />
            <p style={{ fontFamily: F.ui, fontSize: 14.5, lineHeight: 1.55, color: 'rgba(255,255,255,0.66)', margin: '14px 0 0' }}>
              The friendly way to learn the Kannada that Karnataka actually speaks. Coming soon to iOS &amp; Android.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, fontFamily: F.ui, fontSize: 13.5, fontWeight: 600, color: T.goldBright }}>
              <Icon name="globe" size={16} color={T.goldBright} sw={2} /> {DOMAIN}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 56, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 14 }}>Explore</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11, alignItems: 'flex-start' }}>
                {[['Story', '#about'], ['Contact', '#contact']].map(([l, h]) => (
                  <a key={h} href={h} style={{ fontFamily: F.ui, fontSize: 14.5, color: 'rgba(255,255,255,0.78)', textDecoration: 'none' }}>{l}</a>
                ))}
                <button type="button" onClick={() => onJoin('')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                  fontFamily: F.ui, fontSize: 14.5, color: T.goldBright, fontWeight: 600, textAlign: 'left' }}>Join the waitlist</button>
              </div>
            </div>
            <div>
              <div style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 14 }}>Reach us</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                <a href={`mailto:${EMAIL}`} style={{ fontFamily: F.ui, fontSize: 14.5, color: 'rgba(255,255,255,0.78)', textDecoration: 'none' }}>{EMAIL}</a>
                <a href={`https://instagram.com/${INSTA}`} target="_blank" rel="noreferrer" style={{ fontFamily: F.ui, fontSize: 14.5, color: 'rgba(255,255,255,0.78)', textDecoration: 'none' }}>@{INSTA}</a>
              </div>
            </div>
          </div>
        </div>
        <div style={{ height: 1, background: 'rgba(255,255,255,0.12)', margin: '36px 0 22px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ fontFamily: F.ui, fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>© 2026 Kannada Beku · Made with filter coffee in Bengaluru.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <a href="privacy.html" style={{ fontFamily: F.ui, fontSize: 13, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Privacy Policy</a>
            <div style={{ fontFamily: kannadaFamily(tw.kfont), fontSize: 17, color: 'rgba(255,255,255,0.4)' }}>ಕನ್ನಡ ಬೇಕು</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── App ──────────────────────────────────────────────────────────────────────
function App() {
  const [tw, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [survey, setSurvey] = useState({ open: false, email: '' });
  const openSurvey = (email = '') => setSurvey({ open: true, email });
  const closeSurvey = () => setSurvey((s) => ({ ...s, open: false }));

  return (
    <div style={{ background: T.surface, minHeight: '100vh' }}>
      <Nav tw={tw} onJoin={openSurvey} />
      <Hero tw={tw} onJoin={openSurvey} />
      <Inside tw={tw} />
      <Story tw={tw} />
      <Vision tw={tw} />
      <Contact tw={tw} />
      <Footer tw={tw} onJoin={openSurvey} />

      <SurveyModal open={survey.open} initialEmail={survey.email} onClose={closeSurvey} tw={tw} />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Kannada script" />
        <TweakRadio label="Typeface" value={tw.kfont}
          options={[{ label: 'Noto Sans', value: 'noto' }, { label: 'Baloo (rounded)', value: 'baloo' }]}
          onChange={(v) => setTweak('kfont', v)} />

        <TweakSection label="What’s inside" />
        <TweakRadio label="How it works" value={tw.showcase}
          options={[{ label: 'Phone walkthrough', value: 'walk' }, { label: 'Feature cards', value: 'cards' }]}
          onChange={(v) => setTweak('showcase', v)} />

        <TweakSection label="Heritage motif" />
        <TweakToggle label="Rangoli watermark" value={tw.motif} onChange={(v) => setTweak('motif', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
