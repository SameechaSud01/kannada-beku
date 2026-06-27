import { Colors } from '../../constants/colors';
import { Icons } from '../../constants/icons';
import { LipButton } from '../ui/LipButton';
import { IconWell } from './IconWell';
import { SystemStateScreen } from './SystemStateScreen';

export type ErrorStateProps = {
  /** Re-run the failed query. */
  onRetry: () => void;
  /** Optional secondary action; renders the "Get help" tertiary button when set. */
  onHelp?: () => void;
  title?: string;
  body?: string;
  retryLabel?: string;
  helpLabel?: string;
  /** Show the back chip (standalone full-screen error). */
  back?: boolean;
  onBack?: () => void;
};

/**
 * Full-screen load error (st-feedback.jsx FailureFull) — a genuine failure, so
 * it stays red: pale-red icon well + alert-triangle, primary "Try again", and an
 * optional tertiary "Get help". Use for true load/server failures; treat
 * connectivity loss as caution with <OfflineState> instead.
 */
export function ErrorState({
  onRetry,
  onHelp,
  title = 'Something went wrong',
  body = "We couldn't load this. Check your connection and give it another try.",
  retryLabel = 'Try again',
  helpLabel = 'Get help',
  back = false,
  onBack,
}: ErrorStateProps) {
  return (
    <SystemStateScreen
      back={back}
      onBack={onBack}
      well={
        <IconWell size={104} bg={Colors.errorContainerLow}>
          <Icons.emHelp size={48} color={Colors.primary} strokeWidth={2} />
        </IconWell>
      }
      title={title}
      body={body}
      actions={
        <>
          <LipButton
            label={retryLabel}
            variant="primary"
            icon={Icons.refresh}
            iconLeading
            onPress={onRetry}
          />
          {onHelp ? <LipButton label={helpLabel} variant="tertiary" onPress={onHelp} /> : null}
        </>
      }
    />
  );
}
