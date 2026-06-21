// ════════════════════════════════════════════════════════════════════════
// SURVEY MODAL — the waitlist signup *is* the questionnaire. Opens from any
// "Join the waitlist / Get notified" action; email = waitlist, the four
// prompts (motivation · struggles · goals · willingness to pay) steer the
// roadmap. No standalone on-scroll section — it lives in an overlay.
// ════════════════════════════════════════════════════════════════════════

// ── Supabase config ─────────────────────────────────────────────────────────
// Fill these in from your Supabase project → Settings → API. The anon key is
// safe to ship in client code — it's gated by Row-Level Security (see setup
// notes). Until they're filled in, the form just shows the thank-you screen.
const SUPABASE_URL = 'https://fhhzrzmmulqgmfwmeodq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_i4ovF7U6Z0wHD09wMDBtpA_CETQFN2l';
const SUPABASE_TABLE = 'waitlist';
const SUPABASE_READY = !SUPABASE_URL.includes('YOUR-PROJECT') && !SUPABASE_ANON_KEY.includes('YOUR-ANON-KEY');

async function saveSignup(a) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      email: a.email,
      name: a.name || null,
      city: a.city || null,
      motivation: a.motivation,
      motivation_note: a.motivationNote || null,
      struggles: a.struggles,
      struggles_note: a.strugglesNote || null,
      wants: a.wants,
      wants_note: a.wantsNote || null,
      pricing_model: a.model || null,
      price: a.price || null,
      community_optin: !!a.community,
    }),
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
}

// ── Chip — pill toggle (multi- or single-select) ────────────────────────────
function Chip({ label, active, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{
      cursor: 'pointer', fontFamily: F.ui, fontWeight: 600, fontSize: 14.5,
      // 44px min hit area (WCAG 2.5.5 / iOS) — inline-flex centres the label.
      padding: '11px 16px', minHeight: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: 999, transition: 'background .12s, color .12s, border-color .12s',
      border: `1.5px solid ${active ? T.red : T.hairStrong}`,
      background: active ? T.red : T.card,
      color: active ? '#fff' : T.sub,
    }}>{label}</button>
  );
}

function ChipGroup({ options, value, onToggle, multi = true }) {
  const has = (o) => multi ? value.includes(o) : value === o;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
      {options.map((o) => (
        <Chip key={o} label={o} active={has(o)} onClick={() => onToggle(o)} />
      ))}
    </div>
  );
}

