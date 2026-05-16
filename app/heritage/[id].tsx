import { View, Text, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Fonts } from '../../constants/fonts';

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
      <View style={{ flex: 1, backgroundColor: '#FBFBE2', paddingTop: insets.top + 32, paddingHorizontal: 24, alignItems: 'center' }}>
        <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 20, color: '#1B1D0E', marginBottom: 8 }}>
          Heritage entry not found
        </Text>
        <Pressable onPress={() => router.back()} hitSlop={8} style={{ paddingVertical: 12 }}>
          <Text style={{ fontFamily: Fonts.dmSans.medium, fontSize: 14, color: '#91001B' }}>
            ← Back
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FBFBE2' }}>
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingBottom: 12,
          paddingHorizontal: 24,
          backgroundColor: 'rgba(251,251,226,0.85)',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
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
        <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 16, color: '#1B1D0E' }}>
          Heritage
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        <View
          style={{
            marginHorizontal: 24,
            marginTop: 12,
            height: 220,
            borderRadius: 32,
            overflow: 'hidden',
            backgroundColor: '#5C1A1A',
          }}
        >
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#7A2020', opacity: 0.6 }} />
          <View style={{ position: 'absolute', top: 20, right: 30, width: 100, height: 160, borderRadius: 8, backgroundColor: '#A04030', opacity: 0.4 }} />
          <View style={{ position: 'absolute', top: 30, left: 40, width: 60, height: 140, borderRadius: 6, backgroundColor: '#8B3025', opacity: 0.3 }} />
        </View>

        <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: 10,
              letterSpacing: 2.5,
              color: '#785900',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            {entry.eyebrow}
          </Text>
          <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 28, color: '#1B1D0E', letterSpacing: -0.5, marginBottom: 6 }}>
            {entry.title}
          </Text>
          <Text style={{ fontFamily: Fonts.lora.italic, fontSize: 14, color: '#464646', marginBottom: 24 }}>
            {entry.subtitle}
          </Text>
          {entry.body.map((p, i) => (
            <Text
              key={i}
              style={{
                fontFamily: Fonts.dmSans.regular,
                fontSize: 15,
                color: '#1B1D0E',
                lineHeight: 24,
                marginBottom: 16,
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
