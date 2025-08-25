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
    console.log('useFilteredData Debug:', {
      dataLength: data.length,
      selectedProject,
      selectedPeriod,
      hasSelectedProject: !!selectedProject,
      hasSelectedPeriod: !!selectedPeriod,
      sampleData: data.slice(0, 2).map(r => ({
        project: r.project,
        period: r.period,
        views: r.views,
        si: r.si,
        er: r.er
      }))
    });

    // Если не выбраны ни проект, ни период - возвращаем все данные
    if (!selectedProject && !selectedPeriod) {
      console.log('No filters selected, returning all data');
      return data;
    }

    const filtered = data.filter((row) => {
      const matchProject = selectedProject && selectedProject.trim() !== '' ? row.project === selectedProject : true;
      const matchPeriod = selectedPeriod && selectedPeriod.trim() !== '' ? row.period === selectedPeriod : true;
      return matchProject && matchPeriod;
    });

    console.log('Filtered data result:', {
      filteredLength: filtered.length,
      sampleFiltered: filtered.slice(0, 2).map(r => ({
        project: r.project,
        period: r.period,
        views: r.views,
        si: r.si,
        er: r.er
      }))
    });

    return filtered;
  }, [data, selectedProject, selectedPeriod]);
}
