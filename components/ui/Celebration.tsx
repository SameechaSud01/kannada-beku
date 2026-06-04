import { useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, Dimensions, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { ProgressRing } from './ProgressRing';
import { LipButton } from './LipButton';
import {
  STREAK_MILESTONE_COPY,
  type StreakMilestone,
} from '../modals/instances/StreakMilestoneTakeover';
import type { Icon as TablerIcon } from '@tabler/icons-react-native';

export type CelebrationKind = 'lesson' | 'streak' | 'level';

export type CelebrationProps = {
  kind: CelebrationKind;
  onClose: () => void;
  /** streak variant — pulls locked copy from STREAK_MILESTONE_COPY. */
  streak?: StreakMilestone;
  /** level variant. */
  level?: number;
  /** Optional overrides (lesson/level). */
  eyebrow?: string;
  title?: string;
  sub?: string;
  cta?: string;
};

type Resolved = {
  Icon: TablerIcon;
  accent: string;
  ink: string;
  lip: string;
  ring: string;
  eyebrow: string;
  title: string;
  sub: string;
  cta: string;
};

const RING = 132;
const SCREEN_H = Dimensions.get('window').height;
const CONFETTI_COLORS = [
  Colors.secondaryContainer,
  Colors.primaryContainer,
  Colors.goldBright,
  Colors.primary,
  Colors.secondary,
];

/**
 * Shared full-frame celebration (spec_playful_redesign §Celebration). Dim + blur
 * backdrop, confetti, a ring that sweeps empty→full around a bobbing disc + icon,
 * then eyebrow / Baloo title / sub / lip-button CTA rising in sequence.
 *
 * Three kinds — lesson (gold, trophy), streak (red, flame), level (deep gold,
 * star). The streak variant reuses the LOCKED per-milestone copy. Respects
 * reduce-motion: shows the end state with no loops or confetti.
 */
export function Celebration(props: CelebrationProps) {
  const { kind, onClose } = props;
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((r) => {
      if (alive) setReduced(r);
    });
    return () => {
      alive = false;
    };
  }, []);

  const cfg = useMemo(() => resolve(props), [props]);

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 70 }]}>
      <BlurView intensity={reduced ? 0 : 32} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(27,29,14,0.82)' }]} />

      {!reduced ? <Confetti /> : null}

      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: Spacing.xxxl,
        }}
      >
        <Badge cfg={cfg} reduced={reduced} />

        <RisingText reduced={reduced} delay={150}>
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: moderateScale(12),
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: cfg.accent,
              marginBottom: Spacing.sm,
              textAlign: 'center',
            }}
            maxFontSizeMultiplier={1.4}
          >
            {cfg.eyebrow}
          </Text>
        </RisingText>

        <RisingText reduced={reduced} delay={250}>
          <Text
            style={{
              fontFamily: Fonts.baloo.extrabold,
              fontSize: moderateScale(30),
              lineHeight: moderateScale(40),
              color: Colors.onPrimary,
              textAlign: 'center',
              letterSpacing: -0.3,
              paddingHorizontal: Spacing.sm,
            }}
            maxFontSizeMultiplier={1.3}
          >
            {cfg.title}
          </Text>
        </RisingText>

        <RisingText reduced={reduced} delay={350}>
          <Text
            style={{
              fontFamily: Fonts.dmSans.medium,
              fontSize: moderateScale(14.5),
              lineHeight: moderateScale(21),
              color: 'rgba(255,255,255,0.86)',
              textAlign: 'center',
              marginTop: Spacing.md,
              maxWidth: moderateScale(280),
            }}
            maxFontSizeMultiplier={1.4}
          >
            {cfg.sub}
          </Text>
        </RisingText>

        <RisingText reduced={reduced} delay={450}>
          <View style={{ marginTop: Spacing.xxl }}>
            <LipButton
              label={cfg.cta}
              onPress={onClose}
              color={cfg.accent}
              lip={cfg.lip}
              fg={cfg.ink}
              icon={Icons.forward}
              fullWidth={false}
            />
          </View>
        </RisingText>
      </View>
    </View>
  );
}

