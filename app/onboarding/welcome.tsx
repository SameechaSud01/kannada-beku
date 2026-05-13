import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { ProgressDots } from '../../components/onboarding/ProgressDots';
import { useCopy } from '../../hooks/useCopy';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const copy = useCopy();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#FBFBE2',
        paddingTop: insets.top + 20,
        paddingBottom: insets.bottom + 20,
        paddingHorizontal: 24,
        justifyContent: 'space-between',
      }}
    >
      <ProgressDots total={4} current={0} />

      <View style={{ alignItems: 'center' }}>
        <Text
          style={{
            fontFamily: Fonts.notoSerifKannada.bold,
            fontSize: 72,
            color: Colors.primaryContainer,
            lineHeight: 110,
            paddingTop: 10,
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          ಕನ್ನಡ ಬಾ
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: 20,
            color: '#1B1D0E',
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          Kannada Baa
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.regular,
            fontSize: 16,
            color: '#464646',
            textAlign: 'center',
            lineHeight: 24,
            maxWidth: 280,
          }}
        >
          {copy('onboardingWelcome')}
        </Text>
      </View>

      <Pressable
        onPress={() => router.push('/onboarding/goal')}
        style={({ pressed }) => ({
          backgroundColor: pressed ? '#8D0020' : Colors.primaryContainer,
          borderRadius: 16,
          paddingVertical: 18,
          alignItems: 'center',
          transform: [{ scale: pressed ? 0.97 : 1 }],
          shadowColor: Colors.primaryContainer,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.25,
          shadowRadius: 16,
          elevation: 6,
        })}
      >
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: 17,
            color: '#FFFFFF',
          }}
        >
          Get Started
        </Text>
      </Pressable>
    </View>
  );
}
