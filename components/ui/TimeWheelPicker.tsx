import { useRef } from 'react';
import { ScrollView, Text, View } from 'react-native';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Radius } from '../../constants/spacing';

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
/** Quarter-hour steps only — deliberate simplification (spec_onboarding_reminder_step §4, amended 2026-07-13). */
const MINUTES = [0, 15, 30, 45];
const MERIDIEMS = ['AM', 'PM'] as const;
type Meridiem = (typeof MERIDIEMS)[number];

const ITEM_HEIGHT = moderateScale(52);
/** One row above + selected + one below, like a slot wheel. */
const VISIBLE_ROWS = 3;

/** Split an 'HH:MM' 24h string into wheel positions (minute snapped to a quarter). */
function toWheel(time: string): { hour12: number; minute: number; meridiem: Meridiem } {
  const [hStr, mStr] = time.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return { hour12: 7, minute: 0, meridiem: 'PM' };
  const minute = MINUTES.reduce((best, v) => (Math.abs(v - m) < Math.abs(best - m) ? v : best));
  return { hour12: h % 12 === 0 ? 12 : h % 12, minute, meridiem: h >= 12 ? 'PM' : 'AM' };
}

/** Recombine wheel positions into the stored 'HH:MM' 24h format. */
function fromWheel(hour12: number, minute: number, meridiem: Meridiem): string {
  const h24 = (hour12 % 12) + (meridiem === 'PM' ? 12 : 0);
  return `${String(h24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export interface TimeWheelPickerProps {
  /** 'HH:MM' 24h. Non-quarter minutes display snapped to the nearest quarter. */
  value: string;
  onChange: (time: string) => void;
}

/**
 * 3-column spin wheel (hour · minute · AM/PM) shared by the onboarding
 * reminder step and Profile → Reminders. Snap-scrolling ScrollView columns
 * over a gold highlight band — no native DateTimePicker. The columns only
 * position themselves from `value` on mount; external `value` changes after
 * mount restyle the labels but don't re-scroll.
 */
export function TimeWheelPicker({ value, onChange }: TimeWheelPickerProps) {
  const { hour12, minute, meridiem } = toWheel(value);

  return (
    <View style={{ gap: moderateScale(12) }}>
      {/* Wheel: gold band behind the center row, three snap columns over it. */}
      <View style={{ height: ITEM_HEIGHT * VISIBLE_ROWS }}>
        <View
          style={{
            position: 'absolute',
            top: ITEM_HEIGHT,
            left: 0,
            right: 0,
            height: ITEM_HEIGHT,
            borderRadius: Radius.chunky,
            backgroundColor: Colors.secondaryFixed,
            borderBottomWidth: 3,
            borderBottomColor: Colors.goldLip,
          }}
        />
        <View style={{ flexDirection: 'row' }}>
          <WheelColumn
            label="Hour"
            values={HOURS.map(String)}
            selectedIndex={HOURS.indexOf(hour12)}
            onChange={(i) => onChange(fromWheel(HOURS[i], minute, meridiem))}
          />
          <WheelColumn
            label="Minutes"
            values={MINUTES.map((m) => String(m).padStart(2, '0'))}
            selectedIndex={MINUTES.indexOf(minute)}
            onChange={(i) => onChange(fromWheel(hour12, MINUTES[i], meridiem))}
          />
          <WheelColumn
            label="AM or PM"
            values={[...MERIDIEMS]}
            selectedIndex={MERIDIEMS.indexOf(meridiem)}
            onChange={(i) => onChange(fromWheel(hour12, minute, MERIDIEMS[i]))}
          />
        </View>
      </View>

      <Text
        style={{
          fontFamily: Fonts.dmSans.regular,
          fontSize: moderateScale(13.5),
          color: Colors.inkFaint,
          textAlign: 'center',
        }}
        maxFontSizeMultiplier={1.3}
      >
        Spin to set your time
      </Text>
    </View>
  );
}

/**
 * One snap-scrolling wheel column. Padding of one row top/bottom lets the first
 * and last values rest in the center band; snap interval = row height.
 */
function WheelColumn({
  label,
  values,
  selectedIndex,
  onChange,
}: {
  label: string;
  values: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
}) {
  const ref = useRef<ScrollView>(null);
  const settle = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const raw = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    const index = Math.min(values.length - 1, Math.max(0, raw));
    if (index !== selectedIndex) onChange(index);
  };

  return (
    <ScrollView
      ref={ref}
      onLayout={() => ref.current?.scrollTo({ y: selectedIndex * ITEM_HEIGHT, animated: false })}
      style={{ flex: 1, height: ITEM_HEIGHT * VISIBLE_ROWS }}
      contentContainerStyle={{ paddingVertical: ITEM_HEIGHT }}
      showsVerticalScrollIndicator={false}
      snapToInterval={ITEM_HEIGHT}
      decelerationRate="fast"
      onMomentumScrollEnd={settle}
      accessibilityLabel={`${label}, selected ${values[selectedIndex]}`}
    >
      {values.map((value, i) => (
        <View
          key={value}
          style={{ height: ITEM_HEIGHT, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text
            style={{
              fontFamily: Fonts.baloo.bold,
              fontSize: moderateScale(i === selectedIndex ? 26 : 22),
              color: i === selectedIndex ? Colors.onSecondaryContainer : Colors.textFaint,
              fontVariant: ['tabular-nums'],
            }}
            maxFontSizeMultiplier={1.2}
          >
            {value}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
