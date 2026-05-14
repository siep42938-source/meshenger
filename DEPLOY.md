# Деплой Umberla — публичный сервер

## Вариант 1: Render.com (рекомендуется, бесплатно)

### Шаг 1 — Загрузи код на GitHub
```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/ТВО_ИМЯ/umberla.git
git push -u origin main
```

### Шаг 2 — Задеплой на Render
1. Зайди на [render.com](https://render.com) → Sign Up
2. **New** → **Blueprint**
3. Подключи свой GitHub репозиторий
4. Render найдёт `render.yaml` и создаст два сервиса:
   - `umberla-server` — бэкенд (Node.js)
   - `umberla-app` — фронтенд (React PWA)

### Шаг 3 — Добавь переменные окружения
В Render Dashboard → `umberla-server` → **Environment**:

| Переменная | Значение |
|---|---|
| `TELEGRAM_BOT_TOKEN` | Токен от @BotFather |
| `ADMIN_TELEGRAM_ID` | Твой Telegram ID (от @userinfobot) |
| `APP_URL` | URL фронтенда (например `https://umberla-app.onrender.com`) |
| `WEBHOOK_URL` | URL бэкенда (например `https://umberla-server.onrender.com`) |

### Шаг 4 — Готово!
- Фронтенд: `https://umberla-app.onrender.com`
- Бэкенд: `https://umberla-server.onrender.com`
- Telegram бот автоматически получит webhook и начнёт отправлять ссылки

---

## Вариант 2: Railway.app

1. Зайди на [railway.app](https://railway.app)
2. **New Project** → **Deploy from GitHub repo**
3. Выбери репозиторий
4. Railway найдёт `railway.json` и задеплоит сервер
5. Добавь переменные окружения в настройках

---

## Вариант 3: VPS (DigitalOcean, Hetzner, и т.д.)

```bash
# На сервере:
git clone https://github.com/ТВО_ИМЯ/umberla.git
cd umberla

# Собери фронтенд
cd meshenger
npm ci && npm run build

# Запусти сервер
cd server
cp .env.example .env
nano .env  # заполни переменные
npm ci --omit=dev
node index.js

# Или через PM2 (автозапуск):
npm install -g pm2
pm2 start index.js --name umberla
pm2 save && pm2 startup
```

Для раздачи фронтенда через nginx:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/umberla/meshenger/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header X-Forwarded-For $remote_addr;
    }
}
```

---

## Почему нет ссылки в Telegram боте?

Бот показывает кнопку со ссылкой только если задана переменная `APP_URL`.
Без неё — кнопка ведёт на заглушку.

**Решение:** задай `APP_URL=https://твой-домен.com` в `.env` сервера.
