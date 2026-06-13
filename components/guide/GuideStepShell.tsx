import type { ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { GUIDE_STEP_COUNT } from '../../constants/guide';
import { LipButton } from '../ui/LipButton';
import { Watermark } from '../ui/Watermark';

interface GuideStepShellProps {
  /** 1-based step index. */
  step: number;
  /** Tap the back chip — go to the previous step, or exit on step 1. */
  onBack: () => void;
  /** Primary red CTA label for this step. */
  ctaLabel: string;
  /** Primary CTA press handler. */
  onCta: () => void;
  /** Disabled CTA (e.g. while finishing onboarding). */
  ctaDisabled?: boolean;
  children: ReactNode;
}

/**
 * Shared chrome for the 4-step paced basics flow (chunky_v3 §8):
 * back chip + "Kannada basics" + "n/4" counter + a gold progress bar header,
 * a scrolling content body, and a single red Next/Done CTA pinned at the bottom.
 *
 * Both /onboarding/basics and /guide render their step content inside this so
 * the flow chrome stays identical; only the CTA wiring differs.
 */
export function GuideStepShell({
  step,
  onBack,
  ctaLabel,
  onCta,
  ctaDisabled = false,
  children,
}: GuideStepShellProps) {
  const insets = useSafeAreaInsets();
  const progress = Math.min(1, Math.max(0, step / GUIDE_STEP_COUNT));

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surfaceCream }}>
      <Watermark motif="kolamGrid" />

      {/* Header: back chip + title + counter */}
      <View
        style={{
          paddingTop: insets.top + Spacing.sm,
          paddingHorizontal: Spacing.lg,
          paddingBottom: Spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          gap: moderateScale(12),
        }}
      >
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel={step <= 1 ? 'Close' : 'Back'}
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

        <Text
          style={{
            flex: 1,
            fontFamily: Fonts.baloo.bold,
            fontSize: moderateScale(18),
            color: Colors.onSurface,
            letterSpacing: -0.2,
          }}
          numberOfLines={1}
          maxFontSizeMultiplier={1.3}
        >
          Kannada basics
        </Text>

        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(13),
            color: Colors.tertiary,
            fontVariant: ['tabular-nums'],
          }}
          maxFontSizeMultiplier={1.3}
          accessibilityLabel={`Step ${step} of ${GUIDE_STEP_COUNT}`}
        >
          {step}/{GUIDE_STEP_COUNT}
        </Text>
      </View>

      {/* Gold progress bar */}
      <View style={{ paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md }}>
        <View
          style={{
            height: moderateScale(9),
            borderRadius: Radius.full,
            backgroundColor: 'rgba(27,29,14,0.10)',
            overflow: 'hidden',
          }}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 1, max: GUIDE_STEP_COUNT, now: step }}
        >
          <View
            style={{
              height: '100%',
              width: `${progress * 100}%`,
              borderRadius: Radius.full,
              backgroundColor: Colors.secondaryContainer,
            }}
          />
        </View>
      </View>

      {/* Body */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: Spacing.lg,
          paddingTop: Spacing.sm,
          paddingBottom: Spacing.xxl,
        }}
      >
        {children}
      </ScrollView>

      {/* CTA */}
      <View
        style={{
          paddingHorizontal: Spacing.lg,
          paddingTop: Spacing.md,
          paddingBottom: insets.bottom + Spacing.lg,
        }}
      >
        <LipButton
          label={ctaLabel}
          onPress={onCta}
          variant="primary"
          disabled={ctaDisabled}
        />
      </View>
    </View>
  );
}
