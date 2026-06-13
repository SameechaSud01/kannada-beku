import { Text, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { ChunkyPressable } from '../ui/ChunkyPressable';

interface OptionCardProps {
  label: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
}

/**
 * Chunky kit v3 option card.
 * - selected: bg #fff5f5, 2px primaryContainer border, red check circle, lip 4 (red@25%)
 * - idle:     white, 2px ink@10% border, lip 3 (ink@10%)
 */
export function OptionCard({ label, subtitle, selected, onPress }: OptionCardProps) {
  return (
    <ChunkyPressable
      onPress={onPress}
      accessibilityLabel={label}
      bg={selected ? '#fff5f5' : '#ffffff'}
      lip={selected ? 4 : 3}
      lipColor={selected ? 'rgba(145,0,27,0.25)' : Colors.cardLip}
      border
      borderWidth={2}
      borderColor={selected ? Colors.primaryContainer : 'rgba(27,29,14,0.10)'}
      radius={Radius.chunky}
      style={{
        padding: moderateScale(18),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <View style={{ flex: 1, marginRight: Spacing.md }}>
        <Text
          style={{
            fontFamily: Fonts.baloo.bold,
            fontSize: moderateScale(16),
            color: Colors.onSurface,
            marginBottom: subtitle ? Spacing.xs : 0,
          }}
          maxFontSizeMultiplier={1.4}
        >
          {label}
        </Text>
        {subtitle && (
          <Text
            style={{
              fontFamily: Fonts.dmSans.regular,
              fontSize: moderateScale(13),
              color: Colors.tertiary,
            }}
            maxFontSizeMultiplier={1.4}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {selected && (
        <View
          style={{
            width: moderateScale(26),
            height: moderateScale(26),
            borderRadius: Radius.full,
            backgroundColor: Colors.primaryContainer,
            borderBottomWidth: 2,
            borderBottomColor: Colors.redLip,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icons.check size={moderateScale(15)} color={Colors.onPrimary} strokeWidth={2.8} />
        </View>
      )}
    </ChunkyPressable>
  );
}
