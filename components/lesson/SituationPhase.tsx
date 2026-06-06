import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { BACK_CHIP_TOP_RESERVE } from '../ui/ExitBackButton';
import { LipButton } from '../ui/LipButton';
import type { Lesson } from '../../constants/lessons/types';

interface SituationPhaseProps {
  lesson: Lesson;
  onAdvance: () => void;
}

export function SituationPhase({ lesson, onAdvance }: SituationPhaseProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: Spacing.lg,
          paddingTop: insets.top + BACK_CHIP_TOP_RESERVE,
          paddingBottom: Spacing.lg,
        }}
      >
        <View
          style={{
            backgroundColor: Colors.secondaryFixed,
            borderRadius: Radius.xl,
            paddingVertical: Spacing.xxxl + Spacing.md,
            paddingHorizontal: Spacing.lg,
            marginBottom: Spacing.xxl,
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: moderateScale(180),
          }}
        >
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: moderateScale(11),
              color: Colors.onSecondaryContainer,
              letterSpacing: 1.6,
              textTransform: 'uppercase',
              marginBottom: Spacing.sm,
            }}
          >
            Situation
          </Text>
          <Text
            style={{
              fontFamily: Fonts.baloo.bold,
              fontSize: moderateScale(20),
              color: Colors.onSecondaryContainer,
              textAlign: 'center',
              lineHeight: moderateScale(28),
            }}
            maxFontSizeMultiplier={1.2}
          >
            {lesson.title}
          </Text>
        </View>

        <Text
          style={{
            fontFamily: Fonts.baloo.extrabold,
            fontSize: moderateScale(24),
            color: Colors.onSurface,
            lineHeight: moderateScale(34),
            letterSpacing: -0.3,
            marginBottom: Spacing.md,
          }}
          maxFontSizeMultiplier={1.2}
        >
          {lesson.title}
        </Text>

        <Text
          style={{
            fontFamily: Fonts.dmSans.regular,
            fontSize: moderateScale(16),
            color: Colors.onSurface,
            lineHeight: moderateScale(24),
          }}
        >
          {lesson.situation}
        </Text>
      </ScrollView>

      <View style={{ padding: Spacing.lg, paddingBottom: insets.bottom + Spacing.lg }}>
        <LipButton
          label="Let's start"
          onPress={onAdvance}
          accessibilityLabel="Start the lesson"
          icon={Icons.forward}
        />
      </View>
    </View>
  );
}
