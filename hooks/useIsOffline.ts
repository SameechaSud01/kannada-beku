type NetworkState = {
  isConnected?: boolean | null;
  isInternetReachable?: boolean | null;
};

// expo-network's ExpoNetwork module calls requireNativeModule('ExpoNetwork') at
// import time, which throws if the native module isn't in the running build —
// e.g. a dev client built before expo-network was added to the project. Catch
// that here so a stale build degrades to "online" instead of crashing the whole
// app at module-eval. Rebuild the dev client (`npx pod-install ios &&
// npx expo run:ios`) to restore real connectivity detection.
let nativeUseNetworkState: (() => NetworkState) | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  nativeUseNetworkState = require('expo-network').useNetworkState as () => NetworkState;
} catch {
  nativeUseNetworkState = null;
}

/** Fallback when the native module is absent: assume we're online. */
function useNetworkStateFallback(): NetworkState {
  return { isConnected: true, isInternetReachable: true };
}

const useNetworkState = nativeUseNetworkState ?? useNetworkStateFallback;

/**
 * Reactive connectivity flag (audit H1). True only when we're confident the
 * device is offline — an unknown/undetermined state reads as online so we never
 * flash a false "you're offline" screen on a slow first probe.
 *
 * Used to choose between <OfflineState> (caution, work-is-safe) and
 * <ErrorState> (genuine failure) when a fetch fails.
 */
export function useIsOffline(): boolean {
  const state = useNetworkState();
  if (state.isConnected === false) return true;
  if (state.isInternetReachable === false) return true;
  return false;
}
