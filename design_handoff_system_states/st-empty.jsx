// st-empty.jsx — empty states (no content yet — distinct from errors).
//   Games locked (warning-orange) · No quiz scores (gold) · No streak · No search match.

const EmptyPaths = {
  search: (
    <g>
      <circle cx="11" cy="11" r="6.4" />
      <path d="m16 16 4 4" />
    </g>
  ),
};

// Gold reward button (README: reward CTAs use the gold variant).
function CKBtnGold({ children, style, ...rest }) {
  return (
    <CK as="button" lip={5} lipColor="var(--goldLip)" {...rest} style={{
      width: '100%', minHeight: 50, boxSizing: 'border-box',
      fontFamily: CK_DISPLAY, fontWeight: 700, fontSize: 16, color: 'var(--goldDeep)',
      background: 'linear-gradient(160deg, var(--goldHi), var(--gold))', border: 'none',
      borderRadius: 'var(--r)', padding: '15px 22px 13px',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, ...style,
    }}>{children}</CK>
  );
}

// 1 · Practice / Games — nothing unlocked yet (locked = warning orange)
function EmptyGames() {
  const T = useTone();
  return (
    <CKPhone bg="var(--surfaceLow)" pad="0">
      <CK2PageHeader title="Games" sub="Play with what you've learned" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 34px 70px' }}>
        <div className="st-rise" style={{ ['--d']: '0ms', position: 'relative' }}>
          <IconWell size={104} bg="var(--warnPale)" style={{ margin: '0 auto' }}>
            <CKIcon d={CKPaths.lock} size={46} stroke={2} color="var(--warn)" />
          </IconWell>
          {/* faint dice peeking behind */}
        </div>
        <div className="st-rise" style={{ ['--d']: '80ms', fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 24, marginTop: 22, color: 'var(--ink)', textWrap: 'balance' }}>
          {T('Games unlock as you learn', 'No games yet, guru')}
        </div>
        <div className="st-rise" style={{ ['--d']: '140ms', fontFamily: CK_BODY, fontWeight: 500, fontSize: 14.5, lineHeight: 1.5, color: 'var(--muted)', marginTop: 10, maxWidth: 290, textWrap: 'pretty' }}>
          {T('Finish your first lesson and Quick Quiz, Dictation and more open up — each one plays only with phrases you already know.', 'Finish one lesson and the games open up. They only use phrases you already learned.')}
        </div>
        <div className="st-rise" style={{ ['--d']: '220ms', width: '100%', marginTop: 26 }}>
          <CKBtnPrimary><CKPlay size={15} />{T('Start Lesson 1', 'Start Lesson 1')}</CKBtnPrimary>
        </div>
      </div>
      <CKTabBar active={2} />
    </CKPhone>
  );
}

// 2 · Quiz results — no scores yet (gold, encouraging)
function EmptyScores() {
  const T = useTone();
  return (
    <StateScaffold
      back
      well={
        <div style={{ position: 'relative', width: 116, margin: '0 auto' }}>
          <IconWell size={104} bg="var(--goldPale)" ring="var(--goldLip)" style={{ margin: '0 auto' }}>
            <CKIcon d={CKPaths.bolt} size={48} stroke={2} color="var(--goldDeep)" />
          </IconWell>
          <span style={{ position: 'absolute', top: -4, right: 2, fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 30, color: 'var(--faint)' }}>?</span>
        </div>
      }
      title={T('No scores yet', 'No high score… yet')}
      body={T('Play your first Quick Quiz and your best score and streak will show up here.', 'Play one Quick Quiz and your best score lands right here.')}
      actions={
        <CKBtnGold><CKPlay size={15} color="var(--goldDeep)" />{T('Play Quick Quiz', 'Play Quick Quiz')}</CKBtnGold>
      }
      note={T('Each game draws only from phrases you already know.', 'Only uses phrases you already know.')}
    />
  );
}

