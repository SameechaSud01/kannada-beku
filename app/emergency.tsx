import { useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/fonts';
import { Spacing, Radius } from '../constants/spacing';
import { Icons } from '../constants/icons';
import { deviceTtsAudioService } from '../services/audio/deviceTtsAudioService';
import { useEmergencyPhrases } from '../hooks/useEmergencyPhrases';
import { BrandGradient } from '../components/ui/BrandGradient';
import { AudioOrb } from '../components/ui/AudioOrb';
import { LipButton } from '../components/ui/LipButton';

/**
 * Emergency phrases (chunky_v3 §5). Intentionally all-red urgency — no
 * warning-orange anywhere here. Red gradient header with a redLip lip, red lip
 * category chips, and white chunky phrase cards with a 5px left accent in the
 * group colour (gold for Auto/cab, red for In-trouble).
 */
export default function EmergencyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: groups, isLoading, isError, refetch } = useEmergencyPhrases();
  const [activeGroup, setActiveGroup] = useState(0);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const play = (id: string, text: string) => {
    setPlayingId(id);
    deviceTtsAudioService
      .play(text)
      .catch((err) => console.warn('[audio] emergency phrase failed', err))
      .finally(() => setPlayingId((cur) => (cur === id ? null : cur)));
  };

  const current = groups?.[activeGroup];

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surfaceCream }}>
      {/* Red gradient header — rounded bottom + redLip lip */}
      <BrandGradient
        style={{
          paddingTop: insets.top + Spacing.sm,
          paddingBottom: Spacing.xl,
          paddingHorizontal: Spacing.lg,
          borderBottomLeftRadius: Radius.chunky,
          borderBottomRightRadius: Radius.chunky,
          borderBottomWidth: 4,
          borderBottomColor: Colors.redLip,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(12) }}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={12}
            style={({ pressed }) => ({
              width: moderateScale(40),
              height: moderateScale(40),
              borderRadius: Radius.full,
              backgroundColor: 'rgba(255,255,255,0.18)',
              borderBottomWidth: pressed ? 0 : 3,
              borderBottomColor: 'rgba(0,0,0,0.18)',
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ translateY: pressed ? 3 : 0 }],
            })}
          >
            <Icons.back size={moderateScale(20)} color={Colors.onPrimary} />
          </Pressable>
          <Text
            style={{
              fontFamily: Fonts.baloo.extrabold,
              fontSize: moderateScale(24),
              color: Colors.onPrimary,
              letterSpacing: -0.3,
              lineHeight: moderateScale(34),
            }}
            maxFontSizeMultiplier={1.2}
          >
            Emergency phrases
          </Text>
        </View>
        <Text
          style={{
            fontFamily: Fonts.dmSans.medium,
            fontSize: moderateScale(13),
            color: 'rgba(255,255,255,0.9)',
            marginTop: Spacing.sm,
          }}
          maxFontSizeMultiplier={1.3}
        >
          Works offline · tap any card to hear it
        </Text>
      </BrandGradient>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : isError || !groups ? (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: Spacing.xxl,
            gap: Spacing.md,
          }}
        >
          <Text
            style={{
              fontFamily: Fonts.baloo.bold,
              fontSize: moderateScale(17),
              color: Colors.onSurface,
              textAlign: 'center',
            }}
          >
            Couldn&apos;t load phrases
          </Text>
          <Text
            style={{
              fontFamily: Fonts.dmSans.medium,
              fontSize: moderateScale(13),
              color: Colors.tertiary,
              textAlign: 'center',
            }}
          >
            Check your connection and try again.
          </Text>
          <LipButton label="Retry" variant="primary" onPress={() => refetch()} fullWidth={false} />
        </View>
      ) : (
        <>
          {/* Category chips — active = red pill w/ redLip lip, idle = white + hairline */}
          <View style={{ paddingTop: Spacing.lg }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: Spacing.lg, gap: Spacing.sm }}
            >
              {groups.map((group, gi) => {
                const active = gi === activeGroup;
                return (
                  <Pressable
                    key={group.id}
                    onPress={() => setActiveGroup(gi)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={group.label}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: moderateScale(6),
                      backgroundColor: active ? Colors.primaryContainer : '#ffffff',
                      borderRadius: Radius.full,
                      paddingVertical: moderateScale(9),
                      paddingHorizontal: Spacing.lg,
                      borderTopWidth: active ? 0 : 1,
                      borderLeftWidth: active ? 0 : 1,
                      borderRightWidth: active ? 0 : 1,
                      borderColor: Colors.hairline,
                      borderBottomWidth: 3,
                      borderBottomColor: active ? Colors.redLip : Colors.hairline,
                    }}
                  >
                    <GroupIcon id={group.id} color={active ? Colors.onPrimary : Colors.primary} />
                    <Text
                      style={{
                        fontFamily: Fonts.baloo.bold,
                        fontSize: moderateScale(13.5),
                        color: active ? Colors.onPrimary : Colors.onSurface,
                      }}
                      maxFontSizeMultiplier={1.2}
                    >
                      {group.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: Spacing.lg,
              paddingTop: Spacing.lg,
              paddingBottom: moderateScale(40) + insets.bottom,
              gap: moderateScale(10),
            }}
          >
            {current?.items.map((item) => {
              const accent = groupAccent(current.id);
              const caption = [item.transliteration, item.meaning].filter(Boolean).join(' · ');
              return (
                <View
                  key={item.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: Spacing.md,
                    backgroundColor: '#ffffff',
                    borderRadius: Radius.chunky,
                    paddingVertical: Spacing.lg,
                    paddingHorizontal: Spacing.lg,
                    borderWidth: 1,
                    borderColor: Colors.hairline,
                    borderLeftWidth: 5,
                    borderLeftColor: accent,
                    borderBottomWidth: 4,
                    borderBottomColor: Colors.cardLip,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    {/* Kannada hero */}
                    <Text
                      style={{
                        fontFamily: Fonts.baloo.bold,
                        fontSize: moderateScale(17),
                        lineHeight: moderateScale(25),
                        color: Colors.onSurface,
                        letterSpacing: -0.2,
                      }}
                      maxFontSizeMultiplier={1.3}
                    >
                      {item.kannada}
                    </Text>
                    {caption ? (
                      <Text
                        style={{
                          fontFamily: Fonts.dmSans.medium,
                          fontSize: moderateScale(13),
                          lineHeight: moderateScale(19),
                          color: Colors.tertiary,
                          marginTop: moderateScale(3),
                        }}
                        maxFontSizeMultiplier={1.3}
                      >
                        {caption}
                      </Text>
                    ) : null}
                  </View>
                  <AudioOrb
                    size={44}
                    playing={playingId === item.id}
                    onPress={() => play(item.id, item.audioUrl ?? item.kannada)}
                    accessibilityLabel={`Listen: ${item.meaning}`}
                  />
                </View>
              );
            })}

            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: moderateScale(12),
                color: Colors.tertiary,
                textAlign: 'center',
                marginTop: moderateScale(18),
              }}
              maxFontSizeMultiplier={1.3}
            >
              Audio uses your device&apos;s voice · romanisation pending review.
            </Text>
          </ScrollView>
        </>
      )}
    </View>
  );
}

/** Left-accent colour per group: gold for Auto/cab, red for everything else. */
function groupAccent(id: string): string {
  return id === 'auto' ? Colors.secondaryContainer : Colors.primaryContainer;
}

function GroupIcon({ id, color }: { id: string; color: string }) {
  if (id === 'auto') return <Icons.emAuto size={moderateScale(16)} color={color} />;
  if (id === 'trouble') return <Icons.emHelp size={moderateScale(16)} color={color} />;
  return <Icons.emBasic size={moderateScale(16)} color={color} />;
}
