import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/fonts';
import { Spacing, Radius } from '../constants/spacing';
import { Icons } from '../constants/icons';
import { deviceTtsAudioService } from '../services/audio/deviceTtsAudioService';
import { useEmergencyPhrases } from '../hooks/useEmergencyPhrases';
import { Toasts } from '../components/modals/instances/toastCatalog';
import { BrandGradient } from '../components/ui/BrandGradient';
import { AudioOrb } from '../components/ui/AudioOrb';
import { BrandSpinner } from '../components/states/BrandSpinner';
import { ErrorState } from '../components/states/ErrorState';

/**
 * Emergency phrases (chunky_v3 §5). Intentionally all-red urgency — no
 * warning-orange anywhere here. Red gradient header with a redLip lip, red lip
 * category chips, then a Mysore-Red-accented context bar whose subtitle tracks
 * the selected category. Cards are sorted most → least urgent (see contextOf)
 * and carry a uniform red left accent. Each card leads with a red situation
 * badge (SAFETY ISSUE / METER DISPUTE / ASKING PRICE …), then a huge
 * transliteration (what you say out loud), a small English gloss (sanity check),
 * and finally the Kannada script demoted to a footnote — these users are
 * learning to speak, not read, and only flash the script to show the driver.
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
      .catch((err) => {
        console.warn('[audio] emergency phrase failed', err);
        Toasts.audioFailed(() => play(id, text));
      })
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
          <BrandSpinner size={48} />
        </View>
      ) : isError || !groups ? (
        <ErrorState
          title="Couldn't load phrases"
          body="Check your connection and give it another try."
          onRetry={() => refetch()}
        />
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

          {/* Category context bar — Mysore Red left accent, subtitle changes with category */}
          <View
            style={{
              marginHorizontal: Spacing.lg,
              marginTop: Spacing.md,
              backgroundColor: '#ffffff',
              borderRadius: Radius.chunky,
              paddingVertical: Spacing.md,
              paddingHorizontal: Spacing.lg,
              borderWidth: 1,
              borderColor: Colors.hairline,
              borderLeftWidth: 6,
              borderLeftColor: Colors.primaryContainer,
              borderBottomWidth: 4,
              borderBottomColor: Colors.cardLip,
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.baloo.bold,
                fontSize: moderateScale(15),
                color: Colors.onSurface,
              }}
              maxFontSizeMultiplier={1.2}
            >
              {current?.label}
            </Text>
            <Text
              style={{
                fontFamily: Fonts.dmSans.medium,
                fontSize: moderateScale(12.5),
                lineHeight: moderateScale(18),
                color: Colors.tertiary,
                marginTop: moderateScale(2),
              }}
              maxFontSizeMultiplier={1.3}
            >
              {GROUP_BLURB[current?.id ?? ''] ?? ''}
            </Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: Spacing.lg,
              paddingTop: Spacing.md,
              paddingBottom: moderateScale(40) + insets.bottom,
              gap: moderateScale(10),
            }}
          >
            {[...(current?.items ?? [])]
              .sort((a, b) => contextOf(a.meaning).rank - contextOf(b.meaning).rank)
              .map((item) => {
                const badge = contextOf(item.meaning).badge;
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
                      borderLeftColor: Colors.primaryContainer,
                      borderBottomWidth: 4,
                      borderBottomColor: Colors.cardLip,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      {/* Red situation badge — the context, at a glance */}
                      <View
                        style={{
                          alignSelf: 'flex-start',
                          backgroundColor: Colors.primaryContainer,
                          borderRadius: Radius.full,
                          paddingVertical: moderateScale(4),
                          paddingHorizontal: moderateScale(10),
                          borderBottomWidth: 2,
                          borderBottomColor: Colors.redLip,
                          marginBottom: moderateScale(10),
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: Fonts.dmSans.bold,
                            fontSize: moderateScale(10.5),
                            letterSpacing: 1,
                            color: Colors.onPrimary,
                          }}
                          maxFontSizeMultiplier={1.2}
                        >
                          {badge}
                        </Text>
                      </View>
                      {/* Transliteration first (what you say), then English — obvious in any situation */}
                      <View
                        style={{
                          flexDirection: 'row',
                          flexWrap: 'wrap',
                          alignItems: 'baseline',
                          columnGap: moderateScale(8),
                          rowGap: moderateScale(2),
                        }}
                      >
                        {/* Transliteration — what you say out loud */}
                        <Text
                          style={{
                            fontFamily: Fonts.dmSans.bold,
                            fontSize: moderateScale(19),
                            lineHeight: moderateScale(25),
                            color: Colors.primary,
                            letterSpacing: -0.2,
                          }}
                          maxFontSizeMultiplier={1.3}
                        >
                          {item.transliteration ?? item.kannada}
                        </Text>
                        {/* Visual separator between what you say and what you mean */}
                        <Text
                          style={{
                            fontFamily: Fonts.dmSans.bold,
                            fontSize: moderateScale(19),
                            lineHeight: moderateScale(25),
                            color: Colors.tertiary,
                            opacity: 0.5,
                          }}
                          maxFontSizeMultiplier={1.3}
                        >
                          |
                        </Text>
                        {/* English — what you mean */}
                        <Text
                          style={{
                            fontFamily: Fonts.dmSans.bold,
                            fontSize: moderateScale(19),
                            lineHeight: moderateScale(25),
                            color: Colors.onSurface,
                            letterSpacing: -0.2,
                          }}
                          maxFontSizeMultiplier={1.3}
                        >
                          {item.meaning}
                        </Text>
                      </View>
                      {/* Kannada script — footnote only, for showing the driver */}
                      {item.transliteration ? (
                        <Text
                          style={{
                            fontFamily: Fonts.notoSansKannada.regular,
                            fontSize: moderateScale(12),
                            lineHeight: moderateScale(18),
                            color: 'rgba(27,29,14,0.42)',
                            marginTop: moderateScale(8),
                          }}
                          maxFontSizeMultiplier={1.2}
                        >
                          {item.kannada}
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

/**
 * Situation badges, derived client-side from the English meaning so they survive
 * DB re-seeds (rows carry uuids, not stable keys). Every card gets a red badge
 * naming the situation, and `rank` reorders the list most → least urgent —
 * safety first, then the ride-dispute stuff, then routine phrases. First rule to
 * match wins, so order matters.
 */
type Context = { badge: string; rank: number };

const CONTEXT_RULES: { re: RegExp; badge: string; rank: number }[] = [
  {
    re: /\b(help|police|emergency|accident|danger|hurt|thief|lost|stop)\b/i,
    badge: 'SAFETY ISSUE',
    rank: 0,
  },
  { re: /\bmeter\b/i, badge: 'METER DISPUTE', rank: 1 },
  { re: /\b(how much|price|cost|fare|rupees|eshtu)\b/i, badge: 'ASKING PRICE', rank: 2 },
  { re: /\b(kannada|english|understand|speak)\b/i, badge: 'LANGUAGE GAP', rank: 3 },
  { re: /\b(slow|wait|slowly)\b/i, badge: 'SLOW DOWN', rank: 4 },
  { re: /\b(where|turn|address|left|right)\b/i, badge: 'DIRECTIONS', rank: 5 },
  { re: /\b(no|don't|not)\b/i, badge: 'SAYING NO', rank: 6 },
];

function contextOf(meaning: string): Context {
  for (const rule of CONTEXT_RULES) {
    if (rule.re.test(meaning)) return { badge: rule.badge, rank: rule.rank };
  }
  return { badge: 'GOOD TO KNOW', rank: 7 };
}

/** Per-category context line shown under the pills in the header bar. */
const GROUP_BLURB: Record<string, string> = {
  auto: "If you're in a ride dispute or a safety issue",
  trouble: "When you need help fast and can't explain",
  basics: 'Everyday words to get by',
};

function GroupIcon({ id, color }: { id: string; color: string }) {
  if (id === 'auto') return <Icons.emAuto size={moderateScale(16)} color={color} />;
  if (id === 'trouble') return <Icons.emHelp size={moderateScale(16)} color={color} />;
  return <Icons.emBasic size={moderateScale(16)} color={color} />;
}
