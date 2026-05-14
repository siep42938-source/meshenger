/**
 * Простая файловая БД (JSON) — не требует установки MongoDB/PostgreSQL.
 * В продакшене замените на реальную БД.
 */
const fs   = require('fs')
const path = require('path')
const crypto = require('crypto')

const DB_PATH = path.join(__dirname, 'data.json')

function load() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ users: {}, sessions: {}, otps: {} }, null, 2))
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'))
}

function save(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
}

// ─── Users ────────────────────────────────────────────────────────────────────

function getUser(phone) {
  return load().users[phone] || null
}

function createUser(phone, name) {
  const db = load()
  if (db.users[phone]) throw new Error('Номер уже зарегистрирован')
  const user = {
    id:        crypto.randomUUID(),
    phone,
    name,
    createdAt: new Date().toISOString(),
    // Security
    loginAttempts:   0,
    lockedUntil:     null,
    lastLoginAt:     null,
    lastLoginIp:     null,
  }
  db.users[phone] = user
  save(db)
  return user
}

function updateUser(phone, fields) {
  const db = load()
  if (!db.users[phone]) return null
  db.users[phone] = { ...db.users[phone], ...fields }
  save(db)
  return db.users[phone]
}

function isPhoneRegistered(phone) {
  return !!load().users[phone]
}

// ─── OTP ──────────────────────────────────────────────────────────────────────

function saveOtp(phone, code) {
  const db = load()
  db.otps[phone] = {
    code,
    expiresAt:  Date.now() + 10 * 60 * 1000, // 10 минут
    attempts:   0,
    createdAt:  new Date().toISOString(),
  }
  save(db)
}

function getOtp(phone) {
  return load().otps[phone] || null
}

function deleteOtp(phone) {
  const db = load()
  delete db.otps[phone]
  save(db)
}

function incrementOtpAttempts(phone) {
  const db = load()
  if (db.otps[phone]) {
    db.otps[phone].attempts++
    save(db)
    return db.otps[phone].attempts
  }
  return 0
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

function createSession(userId, phone, ip) {
  const db = load()
  const token = crypto.randomBytes(48).toString('hex')
  db.sessions[token] = {
    userId,
    phone,
    ip,
    createdAt:  new Date().toISOString(),
    lastUsedAt: new Date().toISOString(),
    expiresAt:  Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 дней
  }
  save(db)
  return token
}

function getSession(token) {
  if (!token) return null
  const db = load()
  const s = db.sessions[token]
  if (!s) return null
  if (Date.now() > s.expiresAt) {
    delete db.sessions[token]
    save(db)
    return null
  }
  // Update lastUsedAt
  s.lastUsedAt = new Date().toISOString()
  save(db)
  return s
}

function deleteSession(token) {
  const db = load()
  delete db.sessions[token]
  save(db)
}

function getUserSessions(userId) {
  const db = load()
  return Object.entries(db.sessions)
    .filter(([, s]) => s.userId === userId)
    .map(([token, s]) => ({ token: token.slice(0, 8) + '...', ...s }))
}

// ─── Brute-force protection ───────────────────────────────────────────────────

function recordFailedLogin(phone) {
  const db = load()
  const user = db.users[phone]
  if (!user) return
  user.loginAttempts = (user.loginAttempts || 0) + 1
  // Lock after 5 failed attempts for 15 minutes
  if (user.loginAttempts >= 5) {
    user.lockedUntil = Date.now() + 15 * 60 * 1000
    user.loginAttempts = 0
  }
  save(db)
}

function isAccountLocked(phone) {
  const user = getUser(phone)
  if (!user || !user.lockedUntil) return false
  if (Date.now() > user.lockedUntil) {
    updateUser(phone, { lockedUntil: null, loginAttempts: 0 })
    return false
  }
  return true
}

function recordSuccessfulLogin(phone, ip) {
  updateUser(phone, {
    loginAttempts: 0,
    lockedUntil:   null,
    lastLoginAt:   new Date().toISOString(),
    lastLoginIp:   ip,
  })
}

module.exports = {
  getUser, createUser, updateUser, isPhoneRegistered,
  saveOtp, getOtp, deleteOtp, incrementOtpAttempts,
  createSession, getSession, deleteSession, getUserSessions,
  recordFailedLogin, isAccountLocked, recordSuccessfulLogin,
}
