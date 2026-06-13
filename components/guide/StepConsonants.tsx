import { useState } from 'react';
import { LayoutAnimation, Platform, Pressable, Text, UIManager, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { CONSONANT_FAMILIES, type ConsonantFamily } from '../../constants/guide';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface StepConsonantsProps {
  /** Open the full 34-letter chart reference screen. */
  onOpenChart: () => void;
}

/**
 * Step 3 — "Consonants live in 5 places". Accordion families, one open at a
 * time. Open family = goldLip border + lip 4; glyph chips = goldPale tiles with
 * a 2px goldLip lip. A secondary-link opens the full 34-letter chart.
 */
export function StepConsonants({ onOpenChart }: StepConsonantsProps) {
  const reduceMotion = useReducedMotion();
  // First family open by default.
  const [openId, setOpenId] = useState<ConsonantFamily['id'] | null>(
    CONSONANT_FAMILIES[0]?.id ?? null,
  );

  const toggle = (id: ConsonantFamily['id']) => {
    if (!reduceMotion) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setOpenId((cur) => (cur === id ? null : id));
  };

  return (
    <View>
      <Text
        style={{
          fontFamily: Fonts.baloo.extrabold,
          fontSize: moderateScale(26),
          color: Colors.onSurface,
          letterSpacing: -0.5,
          lineHeight: moderateScale(36),
        }}
        maxFontSizeMultiplier={1.2}
      >
        Consonants live in 5 places
      </Text>
      <Text
        style={{
          fontFamily: Fonts.dmSans.regular,
          fontSize: moderateScale(15),
          lineHeight: moderateScale(22),
          color: Colors.tertiary,
          marginTop: Spacing.sm,
          marginBottom: Spacing.xl,
        }}
        maxFontSizeMultiplier={1.4}
      >
        Each consonant is made in one spot of the mouth. Tap a place to see its letters.
      </Text>

      <View style={{ gap: moderateScale(10) }}>
        {CONSONANT_FAMILIES.map((fam) => {
          const isOpen = openId === fam.id;
          return (
            <View
              key={fam.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: Radius.chunky,
                borderWidth: isOpen ? 2 : 1,
                borderColor: isOpen ? Colors.goldLip : Colors.hairline,
                borderBottomWidth: 4,
                borderBottomColor: isOpen ? Colors.goldLip : Colors.cardLip,
                overflow: 'hidden',
              }}
            >
              <Pressable
                onPress={() => toggle(fam.id)}
                accessibilityRole="button"
                accessibilityState={{ expanded: isOpen }}
                accessibilityLabel={`${fam.place}. ${fam.hint}`}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: moderateScale(14),
                  paddingHorizontal: moderateScale(16),
                  opacity: pressed ? 0.7 : 1,
                })}
              >
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
                    {fam.place}
                  </Text>
                  {isOpen && (
                    <Text
                      style={{
                        fontFamily: Fonts.dmSans.regular,
                        fontSize: moderateScale(12.5),
                        lineHeight: moderateScale(18),
                        color: Colors.tertiary,
                        marginTop: moderateScale(2),
                      }}
                      maxFontSizeMultiplier={1.4}
                    >
                      {fam.hint}
                    </Text>
                  )}
                </View>
                <View
                  style={{
                    transform: [{ rotate: isOpen ? '90deg' : '0deg' }],
                  }}
                >
                  <Icons.forward
                    size={moderateScale(18)}
                    color={isOpen ? Colors.goldLip : Colors.tertiary}
                    strokeWidth={2.4}
                  />
                </View>
              </Pressable>

              {isOpen && (
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: moderateScale(8),
                    paddingHorizontal: moderateScale(16),
                    paddingBottom: moderateScale(16),
                  }}
                >
                  {fam.glyphs.map((g) => (
                    <View
                      key={g.kannada}
                      style={{
                        alignItems: 'center',
                        backgroundColor: Colors.secondaryFixed,
                        borderRadius: Radius.tile,
                        borderBottomWidth: 2,
                        borderBottomColor: Colors.goldLip,
                        paddingVertical: moderateScale(8),
                        paddingHorizontal: moderateScale(12),
                        minWidth: moderateScale(54),
                      }}
                      accessibilityRole="text"
                      accessibilityLabel={`${g.kannada}, ${g.transliteration}`}
                    >
                      <Text
                        style={{
                          fontFamily: Fonts.notoSansKannada.bold,
                          fontSize: moderateScale(26),
                          lineHeight: moderateScale(42),
                          color: Colors.onSecondaryContainer,
                        }}
                        maxFontSizeMultiplier={1.2}
                      >
                        {g.kannada}
                      </Text>
                      <Text
                        style={{
                          fontFamily: Fonts.dmSans.bold,
                          fontSize: moderateScale(12),
                          color: Colors.onSecondaryContainer,
                        }}
                        maxFontSizeMultiplier={1.3}
                      >
                        {g.transliteration}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Secondary-link to the full chart (interactiveSecondary chip/border). */}
      <Pressable
        onPress={onOpenChart}
        accessibilityRole="link"
        accessibilityLabel="See the full 34-letter chart"
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: moderateScale(6),
          marginTop: Spacing.lg,
          backgroundColor: '#ffffff',
          borderRadius: Radius.chunky,
          borderWidth: 2,
          borderColor: Colors.interactiveSecondary,
          borderBottomWidth: 4,
          borderBottomColor: Colors.interactiveSecondaryLip,
          paddingVertical: moderateScale(12),
          paddingHorizontal: moderateScale(16),
          transform: [{ translateY: pressed ? 2 : 0 }],
        })}
      >
        <Text
          style={{
            fontFamily: Fonts.baloo.bold,
            fontSize: moderateScale(14.5),
            color: Colors.onSurface,
          }}
          maxFontSizeMultiplier={1.3}
        >
          See the full 34-letter chart
        </Text>
        <Icons.forward
          size={moderateScale(17)}
          color={Colors.onSurface}
          strokeWidth={2.4}
        />
      </Pressable>
    </View>
  );
}
