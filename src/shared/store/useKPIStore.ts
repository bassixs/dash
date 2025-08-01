import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Telegram Web App API
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe: Record<string, unknown>;
        MainButton: Record<string, unknown>;
        BackButton: Record<string, unknown>;
        HapticFeedback: Record<string, unknown>;
        CloudStorage: {
          getItem: (key: string) => Promise<string | null>;
          setItem: (key: string, value: string) => Promise<void>;
          getItems: (keys: string[]) => Promise<{ [key: string]: string | null }>;
          setItems: (items: { [key: string]: string }) => Promise<void>;
          removeItems: (keys: string[]) => Promise<void>;
        };
      };
    };
  }
}

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
  
  // Инициализация
  init: () => Promise<void>;
  
  // Actions для KPI
  addKPI: (kpi: Omit<KPI, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateKPI: (id: string, updates: Partial<KPI>) => void;
  deleteKPI: (id: string) => void;
  setCurrentKPI: (project: string, period: string) => void;
  
  // Actions для прогресса
  updateProgress: (project: string, period: string, data: { views: number; si: number; er: number }) => void;
  setCurrentProgress: (project: string, period: string) => void;
  
  // Синхронизация
  syncKPIData: () => Promise<void>;
  loadKPIData: () => Promise<void>;
  clearKPIData: () => void;
  
  // Экспорт/Импорт
  exportKPIData: () => string;
  importKPIData: (dataString: string) => boolean;
  
  // Вспомогательные методы
  getKPIForProject: (project: string, period: string) => KPI | null;
  getProgressForProject: (project: string, period: string) => Progress | null;
  calculateProgressPercentage: (project: string, period: string) => {
    views: number;
    si: number;
    er: number;
  };
}

// Функция для синхронизации с Telegram Cloud Storage
const syncWithTelegram = async (key: string, data: unknown) => {
  try {
    // Для тестирования используем только localStorage
    console.log(`Syncing ${key} to localStorage:`, data);
    localStorage.setItem(`kpi-${key}`, JSON.stringify(data));
    console.log(`Successfully synced ${key} to localStorage`);

    // Попытка синхронизации с Telegram Cloud Storage (если доступен)
    if (window.Telegram?.WebApp?.CloudStorage) {
      try {
        console.log(`Attempting to sync ${key} with Telegram Cloud Storage`);
        await window.Telegram.WebApp.CloudStorage.setItem(key, JSON.stringify(data));
        console.log(`Successfully synced ${key} with Telegram Cloud Storage`);
      } catch (telegramError) {
        console.warn('Failed to sync with Telegram Cloud Storage:', telegramError);
      }
    } else {
      console.log('Telegram Cloud Storage not available, using localStorage only');
    }
  } catch (error) {
    console.warn('Failed to sync data:', error);
    // Fallback на localStorage
    try {
      localStorage.setItem(`kpi-${key}`, JSON.stringify(data));
      console.log(`Successfully saved ${key} to localStorage after error`);
    } catch (localError) {
      console.warn('Failed to save to localStorage:', localError);
    }
  }
};

// Функция для загрузки из Telegram Cloud Storage
const loadFromTelegram = async (key: string): Promise<unknown> => {
  try {
    // Сначала пробуем localStorage
    console.log(`Loading ${key} from localStorage`);
    const localData = localStorage.getItem(`kpi-${key}`);
    if (localData) {
      console.log(`Successfully loaded ${key} from localStorage:`, localData);
      return JSON.parse(localData);
    }

    // Затем пробуем Telegram Cloud Storage (если доступен)
    if (window.Telegram?.WebApp?.CloudStorage) {
      console.log(`Loading ${key} from Telegram Cloud Storage`);
      const data = await window.Telegram.WebApp.CloudStorage.getItem(key);
      if (data) {
        // Проверяем, что это не HTML-страница
        if (typeof data === 'string' && data.trim().startsWith('<')) {
          console.warn(`Received HTML instead of JSON for ${key}:`, data.substring(0, 100));
          return null;
        }
        console.log(`Successfully loaded ${key} from Telegram Cloud Storage:`, data);
        return JSON.parse(data);
      } else {
        console.log(`No data found for ${key} in Telegram Cloud Storage`);
      }
    } else {
      console.log('Telegram Cloud Storage not available');
    }
  } catch (error) {
    console.warn('Failed to load data:', error);
  }
  return null;
};

