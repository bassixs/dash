const XLSX = require('xlsx');
const path = require('path');
const logger = console;

const filePath = path.join(__dirname, '../../../спецпроекты.xlsx');

const extractPeriodsAndPosts = (sheetName) => {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: ['Ссылка', 'Просмотры', 'СИ', 'ЕР'], defval: null });

    const periods = [];
    let currentPeriod = null;
    let currentPosts = [];

    for (const row of data.slice(1)) { // Пропускаем заголовок
      const link = row['Ссылка'];
      if (!link) continue;

      if (/^\d{2}\.\d{2} - \d{2}\.\d{2}$/.test(link)) {
        if (currentPeriod && currentPosts.length) {
          periods.push([currentPeriod, currentPosts]);
          currentPosts = [];
        }
        currentPeriod = link;
      } else if (link.startsWith('http')) {
        try {
          const post = {
            Просмотры: parseFloat(row['Просмотры'] || 0),
            СИ: parseFloat(row['СИ'] || 0),
            ЕР: parseFloat(row['ЕР'] || 0),
          };
          currentPosts.push(post);
        } catch (e) {
          logger.warn(`Ошибка в данных строки листа ${sheetName}: ${e.message}`);
        }
      }
    }

    if (currentPeriod && currentPosts.length) {
      periods.push([currentPeriod, currentPosts]);
    }

    logger.info(`Извлечено ${periods.length} периодов из листа ${sheetName}`);
    return periods;
  } catch (e) {
    logger.error(`Ошибка при обработке листа ${sheetName}: ${e.message}`);
    return [];
  }
};

// Кэширование данных
const cacheData = () => {
  const workbook = XLSX.readFile(filePath);
  const sheets = workbook.SheetNames.filter(sheet => sheet !== 'цифоры и нужное');
  const cachedData = {};

  for (const sheet of sheets) {
    cachedData[sheet] = extractPeriodsAndPosts(sheet);
  }

  return { sheets, cachedData };
};

module.exports = { extractPeriodsAndPosts, cacheData };