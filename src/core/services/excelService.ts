import ExcelJS from 'exceljs';
import ProjectRecord, { ProjectRecord as ProjectRecordType } from '../models/ProjectRecord';

/**
 * Парсит Excel-файл и возвращает записи и проекты.
 * @param path Путь к файлу
 * @param periods Список периодов
 * @returns Объект с данными и проектами
 * @throws Ошибка при загрузке или парсинге файла
 */
export async function parseExcelFromPublic(path: string = '/projects.xlsx', periods: string[] = []): Promise<{ data: ProjectRecordType[]; projects: string[] }> {
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

    const allRecords: ProjectRecordType[] = [];
    const projects: string[] = [];
    const VALID_HEADERS = ['ссылка', 'просмотры', 'си', 'ер'].map(h => h.toLowerCase());

    workbook.eachSheet((sheet, sheetId) => {
      const jsonData: any[] = [];
      sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        jsonData.push(row.values.slice(1)); // Пропускаем первый элемент (индекс 0)
      });

      if (jsonData.length < 1) return;

      const header = jsonData[0].map((h: string) => h?.toLowerCase());
      if (!VALID_HEADERS.every((h, i) => header[i] === h)) return;

      let currentPeriod = '';
      const records: ProjectRecordType[] = [];

      jsonData.slice(1).forEach((row: any[]) => {
        const [link, views, si, er] = row;
        if (periods.includes(link)) {
          currentPeriod = link;
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

      if (records.length > 0) {
        allRecords.push(...records);
        projects.push(sheet.name);
      }
    });

    console.log('Parsed Excel data:', { records: allRecords.length, projects: projects.length });
    return { data: allRecords, projects };
  } catch (err) {
    console.error('Excel parsing error:', err);
    throw new Error(`Не удалось загрузить файл: ${err.message}`);
  }
}