export const useKPIStore = create<KPIStore>()(
  persist(
    (set, get) => ({
      kpis: [],
      currentKPI: null,
      progress: [],
      currentProgress: null,

      // Автоматически загружаем данные при инициализации
      init: async () => {
        console.log('Initializing KPI store...');
        const kpiData = await loadFromTelegram('kpi-data') as KPI[] | null;
        const progressData = await loadFromTelegram('kpi-progress') as Progress[] | null;

        if (kpiData) {
          set({ kpis: kpiData });
          console.log('KPI data initialized:', kpiData);
        }
        if (progressData) {
          set({ progress: progressData });
          console.log('Progress data initialized:', progressData);
        }
      },

      addKPI: async (kpiData) => {
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

        // Принудительно синхронизируем с Telegram Cloud Storage
        const updatedKPIs = [...get().kpis, newKPI];
        console.log('Adding KPI and syncing:', newKPI);
        await syncWithTelegram('kpi-data', updatedKPIs);
      },

      updateKPI: async (id, updates) => {
        set((state) => ({
          kpis: state.kpis.map((kpi) =>
            kpi.id === id
              ? { ...kpi, ...updates, updatedAt: new Date().toISOString() }
              : kpi
          ),
          currentKPI: state.currentKPI?.id === id ? { ...state.currentKPI, ...updates, updatedAt: new Date().toISOString() } : state.currentKPI,
        }));

        // Принудительно синхронизируем с Telegram Cloud Storage
        console.log('Updating KPI and syncing:', { id, updates });
        await syncWithTelegram('kpi-data', get().kpis);
      },

      deleteKPI: async (id) => {
        set((state) => ({
          kpis: state.kpis.filter((kpi) => kpi.id !== id),
          currentKPI: state.currentKPI?.id === id ? null : state.currentKPI,
        }));

        // Принудительно синхронизируем с Telegram Cloud Storage
        console.log('Deleting KPI and syncing:', { id });
        await syncWithTelegram('kpi-data', get().kpis);
      },

      setCurrentKPI: (project, period) => {
        const kpi = get().getKPIForProject(project, period);
        set({ currentKPI: kpi });
      },

      updateProgress: async (project, period, data) => {
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

        // Синхронизируем прогресс с Telegram Cloud Storage
        await syncWithTelegram('kpi-progress', get().progress);
      },

      setCurrentProgress: (project, period) => {
        const progress = get().getProgressForProject(project, period);
        set({ currentProgress: progress });
      },

      syncKPIData: async () => {
        try {
          console.log('Syncing KPI data...');
          // Синхронизируем KPI данные
          await syncWithTelegram('kpi-data', get().kpis);
          // Синхронизируем прогресс
          await syncWithTelegram('kpi-progress', get().progress);
          console.log('KPI data synced successfully');
        } catch (error) {
          console.warn('Failed to sync KPI data:', error);
        }
      },

      loadKPIData: async () => {
        try {
          console.log('Loading KPI data...');
          // Загружаем KPI данные из Telegram Cloud Storage
          const kpiData = await loadFromTelegram('kpi-data') as KPI[] | null;
          const progressData = await loadFromTelegram('kpi-progress') as Progress[] | null;

          console.log('Loaded KPI data:', { kpiData: kpiData?.length || 0, progressData: progressData?.length || 0 });

          if (kpiData) {
            set({ kpis: kpiData });
            console.log('KPI data loaded successfully:', kpiData);
          }
          if (progressData) {
            set({ progress: progressData });
            console.log('Progress data loaded successfully:', progressData);
          }
        } catch (error) {
          console.warn('Failed to load KPI data:', error);
        }
      },

      clearKPIData: () => {
        set({ kpis: [], currentKPI: null });
        console.log('KPI data cleared.');
        syncWithTelegram('kpi-data', []);
      },

      exportKPIData: () => {
        return JSON.stringify({
          kpis: get().kpis,
          progress: get().progress,
          exportDate: new Date().toISOString()
        });
      },

      importKPIData: (dataString: string) => {
        try {
          // Проверяем, что это не HTML-страница
          if (dataString.trim().startsWith('<')) {
            console.warn('Received HTML instead of JSON for import');
            return false;
          }

          const data = JSON.parse(dataString) as { kpis: KPI[]; progress: Progress[] };
          if (data.kpis && data.progress) {
            set({
              kpis: data.kpis,
              progress: data.progress
            });
            console.log('Successfully imported KPI data:', data);
            return true;
          } else {
            console.warn('Invalid KPI data format - missing kpis or progress');
            return false;
          }
        } catch (error) {
          console.warn('Failed to import KPI data:', error);
          return false;
        }
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