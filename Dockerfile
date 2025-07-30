# Многоэтапная сборка для оптимизации размера
FROM node:18-alpine AS builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы конфигурации
COPY package*.json ./
COPY .npmrc ./

# Устанавливаем зависимости с оптимизированными настройками
RUN npm ci --only=production --no-audit --no-fund --prefer-offline

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Продакшн этап
FROM nginx:alpine

# Копируем собранные файлы
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем конфигурацию nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Открываем порт
EXPOSE 80

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"] 