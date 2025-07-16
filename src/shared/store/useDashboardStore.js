import { create } from 'zustand';

export const useDashboardStore = create((set) => ({
  selectedProject: '',
  selectedPeriod: '14.07 - 20.07',
  setSelectedProject: (project) => set({ selectedProject: project }),
  setSelectedPeriod: (period) => set({ selectedPeriod: period }),
  resetFilters: () => set({ selectedProject: '', selectedPeriod: '14.07 - 20.07' })
}));
