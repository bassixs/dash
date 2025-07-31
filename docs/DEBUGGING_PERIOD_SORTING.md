# Отладка сортировки периодов и прогресс бара

## 🔍 Проблема

Пользователь сообщил, что:
1. **Сортировка периодов неправильная** - периоды отображаются в хаотичном порядке
2. **Прогресс бар привязан к неправильному периоду** - показывает данные для `30.06 - 06.07` вместо актуального `14.07 - 20.07`

## 🛠️ Добавленная отладочная информация

### 1. **В `periodUtils.ts`:**

#### **Улучшенная функция `isValidPeriod`:**
```typescript
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
```

#### **Отладочная информация в `sortPeriods`:**
```typescript
// Отладочная информация
console.log('Period sorting debug:', {
  periodA: a,
  periodB: b,
  dateA: dateA.toISOString(),
  dateB: dateB.toISOString(),
  comparison: dateA.getTime() - dateB.getTime()
});
```

### 2. **В `FiltersPanel.tsx`:**

#### **Подробная отладка сортировки:**
```typescript
// Получаем все периоды из данных
const allPeriods = [...new Set(data.data.map((r: ProjectRecordInterface) => r.period))];
console.log('All periods from data:', allPeriods);

// Фильтруем валидные периоды
const validPeriods = allPeriods.filter(isValidPeriod);
console.log('Valid periods:', validPeriods);

// Сортируем периоды
const sortedPeriods = sortPeriods(validPeriods);
console.log('Sorted periods:', sortedPeriods);

// Получаем периоды в обратном порядке для отображения (последние сверху)
const displayPeriods = getPeriodsForDisplay(sortedPeriods);
console.log('Display periods:', displayPeriods);
```

### 3. **В `DashboardPage` (index.tsx):**

#### **Отладка периодов для прогресс бара:**
```typescript
const periods = useMemo(() => {
  const allPeriods = [...new Set(data?.data.map((r: ProjectRecordInterface) => r.period) || [])];
  console.log('DashboardPage - All periods:', allPeriods);
  
  const validPeriods = allPeriods.filter(isValidPeriod);
  console.log('DashboardPage - Valid periods:', validPeriods);
  
  const sortedPeriods = sortPeriods(validPeriods);
  console.log('DashboardPage - Sorted periods:', sortedPeriods);
  
  return sortedPeriods;
}, [data]);
```

## 🔧 Исправления

### 1. **Улучшен парсинг дат:**
```typescript
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
```

### 2. **Улучшена валидация периодов:**
- ✅ **Проверка на пустые значения**
- ✅ **Проверка типа данных**
- ✅ **Удаление лишних пробелов**
- ✅ **Подробная отладочная информация**

## 📊 Что покажет отладка

### **В консоли браузера вы увидите:**

1. **Все периоды из данных:**
   ```
   All periods from data: ["02.06 - 08.06", "09.06 - 15.06", ...]
   ```

2. **Валидные периоды после фильтрации:**
   ```
   Valid periods: ["02.06 - 08.06", "09.06 - 15.06", ...]
   ```

3. **Отсортированные периоды:**
   ```
   Sorted periods: ["02.06 - 08.06", "09.06 - 15.06", ...]
   ```

4. **Периоды для отображения (в обратном порядке):**
   ```
   Display periods: ["14.07 - 20.07", "07.07 - 13.07", ...]
   ```

5. **Отладка сортировки:**
   ```
   Period sorting debug: {
     periodA: "02.06 - 08.06",
     periodB: "09.06 - 15.06",
     dateA: "2024-06-02T00:00:00.000Z",
     dateB: "2024-06-09T00:00:00.000Z",
     comparison: -604800000
   }
   ```

6. **Валидация периодов:**
   ```
   Period validation: {
     period: "02.06 - 08.06",
     trimmedPeriod: "02.06 - 08.06",
     isValid: true,
     regexMatch: ["02.06 - 08.06"]
   }
   ```

## 🎯 Ожидаемый результат

После исправлений:

### **Правильная сортировка периодов:**
```
Все периоды
14.07 - 20.07 ← Последний (самый новый)
07.07 - 13.07
30.06 - 06.07
23.06 - 29.06
16.06 - 22.06
09.06 - 15.06
02.06 - 08.06
```

### **Прогресс бар для актуального периода:**
- ✅ **Показывает данные для `14.07 - 20.07`**
- ✅ **Автоматически обновляется** при новых данных

## 🔍 Как проверить

1. **Откройте приложение** в браузере
2. **Откройте консоль разработчика** (F12)
3. **Проверьте логи** - они покажут все этапы обработки периодов
4. **Проверьте фильтры** - периоды должны быть отсортированы правильно
5. **Проверьте прогресс бар** - он должен показывать данные для последнего периода

## 🚀 Следующие шаги

Если проблема все еще остается:

1. **Проверьте логи в консоли** - они покажут, где именно происходит ошибка
2. **Проверьте формат периодов** в Excel файле
3. **Проверьте, правильно ли парсятся даты** в функции `getStartDate`

Отладочная информация поможет точно определить, где происходит ошибка! 🔍 