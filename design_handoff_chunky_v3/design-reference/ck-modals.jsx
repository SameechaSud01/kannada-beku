// ck-modals.jsx — modal layer from components/modals/instances/* in the
// chunky kit: lesson-locked dialog, sign-out dialog, reminders sheet,
// streak-milestone celebration takeover. Each shown over a dimmed Home.

function CKModalBackdrop({ children, align = 'center' }) {
  return (
    <CKPhone pad="0" bg="var(--surfaceLow)">
      {/* ghost of the page behind */}
      <div style={{ position: 'absolute', inset: 0, padding: '22px 20px', filter: 'blur(1px)', opacity: 0.9 }} aria-hidden="true">
        <div style={{ height: 40, borderBottom: '1px solid var(--hairline)', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 22, color: 'var(--red)' }}>ಕನ್ನಡ ಬಾ</span>
        </div>
        <div style={{ marginTop: 16, height: 180, background: '#fff', border: '1px solid var(--hairline)', borderRadius: 'var(--r)' }}></div>
        <div style={{ marginTop: 14, height: 90, background: '#fff', border: '1px solid var(--hairline)', borderRadius: 'var(--r)' }}></div>
        <div style={{ marginTop: 14, height: 90, background: '#fff', border: '1px solid var(--hairline)', borderRadius: 'var(--r)' }}></div>
      </div>
      {/* dim */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(27,29,14,0.40)' }}></div>
      {/* modal slot */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'stretch', justifyContent: align === 'bottom' ? 'flex-end' : 'center',
        padding: align === 'bottom' ? 0 : '0 28px',
      }}>{children}</div>
    </CKPhone>
  );
}

function CKDialogBtnRow({ primary, secondary }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 18 }}>
      <CK as="button" lip={4} lipColor="var(--redLip)" style={{
        width: '100%', fontFamily: CK_DISPLAY, fontWeight: 700, fontSize: 15, color: '#fff',
        background: 'var(--red2)', border: 'none', borderRadius: 'calc(var(--r) - 2px)', padding: '14px 0 12px', whiteSpace: 'nowrap',
      }}>{primary}</CK>
      <div style={{ textAlign: 'center', fontFamily: CK_BODY, fontWeight: 700, fontSize: 13.5, color: 'var(--muted)', padding: '6px 0', cursor: 'pointer' }}>{secondary}</div>
    </div>
  );
}

// ── Lesson locked dialog (LessonLockedDialog) ─────────────
function CKModalLocked() {
  return (
    <CKModalBackdrop>
      <div style={{ background: '#fff', borderRadius: 'var(--r)', boxShadow: '0 24px 60px rgba(0,0,0,0.22)', padding: '24px 22px 18px' }}>
        <div style={{ width: 48, height: 48, borderRadius: 15, background: 'var(--surfaceLow)', display: 'grid', placeItems: 'center', color: 'var(--faint)', margin: '0 auto 14px' }}>
          <CKIcon d={CKPaths.lock} size={24} stroke={2} />
        </div>
        <div style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 19, textAlign: 'center', lineHeight: 1.25 }}>Lesson 4 is locked</div>
        <div style={{ fontFamily: CK_BODY, fontWeight: 500, fontSize: 13.5, lineHeight: 1.5, color: 'var(--muted)', textAlign: 'center', marginTop: 6 }}>
          Finish <b>Lesson 3 · Wanting</b> first — each lesson builds on the last.
        </div>
        <CKDialogBtnRow primary="Go to Lesson 3" secondary="Not now" />
      </div>
    </CKModalBackdrop>
  );
}

// ── Sign out dialog (SignOutDialog) ───────────────────────
function CKModalSignOut() {
  return (
    <CKModalBackdrop>
      <div style={{ background: '#fff', borderRadius: 'var(--r)', boxShadow: '0 24px 60px rgba(0,0,0,0.22)', padding: '24px 22px 18px' }}>
        <div style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 19, textAlign: 'center', lineHeight: 1.25 }}>Sign out?</div>
        <div style={{ fontFamily: CK_BODY, fontWeight: 500, fontSize: 13.5, lineHeight: 1.5, color: 'var(--muted)', textAlign: 'center', marginTop: 6 }}>
          Your progress is saved to your account — your streak will be here when you're back.
        </div>
        <CKDialogBtnRow primary="Sign out" secondary="Cancel" />
      </div>
    </CKModalBackdrop>
  );
}

