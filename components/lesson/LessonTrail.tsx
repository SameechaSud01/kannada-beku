import { View, Text } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { ChunkyCircle } from '../ui/ChunkyLip';
import { ChunkyPressable } from '../ui/ChunkyPressable';
import { LockTile } from '../ui/LockTile';

/**
 * Shared "where you are" trail primitives for the lesson- and section-complete
 * screens (DoneCard, PartDoneCard). The trail is a vertical run of pips joined by
 * connectors: completed steps, the just-finished step (highlight), an "up next"
 * card (the primary continue action), and faint locked steps still ahead.
 */

export const PIP = moderateScale(40);
const SEG_W = moderateScale(3);
const SEG_H = moderateScale(30);
const SEG_INDENT = (PIP - SEG_W) / 2;

const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
export const numberWord = (n: number) => NUMBER_WORDS[n] ?? String(n);

/** A completed (or just-finished) row: gold pip + check, title + caption. */
export function DoneNode({
  title,
  subtitle,
  highlight = false,
}: {
  title: string;
  subtitle: string;
  highlight?: boolean;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(14) }}>
      <ChunkyCircle
        size={PIP}
        depth={moderateScale(3)}
        bg={Colors.secondaryFixed}
        lipColor={Colors.goldLip}
      >
        <Icons.check size={moderateScale(20)} color={Colors.onSecondaryContainer} strokeWidth={3} />
      </ChunkyCircle>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          style={{
            fontFamily: Fonts.baloo.bold,
            fontSize: moderateScale(highlight ? 19 : 15.5),
            color: Colors.onSurface,
            letterSpacing: -0.2,
          }}
          numberOfLines={1}
          maxFontSizeMultiplier={1.2}
        >
          {title}
        </Text>
        <Text
          style={{
            fontFamily: highlight ? Fonts.dmSans.bold : Fonts.dmSans.medium,
            fontSize: moderateScale(11.5),
            color: highlight ? Colors.onSecondaryContainer : Colors.textFaint,
            marginTop: moderateScale(2),
          }}
          numberOfLines={1}
          maxFontSizeMultiplier={1.2}
        >
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

/** The "up next" card — the primary continue action (tap to start the next step). */
export function NextCard({
  title,
  subtitle,
  onPress,
}: {
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <ChunkyPressable
      onPress={onPress}
      bg={Colors.surfaceContainerLowest}
      lip={5}
      lipColor={Colors.redLip}
      border
      borderColor={Colors.primaryContainer}
      borderWidth={2}
      radius={Radius.chunky}
      accessibilityLabel={`Start next: ${title}`}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: moderateScale(14),
        paddingVertical: moderateScale(9),
        paddingLeft: moderateScale(9),
        paddingRight: moderateScale(12),
      }}
    >
      <ChunkyCircle
        size={PIP}
        depth={moderateScale(3)}
        bg={Colors.primaryContainer}
        lipColor={Colors.redLip}
      >
        <Icons.play size={moderateScale(16)} color={Colors.onPrimary} />
      </ChunkyCircle>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          style={{
            fontFamily: Fonts.baloo.bold,
            fontSize: moderateScale(15.5),
            color: Colors.onSurface,
            letterSpacing: -0.2,
          }}
          numberOfLines={1}
          maxFontSizeMultiplier={1.2}
        >
          {title}
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(11.5),
            color: Colors.primary,
            marginTop: moderateScale(2),
          }}
          numberOfLines={1}
          maxFontSizeMultiplier={1.2}
        >
          {`Up next · ${subtitle}`}
        </Text>
      </View>
      <Icons.forward size={moderateScale(22)} color={Colors.primaryContainer} strokeWidth={2.6} />
    </ChunkyPressable>
  );
}

/**
 * A step still ahead and not yet reachable (after the "up next" one) — a faint
 * locked row, mirroring the chooser's locked styling so "locked" reads as one
 * consistent thing ("not yet," not "broken").
 */
export function UpcomingNode({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: moderateScale(14),
        opacity: 0.85,
      }}
    >
      <LockTile size={40} iconSize={18} radius={PIP / 2} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          style={{
            fontFamily: Fonts.baloo.bold,
            fontSize: moderateScale(15.5),
            color: Colors.textFaint,
            letterSpacing: -0.2,
          }}
          numberOfLines={1}
          maxFontSizeMultiplier={1.2}
        >
          {title}
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.medium,
            fontSize: moderateScale(11.5),
            color: Colors.textFaint,
            marginTop: moderateScale(2),
          }}
          numberOfLines={1}
          maxFontSizeMultiplier={1.2}
        >
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

/** Vertical connector through the pip centres. */
export function Connector({ filled = false }: { filled?: boolean }) {
  return (
    <View
      style={{
        width: SEG_W,
        height: SEG_H,
        marginVertical: moderateScale(9),
        marginLeft: SEG_INDENT,
        borderRadius: moderateScale(2),
        backgroundColor: filled ? Colors.goldLip : Colors.hairline,
        opacity: filled ? 0.5 : 1,
      }}
    />
  );
}
