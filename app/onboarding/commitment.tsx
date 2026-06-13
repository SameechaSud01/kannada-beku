import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { ProgressDots } from '../../components/onboarding/ProgressDots';
import { ChunkyPressable } from '../../components/ui/ChunkyPressable';
import { LipButton } from '../../components/ui/LipButton';
import { useModal } from '../../components/modals/ModalHost';
import { LearningTimeInfoDialog } from '../../components/modals/instances/LearningTimeInfoDialog';
import { useUserStore } from '../../stores/useUserStore';

type Minutes = 5 | 10 | 20;

const COMMITMENTS: { value: Minutes; label: string; subtitle: string }[] = [
  { value: 5, label: '5 min / day', subtitle: 'Quick daily habit' },
  { value: 10, label: '10 min / day', subtitle: 'Steady progress' },
  { value: 20, label: '20 min / day', subtitle: 'Serious learner' },
];

export default function CommitmentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const modal = useModal();
  const [selected, setSelected] = useState<Minutes | null>(
    useUserStore.getState().dailyGoalMinutes,
  );

  const openInfo = (minutes: Minutes) => {
    modal.show({
      kind: 'dialog',
      component: LearningTimeInfoDialog,
      props: { minutes, onDismiss: () => modal.dismiss() },
      dim: 0.4,
    });
  };

  const handleContinue = () => {
    if (!selected) return;
    useUserStore.getState().setDailyGoalMinutes(selected);
    router.push('/onboarding/basics');
  };

  const canSubmit = !!selected;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.surfaceCream,
        paddingTop: insets.top + Spacing.xl,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.xxl,
      }}
    >
      <ProgressDots total={6} current={4} />

      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(11),
            letterSpacing: 2,
            color: Colors.tertiary,
            textTransform: 'uppercase',
            marginBottom: Spacing.sm,
          }}
          maxFontSizeMultiplier={1.4}
        >
          Step 4 of 5
        </Text>
        <Text
          style={{
            fontFamily: Fonts.baloo.extrabold,
            fontSize: moderateScale(27),
            color: Colors.onSurface,
            letterSpacing: -0.4,
            lineHeight: moderateScale(38),
            marginBottom: Spacing.sm,
          }}
          maxFontSizeMultiplier={1.3}
        >
          How much time can{'\n'}you commit?
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.regular,
            fontSize: moderateScale(15),
            color: Colors.tertiary,
            marginBottom: Spacing.xxxl,
          }}
          maxFontSizeMultiplier={1.4}
        >
          Set your daily learning goal
        </Text>

        <View style={{ gap: Spacing.md }}>
          {COMMITMENTS.map((item) => (
            <CommitmentCard
              key={item.value}
              label={item.label}
              subtitle={item.subtitle}
              selected={selected === item.value}
              onPress={() => setSelected(item.value)}
              onInfoPress={() => openInfo(item.value)}
            />
          ))}
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: Spacing.md }}>
        <View style={{ flex: 1 }}>
          <LipButton label="Back" variant="secondary" onPress={() => router.back()} />
        </View>
        <View style={{ flex: 1 }}>
          <LipButton
            label="Continue"
            variant="primary"
            disabled={!canSubmit}
            icon={Icons.forward}
            onPress={handleContinue}
            accessibilityLabel="Continue to the next step"
          />
        </View>
      </View>
    </View>
  );
}

interface CommitmentCardProps {
  label: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
  onInfoPress: () => void;
}

function CommitmentCard({ label, subtitle, selected, onPress, onInfoPress }: CommitmentCardProps) {
  const InfoIcon = Icons.info;
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
            marginBottom: Spacing.xs,
          }}
          maxFontSizeMultiplier={1.4}
        >
          {label}
        </Text>
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
      </View>
      {selected ? (
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
      ) : (
        <Pressable
          onPress={onInfoPress}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={`More about ${label}`}
          style={({ pressed }) => ({
            width: moderateScale(28),
            height: moderateScale(28),
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.5 : 1,
          })}
        >
          <InfoIcon size={moderateScale(22)} color={Colors.tertiary} strokeWidth={2} />
        </Pressable>
      )}
    </ChunkyPressable>
  );
}
