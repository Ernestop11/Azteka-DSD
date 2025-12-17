type SignalType =
  | 'addToCart'
  | 'productLongView'
  | 'fastScroll'
  | 'seasonalInterest'
  | 'categoryAffinity'
  | 'priceSensitivity';

type SignalPayload = Record<string, unknown>;
type SignalListener = (payload?: SignalPayload) => void;

const signalMap = new Map<SignalType, SignalListener[]>();

export const aiSignals = {
  emit(type: SignalType, payload?: SignalPayload) {
    const listeners = signalMap.get(type) ?? [];
    listeners.forEach(listener => listener(payload));
  },
  subscribe(type: SignalType, listener: SignalListener) {
    const listeners = signalMap.get(type) ?? [];
    listeners.push(listener);
    signalMap.set(type, listeners);
    return () => {
      const arr = signalMap.get(type);
      if (!arr) return;
      const index = arr.indexOf(listener);
      if (index >= 0) arr.splice(index, 1);
    };
  },
};

export type { SignalType, SignalPayload };
