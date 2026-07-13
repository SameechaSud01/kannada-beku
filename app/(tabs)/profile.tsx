import { useEffect, useRef } from 'react';
import { logger } from '../../lib/logger';
import { View, Text, ScrollView, Pressable, Animated as RNAnimated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
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
import {
  useWordsLearned,
  useCompletedLessons,
  useMinutesPracticed,
  useWeekActivity,
  type WeekDay,
} from '../../hooks/progress';
import { useStreakCelebration } from '../../hooks/useStreakCelebration';
import { useOverallMastery } from '../../hooks/useOverallMastery';
import { useFluencyMode } from '../../hooks/useFluencyMode';
import { formatFirstName } from '../../utils/formatName';
import { useModal } from '../../components/modals/ModalHost';
import { Watermark } from '../../components/ui/Watermark';
import { TopBar } from '../../components/ui/TopBar';
import { TAB_BAR_CLEARANCE } from '../../components/ui/TabBar';
import { LipButton } from '../../components/ui/LipButton';
import { ChunkyPressable } from '../../components/ui/ChunkyPressable';
import { Toasts } from '../../components/modals/instances/toastCatalog';
import { SignOutDialog } from '../../components/modals/instances/SignOutDialog';
import { RemindersSheet } from '../../components/modals/instances/RemindersSheet';
import { GoalSummarySheet } from '../../components/modals/instances/GoalSummarySheet';

const appVersion = Constants.expoConfig?.version ?? '1.0.0';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { streak, onStreakPress } = useStreakCelebration();
  const wordsLearned = useWordsLearned();
  const lessonsDone = useCompletedLessons().length;
  const minutesPracticed = useMinutesPracticed();
  const weekActivity = useWeekActivity();
  const overall = useOverallMastery();
  const overallPct = Math.max(0, Math.min(100, Math.round(overall.progressPct)));
  const user = useAuthStore((s) => s.user);
  const displayName = useUserStore((s) => s.displayName);
  const motivations = useUserStore((s) => s.motivations);
  const dailyGoalMinutes = useUserStore((s) => s.dailyGoalMinutes);
  const goal = useFluencyMode();
  const modal = useModal();

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
            logger.warn('auth', 'signOut failed', { err });
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

  const joinedLabel = formatJoined(user?.created_at);

  const goalLabel =
    goal === 'spoken' ? 'Spoken only' : goal === 'fluency' ? 'Complete fluency' : null;
  const dailyGoalLabel = dailyGoalMinutes ? `${dailyGoalMinutes} min / day` : null;
  const hasOnboardingSummary = !!(goalLabel || dailyGoalLabel || motivations.length);
  const goalSub = [
    dailyGoalLabel,
    motivations.length
      ? `${motivations.length} reason${motivations.length === 1 ? '' : 's'}`
      : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const settingsItems: { id: string; label: string; Icon: TablerIcon; onPress: () => void }[] = [
    {
      id: 'reminders',
      label: 'Reminders',
      Icon: Icons.setReminders,
      onPress: () =>
        modal.show({ kind: 'sheet', component: RemindersSheet, disableContentPanning: true }),
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
        backgroundColor: Colors.surfaceCream,
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <Watermark motif="kolamGrid" />

      <TopBar streak={streak} onStreakPress={onStreakPress} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: TAB_BAR_CLEARANCE + insets.bottom }}
      >
        {/* Name block */}
        <View
          style={{
            paddingHorizontal: Spacing.lg,
            paddingTop: Spacing.xl,
            marginBottom: moderateScale(18),
          }}
        >
          <Text
            style={{
              fontFamily: Fonts.baloo.extrabold,
              fontSize: moderateScale(30),
              color: Colors.onSurface,
              letterSpacing: -0.5,
            }}
            maxFontSizeMultiplier={1.2}
            numberOfLines={1}
          >
            {userName}
          </Text>
          {joinedLabel ? (
            <Text
              style={{
                fontFamily: Fonts.dmSans.medium,
                fontSize: moderateScale(13),
                color: Colors.tertiary,
                marginTop: moderateScale(2),
              }}
              maxFontSizeMultiplier={1.3}
            >
              Learning since {joinedLabel}
            </Text>
          ) : null}
        </View>

        {/* Overall progress band — gold gradient, red bar */}
        <View style={{ paddingHorizontal: Spacing.lg, marginBottom: moderateScale(11) }}>
          <LinearGradient
            colors={[Colors.goldBright, Colors.secondaryContainer]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: Radius.chunky,
              borderBottomWidth: 5,
              borderBottomColor: Colors.goldLip,
              padding: moderateScale(18),
            }}
          >
            <View
              accessibilityRole="progressbar"
              accessibilityLabel={`Overall progress: ${overallPct} percent. Lessons and games combined.`}
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
                  style={{
                    fontFamily: Fonts.baloo.extrabold,
                    fontSize: moderateScale(22),
                    color: Colors.onSecondaryContainer,
                    fontVariant: ['tabular-nums'],
                  }}
                  maxFontSizeMultiplier={1.3}
                >
                  {overall.isLoading ? '—' : `${overallPct}%`}
                </Text>
              </View>
              <View
                style={{
                  height: moderateScale(9),
                  backgroundColor: 'rgba(108,80,0,0.22)',
                  borderRadius: Radius.full,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    height: '100%',
                    width: `${overallPct}%`,
                    backgroundColor: Colors.primaryContainer,
                    borderRadius: Radius.full,
                  }}
                />
              </View>
              <Text
                style={{
                  fontFamily: Fonts.dmSans.medium,
                  fontSize: moderateScale(12),
                  color: Colors.onSecondaryContainer,
                  marginTop: Spacing.sm,
                }}
                maxFontSizeMultiplier={1.3}
              >
                Lessons + games combined
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Three stat cards */}
        <View style={{ paddingHorizontal: Spacing.lg, marginBottom: moderateScale(28) }}>
          <View style={{ flexDirection: 'row', gap: moderateScale(11) }}>
            <StatCard
              Icon={Icons.lessonDone}
              iconColor={Colors.primaryContainer}
              value={lessonsDone}
              label="Lessons done"
            />
            <StatCard
              Icon={Icons.tabLearn}
              iconColor={Colors.secondary}
              value={wordsLearned}
              label="Words learned"
            />
            <StatCard
              Icon={Icons.clock}
              iconColor={Colors.secondary}
              value={minutesPracticed}
              label="Minutes"
            />
          </View>
        </View>

        {/* This week — activity strip */}
        <View style={{ paddingHorizontal: Spacing.lg, marginBottom: moderateScale(28) }}>
          <SectionLabel>This week</SectionLabel>
          <WeekStrip days={weekActivity} />
        </View>

        {/* Your goal */}
        {hasOnboardingSummary ? (
          <View style={{ paddingHorizontal: Spacing.lg, marginBottom: moderateScale(28) }}>
            <SectionLabel>Your goal</SectionLabel>
            <ChunkyPressable
              onPress={() => modal.show({ kind: 'sheet', component: GoalSummarySheet })}
              accessibilityLabel={`Your goal — ${goalLabel ?? 'view details'}`}
              bg="#ffffff"
              lip={4}
              border
              radius={Radius.chunky}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: Spacing.md,
                paddingVertical: moderateScale(14),
                paddingHorizontal: Spacing.lg,
                minHeight: moderateScale(56),
              }}
            >
              <View
                style={{
                  width: moderateScale(40),
                  height: moderateScale(40),
                  borderRadius: Radius.tile,
                  backgroundColor: Colors.secondaryFixed,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icons.tabPractice size={moderateScale(20)} color={Colors.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: Fonts.baloo.bold,
                    fontSize: moderateScale(16),
                    color: Colors.onSurface,
                    letterSpacing: -0.2,
                  }}
                  maxFontSizeMultiplier={1.3}
                >
                  {goalLabel ?? 'View your goal'}
                </Text>
                {goalSub ? (
                  <Text
                    style={{
                      fontFamily: Fonts.dmSans.medium,
                      fontSize: moderateScale(12.5),
                      color: Colors.tertiary,
                      marginTop: moderateScale(1),
                    }}
                    maxFontSizeMultiplier={1.3}
                  >
                    {goalSub}
                  </Text>
                ) : null}
              </View>
              <Icons.forward size={moderateScale(17)} color={Colors.textFaint} />
            </ChunkyPressable>
          </View>
        ) : null}

        {/* Settings list — single white card, hairline-separated rows */}
        <View style={{ paddingHorizontal: Spacing.lg, marginBottom: moderateScale(24) }}>
          <SectionLabel>Settings</SectionLabel>
          <View
            style={{
              borderRadius: Radius.chunky,
              overflow: 'hidden',
              backgroundColor: '#ffffff',
              borderWidth: 1,
              borderColor: Colors.hairline,
              borderBottomWidth: 4,
              borderBottomColor: Colors.cardLip,
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
                  gap: moderateScale(13),
                  paddingVertical: moderateScale(14),
                  paddingHorizontal: Spacing.lg,
                  minHeight: moderateScale(56),
                  borderTopWidth: idx === 0 ? 0 : 1,
                  borderTopColor: Colors.hairline,
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <item.Icon
                  size={moderateScale(20)}
                  color={Colors.primaryContainer}
                  strokeWidth={2.1}
                />
                <Text
                  style={{
                    flex: 1,
                    fontFamily: Fonts.dmSans.bold,
                    fontSize: moderateScale(14.5),
                    color: Colors.onSurface,
                  }}
                  maxFontSizeMultiplier={1.3}
                >
                  {item.label}
                </Text>
                <Icons.forward size={moderateScale(17)} color={Colors.textFaint} />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Sign out — secondary (tan) button */}
        <View style={{ paddingHorizontal: Spacing.lg }}>
          <LipButton label="Sign out" variant="secondary" onPress={handleSignOutPress} />
        </View>

        {/* App version */}
        <Text
          style={{
            fontFamily: Fonts.dmSans.medium,
            fontSize: moderateScale(11.5),
            color: Colors.textFaint,
            textAlign: 'center',
            marginTop: moderateScale(16),
          }}
          maxFontSizeMultiplier={1.3}
        >
          Version {appVersion}
        </Text>
      </ScrollView>
    </RNAnimated.View>
  );
}

