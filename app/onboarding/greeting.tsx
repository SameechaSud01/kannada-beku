import { Image, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import type { Icon as TablerIcon } from '@tabler/icons-react-native';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { MOTIVATION_OPTIONS } from '../../constants/intake';
import { LipButton } from '../../components/ui/LipButton';
import { Watermark } from '../../components/ui/Watermark';
import { useUserStore } from '../../stores/useUserStore';

const MARK_SIZE = moderateScale(96);
const MARK_LIP = moderateScale(6);

/**
 * Post-intake greeting (NEW screen, spec_onboarding_audit_fixes.md): confirms
 * the plan before the basics primer — app mark, "Namaskāra, {firstName}!", and
 * plan chips echoing the actual intake picks. No progress indicator here.
 */
export default function GreetingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // Reactive selectors — a getState() snapshot can miss late store hydration
  // and greet without the name.
  const displayName = useUserStore((s) => s.displayName);
  const motivations = useUserStore((s) => s.motivations);
  const dailyGoalMinutes = useUserStore((s) => s.dailyGoalMinutes);

  const chips: { Icon: TablerIcon; label: string }[] = [
    { Icon: Icons.clock, label: `${dailyGoalMinutes ?? 10} min / day` },
    ...motivations
      .map((m) => MOTIVATION_OPTIONS.find((o) => o.label === m))
      .filter((o): o is (typeof MOTIVATION_OPTIONS)[number] => !!o)
      .map((o) => ({ Icon: o.Icon, label: o.short })),
  ];

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surfaceCream }}>
      <Watermark motif="kolamGrid" />

      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: insets.top,
          paddingHorizontal: moderateScale(30),
        }}
      >
        {/* App mark — the real app icon in a rounded tile with a chunky lip
            (same asset as BrandSplash, so the logo is always the proper one). */}
        <View style={{ width: MARK_SIZE, height: MARK_SIZE + MARK_LIP }}>
          <View
            style={{
              position: 'absolute',
              top: MARK_LIP,
              width: MARK_SIZE,
              height: MARK_SIZE,
              borderRadius: moderateScale(26),
              backgroundColor: Colors.redLip,
            }}
          />
          <View
            style={{
              position: 'absolute',
              top: 0,
              width: MARK_SIZE,
              height: MARK_SIZE,
              borderRadius: moderateScale(26),
              overflow: 'hidden',
            }}
          >
            <Image
              source={require('../../assets/icon.png')}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
              accessible
              accessibilityRole="image"
              accessibilityLabel="Kannada Beku"
            />
          </View>
        </View>

        <Text
          style={{
            fontFamily: Fonts.baloo.extrabold,
            fontSize: moderateScale(34),
            lineHeight: moderateScale(44),
            color: Colors.onSurface,
            textAlign: 'center',
            marginTop: Spacing.xxl,
          }}
          maxFontSizeMultiplier={1.2}
        >
          {displayName ? `Namaskāra, ${displayName}!` : 'Namaskāra!'}
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.regular,
            fontSize: moderateScale(15.5),
            lineHeight: moderateScale(23),
            color: Colors.tertiary,
            textAlign: 'center',
            marginTop: moderateScale(10),
            maxWidth: moderateScale(280),
          }}
          maxFontSizeMultiplier={1.3}
        >
          Your plan is ready — built around what you picked.
        </Text>

        {/* Plan chips echo the actual intake picks. */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: moderateScale(10),
            marginTop: moderateScale(22),
          }}
        >
          {chips.map((chip) => (
            <PlanChip key={chip.label} Icon={chip.Icon} label={chip.label} />
          ))}
        </View>
      </View>

      <View
        style={{
          paddingHorizontal: Spacing.xxl,
          paddingTop: Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xxl,
        }}
      >
        <LipButton
          label="Start Kannada basics"
          icon={Icons.forward}
          onPress={() => router.push('/onboarding/basics')}
        />
      </View>
    </View>
  );
}

function PlanChip({ Icon, label }: { Icon: TablerIcon; label: string }) {
  const lip = moderateScale(3);
  // The lip is an absolute full-size copy offset down so it follows the pill's
  // curve at the chip's intrinsic width (a borderBottom would cut a flat bar
  // across a full-radius shape — see ChunkyLip's threshold note).
  return (
    <View style={{ paddingBottom: lip }}>
      <View
        style={{
          position: 'absolute',
          top: lip,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: Radius.full,
          backgroundColor: Colors.cardLip,
        }}
      />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: moderateScale(7),
          backgroundColor: '#ffffff',
          borderWidth: 1,
          borderColor: Colors.hairline,
          borderRadius: Radius.full,
          paddingHorizontal: moderateScale(15),
          paddingTop: moderateScale(8),
          paddingBottom: moderateScale(7),
        }}
      >
        <Icon size={moderateScale(15)} color={Colors.secondary} strokeWidth={2.2} />
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(13.5),
            color: Colors.onSurface,
          }}
          maxFontSizeMultiplier={1.3}
        >
          {label}
        </Text>
      </View>
    </View>
  );
}
