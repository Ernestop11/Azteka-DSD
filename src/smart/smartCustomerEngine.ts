type CustomerProfile = {
  type: 'grocery' | 'gas_station' | 'liquor' | 'mini_market';
  region: 'NorCal' | 'SoCal' | 'BayArea' | 'Valley';
  tier: 'A' | 'B' | 'C';
};

const mockCustomer: CustomerProfile = {
  type: 'grocery',
  region: 'BayArea',
  tier: 'B',
};

export const getCustomerProfile = (): CustomerProfile => mockCustomer;

export const choosePriceMode = (tier: CustomerProfile['tier']) => {
  if (tier === 'A') return 'A';
  if (tier === 'B') return 'B';
  return 'C';
};

export const chooseLayoutByStoreType = (type: CustomerProfile['type']) => {
  switch (type) {
    case 'gas_station':
      return 'compact';
    case 'liquor':
      return 'premium-stack';
    case 'mini_market':
      return 'quick-grid';
    default:
      return 'standard';
  }
};

export const choosePromoByRegion = (region: CustomerProfile['region']) => {
  switch (region) {
    case 'NorCal':
      return 'bg-catalog-blue';
    case 'SoCal':
      return 'bg-retail-orange';
    case 'BayArea':
      return 'bg-posada-purple';
    case 'Valley':
      return 'bg-foil-green';
    default:
      return 'bg-retail-orange';
  }
};
