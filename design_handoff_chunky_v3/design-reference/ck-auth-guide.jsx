// ck-auth-guide.jsx — Login/Signup (app/(auth)/login.tsx) and the
// Beginners' Guide (app/guide.tsx + constants/guide.ts) in the chunky kit.

// ── LOGIN / SIGNUP ────────────────────────────────────────
function CKInput({ placeholder, value, secure }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid rgba(27,29,14,0.14)', borderRadius: 'calc(var(--r) - 2px)',
      boxShadow: '0 3px 0 rgba(27,29,14,0.06)', padding: '15px 16px',
      fontFamily: CK_BODY, fontWeight: 500, fontSize: 15,
      color: value ? 'var(--ink)' : 'var(--faint)',
    }}>{value ? (secure ? '••••••••••' : value) : placeholder}</div>
  );
}

function CKAuthLogin() {
  return (
    <CKPhone pad="0" bg="var(--surface)">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 30px' }}>
        {/* hero */}
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <div style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 42, lineHeight: 1.5, color: 'var(--red2)' }}>ಕನ್ನಡ ಬಾ</div>
          <div style={{ fontFamily: CK_DISPLAY, fontWeight: 600, fontSize: 18, color: 'var(--red2)', marginTop: 2 }}>Kannada Baa</div>
        </div>

        {/* segmented toggle */}
        <div style={{ display: 'flex', background: 'rgba(27,29,14,0.06)', borderRadius: 99, padding: 4, marginBottom: 22 }}>
          <div style={{
            flex: 1, textAlign: 'center', fontFamily: CK_DISPLAY, fontWeight: 700, fontSize: 14,
            background: '#fff', borderRadius: 99, padding: '10px 0 8px',
            boxShadow: '0 2px 0 rgba(27,29,14,0.10)', color: 'var(--ink)',
          }}>Log in</div>
          <div style={{ flex: 1, textAlign: 'center', fontFamily: CK_DISPLAY, fontWeight: 700, fontSize: 14, padding: '10px 0 8px', color: 'var(--faint)', cursor: 'pointer' }}>Sign up</div>
        </div>

        <div style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 21, lineHeight: 1.25 }}>Welcome back</div>
        <div style={{ fontFamily: CK_BODY, fontWeight: 500, fontSize: 13.5, color: 'var(--muted)', margin: '3px 0 18px' }}>Log in to continue your Kannada journey.</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          <CKInput placeholder="Email" value="sameecha@gmail.com" />
          <CKInput placeholder="Password" value="password" secure />
        </div>
        <div style={{ alignSelf: 'flex-end', fontFamily: CK_BODY, fontWeight: 700, fontSize: 12.5, color: 'var(--red2)', margin: '10px 0 18px', cursor: 'pointer' }}>Forgot password?</div>

        <CK as="button" lip={5} lipColor="var(--redLip)" style={{
          width: '100%', fontFamily: CK_DISPLAY, fontWeight: 700, fontSize: 16, color: '#fff',
          background: 'var(--red2)', border: 'none', borderRadius: 'var(--r)', padding: '16px 0 14px', whiteSpace: 'nowrap',
        }}>Log in</CK>

        {/* divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
          <span style={{ flex: 1, height: 1, background: 'var(--hairline)' }}></span>
          <span style={{ fontFamily: CK_BODY, fontWeight: 600, fontSize: 12, color: 'var(--faint)' }}>or</span>
          <span style={{ flex: 1, height: 1, background: 'var(--hairline)' }}></span>
        </div>

        {/* social */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <CK as="button" lip={4} style={{
            width: '100%', fontFamily: CK_BODY, fontWeight: 700, fontSize: 14.5, color: 'var(--ink)',
            background: '#fff', border: CK_HAIRLINE, borderRadius: 'var(--r)', padding: '14px 0 12px', whiteSpace: 'nowrap',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9,
          }}>
            <span style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 16, color: 'var(--red2)' }}>G</span> Continue with Google
          </CK>
          <CK as="button" lip={4} style={{
            width: '100%', fontFamily: CK_BODY, fontWeight: 700, fontSize: 14.5, color: '#fff',
            background: 'var(--ink)', border: 'none', borderRadius: 'var(--r)', padding: '14px 0 12px', whiteSpace: 'nowrap',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9,
          }}>
             Continue with Apple
          </CK>
        </div>
      </div>
    </CKPhone>
  );
}

