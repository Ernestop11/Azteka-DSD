type EventName = 'click' | 'scrollDepth' | 'dwell' | 'addToCart';

type AnalyticsEvent = {
  name: EventName;
  payload?: Record<string, unknown>;
  timestamp: number;
};

const events: AnalyticsEvent[] = [];

export const retailAnalytics = {
  track(name: EventName, payload?: Record<string, unknown>) {
    events.push({ name, payload, timestamp: Date.now() });
  },
  getEvents() {
    return events;
  },
};
