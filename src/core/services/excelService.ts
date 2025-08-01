import ExcelJS from 'exceljs';

import ProjectRecord, { ProjectRecordInterface } from '../models/ProjectRecord';

export async function parseExcelFromPublic(
  path: string = '/спецпроекты.xlsx'
): Promise<{ data: ProjectRecordInterface[]; projects: string[] }> {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Ошибка сети: ${response.status} ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    if (!workbook.worksheets || workbook.worksheets.length === 0) {
      throw new Error('Excel-файл пустой');
    }

    const allRecords: ProjectRecordInterface[] = [];
    const projects: string[] = [];
    const VALID_HEADERS = ['период', 'ссылка', 'просмотры', 'си', 'ер'].map(h => h.toLowerCase().trim());

    workbook.eachSheet((sheet) => {
      const jsonData: ExcelJS.CellValue[][] = [];
      sheet.eachRow({ includeEmpty: false }, (row) => {
        // Безопасная обработка значений строки
        const rowValues = row.values;
        if (!rowValues) return;
        
        const values = Array.isArray(rowValues)
          ? rowValues.slice(1)
          : Object.values(rowValues || {}).slice(1);
        
        if (values.every((val: ExcelJS.CellValue) => val === undefined || val === null)) return;
        jsonData.push(values);
      });

      if (jsonData.length < 1) {
        return;
      }

      const header = jsonData[0].map((h: ExcelJS.CellValue) => h?.toString().toLowerCase().trim() || '');
      
      if (!VALID_HEADERS.every((h, i) => header[i] === h)) {
        return;
      }

      const records: ProjectRecordInterface[] = [];
      const periodsInSheet: string[] = [];

      jsonData.slice(1).forEach((row: ExcelJS.CellValue[]) => {
        const [period, link, views, si, er] = row;
        
        // Проверяем, что период валидный
        if (!period || typeof period !== 'string' || !period.match(/^\d{2}\.\d{2}\s*-\s*\d{2}\.\d{2}$/)) {
          return;
        }

        // Проверяем, что есть ссылка
        if (!link) {
          return;
        }

        const trimmedPeriod = period.trim();
        periodsInSheet.push(trimmedPeriod);

        const record = new ProjectRecord({
          link: typeof link === 'string' ? link : '',
          views: Number.isFinite(Number(views)) ? Number(views) : 0,
          si: Number.isFinite(Number(si)) ? Number(si) : 0,
          er: Number.isFinite(Number(er)) ? Number(er) : 0,
          project: sheet.name,
          period: trimmedPeriod,
        });

        records.push(record);
      });

      if (records.length > 0) {
        allRecords.push(...records);
        if (!projects.includes(sheet.name)) {
          projects.push(sheet.name);
        }
      }
    });

    return {
      data: allRecords,
      projects: projects.sort()
    };
  } catch (err) {
    throw new Error(`Ошибка парсинга Excel: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
  }
}
