import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { ChunkyPressable } from '../ui/ChunkyPressable';

const TILE = 46;
const TILE_RADIUS = 13;
const TILE_LIP = 3;

/**
 * Persistent re-entry card pinned above the lesson list on /(tabs)/learn.
 * See spec_beginners_guide.md §Re-entry + spec_lessons_tab_detail_redesign §1.
 * Standard white chunky card with a red-gradient book squircle.
 */
export function BasicsCard() {
  const router = useRouter();
  const BookIcon = Icons.book;

  return (
    <ChunkyPressable
      onPress={() => router.push('/guide')}
      accessibilityLabel="Kannada basics. Vowels, consonants, how to read it."
      bg="#ffffff"
      lip={4}
      lipColor={Colors.cardLip}
      border
      borderColor={Colors.hairline}
      radius={Radius.chunky}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: moderateScale(12),
        paddingHorizontal: moderateScale(12),
        minHeight: moderateScale(64),
      }}
    >
      {/* Red-gradient squircle with its own lip (the card's icon block). */}
      <View
        style={{
          width: moderateScale(TILE),
          height: moderateScale(TILE + TILE_LIP),
          marginRight: moderateScale(13),
        }}
      >
        <View
          style={{
            position: 'absolute',
            top: moderateScale(TILE_LIP),
            width: moderateScale(TILE),
            height: moderateScale(TILE),
            borderRadius: moderateScale(TILE_RADIUS),
            backgroundColor: Colors.redLip,
          }}
        />
        <LinearGradient
          colors={[Colors.primaryContainer, Colors.primary]}
          start={{ x: 0.27, y: 0.06 }}
          end={{ x: 0.73, y: 0.94 }}
          style={{
            position: 'absolute',
            top: 0,
            width: moderateScale(TILE),
            height: moderateScale(TILE),
            borderRadius: moderateScale(TILE_RADIUS),
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <BookIcon size={moderateScale(22)} color={Colors.onPrimary} />
        </LinearGradient>
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
