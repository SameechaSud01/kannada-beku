import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { LipButton } from '../ui/LipButton';
import { Watermark } from '../ui/Watermark';

/** Number of intake steps (Name, Why, Time, Reminder). */
export const INTAKE_STEP_COUNT = 4;

export interface IntakeStepShellProps {
  /** 1-based intake step index. */
  step: number;
  title: string;
  subtitle: string;
  /** Renders the top-right "Skip" affordance (steps 2–4 only per the audit). */
  onSkip?: () => void;
  onBack: () => void;
  onContinue: () => void;
  continueDisabled?: boolean;
  /** Footer primary-CTA label. Defaults to "Continue". */
  continueLabel?: string;
  /** Top-right skip-affordance label. Defaults to "Skip". */
  skipLabel?: string;
  children: ReactNode;
}

/**
 * Shared intake chrome (spec_onboarding_audit_fixes.md): exactly ONE progress
 * indicator — a segmented gold bar (filled = gold, rest = ink@10%) with an
 * optional Skip on the same row — a Baloo 800 title block, top-anchored
 * content, and a pinned Back (33%) + Continue footer. No dots, no
 * "Step x of N" eyebrow.
 */
export function IntakeStepShell({
  step,
  title,
  subtitle,
  onSkip,
  onBack,
  onContinue,
  continueDisabled = false,
  continueLabel = 'Continue',
  skipLabel = 'Skip',
  children,
}: IntakeStepShellProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surfaceCream }}>
      <Watermark motif="kolamGrid" />

      {/* Progress segments + Skip — the only progress system. */}
      <View
        style={{
          paddingTop: insets.top + Spacing.md,
          paddingHorizontal: Spacing.xxl,
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.md,
        }}
      >
        <View style={{ flex: 1, flexDirection: 'row', gap: moderateScale(6) }}>
          {Array.from({ length: INTAKE_STEP_COUNT }, (_, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: moderateScale(6),
                borderRadius: moderateScale(3),
                backgroundColor: i < step ? Colors.secondaryContainer : 'rgba(27,29,14,0.10)',
              }}
            />
          ))}
        </View>
        {onSkip ? (
          <Pressable
            onPress={onSkip}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Skip this step"
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
          >
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: moderateScale(13.5),
                letterSpacing: 0.2,
                color: Colors.inkFaint,
              }}
              maxFontSizeMultiplier={1.3}
            >
              {skipLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {/* Title block */}
      <View style={{ paddingHorizontal: Spacing.xxl, paddingTop: Spacing.xl }}>
        <Text
          style={{
            fontFamily: Fonts.baloo.extrabold,
            fontSize: moderateScale(32),
            // Baloo's tall ascenders clip at the design's 1.12 ratio — RN cuts
            // glyphs to lineHeight, so give it ~1.3.
            lineHeight: moderateScale(42),
            letterSpacing: -0.3,
            color: Colors.onSurface,
          }}
          maxFontSizeMultiplier={1.2}
        >
          {title}
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.regular,
            fontSize: moderateScale(15.5),
            lineHeight: moderateScale(22),
            color: Colors.tertiary,
            marginTop: moderateScale(10),
          }}
          maxFontSizeMultiplier={1.3}
        >
          {subtitle}
        </Text>
      </View>

      {/* Content — top-anchored so nothing jumps when the keyboard opens. */}
      <View style={{ flex: 1, paddingHorizontal: Spacing.xxl }}>{children}</View>

      {/* Footer: white Back (33%) + red Continue (fills). */}
      <View
        style={{
          flexDirection: 'row',
          gap: Spacing.md,
          paddingHorizontal: Spacing.xxl,
          paddingTop: Spacing.md,
          paddingBottom: insets.bottom + Spacing.xl,
        }}
      >
        <View style={{ width: '33%' }}>
          <LipButton label="Back" variant="secondary" onPress={onBack} />
        </View>
        <View style={{ flex: 1 }}>
          <LipButton
            label={continueLabel}
            variant="primary"
            icon={Icons.forward}
            disabled={continueDisabled}
            onPress={onContinue}
          />
        </View>
      </View>
    </View>
  );
}
