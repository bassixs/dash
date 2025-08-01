import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface KPI {
  id: string;
  project: string;
  period: string;
  targetViews: number;
  targetSI: number;
  targetER: number;
  createdAt: string;
  updatedAt: string;
}

export interface Progress {
  id: string;
  project: string;
  period: string;
  currentViews: number;
  currentSI: number;
  currentER: number;
  lastUpdated: string;
}

export interface KPIStore {
  // KPI настройки
  kpis: KPI[];
  currentKPI: KPI | null;
  
  // Прогресс
  progress: Progress[];
  currentProgress: Progress | null;
  
  // Actions для KPI
  addKPI: (kpi: Omit<KPI, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateKPI: (id: string, updates: Partial<KPI>) => void;
  deleteKPI: (id: string) => void;
  setCurrentKPI: (project: string, period: string) => void;
  
  // Actions для прогресса
  updateProgress: (project: string, period: string, data: { views: number; si: number; er: number }) => void;
  setCurrentProgress: (project: string, period: string) => void;
  
  // Вспомогательные методы
  getKPIForProject: (project: string, period: string) => KPI | null;
  getProgressForProject: (project: string, period: string) => Progress | null;
  calculateProgressPercentage: (project: string, period: string) => {
    views: number;
    si: number;
    er: number;
  };
}

export const useKPIStore = create<KPIStore>()(
  persist(
    (set, get) => ({
      kpis: [],
      currentKPI: null,
      progress: [],
      currentProgress: null,

      addKPI: (kpiData) => {
        const newKPI: KPI = {
          ...kpiData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set((state) => ({
          kpis: [...state.kpis, newKPI],
          currentKPI: newKPI,
        }));
      },

      updateKPI: (id, updates) => {
        set((state) => ({
          kpis: state.kpis.map((kpi) =>
            kpi.id === id
              ? { ...kpi, ...updates, updatedAt: new Date().toISOString() }
              : kpi
          ),
          currentKPI: state.currentKPI?.id === id
            ? { ...state.currentKPI, ...updates, updatedAt: new Date().toISOString() }
            : state.currentKPI,
        }));
      },

      deleteKPI: (id) => {
        set((state) => ({
          kpis: state.kpis.filter((kpi) => kpi.id !== id),
          currentKPI: state.currentKPI?.id === id ? null : state.currentKPI,
        }));
      },

      setCurrentKPI: (project, period) => {
        const kpi = get().getKPIForProject(project, period);
        set({ currentKPI: kpi });
      },

      updateProgress: (project, period, data) => {
        const existingProgress = get().getProgressForProject(project, period);
        
        if (existingProgress) {
          set((state) => ({
            progress: state.progress.map((p) =>
              p.id === existingProgress.id
                ? { ...p, ...data, lastUpdated: new Date().toISOString() }
                : p
            ),
          }));
        } else {
          const newProgress: Progress = {
            id: crypto.randomUUID(),
            project,
            period,
            currentViews: data.views,
            currentSI: data.si,
            currentER: data.er,
            lastUpdated: new Date().toISOString(),
          };
          
          set((state) => ({
            progress: [...state.progress, newProgress],
          }));
        }
      },

      setCurrentProgress: (project, period) => {
        const progress = get().getProgressForProject(project, period);
        set({ currentProgress: progress });
      },

      getKPIForProject: (project, period) => {
        return get().kpis.find(
          (kpi) => kpi.project === project && kpi.period === period
        ) || null;
      },

      getProgressForProject: (project, period) => {
        return get().progress.find(
          (p) => p.project === project && p.period === period
        ) || null;
      },

      calculateProgressPercentage: (project, period) => {
        const kpi = get().getKPIForProject(project, period);
        const progress = get().getProgressForProject(project, period);
        
        if (!kpi || !progress) {
          return { views: 0, si: 0, er: 0 };
        }
        
        return {
          views: kpi.targetViews > 0 ? (progress.currentViews / kpi.targetViews) * 100 : 0,
          si: kpi.targetSI > 0 ? (progress.currentSI / kpi.targetSI) * 100 : 0,
          er: kpi.targetER > 0 ? (progress.currentER / kpi.targetER) * 100 : 0,
        };
      },
    }),
    {
      name: 'kpi-storage',
      partialize: (state) => ({
        kpis: state.kpis,
        progress: state.progress,
      }),
    }
  )
); 