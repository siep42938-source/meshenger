import React from 'react'
import { motion } from 'framer-motion'
import {
  X, LogOut, Wifi, Bluetooth, Globe, WifiOff,
  User, Bell, Shield, Info, ChevronRight, Smartphone
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useChatStore } from '../../store/chatStore'
import { Avatar } from '../ui/Avatar'
import { NetworkBadge } from '../ui/NetworkBadge'
import { formatPhone } from '../../utils/format'
import type { NetworkMode } from '../../types'

interface Props {
  onClose: () => void
}

const networkOptions: { mode: NetworkMode; label: string; desc: string; Icon: React.FC<any> }[] = [
  { mode: 'internet',     label: 'Интернет',     desc: 'Обычная доставка через сеть',    Icon: Globe },
  { mode: 'wifi-direct',  label: 'Wi-Fi Direct', desc: 'Без роутера, до 200м',           Icon: Wifi },
  { mode: 'bluetooth',    label: 'Bluetooth',    desc: 'Mesh-сеть, до 100м',             Icon: Bluetooth },
  { mode: 'offline',      label: 'Офлайн',       desc: 'Очередь — отправится при связи', Icon: WifiOff },
]

export const SettingsPanel: React.FC<Props> = ({ onClose }) => {
  const { currentUser, logout } = useAuthStore()
  const { networkMode, setNetworkMode } = useChatStore()

  if (!currentUser) return null

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      className="absolute inset-0 bg-surface-950 z-40 flex flex-col overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 safe-top border-b border-surface-800/50">
        <button onClick={onClose} className="btn-ghost p-2 -ml-1">
          <X size={20} />
        </button>
        <h2 className="font-semibold text-white text-lg">Настройки</h2>
      </div>

      {/* Profile card */}
      <div className="px-4 py-5">
        <div className="glass rounded-3xl p-4 flex items-center gap-4">
          <Avatar
            name={currentUser.name}
            color={currentUser.avatarColor}
            size="lg"
            online
          />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-lg truncate">{currentUser.name}</p>
            <p className="text-surface-400 text-sm">{formatPhone(currentUser.phone)}</p>
            <p className="text-green-400 text-xs mt-0.5">● в сети</p>
          </div>
          <button className="btn-ghost p-2">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Network mode */}
      <div className="px-4 mb-4">
        <p className="text-surface-400 text-xs font-semibold uppercase tracking-wider mb-2 px-1">
          Режим сети
        </p>
        <div className="glass rounded-3xl overflow-hidden">
          {networkOptions.map(({ mode, label, desc, Icon }, i) => (
            <button
              key={mode}
              onClick={() => setNetworkMode(mode)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 transition-colors text-left ${
                i < networkOptions.length - 1 ? 'border-b border-surface-700/30' : ''
              } ${networkMode === mode ? 'bg-primary-500/10' : 'hover:bg-white/[0.03]'}`}
            >
              <div className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                networkMode === mode ? 'bg-primary-500' : 'bg-surface-800'
              }`}>
                <Icon size={18} className={networkMode === mode ? 'text-white' : 'text-surface-400'} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${networkMode === mode ? 'text-white' : 'text-surface-200'}`}>
                  {label}
                </p>
                <p className="text-surface-500 text-xs">{desc}</p>
              </div>
              {networkMode === mode && (
                <div className="w-2 h-2 rounded-full bg-primary-400 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
        <p className="text-surface-500 text-xs mt-2 px-1">
          Авто-режим: приложение само выбирает лучший канал
        </p>
      </div>

      {/* Menu items */}
      <div className="px-4 mb-4">
        <p className="text-surface-400 text-xs font-semibold uppercase tracking-wider mb-2 px-1">
          Аккаунт
        </p>
        <div className="glass rounded-3xl overflow-hidden">
          {[
            { Icon: User,       label: 'Профиль',        desc: 'Имя, фото, статус' },
            { Icon: Bell,       label: 'Уведомления',    desc: 'Звуки, вибрация' },
            { Icon: Shield,     label: 'Конфиденциальность', desc: 'Блокировки, сессии' },
            { Icon: Smartphone, label: 'Устройства',     desc: 'Активные сессии' },
          ].map(({ Icon, label, desc }, i, arr) => (
            <button
              key={label}
              className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.03] transition-colors text-left ${
                i < arr.length - 1 ? 'border-b border-surface-700/30' : ''
              }`}
            >
              <div className="w-9 h-9 rounded-2xl bg-surface-800 flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-surface-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-surface-200">{label}</p>
                <p className="text-surface-500 text-xs">{desc}</p>
              </div>
              <ChevronRight size={16} className="text-surface-600" />
            </button>
          ))}
        </div>
      </div>

      {/* App info */}
      <div className="px-4 mb-4">
        <div className="glass rounded-3xl px-4 py-3 flex items-center gap-3">
          <Info size={16} className="text-surface-500" />
          <div>
            <p className="text-surface-300 text-sm">Umberla v1.0.0</p>
            <p className="text-surface-500 text-xs">Работает везде — с интернетом и без</p>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="px-4 pb-8 mt-auto">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl
                     bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium
                     transition-colors border border-red-500/20"
        >
          <LogOut size={18} />
          Выйти из аккаунта
        </button>
      </div>
    </motion.div>
  )
}
