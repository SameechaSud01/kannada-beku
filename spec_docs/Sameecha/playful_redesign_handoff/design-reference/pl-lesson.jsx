// PLAYFUL LESSON — faithful re-skin of the real lesson runner (same phases &
// copy as hooks/useLessonRunner + components/lesson/*), in the playful language.
// Adds: bouncier correct-answer feedback, a Discord-style loading screen with
// tips, and a level-up Celebration on completion. No mascot.
//   situation → teach_words → practice_words(listen→say) →
//   teach_phrases → practice_phrases(listen→say) → summary → real_world → done

const LESSON = {
  no: 2, title: 'Names', subtitle: 'I, you, my name is', glyph: 'ಹ',
  situation: 'You meet your new neighbour by the lift. They ask who you are — time to introduce yourself in Kannada.',
  realWorldPrompt: 'Introduce yourself in Kannada to one new person today — your auto driver, a shopkeeper, or a neighbour. Start with “Nanna hesaru…”.',
  words: [
    { t: 'Nānu',   en: 'I',    kn: 'ನಾನು' },
    { t: 'Nīvu',   en: 'you',  kn: 'ನೀವು' },
    { t: 'Hesaru', en: 'name', kn: 'ಹೆಸರು' },
  ],
  phrases: [
    { t: 'Nanna hesaru…',     en: 'My name is…',        kn: 'ನನ್ನ ಹೆಸರು…' },
    { t: 'Nimma hesaru ēnu?', en: 'What is your name?', kn: 'ನಿಮ್ಮ ಹೆಸರು ಏನು?' },
  ],
};

// ── Discord-style loading screen (tips, no mascot) ─────────────────────────
function LoadingScreen({ onDone }) {
  const { tokens, vibe, tw } = usePL();
  const t = tokens;
  const [tip] = React.useState(() => FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)]);
  React.useEffect(() => { const id = setTimeout(onDone, 2700); return () => clearTimeout(id); }, [onDone]);
  return (
    <PageShell scroll={false}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ fontFamily: kannadaFamily(tw.kfont), fontSize: 88, color: t.red, fontWeight: 700, lineHeight: 1,
          animation: 'pl-bob 2.2s ease-in-out infinite' }}>ಬಾ</div>
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontFamily: PLfont.display, fontWeight: 800, fontSize: 30, letterSpacing: -0.6, color: t.ink }}>Kannada</span>
          <span style={{ fontFamily: kannadaFamily(tw.kfont), fontWeight: 700, fontSize: 32, color: t.red, lineHeight: 1 }}>ಬಾ</span>
        </div>
        <div style={{ width: 180, height: 8, borderRadius: 5, background: t.high, marginTop: 20, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 5, background: vibe.hero(t), animation: 'pl-bar 2.6s ease-out forwards' }} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 24, right: 24, bottom: 54, textAlign: 'center', animation: 'pl-rise .4s ease' }}>
        <div style={{ fontFamily: PLfont.ui, fontSize: 10.5, fontWeight: 800, letterSpacing: 1.4, textTransform: 'uppercase', color: t.gold }}>Did you know · {tip.c}</div>
        <div style={{ fontFamily: PLfont.italic, fontStyle: 'italic', fontSize: 14, color: t.sub, lineHeight: 1.5, marginTop: 6 }}>{tip.f}</div>
      </div>
    </PageShell>
  );
}

