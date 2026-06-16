import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../../constants/colors';
import { Spacing, Radius } from '../../../constants/spacing';
import { Skeleton, SkelCard } from '../Skeleton';
import { TabSkeletonShell } from './TabSkeletonShell';

// Tonal shimmer overrides for colored cards (color is structural; only the
// content inside shimmers — st-loading.jsx onRed / onGold).
const onRed = { c1: 'rgba(255,255,255,0.20)', c2: 'rgba(255,255,255,0.10)' };
const onGold = { c1: 'rgba(120,89,0,0.18)', c2: 'rgba(120,89,0,0.09)' };
const onRedPale = { c1: 'rgba(145,0,27,0.14)', c2: 'rgba(145,0,27,0.07)' };

const PAD = { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md };

/** Home (active=0): greeting → rings card → continue card → gold words banner. */
export function HomeSkeleton({ streak = 0 }: { streak?: number }) {
  return (
    <TabSkeletonShell streak={streak}>
      <View style={{ ...PAD, gap: moderateScale(13) }}>
        {/* Greeting */}
        <View style={{ gap: moderateScale(9), marginBottom: moderateScale(2) }}>
          <Skeleton w="68%" h={moderateScale(28)} radius={moderateScale(9)} />
          <Skeleton w="84%" h={moderateScale(14)} radius={moderateScale(7)} />
        </View>

        {/* Daily-goal rings card */}
        <SkelCard style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(20) }}>
          <Skeleton w={moderateScale(120)} h={moderateScale(120)} radius={moderateScale(999)} />
          <View style={{ flex: 1, gap: moderateScale(14) }}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(10) }}>
                <Skeleton w={moderateScale(10)} h={moderateScale(10)} radius={moderateScale(999)} />
                <Skeleton w="46%" h={moderateScale(12)} radius={moderateScale(6)} />
                <Skeleton w={moderateScale(34)} h={moderateScale(18)} radius={moderateScale(6)} style={{ marginLeft: 'auto' }} />
              </View>
            ))}
          </View>
        </SkelCard>

        {/* Continue card — red (pale fill, red-tonal shimmer) */}
        <View
          style={{
            backgroundColor: Colors.errorContainerLow,
            borderRadius: Radius.chunky,
            borderBottomWidth: 4,
            borderBottomColor: 'rgba(145,0,27,0.12)',
            padding: moderateScale(16),
            flexDirection: 'row',
            alignItems: 'center',
            gap: moderateScale(14),
          }}
        >
          <Skeleton w={moderateScale(44)} h={moderateScale(44)} radius={moderateScale(999)} {...onRedPale} />
          <View style={{ flex: 1, gap: moderateScale(8) }}>
            <Skeleton w="62%" h={moderateScale(15)} radius={moderateScale(7)} {...onRedPale} />
            <Skeleton w="44%" h={moderateScale(11)} radius={moderateScale(6)} {...onRedPale} />
          </View>
        </View>

        {/* Gold words banner */}
        <LinearGradient
          colors={[Colors.goldBright, Colors.secondaryContainer]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: Radius.chunky, borderBottomWidth: 5, borderBottomColor: Colors.goldLip, padding: moderateScale(16), gap: moderateScale(12) }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Skeleton w="50%" h={moderateScale(16)} radius={moderateScale(7)} {...onGold} />
            <Skeleton w={moderateScale(38)} h={moderateScale(16)} radius={moderateScale(7)} {...onGold} />
          </View>
          <Skeleton w="100%" h={moderateScale(9)} radius={moderateScale(99)} {...onGold} />
          <Skeleton w="64%" h={moderateScale(11)} radius={moderateScale(6)} {...onGold} />
        </LinearGradient>
      </View>
    </TabSkeletonShell>
  );
}

