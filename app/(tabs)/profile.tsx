import { useEffect, useRef } from 'react';
import { View, Text, ScrollView, Pressable, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import type { Icon as TablerIcon } from '@tabler/icons-react-native';
import { useAuthStore } from '../../stores/useAuthStore';
import { useUserStore } from '../../stores/useUserStore';
import { useStreak, useWordsLearned } from '../../hooks/progress';
import { useOverallProgress } from '../../hooks/useOverallProgress';
import { useFluencyMode } from '../../hooks/useFluencyMode';
import { formatFirstName } from '../../utils/formatName';
import { useModal } from '../../components/modals/ModalHost';
import { Celebration, type CelebrationKind } from '../../components/ui/Celebration';
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

  // TEMP (Phase 3 dev trigger) — fires each Celebration kind so the overlay can
  // be verified before real triggers are wired in Phase 4 (level/streak) and
  // Phase 5 (lesson). Remove this block + its UI when those land.
  const showCelebration = (kind: CelebrationKind) => {
    modal.show({
      kind: 'takeover',
      component: Celebration,
      props: {
        kind,
        streak: 12 as const,
        level: 3,
        onClose: () => modal.dismiss(),
      },
    });
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

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(4)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
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

  const settingsItems: Array<{
    id: string;
    label: string;
    Icon: TablerIcon;
    onPress: () => void;
  }> = [
    {
      id: 'reminders',
      label: 'Reminders',
      Icon: Icons.setReminders,
      onPress: () =>
        modal.show({
          kind: 'sheet',
          component: RemindersSheet,
        }),
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
    <Animated.View
      style={{
        flex: 1,
        backgroundColor: Colors.surface,
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      {/* APP BAR — centred wordmark, streak right (no hamburger) */}
      <View
        style={{
          paddingTop: insets.top + Spacing.sm,
          paddingBottom: Spacing.md,
          paddingHorizontal: Spacing.xxl,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ width: moderateScale(56) }} />
        <Text
          style={{
            fontFamily: Fonts.notoSansKannada.bold,
            fontSize: moderateScale(22),
            color: Colors.primary,
            letterSpacing: -0.3,
            lineHeight: moderateScale(36),
            paddingTop: Spacing.xs,
          }}
          maxFontSizeMultiplier={1.2}
        >
          ಕನ್ನಡ ಬೇಕು
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: moderateScale(6),
            minWidth: moderateScale(56),
            justifyContent: 'flex-end',
          }}
          accessibilityRole="text"
          accessibilityLabel={`Current streak: ${streak} day${streak === 1 ? '' : 's'}`}
        >
          <Icons.streak size={20} color={Colors.primary} />
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: moderateScale(16),
              color: Colors.onSurface,
            }}
            maxFontSizeMultiplier={1.3}
          >
            {streak}
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: moderateScale(40) + insets.bottom }}
      >
        {/* Avatar + name */}
        <View style={{ alignItems: 'center', paddingTop: Spacing.lg, marginBottom: moderateScale(28) }}>
          <View
            style={{
              width: moderateScale(96),
              height: moderateScale(96),
              borderRadius: Radius.full,
              backgroundColor: Colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: Spacing.md,
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: moderateScale(36),
                color: Colors.onPrimary,
              }}
              maxFontSizeMultiplier={1.2}
            >
              {userName[0]?.toUpperCase()}
            </Text>
          </View>
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: moderateScale(22),
              color: Colors.onSurface,
              letterSpacing: -0.3,
            }}
            maxFontSizeMultiplier={1.3}
          >
            {userName}
          </Text>
        </View>

        {/* Overall progress band — reads user_overall_progress (PR3) */}
        <View style={{ paddingHorizontal: Spacing.xxl, marginBottom: moderateScale(20) }}>
          <View
            style={{
              backgroundColor: Colors.surfaceContainerLow,
              borderRadius: Radius.lg,
              padding: moderateScale(18),
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: Spacing.sm,
              }}
            >
              <Text
                style={{
                  fontFamily: Fonts.dmSans.bold,
                  fontSize: moderateScale(10),
                  letterSpacing: 1.8,
                  color: Colors.tertiary,
                  textTransform: 'uppercase',
                }}
                maxFontSizeMultiplier={1.4}
              >
                Overall progress
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.dmSans.bold,
                  fontSize: moderateScale(20),
                  color: Colors.onSurface,
                }}
                maxFontSizeMultiplier={1.3}
              >
                {overall.isLoading ? '—' : `${overallPct}%`}
              </Text>
            </View>
            <View
              style={{
                height: moderateScale(8),
                backgroundColor: Colors.surfaceContainerHighest,
                borderRadius: Radius.full,
                overflow: 'hidden',
              }}
              accessibilityRole="progressbar"
              accessibilityLabel={`Overall progress: ${overallPct} percent`}
            >
              <View
                style={{
                  height: '100%',
                  width: `${overallPct}%`,
                  backgroundColor: Colors.primary,
                  borderRadius: Radius.full,
                }}
              />
            </View>
            <Text
              style={{
                fontFamily: Fonts.dmSans.regular,
                fontSize: moderateScale(11),
                color: Colors.tertiary,
                marginTop: Spacing.sm,
              }}
              maxFontSizeMultiplier={1.3}
            >
              Lessons + games combined
            </Text>
          </View>
        </View>

        {/* Two stat cards — container-low */}
        <View style={{ paddingHorizontal: Spacing.xxl, marginBottom: moderateScale(28) }}>
          <View style={{ flexDirection: 'row', gap: Spacing.md }}>
            <View
              style={{
                flex: 1,
                backgroundColor: Colors.surfaceContainerLow,
                borderRadius: Radius.lg,
                padding: moderateScale(18),
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: Spacing.sm,
                  marginBottom: Spacing.md,
                }}
              >
                <Icons.streak size={20} color={Colors.primary} />
              </View>
              <Text
                style={{
                  fontFamily: Fonts.dmSans.bold,
                  fontSize: moderateScale(28),
                  color: Colors.onSurface,
                  lineHeight: moderateScale(32),
                }}
                maxFontSizeMultiplier={1.3}
              >
                {streak}
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.dmSans.bold,
                  fontSize: moderateScale(10),
                  letterSpacing: 1.8,
                  color: Colors.tertiary,
                  textTransform: 'uppercase',
                  marginTop: Spacing.xs,
                }}
                maxFontSizeMultiplier={1.4}
              >
                Day streak
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: Colors.surfaceContainerLow,
                borderRadius: Radius.lg,
                padding: moderateScale(18),
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: Spacing.sm,
                  marginBottom: Spacing.md,
                }}
              >
                <Icons.tabLearn size={20} color={Colors.secondary} />
              </View>
              <Text
                style={{
                  fontFamily: Fonts.dmSans.bold,
                  fontSize: moderateScale(28),
                  color: Colors.onSurface,
                  lineHeight: moderateScale(32),
                }}
                maxFontSizeMultiplier={1.3}
              >
                {wordsLearned}
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.dmSans.bold,
                  fontSize: moderateScale(10),
                  letterSpacing: 1.8,
                  color: Colors.tertiary,
                  textTransform: 'uppercase',
                  marginTop: Spacing.xs,
                }}
                maxFontSizeMultiplier={1.4}
              >
                Words learned
              </Text>
            </View>
          </View>
        </View>

        {/* Goal toggle hidden — only "spoken" ships today. The row below opens
            a sheet with the onboarding answers (read-only for now). */}
        {hasOnboardingSummary ? (
          <View style={{ paddingHorizontal: Spacing.xxl, marginBottom: moderateScale(28) }}>
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: moderateScale(11),
                letterSpacing: 2.5,
                color: Colors.tertiary,
                textTransform: 'uppercase',
                marginBottom: Spacing.md,
              }}
              maxFontSizeMultiplier={1.4}
            >
              Your goal
            </Text>
            <Pressable
              onPress={() =>
                modal.show({
                  kind: 'sheet',
                  component: GoalSummarySheet,
                })
              }
              accessibilityRole="button"
              accessibilityLabel={`Your goal — ${goalLabel ?? 'view details'}`}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: Colors.surfaceContainerLow,
                borderRadius: Radius.lg,
                paddingVertical: moderateScale(14),
                paddingHorizontal: Spacing.lg,
                minHeight: moderateScale(56),
                gap: Spacing.md,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: Fonts.dmSans.bold,
                    fontSize: moderateScale(14),
                    color: Colors.onSurface,
                  }}
                  maxFontSizeMultiplier={1.3}
                >
                  {goalLabel ?? 'View your goal'}
                </Text>
                {dailyGoalLabel ? (
                  <Text
                    style={{
                      fontFamily: Fonts.dmSans.regular,
                      fontSize: moderateScale(12),
                      color: Colors.tertiary,
                      marginTop: moderateScale(2),
                    }}
                    maxFontSizeMultiplier={1.3}
                  >
                    {dailyGoalLabel}
                    {motivations.length ? ` · ${motivations.length} reason${motivations.length === 1 ? '' : 's'}` : ''}
                  </Text>
                ) : motivations.length ? (
                  <Text
                    style={{
                      fontFamily: Fonts.dmSans.regular,
                      fontSize: moderateScale(12),
                      color: Colors.tertiary,
                      marginTop: moderateScale(2),
                    }}
                    maxFontSizeMultiplier={1.3}
                  >
                    {`${motivations.length} reason${motivations.length === 1 ? '' : 's'}`}
                  </Text>
                ) : null}
              </View>
              <Icons.forward size={18} color={Colors.tertiary} />
            </Pressable>
          </View>
        ) : null}

        {/* Settings list — ghost-border inset shadow separates rows (§2 No-Line) */}
        <View style={{ paddingHorizontal: Spacing.xxl, marginBottom: moderateScale(28) }}>
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: moderateScale(11),
              letterSpacing: 2.5,
              color: Colors.tertiary,
              textTransform: 'uppercase',
              marginBottom: Spacing.md,
            }}
            maxFontSizeMultiplier={1.4}
          >
            Settings
          </Text>
          <View
            style={{
              backgroundColor: Colors.surfaceContainerLow,
              borderRadius: Radius.lg,
              overflow: 'hidden',
            }}
          >
            {settingsItems.map((item, idx) => (
              <Pressable
                key={item.id}
                onPress={item.onPress}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: moderateScale(14),
                  paddingHorizontal: Spacing.lg,
                  gap: moderateScale(14),
                  minHeight: moderateScale(56),
                  // Tonal step on every other row substitutes for borders.
                  backgroundColor:
                    idx % 2 === 0
                      ? Colors.surfaceContainerLow
                      : Colors.surfaceContainerHigh,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <item.Icon size={20} color={Colors.primary} />
                <Text
                  style={{
                    flex: 1,
                    fontFamily: Fonts.dmSans.medium,
                    fontSize: moderateScale(14),
                    color: Colors.onSurface,
                  }}
                  maxFontSizeMultiplier={1.3}
                >
                  {item.label}
                </Text>
                <Icons.forward size={18} color={Colors.tertiary} />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Sign out */}
        <View style={{ paddingHorizontal: Spacing.xxl }}>
          <Pressable
            onPress={handleSignOutPress}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
            style={({ pressed }) => ({
              paddingVertical: moderateScale(14),
              alignItems: 'center',
              minHeight: moderateScale(44),
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Text
              style={{
                fontFamily: Fonts.dmSans.medium,
                fontSize: moderateScale(14),
                color: Colors.primary,
              }}
              maxFontSizeMultiplier={1.3}
            >
              Sign out
            </Text>
          </Pressable>
        </View>

        {/* TEMP (Phase 3 dev trigger) — remove with the showCelebration helper. */}
        <View style={{ paddingHorizontal: Spacing.xxl, marginTop: moderateScale(28), gap: Spacing.sm }}>
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: moderateScale(11),
              letterSpacing: 2.5,
              color: Colors.tertiary,
              textTransform: 'uppercase',
            }}
          >
            Dev · celebration preview
          </Text>
          {(['lesson', 'streak', 'level'] as const).map((k) => (
            <Pressable
              key={k}
              onPress={() => showCelebration(k)}
              style={({ pressed }) => ({
                paddingVertical: moderateScale(12),
                paddingHorizontal: Spacing.lg,
                borderRadius: Radius.lg,
                backgroundColor: Colors.surfaceContainerHigh,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text style={{ fontFamily: Fonts.dmSans.medium, fontSize: moderateScale(13), color: Colors.onSurface }}>
                Celebrate: {k}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </Animated.View>
  );
}

