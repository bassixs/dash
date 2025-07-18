import { create } from 'zustand';

/**
 * Стор для управления фильтрами дашборда.
 */
export const useDashboardStore = create<{
  selectedProject: string;
  selectedPeriod: string;
  setSelectedProject: (project: string) => void;
  setSelectedPeriod: (period: string) => void;
  resetFilters: () => void;
}>((set) => ({
  selectedProject: '',
  selectedPeriod: '14.07 - 20.07',
  setSelectedProject: (project) => set({ selectedProject: project }),
  setSelectedPeriod: (period) => set({ selectedPeriod: period }),
  resetFilters: () => set({ selectedProject: '', selectedPeriod: '14.07 - 20.07' }),
}));
