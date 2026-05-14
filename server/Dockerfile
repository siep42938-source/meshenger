FROM node:20-alpine

WORKDIR /app

# Копируем зависимости
COPY package*.json ./
RUN npm ci --omit=dev

# Копируем исходники
COPY . .

# Создаём папку для данных
RUN mkdir -p /app/data

EXPOSE 3001

CMD ["node", "index.js"]
