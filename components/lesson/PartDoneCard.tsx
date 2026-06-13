import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { LipButton } from '../ui/LipButton';

interface PartDoneCardProps {
  partLabel: string;
  nextLabel: string;
  onContinue: () => void;
  onBack: () => void;
}

/**
 * Lightweight end-of-sub-part screen for non-final parts. The full lesson
 * celebration + server completion only happens after the last part (DoneCard).
 */
export function PartDoneCard({ partLabel, nextLabel, onContinue, onBack }: PartDoneCardProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surfaceCream }}>
      <View
        style={{
          flex: 1,
          paddingHorizontal: Spacing.lg,
          paddingTop: insets.top + Spacing.xxxl,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: moderateScale(72),
            height: moderateScale(72),
            borderRadius: Radius.full,
            backgroundColor: Colors.secondaryContainer,
            borderBottomWidth: 5,
            borderBottomColor: Colors.goldLip,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: Spacing.xl,
          }}
        >
          <Icons.check size={moderateScale(38)} color={Colors.onSecondaryContainer} strokeWidth={2.6} />
        </View>

        <Text
          style={{
            fontFamily: Fonts.baloo.extrabold,
            fontSize: moderateScale(24),
            color: Colors.onSurface,
            textAlign: 'center',
            lineHeight: moderateScale(34),
            letterSpacing: -0.3,
          }}
          maxFontSizeMultiplier={1.2}
        >
          {partLabel} done!
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.medium,
            fontSize: moderateScale(14),
            color: Colors.tertiary,
            textAlign: 'center',
            marginTop: Spacing.sm,
          }}
          maxFontSizeMultiplier={1.3}
        >
          Up next: {nextLabel}
        </Text>
      </View>

      <View
        style={{
          padding: Spacing.lg,
          paddingBottom: insets.bottom + Spacing.lg,
          gap: Spacing.md,
        }}
      >
        <LipButton
          label={`Continue to ${nextLabel}`}
          onPress={onContinue}
          accessibilityLabel={`Continue to ${nextLabel}`}
          icon={Icons.forward}
        />
        <LipButton
          label="Back to parts"
          variant="secondary"
          onPress={onBack}
          accessibilityLabel="Back to parts"
        />
      </View>
    </View>
  );
}
