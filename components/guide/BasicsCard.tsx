import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { ChunkyPressable } from '../ui/ChunkyPressable';

/**
 * Persistent re-entry card pinned above the lesson list on /(tabs)/learn.
 * See spec_beginners_guide.md §Re-entry — Learn tab card.
 * Chunky kit v3: surfaceCreamLow tonal card with a white book tile + lip.
 */
export function BasicsCard() {
  const router = useRouter();
  const BookIcon = Icons.book;

  return (
    <ChunkyPressable
      onPress={() => router.push('/guide')}
      accessibilityLabel="Kannada basics. Vowels, consonants, how to read it."
      bg={Colors.surfaceCreamLow}
      lip={4}
      lipColor={Colors.cardLip}
      radius={Radius.chunky}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: moderateScale(14),
        paddingHorizontal: moderateScale(14),
        minHeight: moderateScale(64),
      }}
    >
      <View
        style={{
          width: moderateScale(40),
          height: moderateScale(40),
          borderRadius: Radius.tile,
          backgroundColor: '#ffffff',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: moderateScale(14),
        }}
      >
        <BookIcon size={moderateScale(20)} color={Colors.primaryContainer} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: Fonts.baloo.bold,
            fontSize: moderateScale(16),
            color: Colors.onSurface,
            marginBottom: moderateScale(2),
          }}
          numberOfLines={1}
          maxFontSizeMultiplier={1.3}
        >
          Kannada basics
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.regular,
            fontSize: moderateScale(13),
            color: Colors.tertiary,
          }}
          numberOfLines={1}
          maxFontSizeMultiplier={1.4}
        >
          Vowels, consonants, how to read it
        </Text>
      </View>
      <Icons.forward size={moderateScale(18)} color={Colors.tertiary} />
    </ChunkyPressable>
  );
}
