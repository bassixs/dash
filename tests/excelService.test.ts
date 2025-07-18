import { vi, describe, it, expect, beforeEach } from 'vitest';
import { parseExcelFromPublic } from './excelService';
import ExcelJS from 'exceljs';
import ProjectRecord, { ProjectRecordInterface } from '../models/ProjectRecord';

// Мокаем fetch
global.fetch = vi.fn();

describe('parseExcelFromPublic', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should parse valid Excel file correctly', async () => {
    // Подготовка тестовых данных
    const mockSheetData = [
      ['ссылка', 'просмотры', 'си', 'ер'],
      ['2023-01'],
      ['link1', 100, 50, 0.05],
      ['link2', 200, 100, 0.1],
    ];

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('TestProject');
    mockSheetData.forEach(row => sheet.addRow(row));

    const buffer = await workbook.xlsx.write();
    const arrayBuffer = buffer.buffer;

    (global.fetch as any).mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(arrayBuffer),
    });

    const result = await parseExcelFromPublic('/mock.xlsx', ['2023-01']);

    expect(result.projects).toEqual(['TestProject']);
    expect(result.data).toHaveLength(2);
    expect(result.data[0]).toBeInstanceOf(ProjectRecord);
    expect(result.data[0]).toEqual({
      link: 'link1',
      views: 100,
      si: 50,
      er: 0.05,
      project: 'TestProject',
      period: '2023-01',
    });
  });

  it('should throw error for invalid file path', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    await expect(parseExcelFromPublic('/invalid.xlsx')).rejects.toThrow('Ошибка сети: 404 Not Found');
  });

  it('should throw error for empty workbook', async () => {
    const workbook = new ExcelJS.Workbook();
    const buffer = await workbook.xlsx.write();
    const arrayBuffer = buffer.buffer;

    (global.fetch as any).mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(arrayBuffer),
    });

    await expect(parseExcelFromPublic('/empty.xlsx')).rejects.toThrow('Excel-файл пустой');
  });
});