// ── BEGINNERS' GUIDE (app/guide.tsx) ──────────────────────
const CKG_VOWELS = [
  { kn: 'ಅ', tr: 'a', ex: 'as in America' },
  { kn: 'ಆ', tr: 'ā', ex: 'as in art' },
  { kn: 'ಇ', tr: 'i', ex: 'as in igloo' },
  { kn: 'ಈ', tr: 'ī', ex: 'as in seed' },
  { kn: 'ಉ', tr: 'u', ex: 'as in push' },
  { kn: 'ಊ', tr: 'ū', ex: 'as in moon' },
  { kn: 'ಎ', tr: 'e', ex: 'as in cake' },
  { kn: 'ಏ', tr: 'ē', ex: 'as in crane' },
  { kn: 'ಐ', tr: 'ai', ex: 'as in ice' },
  { kn: 'ಒ', tr: 'o', ex: 'as in opener' },
  { kn: 'ಓ', tr: 'ō', ex: 'as in go' },
  { kn: 'ಔ', tr: 'au', ex: 'as in fountain' },
];

function CKGuide() {
  return (
    <CKPhone pad="16px 20px 0" bg="var(--surface)">
      {/* header: back chip + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexShrink: 0 }}>
        <CK lip={3} style={{
          width: 38, height: 38, borderRadius: '50%', background: '#fff',
          border: CK_HAIRLINE, display: 'grid', placeItems: 'center', color: 'var(--red2)', flexShrink: 0,
        }}>
          <CKIcon d={CKPaths.back} size={17} stroke={2.2} />
        </CK>
        <div style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 19 }}>Kannada basics</div>
      </div>

      {/* section heading */}
      <div style={{ margin: '0 2px 4px', fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 22, lineHeight: 1.3 }}>Vowels (ಸ್ವರಗಳು)</div>
      <div style={{ margin: '0 2px 14px', fontFamily: CK_BODY, fontWeight: 500, fontSize: 12.5, lineHeight: 1.5, color: 'var(--muted)' }}>
        Kannada has 13 vowels. Long vowels use a macron — ā, ē, ī, ō, ū.
      </div>

      {/* glyph grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 9 }}>
        {CKG_VOWELS.map((v) => (
          <CK key={v.kn} lip={3} style={{
            background: '#fff', border: CK_HAIRLINE, borderRadius: 'calc(var(--r) - 2px)',
            padding: '12px 6px 10px', textAlign: 'center',
          }}>
            <div style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 30, lineHeight: 1.4, color: 'var(--red2)' }}>{v.kn}</div>
            <div style={{ fontFamily: CK_BODY, fontWeight: 800, fontSize: 13.5 }}>{v.tr}</div>
            <div style={{ fontFamily: CK_BODY, fontWeight: 500, fontSize: 10, color: 'var(--faint)', marginTop: 1 }}>{v.ex}</div>
          </CK>
        ))}
      </div>

      {/* pager dots */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', padding: '18px 0 22px', marginTop: 'auto', flexShrink: 0 }}>
        {['vowels', 'rules', 'consonants', 'key'].map((s, i) => (
          <span key={s} style={{ width: i === 0 ? 18 : 7, height: 7, borderRadius: 4, background: i === 0 ? 'var(--goldLip)' : 'rgba(27,29,14,0.14)' }}></span>
        ))}
      </div>
    </CKPhone>
  );
}

Object.assign(window, { CKAuthLogin, CKGuide, CKInput });
