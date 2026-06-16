// st-splash.jsx — app launch / splash. Three takes:
//   A · Bengaluru skyline — landmark stickers stand along the bottom on cream.
//   B · Sticker scatter — culture + food stickers frame the mark.
//   C · Red brand reveal — the in-app chunky language (gradient + gold ಬೇಕು).
// Stickers are the project's transparent illustration set (see Kannada Baa Stickers).

// Floating sticker: wrapper holds position + rotation, inner img does the gentle float.
function Sticker({ src, w, rot = 0, i = 0, z = 1, style }) {
  return (
    <div style={{ position: 'absolute', width: w, zIndex: z, transform: `rotate(${rot}deg)`, ...style }}>
      <img className="st-float" src={`../assets/${src}.png`} alt="" aria-hidden="true"
        style={{ width: '100%', display: 'block', ['--i']: i,
          filter: 'drop-shadow(0 7px 12px rgba(40,30,20,0.16))' }} />
    </div>
  );
}

// Shared centred mark: app icon + wordmark + eyebrow + tagline (+ optional loader).
function SplashMark({ icon = 128, loader = true }) {
  const T = useTone();
  return (
    <>
      <AppIcon size={icon} />
      <div className="st-rise" style={{ ['--d']: '560ms', fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 33, color: 'var(--red)', marginTop: 22, lineHeight: 1, whiteSpace: 'nowrap' }}>ಕನ್ನಡ ಬೇಕು</div>
      <div className="st-rise" style={{ ['--d']: '660ms', fontFamily: CK_BODY, fontWeight: 700, fontSize: 11, letterSpacing: 2.4, textTransform: 'uppercase', color: '#9a7b1e', marginTop: 10 }}>Kannada&nbsp;&nbsp;Beku</div>
      <div className="st-rise" style={{ ['--d']: '760ms', fontFamily: CK_BODY, fontWeight: 600, fontSize: 12.5, color: '#9a7b1e', textWrap: 'balance', textAlign: 'center', maxWidth: 250, marginTop: 12 }}>
        {T('Learn Kannada. Belong in Bengaluru.', 'Time to stop nodding and start talking.')}
      </div>
      {loader && <div className="st-rise" style={{ ['--d']: '900ms', marginTop: 18 }}><CKDots color="#cf9a1c" /></div>}
    </>
  );
}

// A · Bengaluru skyline — landmarks stand on a soft warm ground; mark floats above.
function SplashSkyline() {
  return (
    <div style={{
      width: '100%', height: '100%', boxSizing: 'border-box', position: 'relative', overflow: 'hidden',
      background: 'radial-gradient(125% 80% at 50% 30%, #fbf4e2 0%, #f1e6c9 100%)', fontFamily: CK_BODY,
    }}>
      {/* warm ground band behind the skyline */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 250,
        background: 'linear-gradient(180deg, transparent 0%, rgba(120,89,0,0.05) 45%, rgba(120,89,0,0.11) 100%)' }}></div>

      {/* skyline (bottom-anchored, slight overlaps) */}
      <Sticker src="mysore-palace"  w={166} rot={-2} i={0} z={1} style={{ left: -30, bottom: 44 }} />
      <Sticker src="town-hall"      w={150} rot={2}  i={2} z={4} style={{ right: -30, bottom: 56 }} />
      <Sticker src="vidhana-soudha" w={196} rot={0}  i={1} z={3} style={{ left: 84, bottom: 36 }} />
      <Sticker src="filter-coffee"  w={56}  rot={9}  i={3} z={5} style={{ left: 34, bottom: 26 }} />
      <Sticker src="dosa"           w={90}  rot={-6} i={4} z={2} style={{ right: 16, bottom: 22 }} />

      {/* mark */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 132 }}>
        <SplashMark icon={124} />
      </div>
    </div>
  );
}

// B · Sticker scatter — culture + food stickers ring the mark.
function SplashScatter() {
  return (
    <div style={{
      width: '100%', height: '100%', boxSizing: 'border-box', position: 'relative', overflow: 'hidden',
      background: 'radial-gradient(120% 90% at 50% 42%, #fbf4e2 0%, #f2e7cd 100%)', fontFamily: CK_BODY,
    }}>
      {/* top frame */}
      <Sticker src="mysore-palace"           w={120} rot={-6} i={0} style={{ top: 58, left: -18 }} />
      <Sticker src="mysore-dasara"           w={140} rot={5}  i={1} style={{ top: 50, right: -22 }} />
      <Sticker src="lalbagh"                  w={98}  rot={-4} i={2} style={{ top: 172, left: 2 }} />
      <Sticker src="dodda-ganapathi-temple"   w={84}  rot={6}  i={3} style={{ top: 180, right: 8 }} />
      {/* bottom frame */}
      <Sticker src="flower-market-malini"     w={118} rot={-5} i={4} style={{ bottom: 150, left: -14 }} />
      <Sticker src="filter-coffee"            w={54}  rot={10} i={5} style={{ bottom: 248, right: 28 }} />
      <Sticker src="channapatna-toys"         w={82}  rot={-7} i={6} style={{ bottom: 58, left: 28 }} />
      <Sticker src="dosa"                     w={100} rot={7}  i={7} style={{ bottom: 78, right: -10 }} />

      {/* mark */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <SplashMark icon={128} />
      </div>
    </div>
  );
}

// C · Red brand reveal — immersive in-app red language with the real icon tile.
function SplashRedBrand() {
  const T = useTone();
  const dots = 'radial-gradient(circle, rgba(255,255,255,0.07) 1.3px, transparent 1.5px)';
  return (
    <div style={{
      width: '100%', height: '100%', boxSizing: 'border-box',
      backgroundColor: 'var(--red)',
      backgroundImage: `${dots}, radial-gradient(135% 80% at 50% 22%, var(--red2) 0%, var(--red) 62%, #6e0014 100%)`,
      backgroundSize: '22px 22px, auto',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: CK_BODY, position: 'relative', overflow: 'hidden', color: '#fff',
    }}>
      {/* giant ಬೇಕು watermark, tilted, behind */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: -28, right: -36, fontFamily: CK_DISPLAY, fontWeight: 800,
        fontSize: 240, lineHeight: 1, color: 'rgba(255,255,255,0.06)', transform: 'rotate(-10deg)', userSelect: 'none',
      }}>ಬೇಕು</div>

      <AppIcon size={150} ring="1px solid rgba(255,215,120,0.28)" shadow="0 24px 54px rgba(0,0,0,0.42), 0 0 0 6px rgba(255,255,255,0.04)" />

      <div className="st-rise" style={{ ['--d']: '620ms', fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 36, marginTop: 24, lineHeight: 1, whiteSpace: 'nowrap' }}>
        ಕನ್ನಡ <span style={{ color: 'var(--goldHi)' }}>ಬೇಕು</span>
      </div>
      <div className="st-rise" style={{ ['--d']: '720ms', fontFamily: CK_BODY, fontWeight: 700, fontSize: 11, letterSpacing: 2.6, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginTop: 12 }}>Kannada&nbsp;&nbsp;Beku</div>

      <div className="st-rise" style={{ ['--d']: '1000ms', position: 'absolute', bottom: 56, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <CKDots color="var(--goldHi)" />
        <div style={{ fontFamily: CK_BODY, fontWeight: 600, fontSize: 12.5, color: 'rgba(255,255,255,0.82)', textWrap: 'balance', textAlign: 'center', maxWidth: 250 }}>
          {T('Learn Kannada. Belong in Bengaluru.', 'Time to stop nodding and start talking.')}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Sticker, SplashMark, SplashSkyline, SplashScatter, SplashRedBrand });
