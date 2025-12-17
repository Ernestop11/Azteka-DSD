type ConsumptionInput = {
  sku: string;
  dailySalesAvg: number;
  seasonalMultiplier: number;
};

export const stockConsumptionPredictor = {
  predict(inputs: ConsumptionInput[]) {
    return inputs.map(input => ({
      sku: input.sku,
      expectedConsumption: input.dailySalesAvg * input.seasonalMultiplier,
    }));
  },
};
