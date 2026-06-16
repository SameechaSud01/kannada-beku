import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { Watermark } from '../ui/Watermark';
import { BrandSpinner } from '../states/BrandSpinner';

/**
 * Brief loading state for the Beginners' Guide while its content is fetched from
 * the DB (see services/api/guide.ts). The fetch always resolves — to the live
 * row or the bundled fallback — so this is momentary. Keeps the back chip so the
 * user is never trapped if the fetch is slow.
 */
export function GuideLoading({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: Colors.surfaceCream }}>
      <Watermark motif="kolamGrid" />
      <View
        style={{
          paddingTop: insets.top + Spacing.sm,
          paddingHorizontal: Spacing.lg,
          flexDirection: 'row',
        }}
      >
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={12}
          style={({ pressed }) => ({
            width: moderateScale(40),
            height: moderateScale(40),
            borderRadius: Radius.full,
            backgroundColor: '#ffffff',
            borderWidth: 1,
            borderColor: Colors.hairline,
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ scale: pressed ? 0.94 : 1 }],
          })}
        >
          <Icons.back size={moderateScale(20)} color={Colors.primary} />
        </Pressable>
      </View>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <BrandSpinner size={48} />
      </View>
    </View>
  );
}