/** Formats a Supabase ISO created_at into "Mon YYYY"; returns null if absent/invalid. */
function formatJoined(createdAt?: string): string | null {
  if (!createdAt) return null;
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}

function SectionLabel({ children }: { children: string }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: moderateScale(7),
        marginBottom: Spacing.md,
      }}
    >
      <View
        style={{
          width: moderateScale(4),
          height: moderateScale(13),
          borderRadius: 2,
          backgroundColor: Colors.secondary,
        }}
      />
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

function WeekStrip({ days }: { days: WeekDay[] }) {
  const activeCount = days.filter((d) => d.active).length;
  return (
    <View
      accessibilityRole="summary"
      accessibilityLabel={`This week: active on ${activeCount} of 7 days`}
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        borderRadius: Radius.chunky,
        paddingVertical: moderateScale(14),
        paddingHorizontal: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.hairline,
        borderBottomWidth: 4,
        borderBottomColor: Colors.cardLip,
      }}
    >
      {days.map((d) => (
        <View key={d.iso} style={{ alignItems: 'center', gap: moderateScale(7) }}>
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: moderateScale(10.5),
              letterSpacing: 0.5,
              color: d.isToday ? Colors.onSurface : Colors.textFaint,
              textTransform: 'uppercase',
            }}
            maxFontSizeMultiplier={1.3}
          >
            {d.label}
          </Text>
          <View
            style={{
              width: moderateScale(26),
              height: moderateScale(26),
              borderRadius: Radius.full,
              backgroundColor: d.active ? Colors.secondaryFixed : 'transparent',
              borderWidth: d.active ? 0 : 1.5,
              borderColor: d.isToday ? Colors.secondary : Colors.hairline,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {d.active ? (
              <Icons.check size={moderateScale(14)} color={Colors.secondary} strokeWidth={3} />
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}

function StatCard({
  Icon,
  iconColor,
  value,
  label,
}: {
  Icon: TablerIcon;
  iconColor: string;
  value: number;
  label: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#ffffff',
        borderRadius: Radius.chunky,
        padding: moderateScale(16),
        borderWidth: 1,
        borderColor: Colors.hairline,
        borderBottomWidth: 4,
        borderBottomColor: Colors.cardLip,
      }}
    >
      <Icon size={moderateScale(20)} color={iconColor} />
      <Text
        style={{
          fontFamily: Fonts.baloo.extrabold,
          fontSize: moderateScale(28),
          color: Colors.onSurface,
          letterSpacing: -0.8,
          marginTop: moderateScale(6),
          lineHeight: moderateScale(38),
          fontVariant: ['tabular-nums'],
        }}
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
