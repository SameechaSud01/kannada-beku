import { View } from 'react-native';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export type ChunkyLipProps = {
  /** Square convenience — sets both width and height. Overridden by width/height. */
  size?: number;
  width?: number;
  height?: number;
  /** Face corner radius. A circle is just `radius = size / 2` (see `ChunkyCircle`). */
  radius: number;
  /** Face fill colour. */
  bg: string;
  /** Hard bottom "lip" colour — a second copy of the shape, offset down by `depth`. */
  lipColor: string;
  /** Resting lip height in px (the face drops onto it when `pressed`). */
  depth?: number;
  /** Draw an inset hairline/ring around the face. */
  border?: boolean;
  borderColor?: string;
  borderWidth?: number;
  /** Press state — drops the face by `depth` so the lip disappears under it. */
  pressed?: boolean;
  /** Style for the outer wrapper (layout: margins, position, animated transforms). */
  style?: StyleProp<ViewStyle>;
  /** Style for the opaque face (e.g. an ambient shadow — iOS won't cast one from
   *  the transparent wrapper). */
  faceStyle?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

/**
 * Chunky tactile "lip" for any rounded shape — tiles, circles, pills (chunky_v3
 * round-lip fix). RN can't offset a box-shadow, so the lip is a *second copy of
 * the shape* (`lipColor`) stacked `depth`px lower than the face; on press the
 * face drops onto it for a physical key feel. Because the lip is the full shape
 * (not a `borderBottom`), it follows rounded corners instead of cutting a flat
 * line across the bottom.
 *
 * Threshold (not shape): a plain `borderBottom` lip is fine only on roomy rects
 * where `radius ≤ width × 0.12`. Anything rounder — glyph tiles, chips, circles,
 * pills — must use this so the lip doesn't read as a straight bar.
 *
 * Note: the wrapper reserves `depth`px of extra height below the face. If a row's
 * baseline shifts after swapping one in, trim the row gap by ~`depth`px.
 */
export function ChunkyLip({
  size,
  width,
  height,
  radius,
  bg,
  lipColor,
  depth = 3,
  border = false,
  borderColor,
  borderWidth = 1,
  pressed = false,
  style,
  faceStyle,
  children,
}: ChunkyLipProps) {
  const w = width ?? size ?? 0;
  const h = height ?? size ?? 0;
  return (
    <View style={[{ width: w, height: h + depth }, style]}>
      {/* Lip — a full copy of the shape, offset down by `depth`, peeking below. */}
      <View
        style={{
          position: 'absolute',
          top: depth,
          width: w,
          height: h,
          borderRadius: radius,
          backgroundColor: lipColor,
        }}
      />
      {/* Face — rests at top:0, drops onto the lip when pressed. */}
      <View
        style={[
          {
            position: 'absolute',
            top: pressed ? depth : 0,
            width: w,
            height: h,
            borderRadius: radius,
            backgroundColor: bg,
            borderWidth: border ? borderWidth : 0,
            borderColor: border ? borderColor : undefined,
            alignItems: 'center',
            justifyContent: 'center',
          },
          faceStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

export type ChunkyCircleProps = Omit<ChunkyLipProps, 'radius' | 'width' | 'height'> & {
  size: number;
};

/** Convenience wrapper: a `ChunkyLip` whose radius is always `size / 2`. */
export function ChunkyCircle({ size, ...rest }: ChunkyCircleProps) {
  return <ChunkyLip size={size} radius={size / 2} {...rest} />;
}
