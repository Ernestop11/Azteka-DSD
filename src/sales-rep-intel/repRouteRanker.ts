type RouteStop = {
  customerId: string;
  priorityScore: number;
  estimatedOrderVolume: number;
  behaviorScore: number;
  seasonalScore: number;
};

export const repRouteRanker = {
  rankRoute(stops: RouteStop[]) {
    return stops
      .map(stop => ({
        ...stop,
        totalScore:
          stop.priorityScore * 0.4 +
          stop.estimatedOrderVolume * 0.3 +
          stop.behaviorScore * 0.2 +
          stop.seasonalScore * 0.1,
      }))
      .sort((a, b) => b.totalScore - a.totalScore);
  },
};
