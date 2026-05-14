import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Phone, Video, MessageCircle, Copy, Check, AtSign } from 'lucide-react'
import { Avatar } from '../ui/Avatar'
import { formatPhone } from '../../utils/format'
import { useCallStore } from '../../store/callStore'
import type { User } from '../../types'
import { useState } from 'react'

interface Props {
  user: User
  chatId?: string
  onClose: () => void
  onMessage?: () => void
}

export const UserProfile: React.FC<Props> = ({ user, chatId, onClose, onMessage }) => {
  const { startCall } = useCallStore()
  const [copied, setCopied] = useState<string | null>(null)

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text).catch(() => {})
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleCall = (type: 'audio' | 'video') => {
    if (chatId) startCall(chatId, type)
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-sm overflow-hidden rounded-3xl"
          style={{
            background: 'rgba(12,18,32,0.92)',
            backdropFilter: 'blur(40px) saturate(2)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
        >
          {/* Header with avatar */}
          <div
            className="relative px-6 pt-8 pb-6 text-center"
            style={{
              background: `linear-gradient(160deg, ${user.avatarColor}30 0%, transparent 70%)`,
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <X size={14} className="text-white/60" />
            </button>

            {/* Avatar */}
            <div className="flex justify-center mb-3">
              <div className="relative">
                <Avatar name={user.name} color={user.avatarColor} size="xl" />
                <div
                  className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2"
                  style={{
                    background: user.status === 'online' ? '#4ade80' : user.status === 'away' ? '#fbbf24' : '#6b7280',
                    borderColor: 'rgba(12,18,32,0.92)',
                    boxShadow: user.status === 'online' ? '0 0 8px #4ade80' : 'none',
                  }}
                />
              </div>
            </div>

            <h2 className="text-white font-bold text-xl">{user.name}</h2>
            <p className="text-white/40 text-sm mt-0.5">
              {user.status === 'online' ? '🟢 в сети' : user.status === 'away' ? '🟡 недавно был' : '⚫ не в сети'}
            </p>
            {user.bio && <p className="text-white/60 text-sm mt-2 leading-relaxed">{user.bio}</p>}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              { icon: MessageCircle, label: 'Написать', action: () => { onMessage?.(); onClose() }, color: 'var(--color-primary)' },
              { icon: Phone,         label: 'Звонок',   action: () => handleCall('audio'),           color: '#059669' },
              { icon: Video,         label: 'Видео',    action: () => handleCall('video'),            color: '#0891b2' },
            ].map(({ icon: Icon, label, action, color }) => (
              <button
                key={label}
                onClick={action}
                className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all"
                style={{
                  background: `${color}18`,
                  border: `1px solid ${color}30`,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = `${color}28`)}
                onMouseLeave={e => (e.currentTarget.style.background = `${color}18`)}
              >
                <Icon size={20} style={{ color }} />
                <span className="text-xs font-medium" style={{ color }}>{label}</span>
              </button>
            ))}
          </div>

          {/* Info rows */}
          <div className="px-4 py-3 space-y-1">
            {user.username && (
              <button
                onClick={() => copy(`@${user.username}`, 'username')}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all text-left"
                style={{ background: 'rgba(255,255,255,0.03)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.2)' }}>
                  <AtSign size={16} className="text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/40 text-xs">Username</p>
                  <p className="text-white text-sm font-medium">@{user.username}</p>
                </div>
                {copied === 'username'
                  ? <Check size={14} className="text-green-400 flex-shrink-0" />
                  : <Copy size={14} className="text-white/20 flex-shrink-0" />
                }
              </button>
            )}

            <button
              onClick={() => copy(user.phone, 'phone')}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all text-left"
              style={{ background: 'rgba(255,255,255,0.03)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(5,150,105,0.15)', border: '1px solid rgba(5,150,105,0.2)' }}>
                <Phone size={16} className="text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/40 text-xs">Телефон</p>
                <p className="text-white text-sm font-medium">{formatPhone(user.phone)}</p>
              </div>
              {copied === 'phone'
                ? <Check size={14} className="text-green-400 flex-shrink-0" />
                : <Copy size={14} className="text-white/20 flex-shrink-0" />
              }
            </button>
          </div>

          <div className="px-4 pb-4" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
