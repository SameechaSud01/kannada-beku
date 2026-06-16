// st-feedback.jsx — success & failure states.
//   Success: top dark pill toast (in context) + full-screen reward moment.
//   Failure: bottom soft card toast (in context) + full-screen error w/ retry + offline.

// extra glyphs — accurate @tabler/icons-react-native outline paths (24×24,
// the app's single icon library; round caps/joins via CKIcon).
const StPaths = {
  // IconWifiOff — offline. (Tabler; would join Icons map as `wifiOff`.)
  wifiOff: (
    <g>
      <path d="M12 18l.01 0" />
      <path d="M9.172 15.172a4 4 0 0 1 5.656 0" />
      <path d="M6.343 12.343a7.963 7.963 0 0 1 3.864 -2.14m4.163 .155a7.965 7.965 0 0 1 3.287 2" />
      <path d="M3.515 9.515a12 12 0 0 1 3.544 -2.455m3.101 -.92a12 12 0 0 1 10.325 3.374" />
      <path d="M3 3l18 18" />
    </g>
  ),
  // IconRefresh — retry. (Tabler; would join Icons map as `refresh`.)
  refresh: (
    <g>
      <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
      <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
    </g>
  ),
  // IconAlertTriangle — full-screen error (== Icons.emHelp / `alert`).
  alertTriangle: (
    <g>
      <path d="M12 9v4" />
      <path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z" />
      <path d="M12 16h.01" />
    </g>
  ),
};

// ── Toasts ───────────────────────────────────────────────
// Success — top, dark pill, gold check, auto-dismiss (shown static here).
function ToastSuccess({ children, top = 30 }) {
  return (
    <div className="st-rise" style={{ ['--d']: '120ms',
      position: 'absolute', top, left: '50%', transform: 'translateX(-50%)', maxWidth: '86%',
      background: 'var(--ink)', borderRadius: 99, padding: '11px 16px 11px 12px',
      display: 'flex', alignItems: 'center', gap: 10, zIndex: 5,
      boxShadow: '0 10px 30px rgba(27,29,14,0.28)', whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 22, height: 22, borderRadius: 99, background: 'var(--gold)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <CKIcon d={CKPaths.check} size={14} stroke={3} color="var(--goldDeep)" />
      </span>
      <span style={{ fontFamily: CK_BODY, fontWeight: 700, fontSize: 14, color: '#fff' }}>{children}</span>
    </div>
  );
}

// Error — bottom, soft card, redPale X circle, sticky; optional retry chevron.
function ToastError({ title, subtitle, retry = false, bottom = 30 }) {
  return (
    <div className="st-rise" style={{ ['--d']: '120ms',
      position: 'absolute', bottom, left: 18, right: 18,
      background: '#fff', border: CK_HAIRLINE, borderRadius: 'var(--r)', padding: '12px 14px',
      display: 'flex', alignItems: 'center', gap: 11, zIndex: 5,
      boxShadow: '0 12px 30px rgba(27,29,14,0.16)',
    }}>
      <span style={{ width: 22, height: 22, borderRadius: 99, background: 'var(--redPale)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <CKIcon d={CKPaths.close} size={13} stroke={3} color="var(--red)" />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: CK_BODY, fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>{title}</div>
        {subtitle && <div style={{ fontFamily: CK_BODY, fontWeight: 500, fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>{subtitle}</div>}
      </div>
      {retry && <span style={{ color: 'var(--muted)', display: 'flex', flexShrink: 0 }}><CKIcon d={CKPaths.chevron} size={18} stroke={2.2} /></span>}
    </div>
  );
}

// ── Context backgrounds (faint, so the toast is the subject) ──
function BgHomeMini() {
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: 0.5, filter: 'saturate(0.85)' }}>
      <CKPhone bg="var(--surfaceLow)" pad="0">
        <CK2TopBar streak={6} />
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 13 }}>
          <Skel w="64%" h={24} r={9} />
          <SkelCard style={{ height: 120 }}></SkelCard>
          <div style={{ background: 'var(--redPale)', borderRadius: 'var(--r)', height: 70 }}></div>
        </div>
      </CKPhone>
    </div>
  );
}
function BgRemindersMini() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* dim scrim over a settings-ish sheet */}
      <CKPhone bg="var(--surfaceLow)" pad="0">
        <CK2PageHeader title="Settings" sub="Reminders · Audio · Help" />
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12, opacity: 0.5 }}>
          {[0, 1, 2].map((i) => (
            <SkelCard key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Skel w={36} h={36} r={11} /><Skel w="50%" h={13} r={7} />
              <Skel w={40} h={22} r={99} style={{ marginLeft: 'auto' }} />
            </SkelCard>
          ))}
        </div>
      </CKPhone>
    </div>
  );
}

