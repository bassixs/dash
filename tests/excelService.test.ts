import { describe, it, expect, vi } from 'vitest';
import ExcelJS from 'exceljs';
import { parseExcelFromPublic } from '@core/services/excelService';

describe('excelService', () => {
  it('handles non-array row.values', async () => {
    // Мокаем fetch
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(8),
    } as Response);

    // Создаем объект для мока xlsx
    const mockXlsx = {
      load: vi.fn().mockResolvedValue(undefined),
    };

    // Создаем объект для мока Worksheet
    const mockWorksheet = {
      eachRow: vi.fn().mockImplementation((cb: (row: ExcelJS.Row, rowNumber: number) => void) => {
        cb(
          {
            values: { 1: 'ссылка', 2: 'просмотры', 3: 'си', 4: 'ер' },
            getCell: (col: number) => ({
              value: ['ссылка', 'просмотры', 'си', 'ер'][col - 1],
            }),
          } as unknown as ExcelJS.Row,
          1
        );
      }),
    };

    // Мокаем Workbook и его метод xlsx
    vi.spyOn(ExcelJS, 'Workbook').mockImplementation(() => ({
      xlsx: mockXlsx,
      getWorksheet: vi.fn().mockReturnValue(mockWorksheet),
    } as unknown as ExcelJS.Workbook));

    const result = await parseExcelFromPublic('/спецпроекты.xlsx');
    expect(result.data).toEqual([]);
    expect(result.projects).toEqual([]);
  });
});