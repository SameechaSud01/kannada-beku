import { moderateScale } from 'react-native-size-matters';

export const Spacing = {
  xs: moderateScale(4),
  sm: moderateScale(8),
  md: moderateScale(12),
  lg: moderateScale(16),
  xl: moderateScale(20),
  xxl: moderateScale(24),
  xxxl: moderateScale(32),
};

export const Radius = {
  sm: moderateScale(8),
  md: moderateScale(10),
  lg: moderateScale(14),
  // Chunky kit v3 — default card/button radius (16) + inner tile radius (12).
  chunky: moderateScale(16),
  tile: moderateScale(12),
  xl: moderateScale(20),
  full: 999,
};