// 3 · Profile — no streak yet
function EmptyStreak() {
  const T = useTone();
  return (
    <CKPhone bg="var(--surfaceLow)" pad="0">
      <CK2TopBar streak={0} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 34px 70px' }}>
        <div className="st-rise" style={{ ['--d']: '0ms' }}>
          <IconWell size={104} bg="var(--redPale)" style={{ margin: '0 auto' }}>
            <CKIcon d={CKPaths.flame} size={50} stroke={2} color="var(--red2)" />
          </IconWell>
        </div>
        <div className="st-rise" style={{ ['--d']: '80ms', fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 24, marginTop: 22, color: 'var(--ink)', textWrap: 'balance' }}>
          {T('Start your streak today', 'Light up that streak')}
        </div>
        <div className="st-rise" style={{ ['--d']: '140ms', fontFamily: CK_BODY, fontWeight: 500, fontSize: 14.5, lineHeight: 1.5, color: 'var(--muted)', marginTop: 10, maxWidth: 290, textWrap: 'pretty' }}>
          {T('Learn for five minutes a day and watch the flame grow. One lesson is all it takes to begin.', 'Five minutes a day keeps the flame alive. One lesson and you’re in.')}
        </div>
        <div className="st-rise" style={{ ['--d']: '220ms', width: '100%', marginTop: 26 }}>
          <CKBtnPrimary><CKPlay size={15} />{T("Start today's lesson", 'Start today’s lesson')}</CKBtnPrimary>
        </div>
      </div>
      <CKTabBar active={3} />
    </CKPhone>
  );
}

// 4 · Search — no matching phrase
function EmptySearch() {
  const T = useTone();
  return (
    <CKPhone bg="var(--surfaceLow)" pad="0">
      {/* search bar chrome */}
      <div style={{ padding: '16px 20px 14px', borderBottom: '1px solid var(--hairline)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: CK_HAIRLINE, borderRadius: 99, padding: '11px 16px', boxShadow: '0 3px 0 rgba(27,29,14,0.06)' }}>
          <span style={{ color: 'var(--faint)', display: 'flex' }}><CKIcon d={EmptyPaths.search} size={18} stroke={2} /></span>
          <span style={{ fontFamily: CK_BODY, fontWeight: 600, fontSize: 14.5, color: 'var(--ink)' }}>biriyani</span>
          <span style={{ marginLeft: 'auto', color: 'var(--faint)', display: 'flex' }}><CKIcon d={CKPaths.close} size={16} stroke={2.4} /></span>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 34px 40px' }}>
        <div className="st-rise" style={{ ['--d']: '0ms' }}>
          <IconWell size={96} bg="var(--surfaceHigh)" style={{ margin: '0 auto' }}>
            <CKIcon d={EmptyPaths.search} size={42} stroke={2} color="var(--faint)" />
          </IconWell>
        </div>
        <div className="st-rise" style={{ ['--d']: '80ms', fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 23, marginTop: 20, color: 'var(--ink)', textWrap: 'balance' }}>
          {T('No phrase for “biriyani”', 'Nothing for “biriyani”')}
        </div>
        <div className="st-rise" style={{ ['--d']: '140ms', fontFamily: CK_BODY, fontWeight: 500, fontSize: 14.5, lineHeight: 1.5, color: 'var(--muted)', marginTop: 10, maxWidth: 280, textWrap: 'pretty' }}>
          {T('Try a different word, or browse phrases by everyday situations instead.', 'Try another word, or browse by situation instead.')}
        </div>
        <div className="st-rise" style={{ ['--d']: '220ms', marginTop: 22 }}>
          <CK as="button" lip={4} style={{
            fontFamily: CK_DISPLAY, fontWeight: 700, fontSize: 14.5, color: 'var(--ink)',
            background: '#fff', border: '2px solid var(--interactiveSecondary)', boxShadow: '0 4px 0 var(--interactiveSecondaryLip)',
            borderRadius: 'var(--r)', padding: '12px 22px 10px',
          }}>{T('Browse by situation', 'Browse by situation')}</CK>
        </div>
      </div>
    </CKPhone>
  );
}

Object.assign(window, { EmptyGames, EmptyScores, EmptyStreak, EmptySearch, CKBtnGold });
