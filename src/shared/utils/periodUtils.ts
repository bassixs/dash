/**
 * Утилиты для работы с периодами
 */

/**
 * Сортирует периоды в обратном хронологическом порядке (последние сверху)
 * @param periods - массив периодов в формате "DD.MM - DD.MM"
 * @returns отсортированный массив периодов
 */
export function sortPeriods(periods: string[]): string[] {
  return periods.sort((a, b) => {
    const getStartDate = (period: string) => {
      const startDateStr = period.split(' - ')[0]; // "02.06" -> "02.06"
      const [day, month] = startDateStr.split('.');
      
      // Предполагаем, что год текущий или следующий
      const currentYear = new Date().getFullYear();
      const date = new Date(currentYear, parseInt(month) - 1, parseInt(day));
      
      // Если месяц меньше текущего месяца, то это следующий год
      const currentMonth = new Date().getMonth();
      if (parseInt(month) - 1 < currentMonth) {
        date.setFullYear(currentYear + 1);
      }
      
      return date;
    };
    
    const dateA = getStartDate(a);
    const dateB = getStartDate(b);
    
    // Сортируем в обратном порядке - последние сверху
    return dateB.getTime() - dateA.getTime();
  });
}

/**
 * Получает первый период из отсортированного массива (самый последний по времени)
 * @param periods - массив периодов
 * @returns последний период или null
 */
export function getLastPeriod(periods: string[]): string | null {
  if (periods.length === 0) return null;
  return periods[0]; // Первый элемент - это самый новый период
}

/**
 * Проверяет, является ли период валидным
 * @param period - период для проверки
 * @returns true если период валиден
 */
export function isValidPeriod(period: string): boolean {
  return Boolean(period && period.match(/^\d{2}\.\d{2}\s*-\s*\d{2}\.\d{2}$/));
} 