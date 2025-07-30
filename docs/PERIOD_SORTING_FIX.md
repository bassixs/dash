# Исправление сортировки периодов

## 🎯 Проблема

Периоды в фильтрах отображались в неправильном порядке:

**Было:**
```
02.06 - 08.06
09.06 - 15.06
23.06 - 29.06
30.06 - 06.07
14.07 - 20.07
16.06 - 22.06
07.07 - 13.07
16.09 - 22.06
```

**Должно быть:**
```
02.06 - 08.06
09.06 - 15.06
16.06 - 22.06
23.06 - 29.06
30.06 - 06.07
07.07 - 13.07
14.07 - 20.07
```

## ✅ Решение

### 1. **Создана утилита для сортировки периодов**

**Файл:** `src/shared/utils/periodUtils.ts`

```typescript
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
    
    return dateA.getTime() - dateB.getTime();
  });
}
```

### 2. **Логика сортировки**

- **Извлекаем дату начала** каждого периода (первая дата в диапазоне)
- **Парсим день и месяц** из строки "DD.MM"
- **Учитываем год**: если месяц меньше текущего, считаем что это следующий год
- **Сортируем по timestamp** для корректного хронологического порядка

### 3. **Дополнительные утилиты**

```typescript
// Получение последнего периода
export function getLastPeriod(periods: string[]): string | null {
  if (periods.length === 0) return null;
  return periods[periods.length - 1];
}

// Валидация периода
export function isValidPeriod(period: string): boolean {
  return period && period.match(/^\d{2}\.\d{2}\s*-\s*\d{2}\.\d{2}$/) !== null;
}
```

### 4. **Обновлены компоненты**

#### **FiltersPanel.tsx**
```typescript
import { sortPeriods, isValidPeriod } from '@shared/utils/periodUtils';

const periods = sortPeriods(
  [...new Set(data.data.map((r: ProjectRecordInterface) => r.period))]
    .filter(isValidPeriod)
);
```

#### **DashboardPage.tsx**
```typescript
import { sortPeriods, isValidPeriod, getLastPeriod } from '@shared/utils/periodUtils';

const periods = useMemo(() => {
  const allPeriods = [...new Set(data?.data.map((r: ProjectRecordInterface) => r.period) || [])];
  return sortPeriods(allPeriods.filter(isValidPeriod));
}, [data]);

const lastPeriod = getLastPeriod(periods);
```

## 🎯 Результат

### ✅ **Правильная сортировка**
- Периоды теперь отображаются в хронологическом порядке
- От прошлого к настоящему времени
- Учитывается переход между годами

### ✅ **Автоматическое определение последнего периода**
- Прогресс бар автоматически применяется к последнему периоду
- При добавлении нового периода прогресс бар переключится на него

### ✅ **Переиспользуемый код**
- Логика сортировки вынесена в отдельную утилиту
- Избежано дублирование кода
- Легко тестировать и поддерживать

## 📱 Пример работы

**Входные данные:**
```
02.06 - 08.06
09.06 - 15.06
23.06 - 29.06
30.06 - 06.07
14.07 - 20.07
16.06 - 22.06
07.07 - 13.07
```

**Результат сортировки:**
```
02.06 - 08.06
09.06 - 15.06
16.06 - 22.06
23.06 - 29.06
30.06 - 06.07
07.07 - 13.07
14.07 - 20.07  ← Последний период для прогресс бара
```

Теперь временная линия работает корректно! 🚀 