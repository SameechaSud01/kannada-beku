import { View, Text, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { moderateScale } from 'react-native-size-matters';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Colors } from '../../constants/colors';

type Heritage = {
  eyebrow: string;
  title: string;
  subtitle: string;
  body: string[];
};

const HERITAGE: Record<string, Heritage> = {
  hampi: {
    eyebrow: 'Karnataka Heritage',
    title: 'The Stones of Hampi',
    subtitle: 'Capital of the Vijayanagara Empire (14th–16th c.)',
    body: [
      'Hampi sits along the Tungabhadra river in northern Karnataka. Once the seat of the Vijayanagara Empire, it was among the wealthiest and largest cities in the world in the 1500s — visitors from Persia and Portugal wrote about its bazaars, temples and palace pavilions in awe.',
      'Today its boulder-strewn landscape holds more than 1,600 surviving monuments: the Virupaksha Temple still in active worship, the stone chariot at Vittala, royal enclosures, aqueducts, and the famed musical pillars that ring when tapped.',
      'Hampi was inscribed as a UNESCO World Heritage Site in 1986. Walking it teaches a quieter lesson than any guidebook: Kannada culture is not new. It is layered, ancient, and very much alive.',
    ],
  },
};

export default function HeritageScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const entry = id ? HERITAGE[id] : undefined;

  if (!entry) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.surface, paddingTop: insets.top + Spacing.xxxl, paddingHorizontal: Spacing.xxl, alignItems: 'center' }}>
        <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: moderateScale(20), color: '#1B1D0E', marginBottom: Spacing.sm }}>
          Heritage entry not found
        </Text>
        <Pressable onPress={() => router.back()} hitSlop={8} style={{ paddingVertical: Spacing.md }}>
          <Text style={{ fontFamily: Fonts.dmSans.medium, fontSize: moderateScale(14), color: '#91001B' }}>
            ← Back
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <View
        style={{
          paddingTop: insets.top + Spacing.sm,
          paddingBottom: Spacing.md,
          paddingHorizontal: Spacing.xxl,
          backgroundColor: 'rgba(252,252,250,0.85)',
          flexDirection: 'row',
          alignItems: 'center',
          gap: moderateScale(14),
        }}
      >
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
        >
          <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
            <Path d="M19 12H5M12 19l-7-7 7-7" stroke="#91001B" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
        <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: moderateScale(16), color: '#1B1D0E' }}>
          Heritage
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xxxl }}
      >
        <View
          style={{
            marginHorizontal: Spacing.xxl,
            marginTop: Spacing.md,
            height: moderateScale(220),
            borderRadius: moderateScale(32),
            overflow: 'hidden',
            backgroundColor: '#5C1A1A',
          }}
        >
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#7A2020', opacity: 0.6 }} />
          <View style={{ position: 'absolute', top: Spacing.xl, right: moderateScale(30), width: moderateScale(100), height: moderateScale(160), borderRadius: Radius.sm, backgroundColor: '#A04030', opacity: 0.4 }} />
          <View style={{ position: 'absolute', top: moderateScale(30), left: moderateScale(40), width: moderateScale(60), height: moderateScale(140), borderRadius: moderateScale(6), backgroundColor: '#8B3025', opacity: 0.3 }} />
        </View>

        <View style={{ paddingHorizontal: Spacing.xxl, paddingTop: Spacing.xxl }}>
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: moderateScale(10),
              letterSpacing: 2.5,
              color: '#785900',
              textTransform: 'uppercase',
              marginBottom: Spacing.sm,
            }}
          >
            {entry.eyebrow}
          </Text>
          <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: moderateScale(28), color: '#1B1D0E', letterSpacing: -0.5, marginBottom: moderateScale(6) }}>
            {entry.title}
          </Text>
          <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: moderateScale(14), color: '#464646', marginBottom: Spacing.xxl }}>
            {entry.subtitle}
          </Text>
          {entry.body.map((p, i) => (
            <Text
              key={i}
              style={{
                fontFamily: Fonts.dmSans.regular,
                fontSize: moderateScale(15),
                color: '#1B1D0E',
                lineHeight: moderateScale(24),
                marginBottom: Spacing.lg,
              }}
            >
              {p}
            </Text>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
