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
    console.log('useFilteredData:', { 
      dataLength: data.length, 
      selectedProject, 
      selectedPeriod,
      hasSelectedProject: !!selectedProject,
      hasSelectedPeriod: !!selectedPeriod
    });
    
    // Если не выбраны ни проект, ни период - возвращаем все данные
    if (!selectedProject && !selectedPeriod) {
      console.log('No filters selected, returning all data');
      return data;
    }

    const filtered = data.filter((row) => {
      const matchProject = selectedProject ? row.project === selectedProject : true;
      const matchPeriod = selectedPeriod ? row.period === selectedPeriod : true;
      return matchProject && matchPeriod;
    });
    
    console.log('Filtered data:', {
      originalLength: data.length,
      filteredLength: filtered.length,
      selectedProject,
      selectedPeriod
    });
    
    return filtered;
  }, [data, selectedProject, selectedPeriod]);
}
