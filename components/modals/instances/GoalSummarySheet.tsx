import { View, Text, useWindowDimensions } from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';
import { Spacing, Radius } from '../../../constants/spacing';
import { useUserStore } from '../../../stores/useUserStore';
import { useFluencyMode } from '../../../hooks/useFluencyMode';

export function GoalSummarySheet() {
  const motivations = useUserStore((s) => s.motivations);
  const dailyGoalMinutes = useUserStore((s) => s.dailyGoalMinutes);
  const goal = useFluencyMode();
  const { height: screenHeight } = useWindowDimensions();

  const goalLabel =
    goal === 'spoken' ? 'Spoken only' : goal === 'fluency' ? 'Complete fluency' : null;
  const dailyGoalLabel = dailyGoalMinutes ? `${dailyGoalMinutes} min / day` : null;

  // Open at ~70% of screen so even users with many motivations see most of the
  // list at a glance. Overflow scrolls inside the sheet.
  const minContentHeight = Math.round(screenHeight * 0.7);

  return (
    <BottomSheetScrollView
      bounces={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: moderateScale(20),
        paddingTop: moderateScale(4),
        paddingBottom: moderateScale(36),
        gap: moderateScale(20),
        minHeight: minContentHeight,
      }}
    >
      <Text
        style={{
          fontFamily: Fonts.dmSans.bold,
          fontSize: moderateScale(22),
          color: Colors.onSurface,
          letterSpacing: -0.3,
        }}
        maxFontSizeMultiplier={1.3}
      >
        Your goal
      </Text>

      {goalLabel ? (
        <Section label="Learning goal">
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: moderateScale(17),
              color: Colors.onSurface,
            }}
            maxFontSizeMultiplier={1.3}
          >
            {goalLabel}
          </Text>
        </Section>
      ) : null}

      {dailyGoalLabel ? (
        <Section label="Daily target">
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: moderateScale(17),
              color: Colors.onSurface,
            }}
            maxFontSizeMultiplier={1.3}
          >
            {dailyGoalLabel}
          </Text>
        </Section>
      ) : null}

      {motivations.length ? (
        <Section label={`Why Kannada · ${motivations.length}`}>
          <View style={{ gap: moderateScale(8) }}>
            {motivations.map((m) => (
              <View
                key={m}
                style={{
                  backgroundColor: Colors.surfaceContainerHighest,
                  borderRadius: Radius.md,
                  paddingVertical: moderateScale(12),
                  paddingHorizontal: Spacing.md,
                }}
              >
                <Text
                  style={{
                    fontFamily: Fonts.dmSans.medium,
                    fontSize: moderateScale(14),
                    color: Colors.onSurface,
                    lineHeight: moderateScale(20),
                  }}
                  maxFontSizeMultiplier={1.3}
                >
                  {m}
                </Text>
              </View>
            ))}
          </View>
        </Section>
      ) : null}

      <Text
        style={{
          fontFamily: Fonts.dmSans.regular,
          fontSize: moderateScale(12),
          color: Colors.tertiary,
          lineHeight: moderateScale(18),
          textAlign: 'center',
          paddingHorizontal: Spacing.sm,
          marginTop: 'auto',
        }}
        maxFontSizeMultiplier={1.4}
      >
        Set when you signed up. We&apos;ll let you change these once the fluency path opens.
      </Text>
    </BottomSheetScrollView>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: moderateScale(8) }}>
      <Text
        style={{
          fontFamily: Fonts.dmSans.bold,
          fontSize: moderateScale(11),
          letterSpacing: 2.2,
          color: Colors.tertiary,
          textTransform: 'uppercase',
        }}
        maxFontSizeMultiplier={1.4}
      >
        {label}
      </Text>
      {children}
    </View>
  );
}
