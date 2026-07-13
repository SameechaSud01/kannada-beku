import { forwardRef, useCallback, useImperativeHandle, useRef, type ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import GorhomBottomSheet, {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { Colors } from '../../constants/colors';
import { Shadows } from '../../constants/shadows';

export interface BottomSheetHandle {
  close: () => void;
}

export interface BottomSheetProps {
  children: ReactNode;
  onDismiss: () => void;
  /**
   * Disable the sheet's content pan gesture so vertically-scrolling content
   * (e.g. TimeWheelPicker) owns its drags. Handle drag + backdrop tap still
   * dismiss.
   */
  disableContentPanning?: boolean;
}

/**
 * Bottom sheet primitive (MODALS §4.2). Wraps @gorhom/bottom-sheet.
 * - Dynamic sizing to content, capped below the status bar (topInset)
 * - Drag handle styled per spec (38×5, surfaceDim, marginBottom 8)
 * - Backdrop tap and swipe-down both dismiss
 * - Slide-up 250ms ease-out, slide-down 200ms ease-in (defaults from lib)
 */
export const BottomSheet = forwardRef<BottomSheetHandle, BottomSheetProps>(function BottomSheet(
  { children, onDismiss, disableContentPanning = false },
  ref,
) {
  const sheetRef = useRef<GorhomBottomSheet>(null);
  const insets = useSafeAreaInsets();

  useImperativeHandle(ref, () => ({
    close: () => sheetRef.current?.close(),
  }));

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.55}
        pressBehavior="close"
      />
    ),
    [],
  );

  const handleChange = useCallback(
    (index: number) => {
      if (index === -1) onDismiss();
    },
    [onDismiss],
  );

  return (
    <GorhomBottomSheet
      ref={sheetRef}
      index={0}
      enableDynamicSizing
      topInset={insets.top + moderateScale(12)}
      enablePanDownToClose
      enableContentPanningGesture={!disableContentPanning}
      animateOnMount
      onChange={handleChange}
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        backgroundColor: '#ffffff',
        borderTopLeftRadius: moderateScale(24),
        borderTopRightRadius: moderateScale(24),
        ...Shadows.modal,
      }}
      handleStyle={{
        paddingTop: moderateScale(12),
        paddingBottom: moderateScale(8),
      }}
      handleIndicatorStyle={{
        width: moderateScale(40),
        height: moderateScale(5),
        borderRadius: moderateScale(3),
        backgroundColor: Colors.hairline,
      }}
      accessible
      accessibilityLabel="Bottom sheet"
    >
      <View accessibilityViewIsModal style={{ flexShrink: 1 }}>
        {children}
      </View>
    </GorhomBottomSheet>
  );
});
