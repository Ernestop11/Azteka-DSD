import { syncQueue } from '../offline-sync/syncQueue';
import { syncScheduler } from '../offline-sync/syncScheduler';

export const offlineSyncDebugger = {
  logQueue() {
    console.groupCollapsed('[OfflineSyncDebugger]');
    console.log('Queue:', syncQueue.peekAll());
    console.groupEnd();
  },
  async flush() {
    await syncScheduler.flush();
    this.logQueue();
  },
};
