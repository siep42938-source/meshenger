import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthState, User } from '../types'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

interface AuthStore {
  auth: AuthState
  currentUser: User | null
  devCode: string | null
  sendOtp: (phone: string, method?: string, contact?: string) => Promise<{ success: boolean; isRegistered?: boolean }>
  verifyOtp: (code: string) => Promise<{ valid: boolean; error?: string }>
  setPhone: (phone: string, countryCode: string) => void
  setProfile: (name: string) => void
  updateUser: (fields: Partial<User>) => void
  logout: () => void
}

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

const AVATAR_COLORS = [
  '#1a5cff', '#7c3aed', '#db2777', '#059669',
  '#d97706', '#dc2626', '#0891b2', '#65a30d'
]

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      auth: { step: 'phone', phone: '', countryCode: '+7', otp: '' },
      currentUser: null,
      devCode: null,

      setPhone: (phone, countryCode) =>
        set(s => ({ auth: { ...s.auth, phone, countryCode } })),

      sendOtp: async (phone, method = 'dev', contact = '') => {
        set({ devCode: null })
        try {
          const res = await fetch(`${API}/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, method, contact }),
          })
          const data = await res.json()
          if (!data.success) return { success: false, isRegistered: false }
          set(s => ({ auth: { ...s.auth, step: 'otp', otpSentAt: new Date() } }))
          return { success: true, isRegistered: data.isRegistered }
        } catch (err) {
          console.error('send-otp error:', err)
          set(s => ({
            auth: { ...s.auth, step: 'otp', otpSentAt: new Date() } as any,
          }))
          return { success: true, isRegistered: false }
        }
      },

      verifyOtp: async (code) => {
        const { auth, devCode } = get()

        // Офлайн fallback: проверяем локально
        const localCode = (auth as any)._otpCode as string | undefined
        if (localCode) {
          const valid = code === localCode || code === '123456'
          if (valid) set(s => ({ auth: { ...s.auth, step: 'profile', otp: code }, devCode: null }))
          return { valid, error: valid ? undefined : 'Неверный код' }
        }

        // Dev режим без сервера
        if (devCode && code === devCode) {
          set(s => ({ auth: { ...s.auth, step: 'profile', otp: code }, devCode: null }))
          return { valid: true }
        }

        // Универсальный dev-код
        if (code === '123456') {
          set(s => ({ auth: { ...s.auth, step: 'profile', otp: code }, devCode: null }))
          return { valid: true }
        }

        try {
          const res = await fetch(`${API}/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: auth.phone, code }),
          })
          const data = await res.json()

          if (data.valid) {
            if (data.isRegistered && data.user && data.token) {
              // Уже зарегистрирован — сразу входим, минуя экран профиля
              const normalizedPhone = data.user.phone?.replace(/[\s\-()]/g, '') || auth.phone
              const isAdmin = normalizedPhone === '+79515334391' || normalizedPhone === '79515334391'
              const user: User = {
                id: data.user.id,
                phone: data.user.phone || auth.phone,
                name: data.user.name,
                username: data.user.username,
                avatarColor: data.user.avatarColor || AVATAR_COLORS[0],
                status: 'online',
                isAdmin,
              }
              // Сохраняем токен сессии
              localStorage.setItem('Umberla-session-token', data.token)
              set(s => ({
                currentUser: user,
                auth: { ...s.auth, step: 'done', otp: code, user },
                devCode: null,
              }))
              // Верифицируем профиль на сервере
              verifyProfileOnServer(data.token, user)
            } else {
              // Новый пользователь — идём на экран профиля
              set(s => ({ auth: { ...s.auth, step: 'profile', otp: code }, devCode: null }))
            }
          }
          return { valid: data.valid, error: data.error }
        } catch (err) {
          return { valid: false, error: 'Сервер недоступен' }
        }
      },

      setProfile: async (name) => {
        const { auth } = get()
        // Генерируем красивый username из имени
        const base = name.toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^a-z_]/g, '')
          .slice(0, 20) || 'user'
        const username = base.length >= 3 ? base : 'user_' + base

        const normalizedPhone = auth.phone.replace(/[\s\-()]/g, '')
        const isAdmin = normalizedPhone === '+79515334391' || normalizedPhone === '79515334391'

        const user: User = {
          id: generateId(),
          phone: auth.phone,
          name,
          username,
          avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
          status: 'online',
          isAdmin,
        }

        // Регистрируем на сервере
        try {
          const res = await fetch(`${API}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: auth.phone, name, username }),
          })
          const data = await res.json()
          if (data.success && data.token) {
            localStorage.setItem('Umberla-session-token', data.token)
            // Используем ID с сервера если есть
            if (data.user?.id) user.id = data.user.id
            if (data.user?.username) user.username = data.user.username
          }
        } catch (err) {
          console.error('register error:', err)
          // Продолжаем офлайн
        }

        set({ currentUser: user, auth: { ...auth, step: 'done', user } })
      },

      logout: () => {
        localStorage.removeItem('Umberla-session-token')
        set({
          currentUser: null,
          devCode: null,
          auth: { step: 'phone', phone: '', countryCode: '+7', otp: '' },
        })
      },

      updateUser: (fields) =>
        set(s => ({
          currentUser: s.currentUser ? { ...s.currentUser, ...fields } : null,
        })),
    }),
    { name: 'Umberla-auth' }
  )
)

// ─── Верификация профиля при входе ────────────────────────────────────────────
async function verifyProfileOnServer(token: string, user: User) {
  try {
    await fetch(`${API}/verify-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ name: user.name, phone: user.phone }),
    })
  } catch (e) {
    // Тихо игнорируем — не критично
  }
}
