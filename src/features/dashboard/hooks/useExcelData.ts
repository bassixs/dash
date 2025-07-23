import { useQuery } from '@tanstack/react-query';
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
    staleTime: 1000 * 60 * 60 * 12, // 12 часов
    retry: 2,
  });
}
