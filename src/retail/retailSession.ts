type RetailSession = {
  region: string;
  storeType: string;
  engagementScore: number;
};

let session: RetailSession = {
  region: 'NorCal',
  storeType: 'grocery',
  engagementScore: 0,
};

export const retailSession = {
  getSession: () => session,
  updateEngagement(scoreDelta: number) {
    session = { ...session, engagementScore: session.engagementScore + scoreDelta };
  },
  setRegion(region: string) {
    session = { ...session, region };
  },
};
