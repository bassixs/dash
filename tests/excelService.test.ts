import { describe, it, expect, vi, beforeEach } from 'vitest';
import ExcelJS from 'exceljs';
import { parseExcelFromPublic } from '@core/services/excelService';

// Мокаем ExcelJS
vi.mock('exceljs', () => ({
  default: {
    Workbook: vi.fn().mockImplementation(() => ({
      xlsx: {
        load: vi.fn().mockResolvedValue(undefined),
      },
      worksheets: [],
      eachSheet: vi.fn(),
    })),
  },
}));

describe('excelService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles empty workbook', async () => {
    // Мокаем fetch
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(8),
    } as Response);

    // Мокаем пустую книгу
    const mockWorkbook = {
      xlsx: {
        load: vi.fn().mockResolvedValue(undefined),
      },
      worksheets: [],
      eachSheet: vi.fn(),
    };

    vi.mocked(ExcelJS.Workbook).mockImplementation(() => mockWorkbook as unknown as ExcelJS.Workbook);

    await expect(parseExcelFromPublic('/test.xlsx')).rejects.toThrow('Excel-файл пустой');
  });

  it('handles network error', async () => {
    // Мокаем fetch с ошибкой
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    } as Response);

    await expect(parseExcelFromPublic('/test.xlsx')).rejects.toThrow('Ошибка сети: 404 Not Found');
  });

  it('handles fetch error', async () => {
    // Мокаем fetch с исключением
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

    await expect(parseExcelFromPublic('/test.xlsx')).rejects.toThrow('Не удалось загрузить файл: Network error');
  });
});