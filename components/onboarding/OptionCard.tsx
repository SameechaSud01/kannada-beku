import { Pressable, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

interface OptionCardProps {
  label: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
}

export function OptionCard({ label, subtitle, selected, onPress }: OptionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: selected ? '#FFF5F5' : '#FFFFFF',
        borderWidth: 2,
        borderColor: selected ? Colors.primaryContainer : '#E0DDD0',
        borderRadius: 16,
        padding: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: 16,
            color: Colors.onSurface,
            marginBottom: subtitle ? 4 : 0,
          }}
        >
          {label}
        </Text>
        {subtitle && (
          <Text
            style={{
              fontFamily: Fonts.dmSans.regular,
              fontSize: 13,
              color: Colors.tertiary,
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {selected && (
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: Colors.primaryContainer,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Path
              d="M5 12l5 5L20 7"
              stroke="#FFFFFF"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
      )}
    </Pressable>
  );
}