// ── Reminders sheet (RemindersSheet) ──────────────────────
function CKModalReminders() {
  const times = ['8:00', '12:30', '19:00', '21:00'];
  return (
    <CKModalBackdrop align="bottom">
      <div style={{ background: 'var(--surface)', borderRadius: '24px 24px 0 0', boxShadow: '0 -10px 30px rgba(0,0,0,0.18)', padding: '14px 24px 28px' }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(27,29,14,0.16)', margin: '0 auto 18px' }}></div>
        <div style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 20, lineHeight: 1.2 }}>Reminders</div>
        <div style={{ fontFamily: CK_BODY, fontWeight: 500, fontSize: 13, color: 'var(--muted)', margin: '3px 0 16px' }}>A small nudge keeps the streak alive.</div>

        {/* toggle row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: CK_HAIRLINE, borderRadius: 'calc(var(--r) - 2px)', boxShadow: '0 3px 0 rgba(27,29,14,0.08)', padding: '13px 16px', marginBottom: 14 }}>
          <span style={{ color: 'var(--red2)' }}><CKIcon d={CKPaths.bell} size={20} stroke={2} /></span>
          <span style={{ flex: 1, fontFamily: CK_BODY, fontWeight: 700, fontSize: 14.5 }}>Daily reminder</span>
          <div style={{ width: 46, height: 28, borderRadius: 99, background: 'var(--gold)', boxShadow: 'inset 0 2px 0 rgba(108,80,0,0.25)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 3, right: 3, width: 22, height: 22, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 0 rgba(108,80,0,0.35)' }}></div>
          </div>
        </div>

        <div style={{ fontFamily: CK_BODY, fontWeight: 700, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--faint)', marginBottom: 9 }}>Time</div>
        <div style={{ display: 'flex', gap: 9, marginBottom: 20 }}>
          {times.map((t, i) => (
            <CK key={t} lip={3} lipColor={i === 2 ? 'var(--goldLip)' : 'rgba(27,29,14,0.10)'} style={{
              flex: 1, textAlign: 'center', fontFamily: CK_DISPLAY, fontWeight: 700, fontSize: 14,
              color: i === 2 ? 'var(--goldDeep)' : 'var(--ink)', fontVariantNumeric: 'tabular-nums',
              background: i === 2 ? 'var(--goldPale)' : '#fff',
              border: i === 2 ? '1px solid var(--goldLip)' : CK_HAIRLINE,
              borderRadius: 99, padding: '10px 0 8px',
            }}>{t}</CK>
          ))}
        </div>

        <CK as="button" lip={5} lipColor="var(--redLip)" style={{
          width: '100%', fontFamily: CK_DISPLAY, fontWeight: 700, fontSize: 15, color: '#fff',
          background: 'var(--red2)', border: 'none', borderRadius: 'var(--r)', padding: '15px 0 13px', whiteSpace: 'nowrap',
        }}>Save reminder</CK>
      </div>
    </CKModalBackdrop>
  );
}

// ── Streak celebration takeover (Celebration / StreakMilestone) ──
function CKModalStreak() {
  return (
    <CKPhone pad="0" bg="linear-gradient(160deg, var(--red2), var(--red))">
      {/* confetti dots */}
      {[
        [12, 18, 'var(--gold)'], [78, 10, '#fff'], [30, 34, 'var(--goldHi)'], [88, 30, 'var(--gold)'],
        [8, 52, '#fff'], [70, 48, 'var(--goldHi)'], [22, 70, 'var(--gold)'], [85, 66, '#fff'],
      ].map(([x, y, c], i) => (
        <span key={i} style={{ position: 'absolute', left: x + '%', top: y + '%', width: 7, height: 7, borderRadius: '50%', background: c, opacity: 0.85 }}></span>
      ))}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 40px' }}>
        <CK lip={6} lipColor="var(--goldLip)" style={{
          width: 130, height: 130, borderRadius: '50%',
          background: 'linear-gradient(180deg, var(--goldHi), var(--gold))',
          display: 'grid', placeItems: 'center',
        }}>
          <div>
            <div style={{ color: 'var(--red2)', display: 'flex', justifyContent: 'center' }}><CKIcon d={CKPaths.flame} size={38} stroke={2.2} /></div>
            <div style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 40, lineHeight: 1, color: '#6c5000', fontVariantNumeric: 'tabular-nums' }}>7</div>
          </div>
        </CK>
        <div style={{ fontFamily: CK_DISPLAY, fontWeight: 800, fontSize: 28, color: '#fff', marginTop: 24, lineHeight: 1.2 }}>A full week!</div>
        <div style={{ fontFamily: CK_BODY, fontWeight: 500, fontSize: 14.5, lineHeight: 1.5, color: 'rgba(255,255,255,0.92)', marginTop: 8, maxWidth: 260 }}>
          Seven days of Kannada in a row. Bengaluru better get ready for you.
        </div>
      </div>
      <div style={{ padding: '0 28px 30px', flexShrink: 0 }}>
        <CK as="button" lip={5} lipColor="var(--goldLip)" style={{
          width: '100%', fontFamily: CK_DISPLAY, fontWeight: 700, fontSize: 16, color: '#6c5000',
          background: 'linear-gradient(180deg, var(--goldHi), var(--gold))', border: 'none', borderRadius: 'var(--r)', padding: '16px 0 14px', whiteSpace: 'nowrap',
        }}>Keep it going</CK>
      </div>
    </CKPhone>
  );
}

Object.assign(window, { CKModalLocked, CKModalSignOut, CKModalReminders, CKModalStreak, CKModalBackdrop });