// ── Checkbox — chunky opt-in toggle ─────────────────────────────────────────
function Checkbox({ checked, onChange, title, hint }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} style={{
      cursor: 'pointer', textAlign: 'left', width: '100%', display: 'flex', gap: 14, alignItems: 'flex-start',
      padding: '15px 17px', borderRadius: 16, transition: 'background .12s, border-color .12s',
      border: `1.5px solid ${checked ? T.red : T.hairStrong}`,
      background: checked ? T.redSoft : T.card,
    }}>
      <div style={{ flexShrink: 0, width: 24, height: 24, borderRadius: 8, marginTop: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1.5px solid ${checked ? T.red : T.hairStrong}`, background: checked ? T.red : 'transparent',
        transition: 'background .12s, border-color .12s' }}>
        {checked && <Icon name="check" size={15} color="#fff" sw={3} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 15.5, color: T.ink, lineHeight: 1.35 }}>{title}</div>
        {hint && <div style={{ fontFamily: F.ui, fontSize: 13.5, color: T.sub, marginTop: 4, lineHeight: 1.5 }}>{hint}</div>}
      </div>
    </button>
  );
}

// ── One numbered question block ─────────────────────────────────────────────
function QField({ n, title, hint, children }) {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <div style={{ flexShrink: 0, width: 42, height: 42, borderRadius: 13, background: T.redSoft,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: F.display, fontWeight: 800, fontSize: 17, color: T.red, letterSpacing: -0.5 }}>{n}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <label style={{ display: 'block', fontFamily: F.display, fontWeight: 700, fontSize: 'clamp(18px, 2.2vw, 21px)', color: T.ink, letterSpacing: -0.3, lineHeight: 1.2 }}>{title}</label>
        {hint && <div style={{ fontFamily: F.ui, fontSize: 14, color: T.sub, marginTop: 5, lineHeight: 1.5 }}>{hint}</div>}
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 13 }}>{children}</div>
      </div>
    </div>
  );
}

const textareaStyle = {
  width: '100%', border: `1.5px solid ${T.hairStrong}`, borderRadius: 16, background: T.card,
  padding: '13px 16px', minHeight: 78, resize: 'vertical', outline: 'none',
  // 16px keeps iOS Safari from auto-zooming the viewport on input focus.
  fontFamily: F.ui, fontSize: 16, color: T.ink, lineHeight: 1.55,
};

const PRICE_BY_MODEL = {
  'One-time purchase':   ['Free only', '₹299', '₹599', '₹999', '₹1,499+'],
  'Monthly subscription':['Free only', '₹99 / mo', '₹199 / mo', '₹299 / mo', '₹499 / mo'],
  'Freemium (free + premium)': ['Free + ₹99/mo', 'Free + ₹199/mo', 'Free + ₹299 unlock', 'Wouldn’t pay'],
  'Pay per lesson pack': ['₹49 / pack', '₹99 / pack', '₹149 / pack', '₹199 / pack'],
};

// ── The form body (used inside the modal) ───────────────────────────────────
function SurveyBody({ tw, initialEmail = '', onDone }) {
  const [a, setA] = React.useState({
    motivation: [], motivationNote: '',
    struggles: [], strugglesNote: '',
    wants: [], wantsNote: '',
    model: '', price: '',
    name: '', email: initialEmail, city: '',
    community: false,
  });
  const set = (k, v) => setA((p) => ({ ...p, [k]: v }));
  const toggleIn = (k) => (o) => setA((p) => ({ ...p, [k]: p[k].includes(o) ? p[k].filter((x) => x !== o) : [...p[k], o] }));
  const pickModel = (o) => setA((p) => ({ ...p, model: o, price: '' }));

  // Email = the waitlist. That's the only hard requirement; the rest is
  // encouraged but optional so joining stays one quick step.
  const valid = a.email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(a.email);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');
  const submit = async (e) => {
    e.preventDefault();
    if (!valid || submitting) return;
    setError('');
    if (!SUPABASE_READY) { onDone(a.email); return; } // prototype mode — no DB wired yet
    setSubmitting(true);
    try {
      await saveSignup(a);
      onDone(a.email);
    } catch (err) {
      setError('Couldn’t save your spot just now. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
      {/* email first — joining the waitlist */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ flexShrink: 0, width: 42, height: 42, borderRadius: 13, background: BRAND_GRADIENT,
          display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 0 ${T.redLip}` }}>
          <Icon name="mail" size={20} color="#fff" sw={2.2} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <label style={{ display: 'block', fontFamily: F.display, fontWeight: 700, fontSize: 'clamp(18px, 2.2vw, 21px)', color: T.ink, letterSpacing: -0.3 }}>
            Your email, this saves your spot
          </label>
          <div style={{ fontFamily: F.ui, fontSize: 14, color: T.sub, marginTop: 5, lineHeight: 1.5 }}>
            One email when we launch. That’s the whole commitment. The rest below just helps us build it for you.
          </div>
          <input type="email" required value={a.email} onChange={(e) => set('email', e.target.value)}
            placeholder="you@email.com" style={{ ...textareaStyle, minHeight: 0, height: 52, marginTop: 14 }} />
        </div>
      </div>

      <div style={{ height: 1, background: T.hairline }} />

      <QField n="01" title="What’s motivating you to learn Kannada?"
        hint="Pick any that ring true, or tell us in your words.">
        <ChipGroup value={a.motivation} onToggle={toggleIn('motivation')}
          options={['Moved to Karnataka', 'Married into a Kannada family', 'Work & colleagues', 'Make local friends', 'Respect the culture', 'Travel often']} />
        <textarea style={textareaStyle} value={a.motivationNote} onChange={(e) => set('motivationNote', e.target.value)}
          placeholder="In your own words (optional)…" />
      </QField>

      <div style={{ height: 1, background: T.hairline }} />

      <QField n="02" title="What have you struggled with so far?"
        hint="Where it falls apart in real life. Be specific, it helps us most.">
        <ChipGroup value={a.struggles} onToggle={toggleIn('struggles')}
          options={['Freezing at the counter', 'Auto & cab haggling', 'Talking to in-laws', 'Reading signs & menus', 'Pronunciation', 'No one to practise with']} />
        <textarea style={textareaStyle} value={a.strugglesNote} onChange={(e) => set('strugglesNote', e.target.value)}
          placeholder="What trips you up? (optional)…" />
      </QField>

      <div style={{ height: 1, background: T.hairline }} />

      <QField n="03" title="What do you really want to be able to do?"
        hint="The thing that would make this worth it for you.">
        <ChipGroup value={a.wants} onToggle={toggleIn('wants')}
          options={['Everyday survival phrases', 'Hold a conversation', 'Read the script', 'Workplace Kannada', 'Slang locals actually use', 'Follow films & songs']} />
        <textarea style={textareaStyle} value={a.wantsNote} onChange={(e) => set('wantsNote', e.target.value)}
          placeholder="Describe your “I made it” moment (optional)…" />
      </QField>

      <div style={{ height: 1, background: T.hairline }} />

      <QField n="04" title="What would you happily pay for it?"
        hint="Both the shape of it and a number that feels fair. This keeps the app alive.">
        <div>
          <div style={{ fontFamily: F.ui, fontSize: 12.5, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: T.faint, marginBottom: 10 }}>Which model feels right?</div>
          <ChipGroup multi={false} value={a.model} onToggle={pickModel} options={Object.keys(PRICE_BY_MODEL)} />
        </div>
        {a.model && (
          <div>
            <div style={{ fontFamily: F.ui, fontSize: 12.5, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: T.faint, marginBottom: 10 }}>What price feels fair?</div>
            <ChipGroup multi={false} value={a.price} onToggle={(o) => set('price', o)} options={PRICE_BY_MODEL[a.model]} />
          </div>
        )}
      </QField>

      <div style={{ height: 1, background: T.hairline }} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={{ gridColumn: '1 / -1', fontFamily: F.display, fontWeight: 700, fontSize: 16, color: T.ink }}>
          Anything that helps us reach out (optional)
        </div>
        <input style={{ ...textareaStyle, minHeight: 0, height: 52 }} value={a.name} onChange={(e) => set('name', e.target.value)} placeholder="Your name" />
        <input style={{ ...textareaStyle, minHeight: 0, height: 52 }} value={a.city} onChange={(e) => set('city', e.target.value)} placeholder="City" />
      </div>

      <Checkbox checked={a.community} onChange={(v) => set('community', v)}
        title="Opt in to join our WhatsApp and Instagram community"
        hint="We’ll reach out by email to add you." />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ fontFamily: F.ui, fontSize: 13, color: error ? T.red : T.faint, maxWidth: 320 }}>
          {error || 'We’ll only use this to follow up about Kannada Beku. No spam, no sharing.'}
        </div>
        <LipBtn type="submit" bg={valid ? BRAND_GRADIENT : T.dim} lip={valid ? T.redLip : T.hairStrong}
          fg={valid ? '#fff' : T.faint} icon={submitting ? null : 'forward'}
          style={{ opacity: valid && !submitting ? 1 : 0.85, pointerEvents: valid && !submitting ? 'auto' : 'none' }}>
          {submitting ? 'Saving…' : 'Join the waitlist'}</LipBtn>
      </div>
    </form>
  );
}

