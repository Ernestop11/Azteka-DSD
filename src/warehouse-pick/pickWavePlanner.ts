type WavePlan = {
  wave: 'morning' | 'midday' | 'closing';
  orders: string[];
};

export const pickWavePlanner = {
  plan(orders: { orderId: string; priority: number }[]): WavePlan[] {
    const sorted = [...orders].sort((a, b) => b.priority - a.priority);
    const chunks = {
      morning: sorted.slice(0, Math.ceil(sorted.length / 3)),
      midday: sorted.slice(Math.ceil(sorted.length / 3), Math.ceil((sorted.length * 2) / 3)),
      closing: sorted.slice(Math.ceil((sorted.length * 2) / 3)),
    };
    return (Object.entries(chunks) as Array<[WavePlan['wave'], typeof chunks.morning]>).map(([wave, list]) => ({
      wave,
      orders: list.map(item => item.orderId),
    }));
  },
};
