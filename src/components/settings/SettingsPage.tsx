import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, X, Bell, Shield, Monitor, Info,
  ChevronRight, Smartphone, Laptop, Apple,
  LogOut, Trash2, AtSign, Check
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { formatPhone } from '../../utils/format'

type Page = 'main' | 'notifications' | 'sessions' | 'privacy' | 'about' | 'username'

interface Toggle { label: string; desc?: string; value: boolean; onChange: (v: boolean) => void }

const ToggleRow: React.FC<Toggle> = ({ label, desc, value, onChange }) => (
  <div className="flex items-center justify-between py-3 px-4">
    <div className="flex-1 min-w-0 pr-4">
      <p className="text-white/80 text-sm">{label}</p>
      {desc && <p className="text-white/35 text-xs mt-0.5">{desc}</p>}
    </div>
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => onChange(!value)}
      className="relative flex-shrink-0"
      style={{
        width: 44, height: 24, borderRadius: 999,
        background: value ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : 'rgba(255,255,255,0.12)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: value ? '0 0 10px rgba(124,58,237,0.4)' : 'none',
        transition: 'all 0.25s',
      }}
    >
      <motion.div
        animate={{ x: value ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 600, damping: 35 }}
        className="absolute top-1 w-4 h-4 rounded-full bg-white"
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
      />
    </motion.button>
  </div>
)

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-4">
    <p className="text-purple-400 text-xs font-semibold uppercase tracking-widest px-4 mb-1">{title}</p>
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
      {children}
    </div>
  </div>
)

const Row: React.FC<{ label: string; value?: string; onClick?: () => void; danger?: boolean }> = ({ label, value, onClick, danger }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors"
    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }}
    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
  >
    <span style={{ fontSize: '14px', color: danger ? '#f87171' : 'rgba(255,255,255,0.8)' }}>{label}</span>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {value && <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>{value}</span>}
      <ChevronRight size={14} style={{ color: 'rgba(255,255,255,0.2)' }} />
    </div>
  </button>
)

