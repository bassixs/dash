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
    // Если не выбраны ни проект, ни период - возвращаем все данные
    if (!selectedProject && !selectedPeriod) {
      return data;
    }

    return data.filter((row) => {
      const matchProject = selectedProject ? row.project === selectedProject : true;
      const matchPeriod = selectedPeriod ? row.period === selectedPeriod : true;
      return matchProject && matchPeriod;
    });
  }, [data, selectedProject, selectedPeriod]);
}
