# Многоэтапная сборка для оптимизации размера
FROM node:18-alpine AS builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Настройки npm для стабильности сети
RUN npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retries 5 && \
    npm config set registry https://registry.npmjs.org/

# Копируем файлы конфигурации
COPY package*.json ./
COPY .npmrc ./

# Устанавливаем все зависимости (включая dev для сборки)
RUN npm ci --no-audit --no-fund --prefer-offline --network-timeout=300000

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