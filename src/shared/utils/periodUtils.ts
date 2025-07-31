/**
 * Утилиты для работы с периодами
 */

/**
 * Сортирует периоды в хронологическом порядке от прошлого к настоящему
 * @param periods - массив периодов в формате "DD.MM - DD.MM"
 * @returns отсортированный массив периодов
 */
export function sortPeriods(periods: string[]): string[] {
  return periods.sort((a, b) => {
    const getStartDate = (period: string) => {
      const startDateStr = period.split(' - ')[0]; // "02.06" -> "02.06"
      const [day, month] = startDateStr.split('.');
      
      // Предполагаем, что год текущий
      const currentYear = new Date().getFullYear();
      let date = new Date(currentYear, parseInt(month) - 1, parseInt(day));
      
      // Если месяц меньше текущего месяца, то это следующий год
      const currentMonth = new Date().getMonth();
      if (parseInt(month) - 1 < currentMonth) {
        date = new Date(currentYear + 1, parseInt(month) - 1, parseInt(day));
      }
      
      return date;
    };
    
    const dateA = getStartDate(a);
    const dateB = getStartDate(b);
    
    // Отладочная информация
    console.log('Period sorting debug:', {
      periodA: a,
      periodB: b,
      dateA: dateA.toISOString(),
      dateB: dateB.toISOString(),
      comparison: dateA.getTime() - dateB.getTime()
    });
    
    // Сортируем от прошлого к настоящему
    return dateA.getTime() - dateB.getTime();
  });
}

/**
 * Получает периоды в обратном порядке для отображения в фильтрах (последние сверху)
 * @param periods - массив периодов
 * @returns массив периодов в обратном порядке
 */
export function getPeriodsForDisplay(periods: string[]): string[] {
  return [...periods].reverse();
}

/**
 * Получает последний период из отсортированного массива (самый последний по времени)
 * @param periods - массив периодов
 * @returns последний период или null
 */
export function getLastPeriod(periods: string[]): string | null {
  if (periods.length === 0) return null;
  return periods[periods.length - 1]; // Последний элемент - это самый новый период
}

/**
 * Проверяет, является ли период валидным
 * @param period - период для проверки
 * @returns true если период валиден
 */
export function isValidPeriod(period: string): boolean {
  // Проверяем, что период не пустой и соответствует формату "DD.MM - DD.MM"
  if (!period || typeof period !== 'string') return false;
  
  // Убираем лишние пробелы
  const trimmedPeriod = period.trim();
  
  // Проверяем формат с помощью регулярного выражения
  const periodRegex = /^\d{2}\.\d{2}\s*-\s*\d{2}\.\d{2}$/;
  const isValid = periodRegex.test(trimmedPeriod);
  
  console.log('Period validation:', {
    period,
    trimmedPeriod,
    isValid,
    regexMatch: trimmedPeriod.match(periodRegex)
  });
  
  return isValid;
} 