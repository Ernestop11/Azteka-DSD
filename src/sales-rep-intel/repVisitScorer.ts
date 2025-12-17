type VisitInput = {
  customerId: string;
  daysSinceLastVisit: number;
  seasonalDemandScore: number;
  orderVolumeScore: number;
  missedReorders: number;
};

export const repVisitScorer = {
  scoreVisit(input: VisitInput) {
    const weights = {
      daysSinceLastVisit: 0.25,
      seasonalDemandScore: 0.3,
      orderVolumeScore: 0.3,
      missedReorders: 0.15,
    };

    const normalizedDays = Math.min(input.daysSinceLastVisit / 14, 1);
    const score =
      normalizedDays * weights.daysSinceLastVisit +
      input.seasonalDemandScore * weights.seasonalDemandScore +
      input.orderVolumeScore * weights.orderVolumeScore +
      Math.min(input.missedReorders / 3, 1) * weights.missedReorders;

    return Math.round(score * 100) / 100;
  },
};
