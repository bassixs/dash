import ExcelJS from 'exceljs';

import ProjectRecord, { ProjectRecordInterface } from '../models/ProjectRecord';

export async function parseExcelFromPublic(
  path: string = '/спецпроекты.xlsx'
): Promise<{ data: ProjectRecordInterface[]; projects: string[] }> {
  // Добавляем timestamp для предотвращения кэширования
  const timestamp = Date.now();
  const urlWithTimestamp = `${path}?v=${timestamp}`;
  console.log('Attempting to fetch Excel file from:', urlWithTimestamp);
  try {
    const response = await fetch(urlWithTimestamp, {
      cache: 'no-cache', // Принудительно отключаем кэш
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
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
      console.log(`Processing sheet: ${sheet.name}`);
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
        console.warn(`No data in sheet: ${sheet.name}`);
        return;
      }

      const header = jsonData[0].map((h: ExcelJS.CellValue) => h?.toString().toLowerCase().trim() || '');
      console.log(`Sheet ${sheet.name} headers:`, header);
      
      if (!VALID_HEADERS.every((h, i) => header[i] === h)) {
        console.warn('Invalid headers in sheet:', sheet.name, header);
        return;
      }

      const records: ProjectRecordInterface[] = [];
      const periodsInSheet: string[] = [];

      console.log(`Processing ${jsonData.length} rows in sheet: ${sheet.name}`);

      jsonData.slice(1).forEach((row: ExcelJS.CellValue[], rowIndex: number) => {
        const [period, link, views, si, er] = row;
        
        // Проверяем, что период валидный
        if (!period || typeof period !== 'string' || !period.match(/^\d{2}\.\d{2}\s*-\s*\d{2}\.\d{2}$/)) {
          console.warn(`Invalid period in row ${rowIndex + 1}: "${period}"`);
          return;
        }

        // Проверяем, что есть ссылка
        if (!link) {
          console.warn(`No link in row ${rowIndex + 1}`);
          return;
        }

        const trimmedPeriod = period.trim();
        periodsInSheet.push(trimmedPeriod);

        // Дополнительная проверка и валидация данных
        const viewsNum = Number.isFinite(Number(views)) ? Number(views) : 0;
        const siNum = Number.isFinite(Number(si)) ? Number(si) : 0;
        const erNum = Number.isFinite(Number(er)) ? Number(er) : 0;
        
        // Отладочная информация для всех записей с проблемами
        if (isNaN(viewsNum) || isNaN(siNum) || isNaN(erNum) || 
            !isFinite(viewsNum) || !isFinite(siNum) || !isFinite(erNum)) {
          console.warn(`Row ${rowIndex + 1} - Invalid data:`, {
            period: trimmedPeriod,
            link,
            views,
            si,
            er,
            viewsNum,
            siNum,
            erNum,
            viewsType: typeof views,
            siType: typeof si,
            erType: typeof er
          });
        }
        
        // Отладочная информация для первых 5 записей
        if (rowIndex < 5) {
          console.log(`Row ${rowIndex + 1} debug:`, {
            period: trimmedPeriod,
            link,
            views,
            si,
            er,
            viewsNum,
            siNum,
            erNum,
            erType: typeof er,
            isFinite: Number.isFinite(Number(er))
          });
        }

        // Проверяем, что значения корректные
        if (viewsNum < 0 || siNum < 0 || erNum < 0) {
          console.warn(`Row ${rowIndex + 1}: Negative values detected:`, { views: viewsNum, si: siNum, er: erNum });
        }

        const record = new ProjectRecord({
          link: typeof link === 'string' ? link : '',
          views: viewsNum,
          si: siNum,
          er: erNum,
          project: sheet.name,
          period: trimmedPeriod,
        });

        records.push(record);
      });

      console.log(`Sheet ${sheet.name} summary:`, {
        totalRecords: records.length,
        periodsFound: periodsInSheet,
        uniquePeriods: [...new Set(periodsInSheet)],
        recordsWithPeriods: records.filter(r => r.period).length,
        recordsWithoutPeriods: records.filter(r => !r.period).length
      });

      if (records.length > 0) {
        allRecords.push(...records);
        projects.push(sheet.name);
      }
    });

    // Проверяем все записи на корректность данных
    const invalidRecords = allRecords.filter(r => 
      isNaN(r.views) || isNaN(r.si) || isNaN(r.er) || 
      !isFinite(r.views) || !isFinite(r.si) || !isFinite(r.er) ||
      r.views < 0 || r.si < 0 || r.er < 0
    );
    
    if (invalidRecords.length > 0) {
      console.warn('Found invalid records:', invalidRecords.slice(0, 5));
    }

    console.log('Final Excel parsing summary:', { 
      totalRecords: allRecords.length, 
      projects: projects.length,
      allPeriods: [...new Set(allRecords.map(r => r.period))],
      recordsWithPeriods: allRecords.filter(r => r.period).length,
      recordsWithoutPeriods: allRecords.filter(r => !r.period).length,
      invalidRecords: invalidRecords.length,
      validRecords: allRecords.length - invalidRecords.length
    });

    return { data: allRecords, projects };
  } catch (err) {
    console.error('Excel parsing error:', err);
    throw new Error(`Не удалось загрузить файл: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
  }
}
