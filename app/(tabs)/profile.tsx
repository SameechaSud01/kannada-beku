import { useEffect, useRef } from 'react';
import { View, Text, ScrollView, Pressable, Animated as RNAnimated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Shadows } from '../../constants/shadows';
import { Icons } from '../../constants/icons';
import type { Icon as TablerIcon } from '@tabler/icons-react-native';
import { useAuthStore } from '../../stores/useAuthStore';
import { useUserStore } from '../../stores/useUserStore';
import { useStreak, useWordsLearned } from '../../hooks/progress';
import { useOverallProgress } from '../../hooks/useOverallProgress';
import { useFluencyMode } from '../../hooks/useFluencyMode';
import { formatFirstName } from '../../utils/formatName';
import { useModal } from '../../components/modals/ModalHost';
import { Celebration } from '../../components/ui/Celebration';
import { isStreakMilestone } from '../../components/modals/instances/StreakMilestoneTakeover';
import { BrandGradient } from '../../components/ui/BrandGradient';
import { Watermark } from '../../components/ui/Watermark';
import { StreakPill } from '../../components/ui/StreakPill';
import { Toasts } from '../../components/modals/instances/toastCatalog';
import { SignOutDialog } from '../../components/modals/instances/SignOutDialog';
import { RemindersSheet } from '../../components/modals/instances/RemindersSheet';
import { GoalSummarySheet } from '../../components/modals/instances/GoalSummarySheet';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const streak = useStreak();
  const wordsLearned = useWordsLearned();
  const overall = useOverallProgress();
  const overallPct = Math.max(0, Math.min(100, Math.round(overall.data?.progressPct ?? 0)));
  const user = useAuthStore((s) => s.user);
  const displayName = useUserStore((s) => s.displayName);
  const motivations = useUserStore((s) => s.motivations);
  const dailyGoalMinutes = useUserStore((s) => s.dailyGoalMinutes);
  const goal = useFluencyMode();
  const modal = useModal();

  // Streak pill → flame wiggle; replays the streak Celebration only on a real
  // milestone day (locked milestone copy — no fake milestones).
  const handleStreakPress = () => {
    if (isStreakMilestone(streak)) {
      modal.show({
        kind: 'takeover',
        component: Celebration,
        props: { kind: 'streak', streak, onClose: () => modal.dismiss() },
      });
    }
  };

  const handleSignOutPress = () => {
    modal.show({
      kind: 'dialog',
      component: SignOutDialog,
      props: {
        onConfirm: async () => {
          modal.dismiss();
          try {
            await useAuthStore.getState().signOut();
            Toasts.signedOut();
          } catch (err) {
            console.warn('[auth] signOut failed', err);
          }
        },
        onCancel: () => modal.dismiss(),
      },
      blockBackdropDismiss: true,
      blockHardwareBack: true,
    });
  };

  const fadeAnim = useRef(new RNAnimated.Value(0)).current;
  const slideAnim = useRef(new RNAnimated.Value(4)).current;

  useEffect(() => {
    RNAnimated.parallel([
      RNAnimated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      RNAnimated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, []);

  const rawName =
    displayName ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Learner';
  const userName = formatFirstName(rawName, 'Learner');

  const goalLabel = goal === 'spoken' ? 'Spoken only' : goal === 'fluency' ? 'Complete fluency' : null;
  const dailyGoalLabel = dailyGoalMinutes ? `${dailyGoalMinutes} min / day` : null;
  const hasOnboardingSummary = !!(goalLabel || dailyGoalLabel || motivations.length);
  const goalSub = [dailyGoalLabel, motivations.length ? `${motivations.length} reason${motivations.length === 1 ? '' : 's'}` : null]
    .filter(Boolean)
    .join(' · ');

  const settingsItems: Array<{ id: string; label: string; Icon: TablerIcon; onPress: () => void }> = [
    {
      id: 'reminders',
      label: 'Reminders',
      Icon: Icons.setReminders,
      onPress: () => modal.show({ kind: 'sheet', component: RemindersSheet }),
    },
    {
      id: 'audio',
      label: 'Audio & pronunciation',
      Icon: Icons.setAudio,
      onPress: () => router.push('/settings/audio'),
    },
    {
      id: 'help',
      label: 'Help & feedback',
      Icon: Icons.setHelp,
      onPress: () => router.push('/settings/help'),
    },
  ];

  return (
    <RNAnimated.View
      style={{
        flex: 1,
        backgroundColor: Colors.surface,
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <Watermark motif="rangoli" />

      {/* Top bar — wordmark + streak pill + hairline */}
      <View
        style={{
          paddingTop: insets.top + Spacing.sm,
          paddingBottom: Spacing.sm,
          paddingHorizontal: Spacing.lg,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottomWidth: 1,
          borderBottomColor: Colors.hairline,
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.notoSansKannada.bold,
            fontSize: moderateScale(22),
            color: Colors.primary,
            letterSpacing: -0.3,
            lineHeight: moderateScale(34),
          }}
          maxFontSizeMultiplier={1.2}
        >
          ಕನ್ನಡ ಬೇಕು
        </Text>
        <StreakPill streak={streak} onPress={handleStreakPress} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: moderateScale(40) + insets.bottom }}
      >
        {/* Avatar + name */}
        <View style={{ alignItems: 'center', paddingTop: Spacing.xxl, marginBottom: moderateScale(20) }}>
          <View
            style={{
              width: moderateScale(84),
              height: moderateScale(84),
              borderRadius: Radius.full,
              marginBottom: Spacing.md,
              ...Shadows.tabActive,
            }}
          >
            <BrandGradient
              style={{
                width: '100%',
                height: '100%',
                borderRadius: Radius.full,
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <Text
                style={{ fontFamily: Fonts.baloo.extrabold, fontSize: moderateScale(36), color: Colors.onPrimary }}
                maxFontSizeMultiplier={1.2}
              >
                {userName[0]?.toUpperCase()}
              </Text>
            </BrandGradient>
          </View>
          <Text
            style={{ fontFamily: Fonts.baloo.extrabold, fontSize: moderateScale(24), color: Colors.onSurface, letterSpacing: -0.3 }}
            maxFontSizeMultiplier={1.3}
          >
            {userName}
          </Text>
        </View>

        {/* Overall progress band — gold-wash */}
        <View style={{ paddingHorizontal: Spacing.lg, marginBottom: moderateScale(11) }}>
          <View
            style={{ backgroundColor: Colors.secondaryFixed, borderRadius: Radius.xl, padding: moderateScale(18) }}
            accessibilityRole="progressbar"
            accessibilityLabel={`Overall progress: ${overallPct} percent. Lessons and games combined.`}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: Spacing.sm }}>
              <Text
                style={{
                  fontFamily: Fonts.dmSans.bold,
                  fontSize: moderateScale(11),
                  letterSpacing: 1.4,
                  color: Colors.onSecondaryContainer,
                  textTransform: 'uppercase',
                }}
                maxFontSizeMultiplier={1.4}
              >
                Overall progress
              </Text>
              <Text
                style={{ fontFamily: Fonts.baloo.extrabold, fontSize: moderateScale(22), color: Colors.onSurface }}
                maxFontSizeMultiplier={1.3}
              >
                {overall.isLoading ? '—' : `${overallPct}%`}
              </Text>
            </View>
            <View
              style={{ height: moderateScale(9), backgroundColor: Colors.surfaceContainerHighest, borderRadius: Radius.full, overflow: 'hidden' }}
            >
              <View style={{ height: '100%', width: `${overallPct}%`, backgroundColor: Colors.goldLip, borderRadius: Radius.full }} />
            </View>
            <Text
              style={{ fontFamily: Fonts.dmSans.medium, fontSize: moderateScale(12), color: Colors.onSecondaryContainer, marginTop: Spacing.sm }}
              maxFontSizeMultiplier={1.3}
            >
              Lessons + games combined
            </Text>
          </View>
        </View>

        {/* Two stat cards */}
        <View style={{ paddingHorizontal: Spacing.lg, marginBottom: moderateScale(28) }}>
          <View style={{ flexDirection: 'row', gap: moderateScale(11) }}>
            <StatCard Icon={Icons.streak} iconColor={Colors.primary} value={streak} label="Day streak" />
            <StatCard Icon={Icons.tabLearn} iconColor={Colors.secondary} value={wordsLearned} label="Words learned" />
          </View>
        </View>

        {/* Your goal */}
        {hasOnboardingSummary ? (
          <View style={{ paddingHorizontal: Spacing.lg, marginBottom: moderateScale(28) }}>
            <SectionLabel>Your goal</SectionLabel>
            <Pressable
              onPress={() => modal.show({ kind: 'sheet', component: GoalSummarySheet })}
              accessibilityRole="button"
              accessibilityLabel={`Your goal — ${goalLabel ?? 'view details'}`}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: Spacing.md,
                backgroundColor: Colors.surfaceContainerLowest,
                borderRadius: Radius.lg,
                paddingVertical: moderateScale(14),
                paddingHorizontal: Spacing.lg,
                minHeight: moderateScale(56),
                borderWidth: 1,
                borderColor: Colors.hairline,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <View
                style={{
                  width: moderateScale(40),
                  height: moderateScale(40),
                  borderRadius: moderateScale(12),
                  backgroundColor: Colors.surfaceContainerHigh,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icons.tabPractice size={moderateScale(20)} color={Colors.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontFamily: Fonts.baloo.bold, fontSize: moderateScale(16), color: Colors.onSurface, letterSpacing: -0.2 }}
                  maxFontSizeMultiplier={1.3}
                >
                  {goalLabel ?? 'View your goal'}
                </Text>
                {goalSub ? (
                  <Text
                    style={{ fontFamily: Fonts.dmSans.medium, fontSize: moderateScale(12.5), color: Colors.tertiary, marginTop: moderateScale(1) }}
                    maxFontSizeMultiplier={1.3}
                  >
                    {goalSub}
                  </Text>
                ) : null}
              </View>
              <Icons.forward size={moderateScale(17)} color={Colors.textFaint} />
            </Pressable>
          </View>
        ) : null}

        {/* Settings list — alternating tonal rows */}
        <View style={{ paddingHorizontal: Spacing.lg, marginBottom: moderateScale(20) }}>
          <SectionLabel>Settings</SectionLabel>
          <View style={{ borderRadius: Radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: Colors.hairline }}>
            {settingsItems.map((item, idx) => (
              <Pressable
                key={item.id}
                onPress={item.onPress}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: moderateScale(13),
                  paddingVertical: moderateScale(14),
                  paddingHorizontal: Spacing.lg,
                  minHeight: moderateScale(56),
                  backgroundColor: idx % 2 === 0 ? Colors.surfaceContainerLowest : Colors.surfaceContainerLow,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <item.Icon size={moderateScale(20)} color={Colors.primary} strokeWidth={2.1} />
                <Text
                  style={{ flex: 1, fontFamily: Fonts.dmSans.bold, fontSize: moderateScale(14.5), color: Colors.onSurface }}
                  maxFontSizeMultiplier={1.3}
                >
                  {item.label}
                </Text>
                <Icons.forward size={moderateScale(17)} color={Colors.textFaint} />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Sign out */}
        <View style={{ paddingHorizontal: Spacing.lg }}>
          <Pressable
            onPress={handleSignOutPress}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
            style={({ pressed }) => ({ paddingVertical: moderateScale(14), alignItems: 'center', minHeight: moderateScale(44), opacity: pressed ? 0.6 : 1 })}
          >
            <Text
              style={{ fontFamily: Fonts.baloo.bold, fontSize: moderateScale(14), color: Colors.primary }}
              maxFontSizeMultiplier={1.3}
            >
              Sign out
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </RNAnimated.View>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(7), marginBottom: Spacing.md }}>
      <View style={{ width: moderateScale(4), height: moderateScale(13), borderRadius: 2, backgroundColor: Colors.secondary }} />
      <Text
        style={{
          fontFamily: Fonts.dmSans.bold,
          fontSize: moderateScale(11),
          letterSpacing: 1.4,
          color: Colors.tertiary,
          textTransform: 'uppercase',
        }}
        maxFontSizeMultiplier={1.4}
      >
        {children}
      </Text>
    </View>
  );
}

function StatCard({ Icon, iconColor, value, label }: { Icon: TablerIcon; iconColor: string; value: number; label: string }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.surfaceContainerLowest,
        borderRadius: Radius.xl,
        padding: moderateScale(16),
        borderWidth: 1,
        borderColor: Colors.hairline,
      }}
    >
      <Icon size={moderateScale(20)} color={iconColor} />
      <Text
        style={{ fontFamily: Fonts.baloo.extrabold, fontSize: moderateScale(30), color: Colors.onSurface, letterSpacing: -0.8, marginTop: moderateScale(6), lineHeight: moderateScale(40) }}
        maxFontSizeMultiplier={1.2}
        numberOfLines={1}
      >
        {value}
      </Text>
      <Text
        style={{
          fontFamily: Fonts.dmSans.bold,
          fontSize: moderateScale(10.5),
          letterSpacing: 1.2,
          color: Colors.textFaint,
          textTransform: 'uppercase',
          marginTop: moderateScale(5),
        }}
        maxFontSizeMultiplier={1.4}
      >
        {label}
      </Text>
    </View>
  );
}