/** Learn (active=1): title → basics card → lesson rows (fading down the list). */
export function LearnSkeleton({ streak = 0 }: { streak?: number }) {
  return (
    <TabSkeletonShell streak={streak}>
      <View style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, gap: moderateScale(9) }}>
        <Skeleton w="46%" h={moderateScale(28)} radius={moderateScale(9)} />
        <Skeleton w="60%" h={moderateScale(13)} radius={moderateScale(7)} />
      </View>
      <View style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, gap: moderateScale(11) }}>
        {/* Basics card */}
        <View
          style={{
            backgroundColor: Colors.surfaceCreamLow,
            borderWidth: 1,
            borderColor: Colors.hairline,
            borderRadius: Radius.chunky,
            padding: moderateScale(14),
            flexDirection: 'row',
            alignItems: 'center',
            gap: moderateScale(13),
          }}
        >
          <Skeleton w={moderateScale(40)} h={moderateScale(40)} radius={moderateScale(12)} />
          <View style={{ flex: 1, gap: moderateScale(8) }}>
            <Skeleton w="52%" h={moderateScale(14)} radius={moderateScale(7)} />
            <Skeleton w="72%" h={moderateScale(11)} radius={moderateScale(6)} />
          </View>
        </View>
        {/* Lesson rows */}
        {[0, 1, 2, 3, 4].map((i) => (
          <SkelCard key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(13), opacity: 1 - i * 0.12 }}>
            <Skeleton w={moderateScale(44)} h={moderateScale(44)} radius={moderateScale(13)} />
            <View style={{ flex: 1, gap: moderateScale(8) }}>
              <Skeleton w={`${64 - i * 6}%`} h={moderateScale(14)} radius={moderateScale(7)} />
              <Skeleton w={`${48 - i * 4}%`} h={moderateScale(11)} radius={moderateScale(6)} />
            </View>
            <Skeleton w={moderateScale(22)} h={moderateScale(22)} radius={moderateScale(999)} />
          </SkelCard>
        ))}
      </View>
    </TabSkeletonShell>
  );
}

/** Games (active=2): title → gold featured quiz → 2-up red grid → wide gold. */
export function GamesSkeleton({ streak = 0 }: { streak?: number }) {
  return (
    <TabSkeletonShell streak={streak}>
      <View style={{ ...PAD, paddingTop: Spacing.lg, gap: moderateScale(13) }}>
        <View style={{ gap: moderateScale(8) }}>
          <Skeleton w="40%" h={moderateScale(28)} radius={moderateScale(9)} />
          <Skeleton w="58%" h={moderateScale(13)} radius={moderateScale(7)} />
        </View>

        {/* Featured quiz — gold */}
        <View
          style={{
            backgroundColor: Colors.secondaryFixed,
            borderRadius: Radius.chunky,
            borderBottomWidth: 5,
            borderBottomColor: Colors.goldLip,
            padding: moderateScale(18),
          }}
        >
          <Skeleton w={moderateScale(52)} h={moderateScale(52)} radius={moderateScale(14)} {...onGold} style={{ marginBottom: moderateScale(12) }} />
          <Skeleton w="48%" h={moderateScale(18)} radius={moderateScale(8)} {...onGold} />
          <Skeleton w="34%" h={moderateScale(12)} radius={moderateScale(6)} {...onGold} style={{ marginTop: moderateScale(8) }} />
        </View>

        {/* 2-up red grid */}
        <View style={{ flexDirection: 'row', gap: moderateScale(11) }}>
          {[
            { bg: Colors.primaryContainer, lip: Colors.redLip },
            { bg: Colors.primary, lip: Colors.redLipDeep },
          ].map((c, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: moderateScale(150),
                borderRadius: Radius.chunky,
                backgroundColor: c.bg,
                borderBottomWidth: 5,
                borderBottomColor: c.lip,
                padding: moderateScale(16),
                justifyContent: 'flex-end',
                gap: moderateScale(8),
              }}
            >
              <Skeleton w="62%" h={moderateScale(16)} radius={moderateScale(7)} {...onRed} />
              <Skeleton w="84%" h={moderateScale(11)} radius={moderateScale(6)} {...onRed} />
            </View>
          ))}
        </View>

        {/* Wide — gold */}
        <View
          style={{
            height: moderateScale(96),
            borderRadius: Radius.chunky,
            backgroundColor: Colors.secondaryFixed,
            borderBottomWidth: 5,
            borderBottomColor: Colors.goldLip,
            padding: moderateScale(16),
            justifyContent: 'flex-end',
            gap: moderateScale(8),
          }}
        >
          <Skeleton w="38%" h={moderateScale(16)} radius={moderateScale(7)} {...onGold} />
          <Skeleton w="28%" h={moderateScale(11)} radius={moderateScale(6)} {...onGold} />
        </View>
      </View>
    </TabSkeletonShell>
  );
}

