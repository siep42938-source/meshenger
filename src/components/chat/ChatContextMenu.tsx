import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pin, BellOff, MessageCircle, Archive, Trash2, Eye, EyeOff } from 'lucide-react'
import type { Chat } from '../../types'

interface Props {
  chat: Chat
  x: number
  y: number
  onClose: () => void
  onPin: () => void
  onMute: () => void
  onMarkUnread: () => void
  onArchive: () => void
  onDelete: () => void
  onClearHistory: () => void
}

export const ChatContextMenu: React.FC<Props> = ({
  chat, x, y, onClose,
  onPin, onMute, onMarkUnread, onArchive, onDelete, onClearHistory
}) => {
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click or Escape
  useEffect(() => {
    const handler = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent && e.key === 'Escape') { onClose(); return }
      if (e instanceof MouseEvent && ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('keydown', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('keydown', handler)
    }
  }, [])

  // Adjust position so menu doesn't go off screen
  const menuW = 220
  const menuH = 280
  const adjX = Math.min(x, window.innerWidth - menuW - 8)
  const adjY = Math.min(y, window.innerHeight - menuH - 8)

  const items = [
    {
      icon: Pin,
      label: chat.isPinned ? 'Открепить' : 'Закрепить',
      action: onPin,
    },
    {
      icon: BellOff,
      label: chat.isMuted ? 'Включить уведомления' : 'Выключить уведомления',
      action: onMute,
    },
    {
      icon: chat.unreadCount > 0 ? Eye : EyeOff,
      label: chat.unreadCount > 0 ? 'Пометить прочитанным' : 'Пометить непрочитанным',
      action: onMarkUnread,
    },
    {
      icon: Archive,
      label: (chat as any).archived ? 'Разархивировать' : 'Архивировать',
      action: onArchive,
    },
    {
      icon: MessageCircle,
      label: 'Очистить историю',
      action: onClearHistory,
      divider: true,
    },
    {
      icon: Trash2,
      label: 'Удалить чат',
      action: onDelete,
      danger: true,
    },
  ]

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.92, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: -8 }}
      transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
      className="fixed z-[200] rounded-2xl overflow-hidden"
      style={{
        left: adjX,
        top: adjY,
        width: menuW,
        background: 'rgba(10,14,26,0.97)',
        backdropFilter: 'blur(32px) saturate(2)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 16px 48px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,0.4)',
      }}
    >
      {items.map(({ icon: Icon, label, action, danger, divider }, i) => (
        <React.Fragment key={label}>
          {divider && (
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '2px 0' }} />
          )}
          <motion.button
            whileHover={{ backgroundColor: danger ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.06)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { action(); onClose() }}
            className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
            style={{ color: danger ? '#f87171' : 'rgba(255,255,255,0.8)' }}
          >
            <Icon size={16} style={{ opacity: 0.7, flexShrink: 0 }} />
            <span style={{ fontSize: '14px', fontWeight: 500 }}>{label}</span>
          </motion.button>
        </React.Fragment>
      ))}
    </motion.div>
  )
}
