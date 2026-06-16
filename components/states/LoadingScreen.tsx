import { Text, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing } from '../../constants/spacing';
import { BackChip } from './BackChip';
import { BrandSpinner } from './BrandSpinner';

export type LoadingScreenProps = {
  /** Label under the spinner. */
  label?: string;
  /** Show the back chip top-left (lesson / guide loads — never trap the user). */
  back?: boolean;
  onBack?: () => void;
  bg?: string;
};

/**
 * Momentary spinner screen (st-loading.jsx LoadingSpinner) — the branded
 * replacement for a bare ActivityIndicator. Cream bg, a centred red ring + label,
 * and an optional back chip so the user is never trapped while a lesson / guide
 * loads.
 */
export function LoadingScreen({
  label = 'Getting things ready…',
  back = false,
  onBack,
  bg = Colors.surfaceCreamLow,
}: LoadingScreenProps) {
  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      {back ? <BackChip onPress={onBack} /> : null}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.lg }}>
        <BrandSpinner size={48} />
        <Text
          style={{
            fontFamily: Fonts.baloo.bold,
            fontSize: moderateScale(15.5),
            color: Colors.tertiary,
          }}
          maxFontSizeMultiplier={1.3}
        >
          {label}
        </Text>
      </View>
    </View>
  );
}
