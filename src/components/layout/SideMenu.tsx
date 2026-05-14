import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, User, Users, Megaphone, Phone, BookmarkCheck,
  Settings, Moon, Sun, LogOut, ChevronRight, Palette, Shield
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import { Avatar } from '../ui/Avatar'
import { ThemePanel } from '../settings/ThemePanel'
import { formatPhone } from '../../utils/format'
import clsx from 'clsx'

import type { GlobalModal } from './MainLayout'

interface Props {
  onClose: () => void
  onOpenChat: (id: string) => void
  onOpenModal: (modal: GlobalModal) => void
}

type Section = 'theme' | 'settings' | null

export const SideMenu: React.FC<Props> = ({ onClose, onOpenChat, onOpenModal }) => {
  const { currentUser, logout } = useAuthStore()
  const { theme, setMode } = useThemeStore()
  const [openSection, setOpenSection] = useState<Section>(null)

  if (!currentUser) return null

  const isLight = theme.mode === 'light'
  const toggle = (s: Section) => setOpenSection(p => p === s ? null : s)

  const mainItems = [
    { icon: User,          label: 'Мой профиль',    action: () => { onOpenModal('profile'); onClose() } },
    { icon: Users,         label: 'Создать группу', action: () => { onOpenModal('createGroup'); onClose() } },
    { icon: Megaphone,     label: 'Создать канал',  action: () => { onOpenModal('createChannel'); onClose() } },
    { icon: Phone,         label: 'Звонки',         action: () => {} },
    { icon: BookmarkCheck, label: 'Избранное',      action: () => { onOpenChat('saved-messages'); onClose() } },
  ]

  const settingsItems = [
    { label: 'Уведомления',        action: () => {} },
    { label: 'Конфиденциальность', action: () => {} },
    { label: 'Активные сессии',    action: () => {} },
    { label: 'О приложении',       action: () => {} },
  ]

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
      />

      {/* Panel */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 320 }}
        className="fixed left-0 top-0 bottom-0 w-72 z-50 flex flex-col"
        style={{
          background: 'rgba(8,12,22,0.92)',
          backdropFilter: 'blur(48px) saturate(2.2)',
          WebkitBackdropFilter: 'blur(48px) saturate(2.2)',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '8px 0 48px rgba(0,0,0,0.7)',
        }}
      >
        {/* ── Header ── */}
        <div
          className="relative px-5 pt-12 pb-5 safe-top flex-shrink-0"
          style={{
            background: 'linear-gradient(160deg, rgba(124,58,237,0.25) 0%, transparent 70%)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <X size={14} className="text-white/60" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { onOpenModal('profile'); onClose() }}
            className="flex items-end gap-3 w-full text-left"
          >
            <div className="relative">
              <Avatar name={currentUser.name} color={currentUser.avatarColor} size="lg" />
              <div
                className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-2"
                style={{ background: '#4ade80', borderColor: 'rgba(8,12,22,0.92)', boxShadow: '0 0 8px #4ade80' }}
              />
            </div>
            <div className="flex-1 min-w-0 pb-0.5">
              <p className="text-white font-bold text-base leading-tight truncate">{currentUser.name}</p>
              <p className="text-white/40 text-xs mt-0.5 truncate">{formatPhone(currentUser.phone)}</p>
              {currentUser.username && (
                <p className="text-purple-400 text-xs mt-0.5">@{currentUser.username}</p>
              )}
            </div>
          </motion.button>
        </div>

        {/* ── Menu items ── */}
        <div className="flex-1 overflow-y-auto py-2">

          {/* Main items */}
          {mainItems.map(({ icon: Icon, label, action }) => (
            <MenuItem
              key={label}
              icon={Icon}
              label={label}
              onClick={action}
            />
          ))}

          {/* Admin panel — только для администраторов */}
          {currentUser.isAdmin && (
            <>
              <Divider />
              <MenuItem
                icon={Shield}
                label="Панель администратора"
                badge="ADMIN"
                onClick={() => { onOpenModal('admin'); onClose() }}
              />
            </>
          )}

          <Divider />

          {/* Оформление */}
          <ExpandableItem
            icon={Palette}
            label="Оформление"
            isOpen={openSection === 'theme'}
            onToggle={() => toggle('theme')}
          >
            <div className="px-3 py-3">
              <ThemePanel />
            </div>
          </ExpandableItem>

          {/* Настройки */}
          <MenuItem
            icon={Settings}
            label="Настройки"
            onClick={() => { onOpenModal('settings'); onClose() }}
          />

          <Divider />

          {/* Night mode */}
          <div className="flex items-center gap-3.5 px-4 py-3">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              {isLight
                ? <Sun size={16} className="text-yellow-300" />
                : <Moon size={16} className="text-white/50" />
              }
            </div>
            <span className="flex-1 text-white/70 text-sm">Ночной режим</span>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setMode(isLight ? 'dark' : 'light')}
              className="relative flex-shrink-0"
              style={{
                width: 44, height: 24, borderRadius: 999,
                background: !isLight
                  ? 'linear-gradient(135deg, #7c3aed, #6d28d9)'
                  : 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: !isLight ? '0 0 12px rgba(124,58,237,0.5)' : 'none',
                transition: 'all 0.3s',
              }}
            >
              <motion.div
                animate={{ x: !isLight ? 22 : 2 }}
                transition={{ type: 'spring', stiffness: 600, damping: 35 }}
                className="absolute top-1 w-4 h-4 rounded-full bg-white"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
              />
            </motion.button>
          </div>
        </div>

        {/* ── Footer ── */}
        <div
          className="px-4 py-4 flex-shrink-0 safe-bottom"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <motion.button
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all"
            style={{ color: '#f87171' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <LogOut size={16} />
            Выйти из аккаунта
          </motion.button>
          <p className="text-white/15 text-[10px] text-center mt-2">Umberla Messenger v1.0.0</p>
        </div>
      </motion.div>

    </>
  )
}

/* ── Sub-components ── */

const MenuItem: React.FC<{
  icon: React.FC<any>
  label: string
  onClick: () => void
  badge?: string
}> = ({ icon: Icon, label, onClick, badge }) => (
  <motion.button
    whileHover={{ x: 3 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl mx-1 transition-all text-left group"
    style={{ width: 'calc(100% - 8px)' }}
    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
  >
    <div
      className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-105"
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      <Icon size={17} className="text-white/60 group-hover:text-white/90 transition-colors" />
    </div>
    <span className="flex-1 text-white/70 text-sm font-medium group-hover:text-white transition-colors">
      {label}
    </span>
    {badge && (
      <span
        className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
        style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.2)' }}
      >
        {badge}
      </span>
    )}
  </motion.button>
)

const ExpandableItem: React.FC<{
  icon: React.FC<any>
  label: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}> = ({ icon: Icon, label, isOpen, onToggle, children }) => (
  <>
    <motion.button
      whileHover={{ x: 3 }}
      whileTap={{ scale: 0.98 }}
      onClick={onToggle}
      className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl mx-1 transition-all text-left group"
      style={{
        width: 'calc(100% - 8px)',
        background: isOpen ? 'rgba(124,58,237,0.1)' : 'transparent',
        borderLeft: isOpen ? '2px solid rgba(124,58,237,0.7)' : '2px solid transparent',
      }}
      onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
      onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = 'transparent' }}
    >
      <div
        className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all"
        style={{
          background: isOpen ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Icon size={17} className={isOpen ? 'text-purple-300' : 'text-white/60 group-hover:text-white/90 transition-colors'} />
      </div>
      <span className={clsx('flex-1 text-sm font-medium transition-colors', isOpen ? 'text-white' : 'text-white/70 group-hover:text-white')}>
        {label}
      </span>
      <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
        <ChevronRight size={14} className="text-white/25" />
      </motion.div>
    </motion.button>

    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeInOut' }}
          className="overflow-hidden mx-2 mb-1"
        >
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </>
)

const Divider = () => (
  <div className="mx-4 my-1.5" style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }} />
)