export const SettingsPage: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { currentUser, updateUser } = useAuthStore()
  const [page, setPage] = useState<Page>('main')

  // Notification settings
  const [notifDesktop, setNotifDesktop] = useState(true)
  const [notifSound, setNotifSound]     = useState(true)
  const [notifChats, setNotifChats]     = useState(true)
  const [notifGroups, setNotifGroups]   = useState(true)

  // Privacy settings
  const [phoneVisibility, setPhoneVisibility]   = useState<'all' | 'contacts' | 'nobody'>('nobody')
  const [photoVisibility, setPhotoVisibility]   = useState<'all' | 'contacts' | 'nobody'>('all')
  const [lastSeenVisibility, setLastSeenVisibility] = useState<'all' | 'contacts' | 'nobody'>('nobody')
  const [forwardVisibility, setForwardVisibility]   = useState<'all' | 'contacts' | 'nobody'>('all')

  // Privacy sub-page
  const [privacySubPage, setPrivacySubPage] = useState<null | 'phone' | 'photo' | 'lastseen' | 'forward'>(null)

  const visibilityLabel = (v: 'all' | 'contacts' | 'nobody') =>
    v === 'all' ? 'Все' : v === 'contacts' ? 'Мои контакты' : 'Никто'

  // Username edit
  const [editUsername, setEditUsername] = useState(false)
  const [newUsername, setNewUsername]   = useState(currentUser?.username ?? '')
  const [usernameSaved, setUsernameSaved] = useState(false)

  const saveUsername = () => {
    if (newUsername.length < 5) return
    updateUser({ username: newUsername })
    setUsernameSaved(true)
    setEditUsername(false)
    setTimeout(() => setUsernameSaved(false), 2000)
  }

  const pageTitle: Record<Page, string> = {
    main: 'Настройки', notifications: 'Уведомления',
    sessions: 'Активные сессии', privacy: 'Конфиденциальность',
    about: 'О приложении', username: 'Username',
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm max-h-[85vh] flex flex-col rounded-3xl overflow-hidden"
        style={{
          background: 'rgba(10,14,26,0.95)',
          backdropFilter: 'blur(48px) saturate(2)',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {(page !== 'main' || privacySubPage) ? (
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => {
              if (privacySubPage) { setPrivacySubPage(null) }
              else { setPage('main') }
            }} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.07)' }}>
              <ArrowLeft size={15} className="text-white/70" />
            </motion.button>
          ) : (
            <div className="w-8" />
          )}
          <h3 className="flex-1 text-center font-semibold text-white text-base">
            {privacySubPage
              ? { phone: 'Номер телефона', photo: 'Фото профиля', lastseen: 'Время захода', forward: 'Пересылка' }[privacySubPage]
              : pageTitle[page]
            }
          </h3>
          <motion.button whileTap={{ scale: 0.9 }} onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <X size={14} className="text-white/60" />
          </motion.button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <AnimatePresence mode="wait">

            {/* ── Main ── */}
            {page === 'main' && (
              <motion.div key="main" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}>
                {/* Profile info */}
                {currentUser && (
                  <div className="rounded-2xl p-4 mb-4 flex items-center gap-3" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white flex-shrink-0" style={{ background: currentUser.avatarColor }}>
                      {currentUser.name.slice(0,2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold truncate">{currentUser.name}</p>
                      <p className="text-white/40 text-xs">{formatPhone(currentUser.phone)}</p>
                      {currentUser.username && <p className="text-purple-400 text-xs">@{currentUser.username}</p>}
                    </div>
                  </div>
                )}

                <Section title="Аккаунт">
                  <Row label="Username" value={currentUser?.username ? `@${currentUser.username}` : 'Не задан'} onClick={() => setPage('username')} />
                  <Row label="Уведомления" onClick={() => setPage('notifications')} />
                  <Row label="Конфиденциальность" onClick={() => setPage('privacy')} />
                  <Row label="Активные сессии" onClick={() => setPage('sessions')} />
                </Section>

                <Section title="Приложение">
                  <Row label="О приложении" value="v1.0.0" onClick={() => setPage('about')} />
                </Section>
              </motion.div>
            )}

            {/* ── Username ── */}
            {page === 'username' && (
              <motion.div key="username" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                <p className="text-white/40 text-sm mb-4 leading-relaxed">
                  Задайте уникальный username. Люди смогут найти вас по нему — например, <span className="text-purple-400">@{newUsername || 'username'}</span>
                </p>
                <div className="relative mb-3">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-base">@</span>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={e => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="username"
                    className="input-field pl-8"
                    maxLength={32}
                  />
                </div>
                <p className="text-white/25 text-xs mb-4">Только латинские буквы, цифры и _. Минимум 5 символов.</p>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={saveUsername}
                  disabled={newUsername.length < 5}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {usernameSaved ? <><Check size={16} /> Сохранено!</> : 'Сохранить'}
                </motion.button>
              </motion.div>
            )}

            {/* ── Notifications ── */}
            {page === 'notifications' && (
              <motion.div key="notif" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                <Section title="Общие">
                  <ToggleRow label="Уведомления на рабочем столе" value={notifDesktop} onChange={setNotifDesktop} />
                  <ToggleRow label="Звук" value={notifSound} onChange={setNotifSound} />
                </Section>
                <Section title="Уведомления из чатов">
                  <ToggleRow label="Личные чаты" value={notifChats} onChange={setNotifChats} />
                  <ToggleRow label="Группы" value={notifGroups} onChange={setNotifGroups} />
                </Section>
              </motion.div>
            )}

            {/* ── Sessions ── */}
            {page === 'sessions' && (
              <motion.div key="sessions" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                <Section title="Это устройство">
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.2)' }}>
                      <Laptop size={18} className="text-purple-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{currentUser?.name ?? 'Устройство'}</p>
                      <p className="text-white/35 text-xs">Umberla Web • Сейчас</p>
                    </div>
                  </div>
                </Section>

                <Section title="Активные сессии">
                  {[
                    { name: 'iPhone', app: 'Umberla iOS', time: 'Сегодня, 18:46', icon: Apple },
                    { name: 'MacBook', app: 'Umberla macOS', time: 'Вчера, 14:20', icon: Laptop },
                  ].map(({ name, app, time, icon: Icon }) => (
                    <div key={name} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <Icon size={18} className="text-white/50" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white/80 text-sm font-medium">{name}</p>
                        <p className="text-white/35 text-xs">{app} • {time}</p>
                      </div>
                      <button className="text-white/20 hover:text-red-400 transition-colors p-1">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </Section>

                <button className="w-full flex items-center gap-2 justify-center py-3 rounded-2xl text-sm font-medium text-red-400 transition-all" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.14)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                >
                  <LogOut size={15} />
                  Завершить все другие сессии
                </button>
              </motion.div>
            )}

            {/* ── Privacy ── */}
            {page === 'privacy' && !privacySubPage && (
              <motion.div key="privacy" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                <Section title="Конфиденциальность">
                  <Row label="Номер телефона"      value={visibilityLabel(phoneVisibility)}   onClick={() => setPrivacySubPage('phone')} />
                  <Row label="Фото профиля"         value={visibilityLabel(photoVisibility)}   onClick={() => setPrivacySubPage('photo')} />
                  <Row label="Время захода"         value={visibilityLabel(lastSeenVisibility)} onClick={() => setPrivacySubPage('lastseen')} />
                  <Row label="Пересылка сообщений"  value={visibilityLabel(forwardVisibility)} onClick={() => setPrivacySubPage('forward')} />
                </Section>
                <Section title="Безопасность">
                  <Row label="Код-пароль" value="Выкл." />
                  <Row label="Двухфакторная аутентификация" value="Выкл." />
                </Section>
              </motion.div>
            )}

            {/* ── Privacy sub-pages ── */}
            {page === 'privacy' && privacySubPage && (() => {
              const configs: Record<string, {
                title: string
                value: 'all' | 'contacts' | 'nobody'
                set: (v: 'all' | 'contacts' | 'nobody') => void
              }> = {
                phone:    { title: 'Кто видит мой номер',          value: phoneVisibility,    set: setPhoneVisibility },
                photo:    { title: 'Кто видит фото в моём профиле', value: photoVisibility,    set: setPhotoVisibility },
                lastseen: { title: 'Кто видит время захода',        value: lastSeenVisibility, set: setLastSeenVisibility },
                forward:  { title: 'Кто может пересылать сообщения', value: forwardVisibility, set: setForwardVisibility },
              }
              const cfg = configs[privacySubPage]
              const options: { value: 'all' | 'contacts' | 'nobody'; label: string }[] = [
                { value: 'all',      label: 'Все' },
                { value: 'contacts', label: 'Мои контакты' },
                { value: 'nobody',   label: 'Никто' },
              ]
              return (
                <motion.div key={`privacy-${privacySubPage}`} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                  <p className="text-white/70 text-sm font-semibold mb-3">{cfg.title}</p>
                  <div className="rounded-2xl overflow-hidden mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {options.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => cfg.set(opt.value)}
                        className="radio-option w-full text-left"
                      >
                        <div className={`radio-circle ${cfg.value === opt.value ? 'selected' : ''}`} />
                        <span className="text-white/80 text-sm">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setPrivacySubPage(null)}
                    className="btn-primary w-full"
                  >
                    Готово
                  </motion.button>
                </motion.div>
              )
            })()}

            {/* ── About ── */}
            {page === 'about' && (
              <motion.div key="about" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                <div className="flex flex-col items-center py-6 mb-4">
                  <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 0 32px rgba(124,58,237,0.4)' }}>
                    <span className="text-3xl">☂️</span>
                  </div>
                  <h2 className="text-white font-bold text-xl">Umberla</h2>
                  <p className="text-white/40 text-sm mt-1">Версия 1.0.0</p>
                </div>
                <Section title="О приложении">
                  <Row label="Версия" value="1.0.0" />
                  <Row label="Разработчик" value="Umberla Team" />
                  <Row label="Лицензия" value="MIT" />
                </Section>
                <p className="text-white/20 text-xs text-center mt-4 leading-relaxed">
                  Мессенджер с поддержкой работы без интернета через Bluetooth и Wi-Fi Direct
                </p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}
