import { Text, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';
import { Radius } from '../../../constants/spacing';
import { Icons } from '../../../constants/icons';
import { Halo } from '../Halo';
import { LipButton } from '../../ui/LipButton';
import { DialogBody, DialogTitle } from './_dialogChrome';

export interface TTSUnavailableDialogProps {
  onOpenSettings: () => void;
  onDismiss: () => void;
}

/**
 * Boot-time warning shown once per install when the device has no Kannada TTS
 * voice (chunky_v3 §11). Both buttons mark hasSeenTtsWarning so we don't repeat.
 */
export function TTSUnavailableDialog({ onOpenSettings, onDismiss }: TTSUnavailableDialogProps) {
  return (
    <View style={{ gap: moderateScale(14) }}>
      <View style={{ alignItems: 'center' }}>
        <Halo icon="headphones" iconSize={26} stroke={2.2} iconColor={Colors.secondary} />
      </View>
      <DialogTitle>Kannada voice not installed</DialogTitle>
      <DialogBody>
        Your phone doesn&apos;t have a Kannada text-to-speech voice yet. We can guide you —
        it&apos;s a one-time download in system settings.
      </DialogBody>
      <View
        style={{
          backgroundColor: Colors.surfaceCreamLow,
          borderRadius: Radius.tile,
          padding: moderateScale(12),
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.dmSans.regular,
            fontSize: moderateScale(12),
            lineHeight: moderateScale(18),
            color: Colors.tertiary,
            textAlign: 'center',
          }}
          maxFontSizeMultiplier={1.4}
        >
          <Text style={{ fontFamily: Fonts.dmSans.bold, color: Colors.onSurface }}>
            Settings → Languages → Text-to-speech →{' '}
          </Text>
          install Kannada (kn-IN).
        </Text>
      </View>
      <View style={{ gap: moderateScale(10), marginTop: moderateScale(2) }}>
        <LipButton
          label="Open settings"
          variant="primary"
          onPress={onOpenSettings}
          icon={Icons.forward}
        />
        <LipButton label="Maybe later" variant="secondary" onPress={onDismiss} />
      </View>
    </View>
  );
}
