import { useDashboardStore } from '../../../shared/store/useDashboardStore';
import { useMemo } from 'react';

export function useFilteredData(rawData) {
  const { selectedProject, selectedPeriod } = useDashboardStore();

  return useMemo(() => {
    return rawData.filter((item) => {
      const byProject = selectedProject ? item.project === selectedProject : true;
      const byPeriod = selectedPeriod ? item.period === selectedPeriod : true;
      return byProject && byPeriod;
    });
  }, [rawData, selectedProject, selectedPeriod]);
}
