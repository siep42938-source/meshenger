require('dotenv').config()
const express = require('express')
const cors    = require('cors')
const path    = require('path')
const fs      = require('fs')
const db      = require('./db')
const { createServer } = require('http')
const { Server } = require('socket.io')

const app = express()
app.use(express.json())
// В продакшене разрешаем APP_URL, в разработке — localhost
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      process.env.APP_URL,
      'https://meshenger-black.vercel.app',
      // Разрешаем все поддомены vercel.app для preview деплоев
    ].filter(Boolean)
  : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173', 'http://127.0.0.1:5173']

app.use(cors({
  origin: (origin, callback) => {
    // Разрешаем запросы без origin (мобильные PWA, Postman)
    if (!origin) return callback(null, true)
    // Разрешаем все vercel.app домены (preview деплои)
    if (origin.endsWith('.vercel.app')) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error('CORS: origin not allowed'))
  },
  credentials: true,
}))

const BOT_TOKEN      = process.env.TELEGRAM_BOT_TOKEN
const ADMIN_CHAT_ID  = process.env.ADMIN_TELEGRAM_ID

// ─── Ссылки ───────────────────────────────────────────────────────────────────
// APP_URL — публичный URL вашего сайта (например https://umberla.app)
// Если не задан — бот отправит инструкцию по установке PWA
const APP_URL        = process.env.APP_URL || null
const SOURCE_URL     = process.env.SOURCE_URL || 'https://github.com/umberla/messenger'
// Устаревшая переменная — оставлена для совместимости
const IOS_DOWNLOAD_URL = APP_URL ? `${APP_URL}/install.html` : (process.env.IOS_DOWNLOAD_URL || 'https://apps.apple.com/app/umberla')

// ─── Telegram отправка ────────────────────────────────────────────────────────
async function tgSend(chatId, text) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`
  try {
    const res = await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    })
    const data = await res.json()
    if (!data.ok) console.error('Telegram error:', data.description)
    return data.ok
  } catch (e) {
    console.error('Telegram fetch error:', e.message)
    return false
  }
}

// ─── Telegram Bot: обработка входящих сообщений ──────────────────────────────
async function tgSetWebhook(webhookUrl) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: webhookUrl }),
    })
    const data = await res.json()
    console.log(`   Webhook: ${data.ok ? '✅ установлен → ' + webhookUrl : '❌ ' + data.description}`)
  } catch (e) {
    console.error('Webhook setup error:', e.message)
  }
}

// Отправить приветственное сообщение с кнопками установки и кода
async function tgSendWelcome(chatId) {
  const tgUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`

  // Формируем кнопки в зависимости от наличия APP_URL
  const installUrl  = APP_URL ? `${APP_URL}/install.html` : IOS_DOWNLOAD_URL
  const keyboard = [
    [
      { text: '📲 Установить на iPhone', url: installUrl },
    ],
    [
      { text: '💻 Исходный код', url: SOURCE_URL },
    ],
  ]

  // Если APP_URL задан — добавляем кнопку "Открыть веб-версию"
  if (APP_URL) {
    keyboard.splice(1, 0, [{ text: '🌐 Открыть веб-версию', url: APP_URL }])
  }

  try {
    const res = await fetch(tgUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text:
          `👋 Добро пожаловать в <b>Umberla</b>!\n\n` +
          `📱 Мессенджер, который работает везде — с интернетом и без.\n\n` +
          `<b>Как установить на iPhone:</b>\n` +
          `1. Нажмите «📲 Установить на iPhone»\n` +
          `2. Откройте ссылку в <b>Safari</b>\n` +
          `3. Нажмите ⬆️ → «На экран "Домой"» → «Добавить»\n\n` +
          `Иконка Umberla появится на рабочем столе 🎉`,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: keyboard },
      }),
    })
    const data = await res.json()
    if (!data.ok) console.error('Telegram sendWelcome error:', data.description)
    return data.ok
  } catch (e) {
    console.error('Telegram fetch error:', e.message)
    return false
  }
}

