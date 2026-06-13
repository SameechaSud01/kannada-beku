import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { BACK_CHIP_TOP_RESERVE } from '../ui/ExitBackButton';
import { LipButton } from '../ui/LipButton';

interface RealWorldPhaseProps {
  prompt: string;
  title: string;
  onAdvance: () => void;
}

export function RealWorldPhase({ prompt, title, onAdvance }: RealWorldPhaseProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surfaceCream }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: Spacing.lg,
          paddingTop: insets.top + BACK_CHIP_TOP_RESERVE,
          paddingBottom: Spacing.lg,
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(11),
            letterSpacing: 2,
            color: Colors.tertiary,
            textTransform: 'uppercase',
            marginBottom: Spacing.md,
          }}
          maxFontSizeMultiplier={1.4}
        >
          {title}
        </Text>

        <View
          style={{
            backgroundColor: Colors.secondaryFixed,
            borderRadius: Radius.chunky,
            borderBottomWidth: 5,
            borderBottomColor: Colors.goldLip,
            paddingVertical: Spacing.xxxl,
            paddingHorizontal: Spacing.xl,
          }}
        >
          <Text
            style={{
              fontFamily: Fonts.baloo.bold,
              fontSize: moderateScale(22),
              lineHeight: moderateScale(30),
              color: Colors.onSecondaryContainer,
            }}
            maxFontSizeMultiplier={1.3}
          >
            {prompt}
          </Text>
        </View>
      </ScrollView>

      <View
        style={{
          padding: Spacing.lg,
          paddingBottom: insets.bottom + Spacing.lg,
          gap: Spacing.md,
        }}
      >
        <LipButton label="I'll try this" onPress={onAdvance} icon={Icons.forward} />
        <LipButton
          label="Skip for now"
          variant="tertiary"
          onPress={onAdvance}
          accessibilityLabel="Skip for now"
        />
      </View>
    </View>
  );
}
