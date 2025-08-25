import { useQuery, useQueryClient } from '@tanstack/react-query';
import { parseExcelFromPublic } from '@core/services/excelService';
import { ProjectRecordInterface } from '@core/models/ProjectRecord';

interface ExcelData {
  data: ProjectRecordInterface[];
  projects: string[];
}

/**
 * Хук для загрузки данных из Excel-файла.
 * @returns Результат запроса с данными и проектами
 */
export function useExcelData() {
  const result = useQuery<ExcelData, Error>({
    queryKey: ['excelData'],
    queryFn: () => parseExcelFromPublic('/спецпроекты.xlsx'),
    staleTime: 1000 * 60 * 5, // 5 минут вместо 12 часов
    cacheTime: 1000 * 60 * 10, // 10 минут кэш
    retry: 2,
    refetchOnWindowFocus: true, // Обновлять при фокусе окна
    refetchOnMount: true, // Обновлять при монтировании
  });

  // Отладочная информация
  if (result.data) {
    console.log('useExcelData Debug:', {
      dataLength: result.data.data.length,
      projects: result.data.projects,
      sampleData: result.data.data.slice(0, 3).map(r => ({
        project: r.project,
        period: r.period,
        views: r.views,
        si: r.si,
        er: r.er,
        viewsType: typeof r.views,
        siType: typeof r.si,
        erType: typeof r.er
      }))
    });
  }

  return result;
}

/**
 * Хук для принудительного обновления данных
 */
export function useRefreshExcelData() {
  const queryClient = useQueryClient();
  
  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['excelData'] });
    queryClient.refetchQueries({ queryKey: ['excelData'] });
  };
  
  return { refreshData };
}
