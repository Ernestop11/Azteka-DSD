type SectionRecord = {
  id: string;
  dwellTime: number;
  lastEnter?: number;
};

const sections = new Map<string, SectionRecord>();

export const perfHeatmap = {
  enterSection(id: string) {
    const record = sections.get(id) ?? { id, dwellTime: 0 };
    record.lastEnter = performance.now();
    sections.set(id, record);
  },
  exitSection(id: string) {
    const record = sections.get(id);
    if (!record || record.lastEnter === undefined) return;
    record.dwellTime += performance.now() - record.lastEnter;
    record.lastEnter = undefined;
  },
  trackHover(id: string, duration: number) {
    const record = sections.get(id) ?? { id, dwellTime: 0 };
    record.dwellTime += duration;
    sections.set(id, record);
  },
  getHotspots(minDwell = 2000) {
    return Array.from(sections.values()).filter(record => record.dwellTime >= minDwell);
  },
};
