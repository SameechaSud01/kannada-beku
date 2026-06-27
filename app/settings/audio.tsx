import { useState } from 'react';
import { View, Text, Pressable, Switch, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import * as Linking from 'expo-linking';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { useAuthStore } from '../../stores/useAuthStore';
import { useUserStore } from '../../stores/useUserStore';
import { updateAutoReplay } from '../../services/api/users';
import { deviceTtsAudioService } from '../../services/audio/deviceTtsAudioService';
import { Toasts } from '../../components/modals/instances/toastCatalog';
import { RATE_OPTIONS } from '../../constants/audio';
import { useTtsRate } from '../../hooks/useTtsRate';

const SAMPLE_KANNADA = 'ನಮಸ್ಕಾರ';

export default function AudioScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const userId = useAuthStore((s) => s.user?.id);
  const { ttsRate, changeRate } = useTtsRate();
  const autoReplay = useUserStore((s) => s.autoReplay);
  const setAutoReplay = useUserStore((s) => s.setAutoReplay);
  const [savingAutoReplay, setSavingAutoReplay] = useState(false);

  async function handleAutoReplayToggle(next: boolean) {
    if (!userId || savingAutoReplay) return;
    const previous = useUserStore.getState().autoReplay;
    setSavingAutoReplay(true);
    setAutoReplay(next);
    try {
      await updateAutoReplay(userId, next);
    } catch (err) {
      console.warn('[audio] updateAutoReplay failed', err);
      setAutoReplay(previous);
      Toasts.preferenceSaveFailed();
    } finally {
      setSavingAutoReplay(false);
    }
  }

  function handleTryIt() {
    deviceTtsAudioService.play(SAMPLE_KANNADA).catch((err) => {
      console.warn('[audio] try-it playback failed', err);
      Toasts.audioFailed(handleTryIt);
    });
  }

  function openDeviceTtsSettings() {
    Linking.openSettings().catch(() => undefined);
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <View
        style={{
          paddingTop: insets.top + Spacing.sm,
          paddingBottom: Spacing.md,
          paddingHorizontal: Spacing.xxl,
          flexDirection: 'row',
          alignItems: 'center',
          gap: moderateScale(14),
        }}
      >
        <Pressable
          onPress={() => router.replace('/(tabs)/profile')}
          accessibilityRole="button"
          accessibilityLabel="Back to profile"
          hitSlop={12}
          style={({ pressed }) => ({
            width: moderateScale(40),
            height: moderateScale(40),
            borderRadius: Radius.full,
            backgroundColor: Colors.surfaceContainerHighest,
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ scale: pressed ? 0.94 : 1 }],
          })}
        >
          <Icons.back size={20} color={Colors.primary} />
        </Pressable>
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(20),
            color: Colors.onSurface,
            letterSpacing: -0.3,
          }}
          maxFontSizeMultiplier={1.3}
        >
          Audio & pronunciation
        </Text>
      </View>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Spacing.xxl,
          paddingBottom: insets.bottom + Spacing.xxl,
          paddingTop: Spacing.md,
          gap: moderateScale(20),
        }}
      >
        <SectionHeader label="Playback" />
        <View style={{ gap: moderateScale(10) }}>
          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            {RATE_OPTIONS.map((opt) => {
              const selected = opt.value === ttsRate;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => changeRate(opt.value)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`Speed ${opt.label}`}
                  style={({ pressed }) => ({
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: moderateScale(48),
                    borderRadius: Radius.lg,
                    backgroundColor: selected
                      ? Colors.secondaryContainer
                      : Colors.surfaceContainerHighest,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  })}
                >
                  <Text
                    style={{
                      fontFamily: Fonts.dmSans.bold,
                      fontSize: moderateScale(14),
                      color: selected
                        ? Colors.onSecondaryContainer
                        : Colors.onSurface,
                    }}
                    maxFontSizeMultiplier={1.3}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Pressable
            onPress={handleTryIt}
            accessibilityRole="button"
            accessibilityLabel="Try it"
            style={({ pressed }) => ({
              alignSelf: 'flex-start',
              paddingVertical: moderateScale(10),
              paddingHorizontal: Spacing.lg,
              borderRadius: Radius.md,
              backgroundColor: pressed ? Colors.primary : Colors.primaryContainer,
              minHeight: moderateScale(40),
              justifyContent: 'center',
            })}
          >
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: moderateScale(13),
                color: Colors.onPrimary,
              }}
              maxFontSizeMultiplier={1.3}
            >
              Try it
            </Text>
          </Pressable>
        </View>

        <SectionHeader label="Auto-replay" />
        <View
          style={{
            backgroundColor: Colors.surfaceContainerLow,
            borderRadius: Radius.lg,
            paddingVertical: moderateScale(14),
            paddingHorizontal: Spacing.lg,
            flexDirection: 'row',
            alignItems: 'center',
            minHeight: moderateScale(56),
            gap: Spacing.md,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: Fonts.dmSans.medium,
                fontSize: moderateScale(14),
                color: Colors.onSurface,
              }}
              maxFontSizeMultiplier={1.3}
            >
              Auto-replay audio on lesson cards
            </Text>
            <Text
              style={{
                fontFamily: Fonts.dmSans.regular,
                fontSize: moderateScale(12),
                color: Colors.tertiary,
                marginTop: moderateScale(2),
                lineHeight: moderateScale(16),
              }}
              maxFontSizeMultiplier={1.4}
            >
              Off keeps the speaker button but skips the auto-play on mount.
            </Text>
          </View>
          <Switch
            value={autoReplay}
            onValueChange={handleAutoReplayToggle}
            disabled={savingAutoReplay}
            trackColor={{ true: Colors.primary, false: Colors.surfaceContainerHighest }}
            thumbColor={Colors.onPrimary}
            accessibilityLabel="Auto-replay audio on lesson cards"
          />
        </View>

        <SectionHeader label="Device voice" />
        <Pressable
          onPress={openDeviceTtsSettings}
          accessibilityRole="button"
          accessibilityLabel="Open device TTS settings"
          style={({ pressed }) => ({
            backgroundColor: Colors.surfaceContainerLow,
            borderRadius: Radius.lg,
            paddingVertical: moderateScale(14),
            paddingHorizontal: Spacing.lg,
            minHeight: moderateScale(56),
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text
            style={{
              fontFamily: Fonts.dmSans.medium,
              fontSize: moderateScale(14),
              color: Colors.onSurface,
            }}
            maxFontSizeMultiplier={1.3}
          >
            Open device TTS settings
          </Text>
          <Text
            style={{
              fontFamily: Fonts.dmSans.regular,
              fontSize: moderateScale(12),
              color: Colors.tertiary,
              marginTop: moderateScale(4),
              lineHeight: moderateScale(16),
            }}
            maxFontSizeMultiplier={1.4}
          >
            Install or change the Kannada (kn-IN) voice from system settings.
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <Text
      style={{
        fontFamily: Fonts.dmSans.bold,
        fontSize: moderateScale(11),
        letterSpacing: 2.5,
        color: Colors.tertiary,
        textTransform: 'uppercase',
      }}
      maxFontSizeMultiplier={1.4}
    >
      {label}
    </Text>
  );
}
