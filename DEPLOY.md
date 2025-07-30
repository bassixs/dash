# Инструкции по деплою

## Проблема
Ошибка `ENOSPC: no space left on device` при установке зависимостей в Docker контейнере.

## Решение

### 1. Оптимизация зависимостей
- Удалены тяжелые зависимости: `framer-motion`, `react-virtuoso`, `lodash`, `rimraf`
- Заменены на более легкие альтернативы или CSS анимации
- Добавлен `.npmrc` с оптимизированными настройками

### 2. Многоэтапная сборка Docker
```dockerfile
# Многоэтапная сборка для оптимизации размера
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY .npmrc ./
RUN npm ci --only=production --no-audit --no-fund --prefer-offline
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3. Оптимизированные настройки npm
Создан `.npmrc` файл:
```
prefer-offline=true
cache-min=3600
fund=false
audit=false
loglevel=error
```

### 4. Команды для деплоя

#### Локальная сборка:
```bash
npm install --no-audit --no-fund --prefer-offline
npm run build
```

#### Docker сборка:
```bash
docker build -t telegram-mini-app .
docker run -p 80:80 telegram-mini-app
```

### 5. Размер бандла после оптимизации
- Основной бандл: ~87KB (gzip: ~29KB)
- React: ~142KB (gzip: ~46KB)
- Chart.js: ~168KB (gzip: ~59KB)
- ExcelJS: ~939KB (gzip: ~271KB)

### 6. Альтернативные решения
Если проблема с местом на диске остается:

1. **Увеличить размер диска** в настройках Docker
2. **Использовать .dockerignore** для исключения ненужных файлов
3. **Очистить Docker кэш**: `docker system prune -a`
4. **Использовать более легкие альтернативы** для тяжелых библиотек

### 7. Проверка работоспособности
```bash
npm run dev  # Локальная разработка
npm run build  # Сборка для продакшена
npm run test  # Запуск тестов
``` 