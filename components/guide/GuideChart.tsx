import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { fetchGuideContent, type GuideContent } from '../../services/api/guide';
import { Watermark } from '../ui/Watermark';
import { GuideLoading } from './GuideLoading';

interface GuideChartProps {
  onBack: () => void;
}

const CHART_SUBTITLE =
  "The 34 consonants grouped by where they're produced in the mouth.";

/**
 * The full 34-letter consonant chart — a reference screen linked from step 3 of
 * the paced basics flow. The chart is DB-sourced (content_json.reference.guide,
 * see services/api/guide.ts) with a chunky restyle: goldPale glyph tiles in a
 * responsive grid.
 */
export function GuideChart({ onBack }: GuideChartProps) {
  const insets = useSafeAreaInsets();
  const [guide, setGuide] = useState<GuideContent | null>(null);

  useEffect(() => {
    let alive = true;
    fetchGuideContent().then((g) => {
      if (alive) setGuide(g);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (!guide) {
    return <GuideLoading onBack={onBack} />;
  }

  const glyphs = guide.chart;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surfaceCream }}>
      <Watermark motif="kolamGrid" />

      <View
        style={{
          paddingTop: insets.top + Spacing.sm,
          paddingHorizontal: Spacing.lg,
          paddingBottom: Spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          gap: moderateScale(12),
        }}
      >
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={12}
          style={({ pressed }) => ({
            width: moderateScale(40),
            height: moderateScale(40),
            borderRadius: Radius.full,
            backgroundColor: '#ffffff',
            borderWidth: 1,
            borderColor: Colors.hairline,
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ scale: pressed ? 0.94 : 1 }],
          })}
        >
          <Icons.back size={moderateScale(20)} color={Colors.primary} />
        </Pressable>
        <Text
          style={{
            flex: 1,
            fontFamily: Fonts.baloo.bold,
            fontSize: moderateScale(18),
            color: Colors.onSurface,
            letterSpacing: -0.2,
          }}
          numberOfLines={1}
          maxFontSizeMultiplier={1.3}
        >
          The 34 consonants
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: Spacing.lg,
          paddingTop: Spacing.sm,
          paddingBottom: insets.bottom + Spacing.xxl,
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.dmSans.regular,
            fontSize: moderateScale(13.5),
            lineHeight: moderateScale(20),
            color: Colors.tertiary,
            marginBottom: Spacing.lg,
          }}
          maxFontSizeMultiplier={1.4}
        >
          {CHART_SUBTITLE}
        </Text>

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: moderateScale(8),
          }}
        >
          {glyphs.map((g) => (
            <View
              key={g.kannada}
              style={{
                width: '18%',
                minWidth: moderateScale(54),
                flexGrow: 1,
                alignItems: 'center',
                backgroundColor: Colors.secondaryFixed,
                borderRadius: Radius.tile,
                borderBottomWidth: 3,
                borderBottomColor: Colors.goldLip,
                paddingVertical: moderateScale(10),
                paddingHorizontal: moderateScale(4),
              }}
              accessibilityRole="text"
              accessibilityLabel={`${g.kannada}, ${g.transliteration}, ${g.example}`}
            >
              <Text
                style={{
                  fontFamily: Fonts.notoSansKannada.bold,
                  fontSize: moderateScale(26),
                  lineHeight: moderateScale(40),
                  color: Colors.onSecondaryContainer,
                }}
                maxFontSizeMultiplier={1.2}
              >
                {g.kannada}
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.dmSans.bold,
                  fontSize: moderateScale(13),
                  color: Colors.onSecondaryContainer,
                  marginTop: moderateScale(1),
                }}
                maxFontSizeMultiplier={1.3}
              >
                {g.transliteration}
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.dmSans.regular,
                  fontSize: moderateScale(10.5),
                  lineHeight: moderateScale(14),
                  color: Colors.tertiary,
                  textAlign: 'center',
                  marginTop: moderateScale(1),
                }}
                maxFontSizeMultiplier={1.3}
                numberOfLines={2}
              >
                {g.example}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
