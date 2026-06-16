import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';
import { Spacing } from '../../../constants/spacing';
import { Icons } from '../../../constants/icons';
import { Watermark } from '../../ui/Watermark';
import { TopBar } from '../../ui/TopBar';
import { LipButton } from '../../ui/LipButton';
import { IconWell } from '../IconWell';
import { useReducedMotion } from '../useReducedMotion';

/**
 * Shared layout for a full-tab empty state: real cream chrome (watermark +
 * TopBar) with an optional page header, then a centred hero (well → Baloo title →
 * body → one primary CTA) that rises in. Heroes stagger 0 → 220 ms; reduce-motion
 * shows the resting state. The floating TabBar comes from the (tabs) navigator.
 */
function TabEmpty({
  streak = 0,
  pageTitle,
  pageSub,
  well,
  title,
  body,
  action,
}: {
  streak?: number;
  pageTitle?: string;
  pageSub?: string;
  well: ReactNode;
  title: string;
  body: string;
  action: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  return (
    <View style={{ flex: 1, backgroundColor: Colors.surfaceCream }}>
      <Watermark motif="kolamGrid" />
      <TopBar streak={streak} onStreakPress={() => {}} />

      {pageTitle ? (
        <View style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg }}>
          <Text
            style={{ fontFamily: Fonts.baloo.extrabold, fontSize: moderateScale(32), color: Colors.onSurface, letterSpacing: -0.5, lineHeight: moderateScale(45) }}
            maxFontSizeMultiplier={1.2}
          >
            {pageTitle}
          </Text>
          {pageSub ? (
            <Text
              style={{ fontFamily: Fonts.dmSans.medium, fontSize: moderateScale(15), color: Colors.tertiary, marginTop: moderateScale(2) }}
              maxFontSizeMultiplier={1.4}
            >
              {pageSub}
            </Text>
          ) : null}
        </View>
      ) : null}

      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: moderateScale(34),
          paddingBottom: insets.bottom + moderateScale(70),
        }}
      >
        <Rise reduced={reduced} delay={0}>{well}</Rise>
        <Rise reduced={reduced} delay={80}>
          <Text
            style={{ fontFamily: Fonts.baloo.extrabold, fontSize: moderateScale(24), lineHeight: moderateScale(28), letterSpacing: -0.3, color: Colors.onSurface, marginTop: Spacing.xxl, textAlign: 'center' }}
            maxFontSizeMultiplier={1.3}
          >
            {title}
          </Text>
        </Rise>
        <Rise reduced={reduced} delay={140}>
          <Text
            style={{ fontFamily: Fonts.dmSans.medium, fontSize: moderateScale(14.5), lineHeight: moderateScale(22), color: Colors.tertiary, marginTop: Spacing.md, maxWidth: moderateScale(290), textAlign: 'center' }}
            maxFontSizeMultiplier={1.4}
          >
            {body}
          </Text>
        </Rise>
        <Rise reduced={reduced} delay={220} style={{ alignSelf: 'stretch', marginTop: moderateScale(26) }}>
          {action}
        </Rise>
      </View>
    </View>
  );
}

function Rise({ children, delay, reduced, style }: { children: ReactNode; delay: number; reduced: boolean; style?: object }) {
  if (reduced) return <View style={[{ alignItems: 'center' }, style]}>{children}</View>;
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(440)} style={[{ alignItems: 'center' }, style]}>
      {children}
    </Animated.View>
  );
}

/** Games tab — nothing unlocked yet (locked = warning orange). */
export function GamesLockedEmpty({ streak = 0, onStart }: { streak?: number; onStart: () => void }) {
  return (
    <TabEmpty
      streak={streak}
      pageTitle="Games"
      pageSub="Play with what you've learned."
      well={
        <IconWell size={104} bg={Colors.warningContainerLow}>
          <Icons.locked size={46} color={Colors.warningContainer} strokeWidth={2} />
        </IconWell>
      }
      title="Games unlock as you learn"
      body="Finish your first lesson and Quick Quiz, Dictation and more open up — each one plays only with phrases you already know."
      action={<LipButton label="Start Lesson 1" variant="primary" icon={Icons.play} iconLeading onPress={onStart} />}
    />
  );
}

/** Profile tab — brand-new user, no streak yet. */
export function NoStreakEmpty({ onStart }: { onStart: () => void }) {
  return (
    <TabEmpty
      streak={0}
      well={
        <IconWell size={104} bg={Colors.errorContainerLow}>
          <Icons.flame size={50} color={Colors.primaryContainer} strokeWidth={2} />
        </IconWell>
      }
      title="Start your streak today"
      body="Learn for five minutes a day and watch the flame grow. One lesson is all it takes to begin."
      action={<LipButton label="Start today's lesson" variant="primary" onPress={onStart} />}
    />
  );
}