function resolve(props: CelebrationProps): Resolved {
  const { kind } = props;
  if (kind === 'streak') {
    const milestone = props.streak ?? 7;
    const copy = STREAK_MILESTONE_COPY[milestone];
    return {
      Icon: Icons.flame,
      accent: Colors.primaryContainer,
      ink: Colors.onPrimary,
      lip: Colors.redLip,
      ring: Colors.primaryContainer,
      eyebrow: props.eyebrow ?? `Streak · Day ${copy.word}`,
      title: props.title ?? copy.title,
      sub: props.sub ?? copy.body,
      cta: props.cta ?? 'Keep going',
    };
  }
  if (kind === 'level') {
    const n = props.level ?? 2;
    return {
      Icon: Icons.star,
      accent: Colors.secondary,
      ink: Colors.onPrimary,
      lip: Colors.goldLip,
      ring: Colors.secondaryContainer,
      eyebrow: props.eyebrow ?? 'Level up',
      title: props.title ?? `You reached Level ${n}`,
      sub: props.sub ?? 'New phrases are now open in Practice.',
      cta: props.cta ?? "Let's go",
    };
  }
  // lesson
  return {
    Icon: Icons.trophy,
    accent: Colors.secondaryContainer,
    ink: Colors.onSecondaryContainer,
    lip: Colors.goldLip,
    ring: Colors.secondaryContainer,
    eyebrow: props.eyebrow ?? 'Lesson complete',
    title: props.title ?? 'Lesson done!',
    sub: props.sub ?? 'You spoke Kannada today. Keep the streak alive.',
    cta: props.cta ?? 'Keep going',
  };
}

/** Ring sweeps empty→full around a bobbing accent disc + icon. */
function Badge({ cfg, reduced }: { cfg: Resolved; reduced: boolean }) {
  const bob = useSharedValue(0);
  useEffect(() => {
    if (reduced) return;
    bob.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [reduced, bob]);

  const discStyle = useAnimatedStyle(() => ({ transform: [{ translateY: bob.value }] }));
  const inset = moderateScale(14);

  return (
    <View style={{ marginBottom: Spacing.xxl }}>
      <ProgressRing
        progress={1}
        animated={!reduced}
        size={RING}
        strokeWidth={9}
        color={cfg.ring}
        trackColor="rgba(255,255,255,0.25)"
      >
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: inset,
              left: inset,
              right: inset,
              bottom: inset,
              borderRadius: Radius.full,
              backgroundColor: cfg.accent,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: cfg.lip,
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.4,
              shadowRadius: 30,
              elevation: 10,
            },
            discStyle,
          ]}
        >
          <cfg.Icon size={moderateScale(52)} color={cfg.ink} strokeWidth={1.8} />
        </Animated.View>
      </ProgressRing>
    </View>
  );
}

/** Wraps children in a fade+rise entrance (skipped under reduce-motion). */
function RisingText({
  children,
  delay,
  reduced,
}: {
  children: React.ReactNode;
  delay: number;
  reduced: boolean;
}) {
  if (reduced) return <View style={{ alignItems: 'center' }}>{children}</View>;
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)} style={{ alignItems: 'center' }}>
      {children}
    </Animated.View>
  );
}

/** ~46 falling, rotating, fading confetti pieces in brand colours. */
function Confetti() {
  const bits = useMemo(() => {
    let s = 7;
    const rnd = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    return Array.from({ length: 46 }).map(() => ({
      left: `${rnd() * 100}%` as `${number}%`,
      delay: rnd() * 500,
      duration: 1500 + rnd() * 1400,
      size: moderateScale(6 + rnd() * 8),
      color: CONFETTI_COLORS[Math.floor(rnd() * CONFETTI_COLORS.length)],
      round: rnd() > 0.5,
      spin: rnd() > 0.5 ? 1 : -1,
    }));
  }, []);

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
      {bits.map((b, i) => (
        <ConfettiBit key={i} {...b} />
      ))}
    </View>
  );
}

function ConfettiBit({
  left,
  delay,
  duration,
  size,
  color,
  round,
  spin,
}: {
  left: `${number}%`;
  delay: number;
  duration: number;
  size: number;
  color: string;
  round: boolean;
  spin: number;
}) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(delay, withTiming(1, { duration, easing: Easing.bezier(0.4, 0.1, 0.6, 1) }));
  }, [t, delay, duration]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: -20 + t.value * (SCREEN_H + 40) },
      { rotate: `${spin * t.value * 540}deg` },
    ],
    opacity: t.value < 0.85 ? 1 : 1 - (t.value - 0.85) / 0.15,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          left,
          width: size,
          height: round ? size : size * 0.5,
          borderRadius: round ? size / 2 : 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}
