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

      jsonData.slice(1).forEach((row: any[], rowIndex: number) => {
        const [link, views, si, er] = row;
        if (typeof link === 'string' && link.match(/^\d{2}\.\d{2}\s*-\s*\d{2}\.\d{2}$/)) {
          currentPeriod = link;
          console.log(`Found period in ${sheet.name}: ${currentPeriod}`);
          return;
        }

        if (!link) return;

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

      console.log(`Sheet ${sheet.name} records:`, records.length, 'periods:', [...new Set(records.map(r => r.period))]);
      if (records.length > 0) {
        allRecords.push(...records);
        projects.push(sheet.name);
      }
    });

    console.log('Parsed Excel data:', { records: allRecords.length, projects: projects.length });
    return { data: allRecords, projects };
  } catch (err) {
    console.error('Excel parsing error:', err);
    throw new Error(`Не удалось загрузить файл: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
  }
}
