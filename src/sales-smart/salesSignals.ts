type SalesSignal =
  | 'addToCart'
  | 'removeFromCart'
  | 'longView'
  | 'fastScroll'
  | 'reorderClick'
  | 'dealInterest';

type SalesPayload = Record<string, unknown>;
type SalesListener = (payload?: SalesPayload) => void;

const signalRegistry = new Map<SalesSignal, Set<SalesListener>>();

const ensureSet = (signal: SalesSignal) => {
  if (!signalRegistry.has(signal)) {
    signalRegistry.set(signal, new Set());
  }
  return signalRegistry.get(signal)!;
};

export const salesSignals = {
  emit(signal: SalesSignal, payload?: SalesPayload) {
    ensureSet(signal).forEach(listener => listener(payload));
  },
  subscribe(signal: SalesSignal, listener: SalesListener) {
    ensureSet(signal).add(listener);
    return () => ensureSet(signal).delete(listener);
  },
  clear() {
    signalRegistry.forEach(set => set.clear());
  },
};

export type { SalesSignal, SalesPayload, SalesListener };
