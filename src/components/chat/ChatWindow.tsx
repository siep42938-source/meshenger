import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Phone, Video, MoreVertical, Send,
  Smile, Paperclip, Mic, Info, Lock, BookmarkCheck
} from 'lucide-react'
import { useChatStore } from '../../store/chatStore'
import { useAuthStore } from '../../store/authStore'
import { Avatar } from '../ui/Avatar'
import { MessageStatus } from '../ui/MessageStatus'
import { NetworkBadge } from '../ui/NetworkBadge'
import { formatTime, formatChatDate } from '../../utils/format'
import type { Chat, Message } from '../../types'
import clsx from 'clsx'

interface ChatWindowProps {
  chatId: string
  onBack: () => void
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ chatId, onBack }) => {
  const { chats, messages, contacts, sendMessage, networkMode } = useChatStore()
  const { currentUser } = useAuthStore()
  const [text, setText] = useState('')
  const [showInfo, setShowInfo] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const chat = chats.find(c => c.id === chatId)
  const chatMessages = messages[chatId] ?? []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages.length])

  if (!chat) return null

  const isReadOnly = chat.isReadOnly || chat.type === 'channel'
  const isSaved = chat.type === 'saved'

  // Get chat display name
  function getChatName(): string {
    if (chat!.name) return chat!.name
    if (isSaved) return 'Избранное'
    const otherId = chat!.participants.find(p => p !== 'me' && p !== currentUser?.id)
    return contacts.find(c => c.id === otherId)?.name ?? 'Неизвестный'
  }

  function getChatSubtitle(): string {
    if (chat!.isSystem) return 'Официальный канал'
    if (isSaved) return 'Ваши заметки'
    const otherId = chat!.participants.find(p => p !== 'me' && p !== currentUser?.id)
    const contact = contacts.find(c => c.id === otherId)
    if (!contact) return ''
    if (contact.status === 'online') return 'в сети'
    if (contact.status === 'away') return 'недавно был(а)'
    return 'не в сети'
  }

  function getContactColor(): string {
    return chat!.avatarColor ?? '#1a5cff'
  }

  function isOnline(): boolean {
    const otherId = chat!.participants.find(p => p !== 'me' && p !== currentUser?.id)
    return contacts.find(c => c.id === otherId)?.status === 'online'
  }

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed || isReadOnly) return
    sendMessage(chatId, trimmed, currentUser?.id ?? 'me')
    setText('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Group messages by date
  const grouped: Array<{ date: string; messages: Message[] }> = []
  chatMessages.forEach(msg => {
    const d = formatChatDate(new Date(msg.timestamp))
    const last = grouped[grouped.length - 1]
    if (last && last.date === d) {
      last.messages.push(msg)
    } else {
      grouped.push({ date: d, messages: [msg] })
    }
  })

  const name = getChatName()
  const subtitle = getChatSubtitle()

  return (
    <div className="flex flex-col h-full bg-surface-950">
      {/* Header */}
      <div className="glass border-b border-surface-800/50 px-3 py-2.5 safe-top">
        <div className="flex items-center gap-2">
          {/* Back (mobile) */}
          <button onClick={onBack} className="btn-ghost p-2 -ml-1 lg:hidden">
            <ArrowLeft size={20} />
          </button>

          {/* Avatar + info */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="flex items-center gap-2.5 flex-1 min-w-0 hover:opacity-80 transition-opacity"
          >
            {chat.avatarEmoji ? (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: getContactColor() }}
              >
                {chat.avatarEmoji}
              </div>
            ) : (
              <Avatar
                name={name}
                color={getContactColor()}
                size="sm"
                online={chat.type === 'direct' ? isOnline() : undefined}
              />
            )}
            <div className="min-w-0">
              <p className="font-semibold text-white text-sm truncate">{name}</p>
              <p className={clsx(
                'text-xs truncate',
                subtitle === 'в сети' ? 'text-primary-400' : 'text-surface-400'
              )}>
                {subtitle}
              </p>
            </div>
          </button>

          {/* Actions */}
          <div className="flex items-center gap-0.5">
            {!isReadOnly && !isSaved && (
              <>
                <button className="btn-ghost p-2"><Phone size={18} /></button>
                <button className="btn-ghost p-2"><Video size={18} /></button>
              </>
            )}
            <button className="btn-ghost p-2"><MoreVertical size={18} /></button>
          </div>
        </div>

        {/* Network indicator */}
        <div className="flex items-center gap-2 mt-1.5 px-1">
          <NetworkBadge mode={networkMode} />
          {isReadOnly && (
            <span className="flex items-center gap-1 text-[10px] text-surface-500">
              <Lock size={9} /> Только чтение
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {grouped.map(group => (
          <div key={group.date}>
            {/* Date separator */}
            <div className="flex items-center justify-center my-4">
              <span className="glass-light text-surface-400 text-xs px-3 py-1 rounded-full">
                {group.date}
              </span>
            </div>

            {group.messages.map((msg, i) => {
              const isMe = msg.senderId === 'me' || msg.senderId === currentUser?.id
              const isSystem = msg.senderId === 'umbrella'
              const showAvatar = !isMe && i === 0 ||
                (!isMe && group.messages[i - 1]?.senderId !== msg.senderId)

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className={clsx(
                    'flex items-end gap-2 mb-1',
                    isMe ? 'justify-end' : 'justify-start',
                    isSystem && 'justify-center'
                  )}
                >
                  {/* System message */}
                  {isSystem ? (
                    <div className="glass rounded-2xl px-4 py-3 max-w-[85%] text-center">
                      <p className="text-surface-200 text-sm whitespace-pre-line leading-relaxed">
                        {msg.text}
                      </p>
                      <p className="text-surface-500 text-[10px] mt-1.5">
                        {formatTime(new Date(msg.timestamp))}
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Incoming avatar */}
                      {!isMe && (
                        <div className="w-7 flex-shrink-0">
                          {showAvatar && (
                            <Avatar
                              name={contacts.find(c => c.id === msg.senderId)?.name ?? '?'}
                              color={contacts.find(c => c.id === msg.senderId)?.avatarColor ?? '#555'}
                              size="xs"
                            />
                          )}
                        </div>
                      )}

                      {/* Bubble */}
                      <div className={clsx(
                        'group relative',
                        isMe ? 'message-out' : 'message-in'
                      )}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {msg.text}
                        </p>
                        <div className={clsx(
                          'flex items-center gap-1 mt-1',
                          isMe ? 'justify-end' : 'justify-start'
                        )}>
                          <span className={clsx(
                            'text-[10px]',
                            isMe ? 'text-white/50' : 'text-surface-500'
                          )}>
                            {formatTime(new Date(msg.timestamp))}
                          </span>
                          {isMe && <MessageStatus status={msg.status} />}
                          {msg.networkMode !== 'internet' && (
                            <NetworkBadge mode={msg.networkMode} className="scale-75 origin-right" />
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              )
            })}
          </div>
        ))}

        {chatMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-16 text-center">
            <div className="text-5xl mb-4">
              {isSaved ? '🔖' : chat.avatarEmoji ?? '💬'}
            </div>
            <p className="text-surface-300 font-medium">
              {isSaved ? 'Ваши заметки' : `Начните общение с ${name}`}
            </p>
            <p className="text-surface-500 text-sm mt-1">
              {isSaved
                ? 'Сохраняйте сообщения и заметки'
                : 'Напишите первое сообщение'}
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      {isReadOnly ? (
        <div className="glass border-t border-surface-800/50 px-4 py-3 safe-bottom">
          <div className="flex items-center justify-center gap-2 text-surface-500 text-sm">
            <Lock size={14} />
            <span>Это канал — писать сюда нельзя</span>
          </div>
        </div>
      ) : (
        <div className="glass border-t border-surface-800/50 px-3 py-2.5 safe-bottom">
          <div className="flex items-end gap-2">
            <button className="btn-ghost p-2 flex-shrink-0 mb-0.5">
              <Paperclip size={20} />
            </button>

            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isSaved ? 'Заметка...' : 'Сообщение...'}
                rows={1}
                className="input-field resize-none py-2.5 pr-10 max-h-32 overflow-y-auto"
                style={{ lineHeight: '1.5' }}
              />
              <button className="absolute right-3 bottom-2.5 text-surface-400 hover:text-surface-200 transition-colors">
                <Smile size={18} />
              </button>
            </div>

            <AnimatePresence mode="wait">
              {text.trim() ? (
                <motion.button
                  key="send"
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.7, opacity: 0 }}
                  transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
                  onClick={handleSend}
                  className="w-10 h-10 bg-primary-500 hover:bg-primary-400 rounded-full flex items-center justify-center flex-shrink-0 shadow-glow transition-colors mb-0.5"
                >
                  <Send size={18} className="text-white ml-0.5" />
                </motion.button>
              ) : (
                <motion.button
                  key="mic"
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.7, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="w-10 h-10 bg-surface-800 hover:bg-surface-700 rounded-full flex items-center justify-center flex-shrink-0 transition-colors mb-0.5"
                >
                  <Mic size={18} className="text-surface-300" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  )
}
