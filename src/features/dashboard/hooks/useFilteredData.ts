import { useMemo } from 'react';
import { useDashboardStore } from '@shared/store/useDashboardStore';
import { ProjectRecordInterface } from '@core/models/ProjectRecord';

/**
 * Хук для фильтрации данных по выбранным проекту и периоду.
 * @param data Массив записей
 * @returns Отфильтрованные данные
 */
export function useFilteredData(data: ProjectRecordInterface[]) {
  const { selectedProject, selectedPeriod } = useDashboardStore();

  return useMemo(() => {
    console.log('useFilteredData:', { dataLength: data.length, selectedProject, selectedPeriod });
    if (!selectedProject && !selectedPeriod) return data;

    const filtered = data.filter((row) => {
      const matchProject = selectedProject ? row.project === selectedProject : true;
      const matchPeriod = selectedPeriod ? row.period === selectedPeriod : true;
      return matchProject && matchPeriod;
    });
    console.log('Filtered data:', filtered.length);
    return filtered;
  }, [data, selectedProject, selectedPeriod]);
}
