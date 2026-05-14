import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Phone, Video, MessageCircle, Copy, Check,
  AtSign, Edit3, Camera, Save, ChevronRight, LogOut,
  Bell, Shield, Palette, HelpCircle, QrCode
} from 'lucide-react'
import { Avatar } from '../ui/Avatar'
import { formatPhone } from '../../utils/format'
import { useCallStore } from '../../store/callStore'
import { useAuthStore } from '../../store/authStore'
import type { User } from '../../types'

interface Props {
  user: User
  chatId?: string
  onClose: () => void
  onMessage?: () => void
  isOwnProfile?: boolean
}

export const UserProfile: React.FC<Props> = ({ user, chatId, onClose, onMessage, isOwnProfile = false }) => {
  const { startCall } = useCallStore()
  const { updateUser, logout } = useAuthStore()
  const [copied, setCopied] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(user.name)
  const [editBio, setEditBio] = useState(user.bio || '')
  const [editUsername, setEditUsername] = useState(user.username || '')

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text).catch(() => {})
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleCall = (type: 'audio' | 'video') => {
    if (chatId) startCall(chatId, type)
    onClose()
  }

  const handleSave = () => {
    updateUser({
      name: editName.trim() || user.name,
      bio: editBio.trim(),
      username: editUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, '') || user.username,
    })
    setEditing(false)
  }

  const statusColor = user.status === 'online' ? '#4ade80' : user.status === 'away' ? '#fbbf24' : '#6b7280'
  const statusText = user.status === 'online' ? 'в сети' : user.status === 'away' ? 'недавно был(а)' : 'не в сети'

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: 'spring', damping: 30, stiffness: 320 }}
          onClick={e => e.stopPropagation()}
          className="w-full sm:max-w-sm sm:rounded-3xl rounded-t-3xl overflow-hidden"
          style={{
            background: 'rgba(10,14,26,0.97)',
            backdropFilter: 'blur(40px) saturate(2)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 -4px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
          </div>

          {/* Header */}
          <div
            className="relative px-5 pt-6 pb-5 text-center"
            style={{
              background: `linear-gradient(160deg, ${user.avatarColor}25 0%, transparent 65%)`,
              borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            {/* Close / Edit buttons */}
            <div className="absolute top-4 left-4 right-4 flex justify-between">
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.08)' }}
              >
                <X size={14} className="text-white/60" />
              </button>
              {isOwnProfile && (
                <button
                  onClick={() => editing ? handleSave() : setEditing(true)}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: editing ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.08)' }}
                >
                  {editing ? <Save size={14} className="text-purple-300" /> : <Edit3 size={14} className="text-white/60" />}
                </button>
              )}
            </div>

            {/* Avatar */}
            <div className="flex justify-center mb-3 mt-2">
              <div className="relative">
                <Avatar name={user.name} color={user.avatarColor} size="xl" />
                <div
                  className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2"
                  style={{
                    background: statusColor,
                    borderColor: 'rgba(10,14,26,0.97)',
                    boxShadow: user.status === 'online' ? `0 0 8px ${statusColor}` : 'none',
                  }}
                />
                {isOwnProfile && (
                  <button
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(124,58,237,0.8)', border: '2px solid rgba(10,14,26,0.97)' }}
                  >
                    <Camera size={12} className="text-white" />
                  </button>
                )}
              </div>
            </div>

            {/* Name */}
            {editing ? (
              <input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="input-field text-center text-lg font-bold mb-1 py-2"
                placeholder="Имя"
                autoFocus
              />
            ) : (
              <h2 className="text-white font-bold text-xl">{user.name}</h2>
            )}

            <p className="text-sm mt-0.5" style={{ color: statusColor }}>
              {user.status === 'online' ? '● ' : '○ '}{statusText}
            </p>

            {/* Bio */}
            {editing ? (
              <textarea
                value={editBio}
                onChange={e => setEditBio(e.target.value)}
                className="input-field text-center text-sm mt-2 resize-none py-2"
                placeholder="О себе..."
                rows={2}
              />
            ) : user.bio ? (
              <p className="text-white/50 text-sm mt-2 leading-relaxed">{user.bio}</p>
            ) : isOwnProfile ? (
              <button
                onClick={() => setEditing(true)}
                className="text-white/25 text-xs mt-2 hover:text-white/40 transition-colors"
              >
                + Добавить описание
              </button>
            ) : null}
          </div>

          {/* Action buttons (only for other users) */}
          {!isOwnProfile && (
            <div className="flex gap-2 px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {[
                { icon: MessageCircle, label: 'Написать', action: () => { onMessage?.(); onClose() }, color: '#7c3aed' },
                { icon: Phone,         label: 'Звонок',   action: () => handleCall('audio'),           color: '#059669' },
                { icon: Video,         label: 'Видео',    action: () => handleCall('video'),            color: '#0891b2' },
              ].map(({ icon: Icon, label, action, color }) => (
                <button
                  key={label}
                  onClick={action}
                  className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all active:scale-95"
                  style={{ background: `${color}18`, border: `1px solid ${color}28` }}
                >
                  <Icon size={18} style={{ color }} />
                  <span className="text-xs font-medium" style={{ color }}>{label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Info rows */}
          <div className="px-3 py-2 space-y-0.5">
            {/* Username */}
            {editing ? (
              <div className="px-3 py-2">
                <p className="text-white/40 text-xs mb-1">Username</p>
                <div className="flex items-center gap-2">
                  <span className="text-white/40">@</span>
                  <input
                    value={editUsername}
                    onChange={e => setEditUsername(e.target.value)}
                    className="input-field py-2 text-sm"
                    placeholder="username"
                  />
                </div>
              </div>
            ) : user.username ? (
              <InfoRow
                icon={<AtSign size={16} className="text-purple-400" />}
                iconBg="rgba(124,58,237,0.15)"
                label="Username"
                value={`@${user.username}`}
                onCopy={() => copy(`@${user.username}`, 'username')}
                copied={copied === 'username'}
              />
            ) : null}

            {/* Phone */}
            <InfoRow
              icon={<Phone size={16} className="text-emerald-400" />}
              iconBg="rgba(5,150,105,0.15)"
              label="Телефон"
              value={formatPhone(user.phone)}
              onCopy={() => copy(user.phone, 'phone')}
              copied={copied === 'phone'}
            />
          </div>

          {/* Own profile settings */}
          {isOwnProfile && (
            <div className="px-3 py-2 space-y-0.5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              {[
                { icon: <Bell size={16} className="text-yellow-400" />, iconBg: 'rgba(251,191,36,0.15)', label: 'Уведомления', value: 'Включены' },
                { icon: <Shield size={16} className="text-blue-400" />, iconBg: 'rgba(59,130,246,0.15)', label: 'Конфиденциальность', value: '' },
                { icon: <Palette size={16} className="text-pink-400" />, iconBg: 'rgba(236,72,153,0.15)', label: 'Оформление', value: '' },
              ].map(item => (
                <button
                  key={item.label}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all active:scale-98 text-left"
                  style={{ background: 'rgba(255,255,255,0.02)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: item.iconBg }}>
                    {item.icon}
                  </div>
                  <span className="flex-1 text-white/80 text-sm">{item.label}</span>
                  {item.value && <span className="text-white/30 text-xs">{item.value}</span>}
                  <ChevronRight size={14} className="text-white/20" />
                </button>
              ))}

              {/* Logout */}
              <button
                onClick={() => { logout(); onClose() }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all active:scale-98 text-left mt-2"
                style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)' }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(239,68,68,0.12)' }}>
                  <LogOut size={16} className="text-red-400" />
                </div>
                <span className="flex-1 text-red-400 text-sm font-medium">Выйти</span>
              </button>
            </div>
          )}

          <div className="h-4" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Info row ─────────────────────────────────────────────────────────────────
const InfoRow: React.FC<{
  icon: React.ReactNode
  iconBg: string
  label: string
  value: string
  onCopy?: () => void
  copied?: boolean
}> = ({ icon, iconBg, label, value, onCopy, copied }) => (
  <button
    onClick={onCopy}
    className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all text-left"
    style={{ background: 'rgba(255,255,255,0.02)' }}
    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
  >
    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: iconBg }}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-white/35 text-xs">{label}</p>
      <p className="text-white text-sm font-medium truncate">{value}</p>
    </div>
    {copied
      ? <Check size={14} className="text-green-400 flex-shrink-0" />
      : <Copy size={14} className="text-white/15 flex-shrink-0" />
    }
  </button>
)