// Success toast (in context) — reminder set
function SuccessToast() {
  const T = useTone();
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <BgRemindersMini />
      <ToastSuccess>{T('Reminder set — 8:00 AM daily', 'Reminder locked — 8:00 AM!')}</ToastSuccess>
    </div>
  );
}

// Error toast (in context) — offline
function FailureToast() {
  const T = useTone();
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <BgHomeMini />
      <ToastError
        title={T("You're offline", "Ayyo — no internet")}
        subtitle={T("We'll keep your work safe until you're back", "Don't worry, your progress is safe")}
        retry />
    </div>
  );
}

// ── Full-screen success — daily goal hit (gold reward moment) ──
function SuccessFull() {
  const T = useTone();
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* confetti dots */}
      {[['8%', 110, 'var(--gold)', 7], ['86%', 150, 'var(--red2)', 6], ['18%', 300, 'var(--goldHi)', 5], ['80%', 330, 'var(--gold)', 8], ['12%', 520, 'var(--red2)', 5], ['90%', 540, 'var(--goldHi)', 7]].map((c, i) => (
        <span key={i} className="st-float" style={{ ['--i']: i, position: 'absolute', left: c[0], top: c[1], width: c[3], height: c[3], borderRadius: 99, background: c[2], opacity: 0.8 }}></span>
      ))}
      <StateScaffold
        well={
          <CK lip={6} lipColor="var(--goldLip)" style={{ width: 126, height: 126, borderRadius: '50%', background: 'linear-gradient(160deg, var(--goldHi), var(--gold))', display: 'grid', placeItems: 'center', margin: '0 auto' }}>
            <CKIcon d={CKPaths.check} size={58} stroke={3} color="var(--goldDeep)" />
          </CK>
        }
        title={T("You've hit your daily goal!", 'Done for today! 🎉')}
        body={T('Three lessons of practice today. Your streak is safe — come back tomorrow to keep it alive.', "Proud of you, guru. Go eat some thindi — streak's safe.")}
        actions={<>
          <CKBtnPrimary>{T('Keep going', 'One more, why not')}</CKBtnPrimary>
          <CKBtnSecondary style={{ border: '2px solid var(--interactiveSecondary)', boxShadow: '0 4px 0 var(--interactiveSecondaryLip)' }}>{T('Back to home', 'Back home')}</CKBtnSecondary>
        </>}
      />
    </div>
  );
}

// ── Full-screen failure — load error with retry (true error → red) ──
function FailureFull() {
  const T = useTone();
  return (
    <StateScaffold
      back
      well={
        <IconWell size={104} bg="var(--redPale)" style={{ margin: '0 auto' }}>
          <CKIcon d={StPaths.alertTriangle} size={48} stroke={2} color="var(--red)" />
        </IconWell>
      }
      title={T('Something went wrong', 'Yen idu — something broke')}
      body={T("We couldn't load your lessons. Check your connection and give it another try.", "Couldn't load your lessons. Check your net and try once more.")}
      actions={<>
        <CKBtnPrimary><span style={{ display: 'flex' }}><CKIcon d={StPaths.refresh} size={19} stroke={2.2} color="#fff" /></span>{T('Try again', 'Try again')}</CKBtnPrimary>
        <CKBtnTertiary>{T('Get help', 'Get help')}</CKBtnTertiary>
      </>}
    />
  );
}

// ── Full-screen offline — caution, not error (warning orange; work is safe) ──
function FailureOffline() {
  const T = useTone();
  return (
    <StateScaffold
      back
      well={
        <IconWell size={104} bg="var(--warnPale)" style={{ margin: '0 auto' }}>
          <CKIcon d={StPaths.wifiOff} size={48} stroke={2} color="var(--warn)" />
        </IconWell>
      }
      title={T("You're offline", 'No internet right now')}
      body={T("Reconnect to keep learning. Anything you've done is saved and will sync the moment you're back.", "Your progress is safe and will sync once you're back online.")}
      actions={<>
        <CKBtnPrimary><span style={{ display: 'flex' }}><CKIcon d={StPaths.refresh} size={19} stroke={2.2} color="#fff" /></span>{T('Try again', 'Retry')}</CKBtnPrimary>
        <CKBtnTertiary>{T('Practice offline phrases', 'Use offline phrases')}</CKBtnTertiary>
      </>}
      note={T('Emergency phrases work without a connection.', 'Emergency phrases work without net.')}
    />
  );
}

Object.assign(window, { ToastSuccess, ToastError, SuccessToast, FailureToast, SuccessFull, FailureFull, FailureOffline, StPaths });
