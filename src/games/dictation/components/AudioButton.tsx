import React from 'react';
import { Text, View } from 'react-native';
import { Colors } from '../../../../constants/colors';
import { Fonts } from '../../../../constants/fonts';
import { AudioOrb } from '../../../../components/ui/AudioOrb';

type Props = {
  isPlaying: boolean;
  onPress: () => void;
};

// chunky_v3: red AudioOrb (red face + redLip lip + expanding ping while playing).
const AudioButton: React.FC<Props> = ({ isPlaying, onPress }) => (
  <View style={{ alignItems: 'center' }}>
    <AudioOrb
      onPress={onPress}
      playing={isPlaying}
      disabled={isPlaying}
      size={64}
      accessibilityLabel="tap to hear the word"
    />
    <Text
      style={{
        fontFamily: Fonts.dmSans.regular,
        fontSize: 12,
        color: Colors.tertiary,
        marginTop: 8,
        textAlign: 'center',
      }}
    >
      {isPlaying ? 'playing…' : 'tap to hear the word'}
    </Text>
  </View>
);

export default AudioButton;
