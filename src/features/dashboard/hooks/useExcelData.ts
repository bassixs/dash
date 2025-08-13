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
  return useQuery<ExcelData, Error>({
    queryKey: ['excelData'],
    queryFn: () => parseExcelFromPublic('/спецпроекты.xlsx'),
    staleTime: 1000 * 60 * 5, // 5 минут вместо 12 часов
    cacheTime: 1000 * 60 * 10, // 10 минут кэш
    retry: 2,
    refetchOnWindowFocus: true, // Обновлять при фокусе окна
    refetchOnMount: true, // Обновлять при монтировании
  });
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
