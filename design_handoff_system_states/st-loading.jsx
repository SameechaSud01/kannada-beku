// st-loading.jsx — loading states.
//   A · Spinner screen (matches GuideLoading: red spinner on cream, back chip).
//   B · Home skeleton — real top chrome, shimmer bodies.
//   C · Lessons skeleton.

// A · centred spinner
function LoadingSpinner() {
  const T = useTone();
  return (
    <CKPhone bg="var(--surfaceLow)" pad="0">
      <div style={{ position: 'absolute', top: 18, left: 18 }}>
        <CKRound size={40} bg="#fff" lipColor="rgba(27,29,14,0.10)" lip={3}>
          <span style={{ color: 'var(--red)', display: 'flex' }}><CKIcon d={CKPaths.back} size={20} stroke={2} /></span>
        </CKRound>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
        <CKSpinner size={48} sw={5} />
        <div style={{ fontFamily: CK_DISPLAY, fontWeight: 700, fontSize: 15.5, color: 'var(--muted)' }}>
          {T('Getting things ready…', 'One sec, guru…')}
        </div>
      </div>
    </CKPhone>
  );
}

// Skeleton card frame (white chunky card with hard lip)
function SkelCard({ children, style }) {
  return (
    <div style={{
      background: '#fff', border: CK_HAIRLINE, borderRadius: 'var(--r)',
      boxShadow: '0 4px 0 rgba(27,29,14,0.07)', padding: 16, boxSizing: 'border-box', ...style,
    }}>{children}</div>
  );
}

