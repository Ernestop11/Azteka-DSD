type PreferenceSignal =
  | 'likedProduct'
  | 'repeatPurchase'
  | 'promoInterest'
  | 'categoryAffinity';

type PreferenceListener = (payload?: Record<string, unknown>) => void;

const prefRegistry = new Map<PreferenceSignal, Set<PreferenceListener>>();

const ensureSet = (signal: PreferenceSignal) => {
  if (!prefRegistry.has(signal)) {
    prefRegistry.set(signal, new Set());
  }
  return prefRegistry.get(signal)!;
};

export const preferenceSignals = {
  emit(signal: PreferenceSignal, payload?: Record<string, unknown>) {
    ensureSet(signal).forEach(listener => listener(payload));
  },
  subscribe(signal: PreferenceSignal, listener: PreferenceListener) {
    ensureSet(signal).add(listener);
    return () => ensureSet(signal).delete(listener);
  },
};
