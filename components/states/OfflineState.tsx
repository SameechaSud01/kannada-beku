import { Colors } from '../../constants/colors';
import { Icons } from '../../constants/icons';
import { LipButton } from '../ui/LipButton';
import { IconWell } from './IconWell';
import { SystemStateScreen } from './SystemStateScreen';

export type OfflineStateProps = {
  /** Re-check connectivity / re-run the failed query. */
  onRetry: () => void;
  /** Optional secondary action (e.g. route to emergency phrases). */
  onPracticeOffline?: () => void;
  title?: string;
  body?: string;
  retryLabel?: string;
  practiceLabel?: string;
  note?: string;
  back?: boolean;
  onBack?: () => void;
};

/**
 * Full-screen offline state (st-feedback.jsx FailureOffline) — caution, NOT an
 * error: warm burnt-orange well + wifi-off glyph, work-is-safe copy. Reserve red
 * (<ErrorState>) for genuine failures.
 *
 * Reusable on demand. The app has no NetInfo dependency, so this isn't
 * auto-triggered yet — mount it where connectivity loss is known (e.g. a fetch
 * that fails while a connectivity check reports offline).
 */
export function OfflineState({
  onRetry,
  onPracticeOffline,
  title = "You're offline",
  body = "Reconnect to keep learning. Anything you've done is saved and will sync the moment you're back.",
  retryLabel = 'Try again',
  practiceLabel = 'Practice offline phrases',
  note = 'Emergency phrases work without a connection.',
  back = false,
  onBack,
}: OfflineStateProps) {
  return (
    <SystemStateScreen
      back={back}
      onBack={onBack}
      well={
        <IconWell size={104} bg={Colors.warningContainerLow}>
          <Icons.wifiOff size={48} color={Colors.warningContainer} strokeWidth={2} />
        </IconWell>
      }
      title={title}
      body={body}
      note={onPracticeOffline ? note : undefined}
      actions={
        <>
          <LipButton
            label={retryLabel}
            variant="primary"
            icon={Icons.refresh}
            iconLeading
            onPress={onRetry}
          />
          {onPracticeOffline ? (
            <LipButton label={practiceLabel} variant="tertiary" onPress={onPracticeOffline} />
          ) : null}
        </>
      }
    />
  );
}
