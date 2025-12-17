type SessionState = {
  repId: string;
  visitedCustomers: string[];
  cartInteractions: number;
  estimatedOrderValue: number;
};

const sessionStore = new Map<string, SessionState>();

export const repSessionMemory = {
  startSession(repId: string) {
    sessionStore.set(repId, {
      repId,
      visitedCustomers: [],
      cartInteractions: 0,
      estimatedOrderValue: 0,
    });
  },
  recordVisit(repId: string, customerId: string) {
    const session = sessionStore.get(repId);
    if (!session) return;
    session.visitedCustomers.push(customerId);
  },
  recordCartInteraction(repId: string, valueChange: number) {
    const session = sessionStore.get(repId);
    if (!session) return;
    session.cartInteractions += 1;
    session.estimatedOrderValue += valueChange;
  },
  getSession(repId: string) {
    return sessionStore.get(repId);
  },
};
