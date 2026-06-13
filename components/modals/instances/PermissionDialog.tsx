import { Text, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';
import { Radius } from '../../../constants/spacing';
import { Halo } from '../Halo';
import { LipButton } from '../../ui/LipButton';
import { DialogBody, DialogTitle } from './_dialogChrome';

export type PermissionKind = 'notifications' | 'mic';

export interface PermissionDialogProps {
  kind: PermissionKind;
  onAllow: () => void;
  onDeny: () => void;
}

const COPY: Record<
  PermissionKind,
  { title: string; body: string; preview: string | null; allow: string; icon: 'bell' | 'mic' }
> = {
  notifications: {
    title: 'A gentle nudge each day?',
    body: "We'll ping you once a day at the time you set — never to shame you for missing one. Off by default.",
    preview: 'Swalpa Kannada? Five minutes is plenty.',
    allow: 'Allow notifications',
    icon: 'bell',
  },
  mic: {
    title: 'Hear how you say it?',
    body: 'We listen on-device while you speak the answer, then forget the recording. Nothing leaves your phone.',
    preview: null,
    allow: 'Allow microphone',
    icon: 'mic',
  },
};

/**
 * Pre-system explainer (chunky_v3 §11). Always show this before triggering the
 * OS permission prompt, per the project rule. Red primary "Allow" + secondary
 * tan "Not now".
 */
export function PermissionDialog({ kind, onAllow, onDeny }: PermissionDialogProps) {
  const copy = COPY[kind];
  return (
    <View style={{ gap: moderateScale(14) }}>
      <View style={{ alignItems: 'center' }}>
        <Halo icon={copy.icon} iconColor={Colors.secondary} stroke={2.2} />
      </View>
      <DialogTitle>{copy.title}</DialogTitle>
      <DialogBody>{copy.body}</DialogBody>
      {copy.preview ? <PreviewCard body={copy.preview} /> : null}
      <View style={{ gap: moderateScale(10), marginTop: moderateScale(2) }}>
        <LipButton label={copy.allow} variant="primary" onPress={onAllow} />
        <LipButton label="Not now" variant="secondary" onPress={onDeny} />
      </View>
    </View>
  );
}

function PreviewCard({ body }: { body: string }) {
  return (
    <View
      style={{
        backgroundColor: Colors.surfaceCreamLow,
        borderRadius: Radius.tile,
        padding: moderateScale(12),
        flexDirection: 'row',
        alignItems: 'center',
        gap: moderateScale(10),
      }}
    >
      <View
        style={{
          width: moderateScale(32),
          height: moderateScale(32),
          borderRadius: moderateScale(8),
          backgroundColor: Colors.primaryContainer,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.notoSansKannada.medium,
            fontSize: moderateScale(17),
            color: Colors.onPrimary,
          }}
          maxFontSizeMultiplier={1.2}
        >
          ಬೇ
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(12),
            color: Colors.onSurface,
          }}
          maxFontSizeMultiplier={1.3}
        >
          Kannada Beku
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.regular,
            fontSize: moderateScale(11),
            color: Colors.tertiary,
            marginTop: moderateScale(1),
          }}
          maxFontSizeMultiplier={1.4}
        >
          {body}
        </Text>
      </View>
      <Text
        style={{
          fontFamily: Fonts.dmSans.regular,
          fontSize: moderateScale(10),
          color: Colors.tertiary,
        }}
        maxFontSizeMultiplier={1.4}
      >
        now
      </Text>
    </View>
  );
}
