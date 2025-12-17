type Conflict = {
  action: string;
  reason: string;
};

export const syncConflictResolver = {
  resolve(conflicts: Conflict[]) {
    return conflicts.map(conflict => ({
      ...conflict,
      resolution: conflict.action === 'submitOrder' ? 'retry' : 'remove',
    }));
  },
};