/** Profile (active=3): name → gold progress band → 2 stat cards → settings → sign-out. */
export function ProfileSkeleton({ streak = 0 }: { streak?: number }) {
  return (
    <TabSkeletonShell streak={streak}>
      <View style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, gap: moderateScale(16) }}>
        {/* Name */}
        <View style={{ gap: moderateScale(8) }}>
          <Skeleton w="50%" h={moderateScale(26)} radius={moderateScale(9)} />
          <Skeleton w="38%" h={moderateScale(12)} radius={moderateScale(6)} />
        </View>

        {/* Overall progress band — gold gradient */}
        <LinearGradient
          colors={[Colors.goldBright, Colors.secondaryContainer]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: Radius.chunky, borderBottomWidth: 5, borderBottomColor: Colors.goldLip, padding: moderateScale(18), gap: moderateScale(11) }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Skeleton w="44%" h={moderateScale(11)} radius={moderateScale(6)} {...onGold} />
            <Skeleton w={moderateScale(48)} h={moderateScale(22)} radius={moderateScale(7)} {...onGold} />
          </View>
          <Skeleton w="100%" h={moderateScale(9)} radius={moderateScale(99)} {...onGold} />
          <Skeleton w="56%" h={moderateScale(11)} radius={moderateScale(6)} {...onGold} />
        </LinearGradient>

        {/* Two stat cards */}
        <View style={{ flexDirection: 'row', gap: moderateScale(11) }}>
          {[0, 1].map((i) => (
            <SkelCard key={i} style={{ flex: 1, gap: moderateScale(7) }}>
              <Skeleton w={moderateScale(22)} h={moderateScale(22)} radius={moderateScale(7)} />
              <Skeleton w="42%" h={moderateScale(26)} radius={moderateScale(8)} style={{ marginTop: moderateScale(4) }} />
              <Skeleton w="72%" h={moderateScale(10)} radius={moderateScale(5)} />
            </SkelCard>
          ))}
        </View>

        {/* Settings list */}
        <View style={{ gap: moderateScale(11) }}>
          <Skeleton w="24%" h={moderateScale(11)} radius={moderateScale(6)} />
          <View
            style={{
              backgroundColor: '#ffffff',
              borderWidth: 1,
              borderColor: Colors.hairline,
              borderRadius: Radius.chunky,
              borderBottomWidth: 4,
              borderBottomColor: Colors.cardLip,
              overflow: 'hidden',
            }}
          >
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: moderateScale(13),
                  paddingVertical: moderateScale(15),
                  paddingHorizontal: moderateScale(16),
                  borderTopWidth: i ? 1 : 0,
                  borderTopColor: Colors.hairline,
                }}
              >
                <Skeleton w={moderateScale(20)} h={moderateScale(20)} radius={moderateScale(6)} />
                <Skeleton w={`${52 - i * 7}%`} h={moderateScale(13)} radius={moderateScale(7)} />
                <Skeleton w={moderateScale(16)} h={moderateScale(16)} radius={moderateScale(5)} style={{ marginLeft: 'auto' }} />
              </View>
            ))}
          </View>
        </View>

        {/* Sign out — tan */}
        <Skeleton w="100%" h={moderateScale(50)} radius={Radius.lg} c1="rgba(184,149,106,0.30)" c2="rgba(184,149,106,0.16)" />
      </View>
    </TabSkeletonShell>
  );
}