// Отправить фото + кнопки (красивое приветствие с логотипом)
async function tgSendWelcomeWithPhoto(chatId) {
  const tgUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`

  const installUrl = APP_URL ? `${APP_URL}/install.html` : IOS_DOWNLOAD_URL
  const keyboard = [
    [{ text: '📲 Установить на iPhone', url: installUrl }],
  ]
  if (APP_URL) {
    keyboard.push([{ text: '🌐 Открыть веб-версию', url: APP_URL }])
  }
  keyboard.push([{ text: '💻 Исходный код', url: SOURCE_URL }])

  // Путь к логотипу
  const logoPath = path.join(__dirname, '../public/{C13A05FB-1F57-494F-9E79-A722C535E6CF}.png')

  if (fs.existsSync(logoPath)) {
    // Отправляем фото через multipart/form-data
    try {
      const FormData = (await import('node:stream')).PassThrough
      // Используем fetch с Buffer
      const logoBuffer = fs.readFileSync(logoPath)
      const boundary = '----FormBoundary' + Date.now()

      const body = Buffer.concat([
        Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="chat_id"\r\n\r\n${chatId}\r\n`),
        Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="photo"; filename="umberla.png"\r\nContent-Type: image/png\r\n\r\n`),
        logoBuffer,
        Buffer.from(`\r\n--${boundary}\r\nContent-Disposition: form-data; name="caption"\r\n\r\n` +
          `👋 Добро пожаловать в Umberla!\n\n` +
          `📱 Мессенджер, который работает везде — с интернетом и без.\n\n` +
          `Как установить на iPhone:\n` +
          `1. Нажмите «📲 Установить на iPhone»\n` +
          `2. Откройте ссылку в Safari\n` +
          `3. Нажмите ⬆️ → «На экран "Домой"» → «Добавить»\n\n` +
          `Иконка Umberla появится на рабочем столе 🎉\r\n`),
        Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="parse_mode"\r\n\r\nHTML\r\n`),
        Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="reply_markup"\r\n\r\n${JSON.stringify({ inline_keyboard: keyboard })}\r\n`),
        Buffer.from(`--${boundary}--\r\n`),
      ])

      const res = await fetch(tgUrl, {
        method: 'POST',
        headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
        body,
      })
      const data = await res.json()
      if (data.ok) return true
      console.warn('sendPhoto failed, falling back to text:', data.description)
    } catch (e) {
      console.warn('sendPhoto error, falling back to text:', e.message)
    }
  }

  // Fallback — текстовое сообщение
  return tgSendWelcome(chatId)
}

// Устаревший алиас — оставлен для совместимости
async function tgSendDownloadLink(chatId) {
  return tgSendWelcomeWithPhoto(chatId)
}

// Webhook endpoint — принимает обновления от Telegram
app.post('/api/telegram/webhook', async (req, res) => {
  const update = req.body
  res.sendStatus(200) // Telegram ждёт быстрый ответ

  try {
    const msg = update.message
    if (!msg) return

    const chatId = msg.chat.id
    const text   = msg.text || ''
    const from   = msg.from

    // /start — приветствие с кнопками установки
    if (text.startsWith('/start')) {
      await tgSendWelcomeWithPhoto(chatId)
      // Уведомляем админа о новом пользователе бота
      if (String(chatId) !== String(ADMIN_CHAT_ID)) {
        await tgSend(ADMIN_CHAT_ID,
          `👤 Новый пользователь бота\n\n` +
          `ID: <code>${chatId}</code>\n` +
          `Имя: ${from.first_name || ''}${from.last_name ? ' ' + from.last_name : ''}\n` +
          `Username: ${from.username ? '@' + from.username : 'нет'}`
        )
      }
      return
    }

    // /install — инструкция по установке
    if (text.startsWith('/install')) {
      const installUrl = APP_URL ? `${APP_URL}/install.html` : IOS_DOWNLOAD_URL
      await tgSend(chatId,
        `📲 <b>Установка Umberla на iPhone</b>\n\n` +
        `1. Откройте ссылку в <b>Safari</b>:\n${installUrl}\n\n` +
        `2. Нажмите кнопку <b>⬆️ Поделиться</b> внизу экрана\n\n` +
        `3. Выберите <b>«На экран "Домой"»</b> ➕\n\n` +
        `4. Нажмите <b>«Добавить»</b>\n\n` +
        `✅ Иконка Umberla появится на рабочем столе!`
      )
      return
    }

    // /code — ссылка на исходный код
    if (text.startsWith('/code')) {
      await tgSend(chatId,
        `💻 <b>Исходный код Umberla</b>\n\n` +
        `GitHub: ${SOURCE_URL}\n\n` +
        `Стек: React + TypeScript + Tailwind CSS + Node.js`
      )
      return
    }

    // /help
    if (text.startsWith('/help')) {
      await tgSend(chatId,
        `ℹ️ <b>Umberla Bot</b>\n\n` +
        `/start — главное меню\n` +
        `/install — инструкция по установке на iPhone\n` +
        `/code — исходный код\n` +
        `/help — помощь`
      )
      return
    }
  } catch (e) {
    console.error('Webhook handler error:', e.message)
  }
})

// ─── Rate limiting ────────────────────────────────────────────────────────────
const rateLimits = new Map()
function rateLimit(ip, max = 5, windowMs = 60000) {
  const now   = Date.now()
  const entry = rateLimits.get(ip) || { count: 0, resetAt: now + windowMs }
  if (now > entry.resetAt) { entry.count = 0; entry.resetAt = now + windowMs }
  entry.count++
  rateLimits.set(ip, entry)
  return entry.count > max
}
function getIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || 'unknown'
}
function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

// ─── Auth middleware ──────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  const token   = req.headers['authorization']?.replace('Bearer ', '')
  const session = db.getSession(token)
  if (!session) return res.status(401).json({ error: 'Не авторизован' })
  req.session = session
  req.user    = db.getUser(session.phone)
  next()
}

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/send-otp
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/api/send-otp', async (req, res) => {
  const ip = getIp(req)
  if (rateLimit(ip, 5, 60000)) {
    return res.status(429).json({ error: 'Слишком много запросов. Подождите минуту.' })
  }

  const { phone } = req.body
  if (!phone) return res.status(400).json({ error: 'Укажите номер телефона' })

  const normalized = '+' + phone.replace(/\D/g, '')
  if (normalized.length < 8 || normalized.length > 16) {
    return res.status(400).json({ error: 'Неверный формат номера' })
  }

  if (db.isAccountLocked(normalized)) {
    return res.status(423).json({ error: 'Аккаунт заблокирован на 15 минут.' })
  }

  const isRegistered = db.isPhoneRegistered(normalized)
  const code = generateOtp()
  db.saveOtp(normalized, code)

  console.log(`[OTP] ${normalized} → код: ${code} | ${isRegistered ? 'вход' : 'регистрация'}`)

  // Отправляем тебе в Telegram
  const action = isRegistered ? '🔑 ВХОД' : '🆕 РЕГИСТРАЦИЯ'
  const msg = `${action}\n\n📱 Номер: <b>${normalized}</b>\n🔐 Код: <b>${code}</b>\n🕐 Действует 10 минут\n🌐 IP: ${ip}`
  await tgSend(ADMIN_CHAT_ID, msg)

  // Возвращаем только success — код НЕ показываем на экране
  return res.json({ success: true, isRegistered })
})

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/verify-otp
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/api/verify-otp', (req, res) => {
  const ip = getIp(req)
  if (rateLimit(ip, 10, 60000)) {
    return res.status(429).json({ error: 'Слишком много попыток.' })
  }

  const { phone, code } = req.body
  if (!phone || !code) return res.status(400).json({ error: 'Укажите phone и code' })

  const normalized = '+' + phone.replace(/\D/g, '')

  if (db.isAccountLocked(normalized)) {
    return res.status(423).json({ valid: false, error: 'Аккаунт заблокирован на 15 минут.' })
  }

  const entry = db.getOtp(normalized)
  if (!entry)                    return res.json({ valid: false, error: 'Код не найден. Запросите новый.' })
  if (Date.now() > entry.expiresAt) {
    db.deleteOtp(normalized)
    return res.json({ valid: false, error: 'Код истёк. Запросите новый.' })
  }

  const attempts = db.incrementOtpAttempts(normalized)
  if (attempts > 5) {
    db.deleteOtp(normalized)
    db.recordFailedLogin(normalized)
    return res.status(429).json({ valid: false, error: 'Слишком много попыток. Запросите новый код.' })
  }

  if (code !== entry.code) {
    db.recordFailedLogin(normalized)
    return res.json({ valid: false, error: `Неверный код. Осталось попыток: ${5 - attempts}` })
  }

  db.deleteOtp(normalized)
  db.recordSuccessfulLogin(normalized, ip)

  const isRegistered = db.isPhoneRegistered(normalized)

  if (isRegistered) {
    const user  = db.getUser(normalized)
    const token = db.createSession(user.id, normalized, ip)
    // Уведомляем тебя об успешном входе
    tgSend(ADMIN_CHAT_ID, `✅ ВХОД ВЫПОЛНЕН\n\n📱 ${normalized}\n👤 ${user.name}\n🌐 IP: ${ip}`)
    return res.json({ valid: true, isRegistered: true, token, user })
  } else {
    return res.json({ valid: true, isRegistered: false })
  }
})

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/register — создание аккаунта (только для новых)
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/api/register', (req, res) => {
  const ip = getIp(req)
  const { phone, name, username } = req.body
  if (!phone || !name?.trim()) return res.status(400).json({ error: 'Укажите phone и name' })

  const normalized = '+' + phone.replace(/\D/g, '')

  if (db.isPhoneRegistered(normalized)) {
    return res.status(409).json({ error: 'Номер уже зарегистрирован' })
  }

  try {
    const user  = db.createUser(normalized, name.trim())
    // Сохраняем username если передан
    if (username) db.updateUser(normalized, { username: username.toLowerCase().replace(/[^a-z0-9_]/g, '') })
    const token = db.createSession(user.id, normalized, ip)
    tgSend(ADMIN_CHAT_ID, `🎉 НОВЫЙ ПОЛЬЗОВАТЕЛЬ\n\n📱 ${normalized}\n👤 ${name.trim()}\n🌐 IP: ${ip}`)
    return res.json({ success: true, token, user: { ...user, username } })
  } catch (e) {
    return res.status(409).json({ error: e.message })
  }
})

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/me
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/api/me', requireAuth, (req, res) => {
  res.json({ user: req.user })
})

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/logout
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/api/logout', requireAuth, (req, res) => {
  const token = req.headers['authorization']?.replace('Bearer ', '')
  db.deleteSession(token)
  res.json({ success: true })
})

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/sessions
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/api/sessions', requireAuth, (req, res) => {
  res.json({ sessions: db.getUserSessions(req.user.id) })
})

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/verify-profile — проверка профиля при входе в мессенджер
// Если имя/номер совпадают — уведомление пользователю в ЛС (если есть tgId)
// Если не совпадают — уведомление только администратору
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/api/verify-profile', requireAuth, async (req, res) => {
  const { name, phone } = req.body
  const user = req.user
  const ip   = getIp(req)

  if (!name || !phone) return res.status(400).json({ error: 'Укажите name и phone' })

  const normalizedInput = '+' + phone.replace(/\D/g, '')
  const nameMatch  = user.name?.trim().toLowerCase() === name.trim().toLowerCase()
  const phoneMatch = user.phone === normalizedInput

  if (nameMatch && phoneMatch) {
    // Всё совпало — уведомляем пользователя в ЛС (если у него есть tgId)
    if (user.telegramId) {
      await tgSend(user.telegramId,
        `✅ <b>Вход выполнен</b>\n\n` +
        `Вы вошли в Umberla.\n` +
        `📱 Номер: <b>${user.phone}</b>\n` +
        `👤 Имя: <b>${user.name}</b>\n` +
        `🌐 IP: ${ip}`
      )
    }
    return res.json({ verified: true, match: true })
  } else {
    // Не совпало — уведомляем только администратора
    const mismatchDetails = []
    if (!nameMatch)  mismatchDetails.push(`Имя: ожидалось <b>${user.name}</b>, получено <b>${name}</b>`)
    if (!phoneMatch) mismatchDetails.push(`Номер: ожидалось <b>${user.phone}</b>, получено <b>${normalizedInput}</b>`)

    await tgSend(ADMIN_CHAT_ID,
      `⚠️ <b>НЕСОВПАДЕНИЕ ПРОФИЛЯ</b>\n\n` +
      `👤 User ID: <code>${user.id}</code>\n` +
      `${mismatchDetails.join('\n')}\n` +
      `🌐 IP: ${ip}`
    )
    return res.json({ verified: true, match: false })
  }
})

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/link-telegram — привязать Telegram ID к аккаунту
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/api/link-telegram', requireAuth, async (req, res) => {
  const { telegramId } = req.body
  if (!telegramId) return res.status(400).json({ error: 'Укажите telegramId' })

  db.updateUser(req.user.phone, { telegramId: String(telegramId) })
  res.json({ success: true })
})

app.get('/api/health', (_, res) => res.json({ status: 'ok' }))

// ─── Search users ─────────────────────────────────────────────────────────────
app.get('/api/users/search', requireAuth, (req, res) => {
  const { q } = req.query
  if (!q || String(q).trim().length < 2) {
    return res.json({ users: [] })
  }
  const results = db.searchUsers(String(q), req.session.phone)
  res.json({ users: results })
})

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/chats — получить все чаты пользователя
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/api/chats', requireAuth, (req, res) => {
  const chats = db.getChatsByUser(req.user.id)
  res.json({ chats })
})

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/chats/direct — создать или получить личный чат
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/api/chats/direct', requireAuth, (req, res) => {
  const { recipientId } = req.body
  if (!recipientId) return res.status(400).json({ error: 'Укажите recipientId' })

  const chat = db.getOrCreateDirectChat(req.user.id, recipientId)
  res.json({ chat })
})

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/messages/:chatId — получить историю сообщений
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/api/messages/:chatId', requireAuth, (req, res) => {
  const { chatId } = req.params
  const limit = parseInt(req.query.limit) || 100

  // Проверяем что пользователь является участником чата
  const chat = db.getChatById(chatId)
  if (!chat) return res.status(404).json({ error: 'Чат не найден' })
  if (!chat.participants.includes(req.user.id)) {
    return res.status(403).json({ error: 'Нет доступа к этому чату' })
  }

  const messages = db.getMessages(chatId, limit)
  res.json({ messages })
})

const PORT = process.env.PORT || 3001
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      if (origin.endsWith('.vercel.app')) return callback(null, true)
      if (allowedOrigins.includes(origin)) return callback(null, true)
      callback(new Error('CORS: origin not allowed'))
    },
    credentials: true,
  },
})

// ─── WebSocket: аутентификация ────────────────────────────────────────────────
io.use((socket, next) => {
  const token = socket.handshake.auth.token
  const session = db.getSession(token)
  if (!session) return next(new Error('Не авторизован'))
  socket.userId = session.userId
  socket.phone = session.phone
  next()
})

// ─── WebSocket: обработка подключений ─────────────────────────────────────────
const userSockets = new Map() // userId -> socket.id

io.on('connection', (socket) => {
  console.log(`✅ Пользователь подключен: ${socket.phone} (${socket.id})`)
  userSockets.set(socket.userId, socket.id)

  // Уведомляем всех что пользователь онлайн
  socket.broadcast.emit('user:online', { userId: socket.userId })

  // Отправить сообщение
  socket.on('message:send', (data) => {
    const { chatId, message, recipientId } = data
    console.log(`💬 Сообщение от ${socket.phone}: ${message}`)
    
    // Сохраняем в БД
    const saved = db.saveMessage(chatId, socket.userId, message)
    
    // Отправляем отправителю подтверждение
    socket.emit('message:receive', {
      chatId,
      id: saved.id,
      userId: socket.userId,
      phone: socket.phone,
      message,
      timestamp: saved.timestamp,
      status: 'sent',
    })

    // Отправляем получателю если онлайн
    if (recipientId) {
      const recipientSocketId = userSockets.get(recipientId)
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('message:receive', {
          chatId,
          id: saved.id,
          userId: socket.userId,
          phone: socket.phone,
          message,
          timestamp: saved.timestamp,
          status: 'delivered',
        })
        // Уведомляем отправителя о доставке
        socket.emit('message:delivered', { chatId, userId: socket.userId })
      }
    } else {
      // Групповой чат — отправляем всем в комнате кроме отправителя
      socket.to(chatId).emit('message:receive', {
        chatId,
        id: saved.id,
        userId: socket.userId,
        phone: socket.phone,
        message,
        timestamp: saved.timestamp,
        status: 'delivered',
      })
    }
  })

  // Присоединиться к чату
  socket.on('chat:join', (chatId) => {
    socket.join(chatId)
    console.log(`👥 ${socket.phone} присоединился к чату ${chatId}`)
  })

  // Покинуть чат
  socket.on('chat:leave', (chatId) => {
    socket.leave(chatId)
    console.log(`👋 ${socket.phone} покинул чат ${chatId}`)
  })

  // Статус печати
  socket.on('user:typing', (data) => {
    const { chatId } = data
    socket.to(chatId).emit('user:typing', {
      userId: socket.userId,
      phone: socket.phone,
    })
  })

  // Входящий звонок
  socket.on('call:initiate', (data) => {
    const { recipientId, callData } = data
    const recipientSocketId = userSockets.get(recipientId)
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('call:incoming', {
        callerId: socket.userId,
        callerPhone: socket.phone,
        callData,
      })
    }
  })

  // Ответить на звонок
  socket.on('call:answer', (data) => {
    const { callerId } = data
    const callerSocketId = userSockets.get(callerId)
    if (callerSocketId) {
      io.to(callerSocketId).emit('call:answered', {
        answerId: socket.userId,
        answerPhone: socket.phone,
      })
    }
  })

  // Отклонить звонок
  socket.on('call:reject', (data) => {
    const { callerId } = data
    const callerSocketId = userSockets.get(callerId)
    if (callerSocketId) {
      io.to(callerSocketId).emit('call:rejected', {
        rejectId: socket.userId,
      })
    }
  })

  // Отключение
  socket.on('disconnect', () => {
    console.log(`❌ Пользователь отключен: ${socket.phone}`)
    userSockets.delete(socket.userId)
    // Уведомляем всех что пользователь офлайн
    socket.broadcast.emit('user:offline', { userId: socket.userId })
  })
})

httpServer.listen(PORT, async () => {
  console.log(`\n🚀 Meshenger сервер: http://localhost:${PORT}`)
  // Тест — отправляем тебе уведомление о запуске
  const ok = await tgSend(ADMIN_CHAT_ID, '🚀 <b>Meshenger сервер запущен!</b>\n\nВсе коды регистрации будут приходить сюда.')
  console.log(`   Telegram: ${ok ? '✅ подключён' : '❌ ошибка'}`)
  console.log(`   WebSocket: ✅ включен`)
  console.log(`   Защита: rate limiting + brute-force + session tokens`)
  console.log(`   iOS ссылка: ${IOS_DOWNLOAD_URL}`)

  // Устанавливаем webhook если задан WEBHOOK_URL
  if (process.env.WEBHOOK_URL) {
    await tgSetWebhook(`${process.env.WEBHOOK_URL}/api/telegram/webhook`)
  } else {
    console.log(`   Webhook: не задан WEBHOOK_URL — бот работает без webhook (polling не используется)`)
    console.log(`   Для webhook добавьте WEBHOOK_URL=https://your-domain.com в .env\n`)
  }
})