// ── Shared lesson chrome ────────────────────────────────────────────────────
function LessonProgress({ pct, label }) {
  const { tokens } = usePL();
  const t = tokens;
  return (
    <div style={{ padding: '52px 16px 0' }}>
      <div style={{ height: 8, borderRadius: 5, background: t.high, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 5, background: t.red, width: `${pct * 100}%`, transition: 'width .35s ease' }} />
      </div>
      <div style={{ fontFamily: PLfont.ui, fontSize: 12, fontWeight: 600, color: t.faint, textAlign: 'center', marginTop: 7, letterSpacing: 0.2 }}>{label}</div>
    </div>
  );
}
function BackChip({ onClick }) {
  const { tokens } = usePL();
  const t = tokens;
  return (
    <button onClick={onClick} aria-label="Exit lesson" style={{ position: 'absolute', top: 50, left: 14, zIndex: 30,
      border: 'none', cursor: 'pointer', width: 38, height: 38, borderRadius: 12, background: t.card,
      display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `inset 0 0 0 1px ${t.line}, 0 2px 6px rgba(0,0,0,0.06)` }}>
      <PLIcon name="x" size={18} color={t.sub} sw={2.4} />
    </button>
  );
}
function AudioOrb({ size = 64, primary = true, onClick, pinging }) {
  const { tokens } = usePL();
  const t = tokens;
  return (
    <button onClick={onClick} aria-label="Play audio" style={{ position: 'relative', border: 'none', cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
      width: size, height: size, borderRadius: '50%', background: primary ? t.red : t.card,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: primary ? `0 5px 0 ${t.redLip}` : `inset 0 0 0 1px ${t.line}`, transition: 'transform .08s' }}
      onPointerDown={(e) => e.currentTarget.style.transform = 'scale(0.94)'}
      onPointerUp={(e) => e.currentTarget.style.transform = ''}
      onPointerLeave={(e) => e.currentTarget.style.transform = ''}>
      {pinging && <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid ${primary ? t.red : t.gold}`, animation: 'pl-ping 1s ease-out infinite' }} />}
      <PLIcon name="audio" size={size * 0.42} color={primary ? '#fff' : t.red} sw={2.2} />
    </button>
  );
}
function ScriptCard({ children, glow }) {
  const { tokens } = usePL();
  const t = tokens;
  return (
    <div style={{ position: 'relative', background: t.card, borderRadius: 22, padding: '28px 20px', width: '100%', textAlign: 'center',
      boxShadow: glow ? `inset 0 0 0 2px ${t.gold}, 0 10px 26px ${t.goldLip}22` : `inset 0 0 0 1px ${t.line}, 0 8px 20px rgba(27,29,14,0.06)`,
      transition: 'box-shadow .25s' }}>{children}</div>
  );
}
function Translit({ children, size = 40 }) {
  const { tokens } = usePL();
  return <div style={{ fontFamily: PLfont.italic, fontStyle: 'italic', fontSize: size, lineHeight: 1.2, color: tokens.ink }}>{children}</div>;
}
function EnglishSub({ children }) {
  const { tokens } = usePL();
  return <div style={{ fontFamily: PLfont.ui, fontWeight: 600, fontSize: 16, color: tokens.sub, marginTop: 11 }}>{children}</div>;
}
function KannadaMuted({ children }) {
  const { tokens, tw } = usePL();
  return <div style={{ fontFamily: kannadaFamily(tw.kfont), fontSize: 15, color: tokens.faint, marginTop: 13 }}>{children}</div>;
}

// ── Multiple-choice (gold = correct w/ pop + sparkle float, red = wrong shake)
function ChoiceList({ options, correctIdx, picked, onPick }) {
  const { tokens } = usePL();
  const t = tokens;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {options.map((opt, i) => {
        const reveal = picked !== null;
        const isCorrect = i === correctIdx;
        const isPicked = picked === i;
        let bg = t.card, fg = t.ink, ring = t.line, badge = null, anim = 'none';
        if (reveal && isCorrect) { bg = t.goldWash; fg = t.goldInk; ring = t.gold; badge = 'check'; anim = 'pl-bounce .5s cubic-bezier(.3,1.5,.5,1) both'; }
        else if (reveal && isPicked && !isCorrect) { bg = t.redWash; fg = t.red; ring = t.redHi; badge = 'x'; anim = 'pl-shake .4s ease both'; }
        return (
          <button key={i} onClick={() => onPick(i)} disabled={reveal} style={{ position: 'relative', border: 'none',
            cursor: reveal ? 'default' : 'pointer', WebkitTapHighlightColor: 'transparent',
            background: bg, color: fg, borderRadius: 15, padding: '16px 16px', minHeight: 54,
            fontFamily: PLfont.display, fontWeight: 700, fontSize: 17, textAlign: 'center',
            boxShadow: `inset 0 0 0 ${reveal && (isCorrect || isPicked) ? 2 : 1}px ${ring}`,
            transition: 'background .15s, box-shadow .15s', animation: anim }}>
            {opt}
            {badge && <span style={{ position: 'absolute', top: '50%', right: 12, transform: 'translateY(-50%)',
              width: 24, height: 24, borderRadius: 12, background: badge === 'check' ? t.gold : t.redHi,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', animation: 'pl-pop .3s cubic-bezier(.3,1.5,.6,1) both' }}>
              <PLIcon name={badge} size={14} color="#fff" sw={2.8} /></span>}
            {/* sparkle float on correct */}
            {badge === 'check' && [0,1,2].map(k => (
              <span key={k} style={{ position: 'absolute', right: 18 + k * 12, top: '50%', color: t.gold, fontSize: 13,
                animation: `pl-float .9s ${k * 0.08}s ease-out both`, pointerEvents: 'none' }}>✦</span>
            ))}
          </button>
        );
      })}
    </div>
  );
}

// ── The lesson runner ───────────────────────────────────────────────────────
function Lesson({ onExit, onDone }) {
  const { tokens, tw } = usePL();
  const t = tokens; const kf = kannadaFamily(tw.kfont);
  const W = LESSON.words, P = LESSON.phrases;

  const [st, setSt] = React.useState({ phase: 'situation', wi: 0, pwi: 0, pwStep: 'listen', phi: 0, ppi: 0, ppStep: 'listen' });
  const advance = React.useCallback(() => {
    setSt((s) => {
      switch (s.phase) {
        case 'situation': return { ...s, phase: 'teach_words', wi: 0 };
        case 'teach_words':
          if (s.wi < W.length - 1) return { ...s, wi: s.wi + 1 };
          return { ...s, phase: 'practice_words', pwi: 0, pwStep: 'listen' };
        case 'practice_words':
          if (s.pwStep === 'listen') return { ...s, pwStep: 'say' };
          if (s.pwi < W.length - 1) return { ...s, pwi: s.pwi + 1, pwStep: 'listen' };
          return { ...s, phase: 'teach_phrases', phi: 0 };
        case 'teach_phrases':
          if (s.phi < P.length - 1) return { ...s, phi: s.phi + 1 };
          return { ...s, phase: 'practice_phrases', ppi: 0, ppStep: 'listen' };
        case 'practice_phrases':
          if (s.ppStep === 'listen') return { ...s, ppStep: 'say' };
          if (s.ppi < P.length - 1) return { ...s, ppi: s.ppi + 1, ppStep: 'listen' };
          return { ...s, phase: 'summary' };
        case 'summary': return { ...s, phase: 'real_world' };
        case 'real_world': return { ...s, phase: 'done' };
        default: return s;
      }
    });
  }, []);

  const Frame = ({ progress, children, footer }) => (
    <PageShell scroll={false}>
      <BackChip onClick={onExit} />
      {progress}
      <div style={{ position: 'absolute', top: 92, left: 0, right: 0, bottom: footer ? 96 : 0, overflowY: 'auto', padding: '14px 16px 8px' }}>
        {children}
      </div>
      {footer && <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '14px 16px 30px', background: `linear-gradient(0deg, ${t.bg} 70%, transparent)` }}>{footer}</div>}
    </PageShell>
  );

  if (st.phase === 'situation') {
    return (
      <Frame footer={<LipButton color={t.red} lip={t.redLip} icon="arrow" onClick={advance}>Let’s start</LipButton>}>
        <div style={{ position: 'relative', overflow: 'hidden', background: t.goldWash, borderRadius: 22, padding: '30px 20px', textAlign: 'center', minHeight: 160, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div aria-hidden style={{ position: 'absolute', right: -10, bottom: -34, fontFamily: kf, fontSize: 150, color: 'rgba(201,138,0,0.18)', fontWeight: 700, lineHeight: 1 }}>{LESSON.glyph}</div>
          <div style={{ position: 'relative' }}>
            <div style={{ fontFamily: PLfont.ui, fontSize: 12, fontWeight: 800, letterSpacing: 1.6, textTransform: 'uppercase', color: t.goldLip, marginBottom: 8 }}>Situation</div>
            <div style={{ fontFamily: PLfont.display, fontSize: 24, fontWeight: 800, color: t.goldInk }}>{LESSON.title}</div>
          </div>
        </div>
        <div style={{ fontFamily: PLfont.display, fontSize: 25, fontWeight: 800, color: t.ink, letterSpacing: -0.4, margin: '20px 2px 10px', lineHeight: 1.15 }}>{LESSON.title}</div>
        <div style={{ fontFamily: PLfont.ui, fontSize: 15, color: t.sub, lineHeight: 1.55, padding: '0 2px' }}>{LESSON.situation}</div>
      </Frame>
    );
  }

  if (st.phase === 'teach_words') {
    const w = W[st.wi]; const last = st.wi >= W.length - 1;
    return (
      <Frame
        progress={<LessonProgress pct={(st.wi + 1) / W.length} label={`Word ${st.wi + 1} of ${W.length}`} />}
        footer={<LipButton color={t.red} lip={t.redLip} icon={last ? 'arrow' : 'check'} onClick={advance}>{last ? 'Start practising words' : 'Got it'}</LipButton>}>
        <div key={st.wi} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100%', gap: 22, animation: 'pl-slidein .3s ease both' }}>
          <ScriptCard>
            <Translit size={42}>{w.t}</Translit>
            <EnglishSub>{w.en}</EnglishSub>
            <KannadaMuted>{w.kn}</KannadaMuted>
          </ScriptCard>
          <AudioOrb size={64} pinging />
        </div>
      </Frame>
    );
  }

  if (st.phase === 'practice_words') {
    return <PracticePick key={`pw-${st.pwi}-${st.pwStep}`} kind="word" idx={st.pwi} step={st.pwStep}
      items={W} advance={advance} Frame={Frame} pct={(st.pwi + 1) / W.length}
      label={`Word ${st.pwi + 1} of ${W.length} — ${st.pwStep === 'listen' ? 'Listen' : 'Say it'}`} />;
  }

  if (st.phase === 'teach_phrases') {
    const p = P[st.phi]; const last = st.phi >= P.length - 1;
    const chips = p.t.replace('…', '').split(/\s+/).filter(Boolean);
    return (
      <Frame
        progress={<LessonProgress pct={(st.phi + 1) / P.length} label={`Phrase ${st.phi + 1} of ${P.length}`} />}
        footer={<LipButton color={t.red} lip={t.redLip} icon={last ? 'arrow' : 'check'} onClick={advance}>{last ? 'Start practising phrases' : 'Got it'}</LipButton>}>
        <div key={st.phi} style={{ animation: 'pl-slidein .3s ease both' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
            {chips.map((c, i) => (
              <div key={i} style={{ background: t.high, borderRadius: 12, padding: '8px 13px', fontFamily: PLfont.italic, fontStyle: 'italic', fontSize: 15, color: t.ink }}>{c}</div>
            ))}
          </div>
          <ScriptCard>
            <Translit size={27}>{p.t}</Translit>
            <EnglishSub>{p.en}</EnglishSub>
            <KannadaMuted>{p.kn}</KannadaMuted>
          </ScriptCard>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}><AudioOrb size={64} pinging /></div>
          <div style={{ fontFamily: PLfont.ui, fontSize: 12.5, color: t.faint, textAlign: 'center', marginTop: 13 }}>Tap a word to hear it on its own</div>
        </div>
      </Frame>
    );
  }

  if (st.phase === 'practice_phrases') {
    return <PracticePick key={`pp-${st.ppi}-${st.ppStep}`} kind="phrase" idx={st.ppi} step={st.ppStep}
      items={P} advance={advance} Frame={Frame} pct={(st.ppi + 1) / P.length}
      label={`Phrase ${st.ppi + 1} of ${P.length} — ${st.ppStep === 'listen' ? 'Listen' : 'Say it'}`} />;
  }

  if (st.phase === 'summary') {
    const Row = ({ it }) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: t.card, borderRadius: 14, padding: '11px 14px', boxShadow: `inset 0 0 0 1px ${t.line}` }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: PLfont.italic, fontStyle: 'italic', fontSize: 15, color: t.ink }}>{it.t}</div>
          <div style={{ fontFamily: kf, fontSize: 12.5, color: t.faint, marginTop: 1 }}>{it.kn}</div>
        </div>
        <div style={{ fontFamily: PLfont.ui, fontSize: 13, color: t.sub, textAlign: 'right', maxWidth: '40%' }}>{it.en}</div>
        <div style={{ width: 36, height: 36, borderRadius: 999, background: t.goldWash, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><PLIcon name="audio" size={16} color={t.goldInk} sw={2.2} /></div>
      </div>
    );
    return (
      <Frame footer={<LipButton color={t.red} lip={t.redLip} icon="arrow" onClick={advance}>Continue</LipButton>}>
        <div style={{ fontFamily: PLfont.display, fontSize: 25, fontWeight: 800, color: t.ink, letterSpacing: -0.4, margin: '2px 2px 16px' }}>What you learned</div>
        <SectionLabel color={t.gold}>Words</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{W.map((w, i) => <Row key={i} it={w} />)}</div>
        <SectionLabel color={t.red}>Phrases</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{P.map((p, i) => <Row key={i} it={p} />)}</div>
      </Frame>
    );
  }

  if (st.phase === 'real_world') {
    return (
      <Frame footer={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <LipButton color={t.red} lip={t.redLip} icon="arrow" onClick={advance}>I’ll try this</LipButton>
          <button onClick={advance} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: PLfont.ui, fontWeight: 600, fontSize: 13.5, color: t.faint, padding: 8 }}>Skip for now</button>
        </div>}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100%' }}>
          <div style={{ fontFamily: PLfont.ui, fontSize: 12, fontWeight: 800, letterSpacing: 1.6, textTransform: 'uppercase', color: t.faint, marginBottom: 11 }}>{LESSON.title}</div>
          <div style={{ position: 'relative', overflow: 'hidden', background: t.goldWash, borderRadius: 22, padding: '28px 22px' }}>
            <div aria-hidden style={{ position: 'absolute', right: -8, bottom: -30, fontFamily: kf, fontSize: 130, color: 'rgba(201,138,0,0.16)', fontWeight: 700 }}>ಬಾ</div>
            <div style={{ position: 'relative', fontFamily: PLfont.display, fontSize: 22, fontWeight: 700, color: t.goldInk, lineHeight: 1.35 }}>{LESSON.realWorldPrompt}</div>
          </div>
        </div>
      </Frame>
    );
  }

  return <DonePhase onDone={onDone} />;
}

// Practice (listen → choose meaning; say → speak it) — both words & phrases.
function PracticePick({ kind, idx, step, items, advance, Frame, pct, label }) {
  const { tokens, tw } = usePL();
  const t = tokens; const kf = kannadaFamily(tw.kfont);
  const cur = items[idx];
  const [picked, setPicked] = React.useState(null);
  const [canSay, setCanSay] = React.useState(false);

  const options = React.useMemo(() => {
    const others = items.filter((_, i) => i !== idx);
    const distract = others.slice(0, 2);
    const all = [cur, ...distract];
    return all.map((o, i) => ({ o, k: (i * 7 + idx * 3) % all.length })).sort((a, b) => a.k - b.k).map(x => x.o);
  }, [idx]);
  const correctIdx = options.findIndex(o => o === cur);

  React.useEffect(() => { if (step === 'say') { setCanSay(false); const id = setTimeout(() => setCanSay(true), 1300); return () => clearTimeout(id); } }, [step]);

  const pick = (i) => { if (picked !== null) return; setPicked(i); setTimeout(advance, i === correctIdx ? 950 : 1050); };
  const progress = <LessonProgress pct={pct} label={label} />;

  if (step === 'listen') {
    return (
      <Frame progress={progress}>
        <div style={{ display: 'flex', justifyContent: 'center', margin: '6px 0 20px' }}><AudioOrb size={72} pinging /></div>
        <div style={{ fontFamily: PLfont.display, fontSize: 22, fontWeight: 800, color: t.ink, textAlign: 'center', marginBottom: 18 }}>What does this mean?</div>
        <ChoiceList options={options.map(o => o.en)} correctIdx={correctIdx} picked={picked} onPick={pick} />
      </Frame>
    );
  }
  return (
    <Frame progress={progress}
      footer={<LipButton color={t.red} lip={t.redLip} icon="check" onClick={advance} style={{ opacity: canSay ? 1 : 0.5, pointerEvents: canSay ? 'auto' : 'none' }}>I said it</LipButton>}>
      {kind === 'phrase' && (
        <>
          <div style={{ fontFamily: PLfont.display, fontSize: 20, fontWeight: 800, color: t.ink, textAlign: 'center', marginBottom: 13 }}>How do you say this?</div>
          <div style={{ background: t.goldWash, borderRadius: 16, padding: '13px 16px', textAlign: 'center', marginBottom: 16, fontFamily: PLfont.ui, fontWeight: 700, fontSize: 16, color: t.goldInk }}>{cur.en}</div>
        </>
      )}
      <ScriptCard>
        <Translit size={kind === 'phrase' ? 26 : 38}>{cur.t}</Translit>
        {kind === 'word' && <EnglishSub>{cur.en}</EnglishSub>}
        <KannadaMuted>{cur.kn}</KannadaMuted>
      </ScriptCard>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 11, marginTop: 20 }}>
        <AudioOrb size={56} primary={false} />
        <div style={{ fontFamily: PLfont.ui, fontWeight: 600, fontSize: 15, color: t.ink }}>Say it out loud</div>
      </div>
    </Frame>
  );
}

// Done card — faithful to DoneCard.tsx, restyled + level-up celebration.
function DonePhase({ onDone }) {
  const { tokens, vibe } = usePL();
  const t = tokens; const A = vibe.accents(t);
  const [intent, setIntent] = React.useState(false);
  const [celebrate, setCelebrate] = React.useState(true);
  return (
    <PageShell scroll={false}>
      {celebrate && <Celebration kind="lesson" onClose={() => setCelebrate(false)} />}
      <div style={{ position: 'absolute', top: 50, left: 0, right: 0, bottom: 120, overflowY: 'auto', padding: '16px 16px 8px', zIndex: 2 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
          <div style={{ width: 72, height: 72, borderRadius: 999, background: t.goldWash, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 20px ${t.goldLip}33` }}>
            <PLIcon name="trophy" size={38} color={t.goldInk} fill />
          </div>
        </div>
        <div style={{ fontFamily: PLfont.display, fontSize: 25, fontWeight: 800, color: t.ink, textAlign: 'center', lineHeight: 1.2, marginBottom: 18 }}>Nice — that’s the lesson done!</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, alignItems: 'flex-start', width: 'fit-content', margin: '0 auto 18px' }}>
          {[
            { ic: 'learn', txt: `${LESSON.words.length} words learned` },
            { ic: 'practice', txt: `${LESSON.phrases.length} phrases learned` },
            { ic: 'mic', txt: 'You spoke Kannada today' },
          ].map(r => (
            <div key={r.txt} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <PLIcon name={r.ic} size={18} color={t.red} fill={r.ic !== 'mic'} sw={2} />
              <span style={{ fontFamily: PLfont.ui, fontWeight: 600, fontSize: 15, color: t.ink }}>{r.txt}</span>
            </div>
          ))}
        </div>
        <div style={{ background: t.goldWash, borderRadius: 18, padding: 18, marginBottom: 18 }}>
          <div style={{ fontFamily: PLfont.ui, fontSize: 11.5, fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase', color: t.goldLip, marginBottom: 7 }}>Take it outside</div>
          <div style={{ fontFamily: PLfont.display, fontSize: 17, fontWeight: 700, color: t.goldInk, lineHeight: 1.4 }}>{LESSON.realWorldPrompt}</div>
        </div>
        <SectionLabel color={A[3]}>Keep practising</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[{ t: 'Dictation', s: 'Hear it. Type it.' }, { t: 'Opposites', s: 'Match the contrasts.' }].map(g => (
            <div key={g.t} style={{ display: 'flex', alignItems: 'center', gap: 12, background: t.card, borderRadius: 14, padding: '11px 14px', boxShadow: `inset 0 0 0 1px ${t.line}` }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: PLfont.display, fontWeight: 700, fontSize: 15, color: t.ink }}>{g.t}</div>
                <div style={{ fontFamily: PLfont.ui, fontSize: 12, color: t.sub, marginTop: 0 }}>{g.s}</div>
              </div>
              <div style={{ background: t.red, color: '#fff', borderRadius: 999, padding: '7px 16px', fontFamily: PLfont.display, fontWeight: 700, fontSize: 13, boxShadow: `0 3px 0 ${t.redLip}` }}>Play</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '12px 16px 28px', zIndex: 3, background: `linear-gradient(0deg, ${t.bg} 70%, transparent)` }}>
        <LipButton color={intent ? t.goldDeep : t.red} lip={intent ? t.goldDeepLip : t.redLip} icon={intent ? 'check' : null} onClick={() => setIntent(true)}>
          {intent ? 'Committed!' : 'I’ll try this in real life'}
        </LipButton>
        <button onClick={onDone} style={{ border: 'none', background: 'transparent', cursor: 'pointer', width: '100%', marginTop: 6,
          fontFamily: PLfont.ui, fontWeight: 600, fontSize: 14, color: t.faint, padding: 8 }}>Back to lessons</button>
      </div>
    </PageShell>
  );
}

Object.assign(window, { LoadingScreen, Lesson });
