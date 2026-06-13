import { View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { LipButton } from '../../ui/LipButton';
import { DialogBody, DialogTitle } from './_dialogChrome';

export interface SignOutDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Destructive confirm (chunky_v3 §11). Stacked (primary on top) — the user
 * tapped Sign out on purpose, so we add friction without feeling adversarial.
 * The destructive confirm stays red; "Stay signed in" is the secondary tan rung.
 */
export function SignOutDialog({ onConfirm, onCancel }: SignOutDialogProps) {
  return (
    <View style={{ gap: moderateScale(14) }}>
      <DialogTitle>Sign out of Kannada Beku?</DialogTitle>
      <DialogBody>
        Your streak, lessons and phrases are saved to your account. Sign back in anytime.
      </DialogBody>
      <View style={{ gap: moderateScale(10), marginTop: moderateScale(2) }}>
        <LipButton
          label="Sign out"
          variant="primary"
          onPress={onConfirm}
          accessibilityLabel="Sign out. Destructive."
        />
        <LipButton label="Stay signed in" variant="secondary" onPress={onCancel} />
      </View>
    </View>
  );
}
