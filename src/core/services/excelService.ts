import ExcelJS from 'exceljs';
import ProjectRecord, { ProjectRecordInterface } from '../models/ProjectRecord';

export async function parseExcelFromPublic(
  path: string = '/спецпроекты.xlsx',
  periods: string[] = []
): Promise<{ data: ProjectRecordInterface[]; projects: string[] }> {
  console.log('Attempting to fetch Excel file from:', path);
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Ошибка сети: ${response.status} ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    if (workbook.worksheets.length === 0) {
      throw new Error('Excel-файл пустой');
    }

    const allRecords: ProjectRecordInterface[] = [];
    const projects: string[] = [];
    const VALID_HEADERS = ['ссылка', 'просмотры', 'си', 'ер'].map(h => h.toLowerCase().trim());

    workbook.eachSheet((sheet) => {
      console.log(`Processing sheet: ${sheet.name}`);
      const jsonData: any[] = [];
      sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        const values = Array.isArray(row.values)
          ? row.values.slice(1)
          : Object.values(row.values || {}).slice(1);
        if (values.every((val: ExcelJS.CellValue) => val === undefined || val === null)) return;
        jsonData.push(values);
      });

      if (jsonData.length < 1) {
        console.warn(`No data in sheet: ${sheet.name}`);
        return;
      }

      const header = jsonData[0].map((h: string) => h?.toString().toLowerCase().trim() || '');
      if (!VALID_HEADERS.every((h, i) => header[i] === h)) {
        console.warn('Invalid headers in sheet:', sheet.name, header);
        return;
      }

      let currentPeriod = '';
      const records: ProjectRecordInterface[] = [];
      const periodsInSheet: string[] = [];

      console.log(`Processing ${jsonData.length} rows in sheet: ${sheet.name}`);

      jsonData.slice(1).forEach((row: any[], rowIndex: number) => {
        const [link, views, si, er] = row;
        
        // Проверяем, является ли строка периодом
        if (typeof link === 'string' && link.match(/^\d{2}\.\d{2}\s*-\s*\d{2}\.\d{2}$/)) {
          currentPeriod = link.trim();
          periodsInSheet.push(currentPeriod);
          console.log(`Found period in ${sheet.name} row ${rowIndex + 1}: "${currentPeriod}"`);
          return;
        }

        if (!link) return;

        // Отладочная информация для ЕР
        if (rowIndex < 5) { // Показываем первые 5 записей для отладки
          console.log(`ER Debug - Row ${rowIndex + 1}:`, {
            link,
            views,
            si,
            er,
            erType: typeof er,
            erNumber: Number(er),
            isFinite: Number.isFinite(Number(er)),
            currentPeriod
          });
        }

        const record = new ProjectRecord({
          link: typeof link === 'string' ? link : '',
          views: Number.isFinite(Number(views)) ? Number(views) : 0,
          si: Number.isFinite(Number(si)) ? Number(si) : 0,
          er: Number.isFinite(Number(er)) ? Number(er) : 0,
          project: sheet.name,
          period: currentPeriod,
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

    console.log('Final Excel parsing summary:', { 
      totalRecords: allRecords.length, 
      projects: projects.length,
      allPeriods: [...new Set(allRecords.map(r => r.period))],
      recordsWithPeriods: allRecords.filter(r => r.period).length,
      recordsWithoutPeriods: allRecords.filter(r => !r.period).length
    });

    return { data: allRecords, projects };
  } catch (err) {
    console.error('Excel parsing error:', err);
    throw new Error(`Не удалось загрузить файл: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
  }
}