// B · Home skeleton
function LoadingHome() {
  return (
    <CKPhone bg="var(--surfaceLow)" pad="0">
      <CK2TopBar streak={6} />
      <div style={{ flex: 1, overflow: 'hidden', padding: '16px 20px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          <Skel w="68%" h={26} r={9} />
          <Skel w="84%" h={14} r={7} />
        </div>
        {/* rings card */}
        <SkelCard style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <Skel w={118} h={118} r={999} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Skel w={10} h={10} r={999} />
                <Skel w="46%" h={12} r={6} />
                <Skel w={34} h={18} r={6} style={{ marginLeft: 'auto' }} />
              </div>
            ))}
          </div>
        </SkelCard>
        {/* continue card (red — show as filled tonal shimmer) */}
        <div style={{ background: 'var(--redPale)', borderRadius: 'var(--r)', boxShadow: '0 4px 0 rgba(145,0,27,0.12)', padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
          <Skel w={44} h={44} r={999} style={{ ['--c1']: 'rgba(145,0,27,0.14)', ['--c2']: 'rgba(145,0,27,0.07)' }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Skel w="62%" h={15} r={7} style={{ ['--c1']: 'rgba(145,0,27,0.14)', ['--c2']: 'rgba(145,0,27,0.07)' }} />
            <Skel w="44%" h={11} r={6} style={{ ['--c1']: 'rgba(145,0,27,0.12)', ['--c2']: 'rgba(145,0,27,0.06)' }} />
          </div>
        </div>
        {/* gold banner */}
        <SkelCard style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Skel w="50%" h={16} r={7} />
            <Skel w={38} h={16} r={7} />
          </div>
          <Skel w="100%" h={9} r={99} />
          <Skel w="64%" h={11} r={6} />
        </SkelCard>
      </div>
      <CKTabBar active={0} />
    </CKPhone>
  );
}

// C · Lessons skeleton
function LoadingLessons() {
  return (
    <CKPhone bg="var(--surfaceLow)" pad="0">
      <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--hairline)', display: 'flex', flexDirection: 'column', gap: 9 }}>
        <Skel w="46%" h={26} r={9} />
        <Skel w="60%" h={13} r={7} />
      </div>
      <div style={{ flex: 1, overflow: 'hidden', padding: '16px 20px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* basics card */}
        <div style={{ background: 'var(--surfaceLow)', border: CK_HAIRLINE, borderRadius: 'var(--r)', padding: 14, display: 'flex', alignItems: 'center', gap: 13 }}>
          <Skel w={40} h={40} r={12} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Skel w="52%" h={14} r={7} />
            <Skel w="72%" h={11} r={6} />
          </div>
        </div>
        {[0, 1, 2, 3, 4].map((i) => (
          <SkelCard key={i} style={{ display: 'flex', alignItems: 'center', gap: 13, opacity: 1 - i * 0.12 }}>
            <Skel w={44} h={44} r={13} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Skel w={`${64 - i * 6}%`} h={14} r={7} />
              <Skel w={`${48 - i * 4}%`} h={11} r={6} />
            </div>
            <Skel w={22} h={22} r={999} />
          </SkelCard>
        ))}
      </div>
      <CKTabBar active={1} />
    </CKPhone>
  );
}

// D · Games (Practice) skeleton — featured gold quiz, 2-up red grid, wide gold.
// Cards keep their real fills (colour is structural to this screen); content shimmers.
function LoadingGames() {
  const onRed  = { ['--c1']: 'rgba(255,255,255,0.20)', ['--c2']: 'rgba(255,255,255,0.10)' };
  const onGold = { ['--c1']: 'rgba(120,89,0,0.18)',  ['--c2']: 'rgba(120,89,0,0.09)' };
  return (
    <CKPhone bg="var(--surfaceLow)" pad="0">
      <CK2TopBar streak={6} />
      <div style={{ flex: 1, overflow: 'hidden', padding: '18px 20px 0', display: 'flex', flexDirection: 'column', gap: 13 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Skel w="40%" h={28} r={9} />
          <Skel w="58%" h={13} r={7} />
        </div>
        {/* featured quiz — gold chunky card with play orb */}
        <div style={{ position: 'relative', background: 'var(--goldPale)', borderRadius: 'var(--r)', boxShadow: '0 5px 0 var(--goldLip)', padding: 18, overflow: 'hidden' }}>
          <Skel w={52} h={52} r={14} style={{ ...onGold, marginBottom: 12 }} />
          <Skel w="48%" h={18} r={8} style={onGold} />
          <Skel w="34%" h={12} r={6} style={{ ...onGold, marginTop: 8 }} />
          <div style={{ position: 'absolute', right: 18, bottom: 18 }}><Skel w={46} h={46} r={999} style={{ ['--c1']: 'rgba(145,0,27,0.22)', ['--c2']: 'rgba(145,0,27,0.11)' }} /></div>
        </div>
        {/* 2-up grid — Dictation / Conversations (red) */}
        <div style={{ display: 'flex', gap: 11 }}>
          {[['var(--red2)', 'var(--redLip)'], ['var(--red)', '#4a000e']].map(([bg, lip], i) => (
            <div key={i} style={{ flex: 1, height: 150, borderRadius: 'var(--r)', background: bg, boxShadow: `0 5px 0 ${lip}`, padding: 16, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 8 }}>
              <Skel w="62%" h={16} r={7} style={onRed} />
              <Skel w="84%" h={11} r={6} style={onRed} />
            </div>
          ))}
        </div>
        {/* wide — Opposites (gold) */}
        <div style={{ height: 96, borderRadius: 'var(--r)', background: 'var(--goldPale)', boxShadow: '0 5px 0 var(--goldLip)', padding: 16, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 8 }}>
          <Skel w="38%" h={16} r={7} style={onGold} />
          <Skel w="28%" h={11} r={6} style={onGold} />
        </div>
      </div>
      <CKTabBar active={2} />
    </CKPhone>
  );
}

// E · Profile skeleton — name, gold progress band, 2 stat cards, settings list, sign-out.
function LoadingProfile() {
  const onGold = { ['--c1']: 'rgba(108,80,0,0.20)', ['--c2']: 'rgba(108,80,0,0.10)' };
  return (
    <CKPhone bg="var(--surfaceLow)" pad="0">
      <CK2TopBar streak={6} />
      <div style={{ flex: 1, overflow: 'hidden', padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* name */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Skel w="50%" h={26} r={9} />
          <Skel w="38%" h={12} r={6} />
        </div>
        {/* overall progress band — gold gradient */}
        <div style={{ borderRadius: 'var(--r)', background: 'linear-gradient(135deg, var(--goldHi), var(--gold))', boxShadow: '0 5px 0 var(--goldLip)', padding: 18, display: 'flex', flexDirection: 'column', gap: 11, boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Skel w="44%" h={11} r={6} style={onGold} />
            <Skel w={48} h={22} r={7} style={onGold} />
          </div>
          <Skel w="100%" h={9} r={99} style={{ ['--c1']: 'rgba(108,80,0,0.24)', ['--c2']: 'rgba(108,80,0,0.13)' }} />
          <Skel w="56%" h={11} r={6} style={onGold} />
        </div>
        {/* two stat cards */}
        <div style={{ display: 'flex', gap: 11 }}>
          {[0, 1].map((i) => (
            <SkelCard key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
              <Skel w={22} h={22} r={7} />
              <Skel w="42%" h={26} r={8} style={{ marginTop: 4 }} />
              <Skel w="72%" h={10} r={5} />
            </SkelCard>
          ))}
        </div>
        {/* settings list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          <Skel w="24%" h={11} r={6} />
          <div style={{ background: '#fff', border: CK_HAIRLINE, borderRadius: 'var(--r)', boxShadow: '0 4px 0 rgba(27,29,14,0.10)', overflow: 'hidden' }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '15px 16px', borderTop: i ? '1px solid var(--hairline)' : 'none' }}>
                <Skel w={20} h={20} r={6} />
                <Skel w={`${52 - i * 7}%`} h={13} r={7} />
                <Skel w={16} h={16} r={5} style={{ marginLeft: 'auto' }} />
              </div>
            ))}
          </div>
        </div>
        {/* sign out — tan secondary */}
        <Skel w="100%" h={50} r={14} style={{ ['--c1']: 'rgba(184,149,106,0.30)', ['--c2']: 'rgba(184,149,106,0.16)' }} />
      </div>
      <CKTabBar active={3} />
    </CKPhone>
  );
}

Object.assign(window, { LoadingSpinner, LoadingHome, LoadingLessons, LoadingGames, LoadingProfile, SkelCard });
