import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Edit, Menu, Pin, BellOff, BookmarkCheck, Archive, ChevronDown } from 'lucide-react'
import { useChatStore } from '../../store/chatStore'
import { useAuthStore } from '../../store/authStore'
import { Avatar } from '../ui/Avatar'
import { NetworkBadge } from '../ui/NetworkBadge'
import { ChatContextMenu } from './ChatContextMenu'
import { formatChatDate } from '../../utils/format'
import type { Chat } from '../../types'
import clsx from 'clsx'

interface ChatListProps {
  onOpenMenu: () => void
  onNewChat: () => void
}

interface CtxMenu { chat: Chat; x: number; y: number }

export const ChatList: React.FC<ChatListProps> = ({ onOpenMenu, onNewChat }) => {
  const {
    chats, contacts, activeChatId, setActiveChat, networkMode,
    togglePin, toggleMute, markRead, toggleArchive, deleteChat, clearHistory,
    showArchive, setShowArchive,
  } = useChatStore()
  const { currentUser } = useAuthStore()
  const [search, setSearch] = useState('')
  const [ctxMenu, setCtxMenu] = useState<CtxMenu | null>(null)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const filtered = chats.filter(c => {
    const archived = (c as any).archived
    if (showArchive) return archived
    if (archived) return false
    if (!search) return true
    return getChatName(c).toLowerCase().includes(search.toLowerCase())
  })

  const sorted = [...filtered].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    const ta = a.lastMessage?.timestamp ? new Date(a.lastMessage.timestamp).getTime() : 0
    const tb = b.lastMessage?.timestamp ? new Date(b.lastMessage.timestamp).getTime() : 0
    return tb - ta
  })

  const archivedCount = chats.filter(c => (c as any).archived).length

  function getChatName(chat: Chat): string {
    if (chat.name) return chat.name
    if (chat.type === 'saved') return 'Избранное'
    const otherId = chat.participants.find(p => p !== 'me' && p !== currentUser?.id)
    return contacts.find(c => c.id === otherId)?.name ?? 'Неизвестный'
  }

  function isOnline(chat: Chat): boolean | undefined {
    if (chat.type !== 'direct') return undefined
    const otherId = chat.participants.find(p => p !== 'me' && p !== currentUser?.id)
    return contacts.find(c => c.id === otherId)?.status === 'online'
  }

  const totalUnread = chats
    .filter(c => !(c as any).archived)
    .reduce((s, c) => s + c.unreadCount, 0)

  // Context menu handlers
  const openCtx = (chat: Chat, x: number, y: number) => {
    setCtxMenu({ chat, x, y })
  }

  const handleContextMenu = (e: React.MouseEvent, chat: Chat) => {
    e.preventDefault()
    openCtx(chat, e.clientX, e.clientY)
  }

  const handleLongPressStart = (chat: Chat, e: React.TouchEvent) => {
    const touch = e.touches[0]
    longPressTimer.current = setTimeout(() => {
      openCtx(chat, touch.clientX, touch.clientY)
    }, 500)
  }

  const handleLongPressEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current)
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--color-bg)' }}>

      {/* Header */}
      <div
        className="px-4 pt-4 pb-3 safe-top flex-shrink-0"
        style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button onClick={onOpenMenu} className="btn-ghost p-2 -ml-1">
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-lg">
                {showArchive ? 'Архив' : 'Umberla'}
              </span>
              {!showArchive && totalUnread > 0 && (
                <span className="unread-badge">{totalUnread > 99 ? '99+' : totalUnread}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {!showArchive && <NetworkBadge mode={networkMode} />}
            {showArchive ? (
              <button onClick={() => setShowArchive(false)} className="btn-ghost p-2 text-sm">
                Назад
              </button>
            ) : (
              <button
                onClick={onNewChat}
                className="w-9 h-9 rounded-2xl flex items-center justify-center ml-1"
                style={{
                  background: 'linear-gradient(135deg, var(--color-primary), rgba(109,40,217,0.7))',
                  border: '1px solid rgba(255,255,255,0.15)',
                  boxShadow: '0 0 12px var(--color-glow)',
                }}
              >
                <Edit size={15} className="text-white" />
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.3)' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск"
            className="input-field search-input py-2.5 text-sm"
          />
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">

        {/* Archive button */}
        {!showArchive && archivedCount > 0 && (
          <motion.button
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setShowArchive(true)}
            className="w-full flex items-center gap-3 px-4 py-3 transition-all text-left"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <Archive size={20} style={{ color: 'rgba(255,255,255,0.6)' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white/85 text-sm font-semibold">Архив</p>
              <p className="text-white/35 text-xs">{archivedCount} чат{archivedCount > 1 ? 'а' : ''}</p>
            </div>
            <ChevronDown size={14} style={{ color: 'rgba(255,255,255,0.2)', transform: 'rotate(-90deg)' }} />
          </motion.button>
        )}

        <AnimatePresence initial={false}>
          {sorted.map((chat, i) => {
            const name = getChatName(chat)
            const online = isOnline(chat)
            const isActive = activeChatId === chat.id
            const lastMsg = chat.lastMessage
            const isMe = lastMsg?.senderId === 'me' || lastMsg?.senderId === currentUser?.id

            return (
              <motion.button
                key={chat.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12, height: 0 }}
                transition={{ delay: i * 0.02, duration: 0.18 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setActiveChat(chat.id)}
                onContextMenu={e => handleContextMenu(e, chat)}
                onTouchStart={e => handleLongPressStart(chat, e)}
                onTouchEnd={handleLongPressEnd}
                onTouchMove={handleLongPressEnd}
                className="w-full flex items-center gap-3 px-3 py-2.5 mx-1.5 transition-all text-left rounded-2xl"
                style={{
                  width: 'calc(100% - 12px)',
                  background: isActive ? 'rgba(124,58,237,0.12)' : 'transparent',
                  border: isActive ? '1px solid rgba(124,58,237,0.2)' : '1px solid transparent',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {chat.avatarEmoji ? (
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                      style={{ background: `linear-gradient(135deg, ${chat.avatarColor}, rgba(0,0,0,0.3))`, border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      {chat.avatarEmoji}
                    </div>
                  ) : (
                    <Avatar name={name} color={chat.avatarColor ?? '#7c3aed'} size="md" online={online} />
                  )}
                  {chat.isPinned && !chat.isSystem && (
                    <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
                      <Pin size={8} style={{ color: 'rgba(255,255,255,0.4)' }} />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-semibold text-sm truncate" style={{ color: isActive ? 'white' : 'rgba(255,255,255,0.9)' }}>
                        {name}
                      </span>
                      {chat.isSystem && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0"
                          style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.2)' }}>
                          КАНАЛ
                        </span>
                      )}
                      {chat.type === 'saved' && <BookmarkCheck size={11} className="text-emerald-400 flex-shrink-0" />}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                      {chat.isMuted && <BellOff size={10} style={{ color: 'rgba(255,255,255,0.2)' }} />}
                      {lastMsg && (
                        <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                          {formatChatDate(new Date(lastMsg.timestamp))}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs truncate flex-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {lastMsg
                        ? (isMe ? `Вы: ${lastMsg.text}` : lastMsg.text)
                        : <span style={{ fontStyle: 'italic' }}>Нет сообщений</span>
                      }
                    </p>
                    {chat.unreadCount > 0 && (
                      <span className="ml-2 flex-shrink-0 unread-badge">
                        {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </motion.button>
            )
          })}
        </AnimatePresence>

        {sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="text-4xl mb-3">{showArchive ? '📦' : '🔍'}</div>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {showArchive ? 'Архив пуст' : 'Ничего не найдено'}
            </p>
          </div>
        )}
      </div>

      {/* Context menu */}
      <AnimatePresence>
        {ctxMenu && (
          <ChatContextMenu
            chat={ctxMenu.chat}
            x={ctxMenu.x}
            y={ctxMenu.y}
            onClose={() => setCtxMenu(null)}
            onPin={() => togglePin(ctxMenu.chat.id)}
            onMute={() => toggleMute(ctxMenu.chat.id)}
            onMarkUnread={() => markRead(ctxMenu.chat.id)}
            onArchive={() => toggleArchive(ctxMenu.chat.id)}
            onDelete={() => deleteChat(ctxMenu.chat.id)}
            onClearHistory={() => clearHistory(ctxMenu.chat.id)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
