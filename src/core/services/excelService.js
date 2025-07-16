import ExcelJS from 'exceljs';
import ProjectRecord from '../models/ProjectRecord';

const VALID_HEADERS = ['Ссылка', 'Просмотры', 'СИ', 'ЕР'];

export async function parseExcelFromPublic(path = '/спецпроекты.xlsx', periods = []) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Excel-файл не найден (${response.status})`);

  const buffer = await response.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const allRecords = [];
  const projects = [];

  workbook.eachSheet((sheet) => {
    const sheetName = sheet.name;
    const header = sheet.getRow(1).values;

    if (!VALID_HEADERS.every((h, i) => header[i + 1] === h)) return;

    let currentPeriod = '';
    const jsonData = [];

    sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return;

      let link = row.getCell(1).value;
      const views = row.getCell(2).value;
      const si = row.getCell(3).value;
      const er = row.getCell(4).value;

      if (typeof link === 'object' && (link.text || link.hyperlink)) {
        link = link.hyperlink || link.text;
      }

      if (periods.includes(link)) {
        currentPeriod = link;
        return;
      }

      const record = new ProjectRecord({
        link: typeof link === 'string' ? link : '',
        views: Number(views || 0),
        si: Number(si || 0),
        er: Number(er || 0),
        project: sheetName,
        period: currentPeriod
      });

      if (record.link) jsonData.push(record);
    });

    if (jsonData.length > 0) {
      allRecords.push(...jsonData);
      projects.push(sheetName);
    }
  });

  return {
    data: allRecords,
    projects
  };
}