// ── Modal shell ─────────────────────────────────────────────────────────────
function SurveyModal({ open, initialEmail, onClose, tw }) {
  const [doneEmail, setDoneEmail] = React.useState('');

  React.useEffect(() => {
    if (open) { document.body.style.overflow = 'hidden'; setDoneEmail(''); }
    else { document.body.style.overflow = ''; }
    const onKey = (e) => { if (e.key === 'Escape' && open) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(20,21,12,0.55)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '4vh 16px', overflowY: 'auto' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', width: '100%', maxWidth: 920,
        background: T.surface, borderRadius: 20, boxShadow: '0 40px 90px -30px rgba(20,21,12,0.6)', overflow: 'hidden' }}>

        {/* close */}
        <button type="button" onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: 16, right: 16, zIndex: 5,
          width: 40, height: 40, borderRadius: 999, border: 'none', cursor: 'pointer', background: T.low,
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="x" size={20} color={T.sub} sw={2.4} />
        </button>

        {doneEmail ? (
          <div style={{ padding: 'clamp(40px, 6vw, 64px) clamp(26px, 4vw, 48px)', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 999, background: BRAND_GRADIENT, margin: '0 auto',
              display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 5px 0 ${T.redLip}` }}>
              <Icon name="check" size={32} color="#fff" sw={2.8} />
            </div>
            <div style={{ fontFamily: kannadaFamily(tw.kfont), fontWeight: 700, fontSize: 22, color: T.red, marginTop: 22 }}>ಧನ್ಯವಾದ</div>
            <h2 style={{ fontFamily: F.display, fontWeight: 800, fontSize: 'clamp(26px, 3.4vw, 34px)', color: T.ink, margin: '6px 0 0', letterSpacing: -0.4 }}>
              You’re on the list!
            </h2>
            <p style={{ fontFamily: F.ui, fontSize: 16, color: T.sub, lineHeight: 1.6, margin: '14px auto 0', maxWidth: 420 }}>
              We’ll email <b>{doneEmail}</b> the day we launch, and your answers go straight into what we build first. Thank you.
            </p>
            <div style={{ marginTop: 26 }}>
              <LipBtn onClick={onClose} bg={BRAND_GRADIENT} lip={T.redLip}>Done</LipBtn>
            </div>
          </div>
        ) : (
          <>
            {/* header */}
            <div style={{ padding: 'clamp(30px, 4vw, 40px) clamp(26px, 4vw, 44px) 22px', background: T.card, borderBottom: `1px solid ${T.hairline}` }}>
              <Eyebrow color={T.red}>Join the waitlist · 2 min</Eyebrow>
              <h2 style={{ fontFamily: F.display, fontWeight: 800, letterSpacing: -0.5,
                fontSize: 'clamp(24px, 3.2vw, 34px)', lineHeight: 1.08, color: T.ink, margin: '14px 0 0', maxWidth: 520, textWrap: 'balance' }}>
                Save your spot, and help build the app <span style={{ color: T.red }}>you</span> need.
              </h2>
            </div>
            <div style={{ padding: 'clamp(26px, 4vw, 40px) clamp(26px, 4vw, 44px) clamp(30px, 4vw, 44px)' }}>
              <SurveyBody tw={tw} initialEmail={initialEmail} onDone={setDoneEmail} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { SurveyModal });
