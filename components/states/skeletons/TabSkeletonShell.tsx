import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Colors } from '../../../constants/colors';
import { Watermark } from '../../ui/Watermark';
import { TopBar } from '../../ui/TopBar';

/**
 * Shared chrome for the per-tab loading skeletons: the real cream page bg,
 * kolam watermark and TopBar (wordmark + streak), so only the body shimmers and
 * there's no chrome reflow when data arrives. The floating TabBar comes from the
 * (tabs) navigator, so skeletons don't render it.
 */
export function TabSkeletonShell({
  streak = 0,
  children,
}: {
  streak?: number;
  children: ReactNode;
}) {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.surfaceCream }}>
      <Watermark motif="kolamGrid" />
      <TopBar streak={streak} onStreakPress={() => {}} />
      {children}
    </View>
  );
}
