import { useQuery } from '@tanstack/react-query';
import { parseExcelFromPublic } from '../../../core/services/excelService';

const DEFAULT_PERIODS = [
  '02.06 - 08.06', '09.06 - 15.06', '16.06 - 22.06',
  '23.06 - 29.06', '30.06 - 06.07', '07.07 - 13.07', '14.07 - 20.07'
];

export function useExcelData() {
  return useQuery({
    queryKey: ['excel-data'],
    queryFn: () => parseExcelFromPublic('/спецпроекты.xlsx', DEFAULT_PERIODS),
    staleTime: 1000 * 60 * 60 * 12 // 12 часов
  });
}
