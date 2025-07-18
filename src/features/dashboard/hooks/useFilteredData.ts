import { useMemo } from 'react';
import { useDashboardStore } from '../../../shared/store/useDashboardStore';
import { ProjectRecord } from '../../../core/models/ProjectRecord';

/**
 * Хук для фильтрации данных по выбранным проекту и периоду.
 * @param rawData Массив записей
 * @returns Отфильтрованные данные
 */
export function useFilteredData(rawData: ProjectRecord[]): ProjectRecord[] {
  const { selectedProject, selectedPeriod } = useDashboardStore();

  return useMemo(() => {
    return rawData.filter((item) => {
      const byProject = selectedProject ? item.project === selectedProject : true;
      const byPeriod = selectedPeriod ? item.period === selectedPeriod : true;
      return byProject && byPeriod;
    });
  }, [rawData, selectedProject, selectedPeriod]);
}
