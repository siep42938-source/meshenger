import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Users, MessageSquare, Shield, Trash2,
  Ban, ChevronRight, ArrowLeft, Activity,
  Hash, Radio, UserCheck, AlertTriangle,
} from 'lucide-react'
import { useChatStore } from '../../store/chatStore'
import { useAuthStore } from '../../store/authStore'
import { Avatar } from '../ui/Avatar'
import { formatPhone } from '../../utils/format'
import type { Chat, User } from '../../types'

type AdminPage = 'dashboard' | 'users' | 'chats' | 'user-detail' | 'chat-detail'

interface Props {
  onClose: () => void
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-4">
    <p className="text-purple-400 text-xs font-semibold uppercase tracking-widest px-1 mb-2">{title}</p>
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
      {children}
    </div>
  </div>
)

const StatCard: React.FC<{ icon: React.FC<any>; label: string; value: string | number; color: string }> = ({ icon: Icon, label, value, color }) => (
  <div
    className="flex-1 rounded-2xl p-3 flex flex-col gap-1"
    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
  >
    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
      <Icon size={15} style={{ color }} />
    </div>
    <p className="text-white font-bold text-lg leading-none mt-1">{value}</p>
    <p className="text-white/40 text-xs">{label}</p>
  </div>
)

export const AdminPanel: React.FC<Props> = ({ onClose }) => {
  const { chats, contacts, deleteChat, clearHistory } = useChatStore()
  const { currentUser } = useAuthStore()
  const [page, setPage] = useState<AdminPage>('dashboard')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [bannedUsers, setBannedUsers] = useState<Set<string>>(new Set())

  const totalMessages = Object.values(useChatStore.getState().messages).reduce((s, m) => s + m.length, 0)
  const onlineUsers = contacts.filter(u => u.status === 'online').length
  const groupChats = chats.filter(c => c.type === 'group').length
  const channels = chats.filter(c => c.type === 'channel').length

  const toggleBan = (userId: string) => {
    setBannedUsers(prev => {
      const next = new Set(prev)
      next.has(userId) ? next.delete(userId) : next.add(userId)
      return next
    })
  }

  const pageTitle: Record<AdminPage, string> = {
    dashboard: 'Панель администратора',
    users: 'Пользователи',
    chats: 'Чаты и каналы',
    'user-detail': selectedUser?.name ?? 'Пользователь',
    'chat-detail': selectedChat?.name ?? 'Чат',
  }

  const canGoBack = page !== 'dashboard'
  const goBack = () => {
    if (page === 'user-detail') setPage('users')
    else if (page === 'chat-detail') setPage('chats')
    else setPage('dashboard')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(10px)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 28, scale: 0.96 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md max-h-[88vh] flex flex-col rounded-3xl overflow-hidden"
        style={{
          background: 'rgba(8,12,22,0.97)',
          backdropFilter: 'blur(48px) saturate(2)',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(124,58,237,0.15)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 py-4 flex-shrink-0"
          style={{
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, transparent 60%)',
          }}
        >
          {canGoBack ? (
            <motion.button whileTap={{ scale: 0.9 }} onClick={goBack}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.07)' }}>
              <ArrowLeft size={15} className="text-white/70" />
            </motion.button>
          ) : (
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 0 12px rgba(124,58,237,0.5)' }}
            >
              <Shield size={15} className="text-white" />
            </div>
          )}
          <h3 className="flex-1 text-center font-bold text-white text-base">{pageTitle[page]}</h3>
          <motion.button whileTap={{ scale: 0.9 }} onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.07)' }}>
            <X size={14} className="text-white/60" />
          </motion.button>
        </div>

        {/* Admin badge */}
        {page === 'dashboard' && (
          <div className="mx-4 mt-3 px-3 py-2 rounded-xl flex items-center gap-2"
            style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)' }}>
            <Shield size={13} className="text-purple-400 flex-shrink-0" />
            <p className="text-purple-300 text-xs font-medium">
              Вы вошли как администратор · {formatPhone(currentUser?.phone ?? '')}
            </p>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <AnimatePresence mode="wait">

            {/* ── Dashboard ── */}
            {page === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}>
                {/* Stats */}
                <div className="flex gap-2 mb-4">
                  <StatCard icon={Users}         label="Контактов"  value={contacts.length} color="#7c3aed" />
                  <StatCard icon={Activity}      label="Онлайн"     value={onlineUsers}     color="#4ade80" />
                  <StatCard icon={MessageSquare} label="Сообщений"  value={totalMessages}   color="#60a5fa" />
                </div>
                <div className="flex gap-2 mb-4">
                  <StatCard icon={Hash}  label="Групп"   value={groupChats} color="#f59e0b" />
                  <StatCard icon={Radio} label="Каналов" value={channels}   color="#f472b6" />
                  <StatCard icon={MessageSquare} label="Всего чатов" value={chats.length} color="#34d399" />
                </div>

                <Section title="Управление">
                  <NavRow icon={Users}         label="Пользователи" badge={String(contacts.length)} onClick={() => setPage('users')} />
                  <NavRow icon={MessageSquare} label="Чаты и каналы" badge={String(chats.length)}   onClick={() => setPage('chats')} />
                </Section>

                <Section title="Система">
                  <div className="px-4 py-3 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" style={{ boxShadow: '0 0 6px #4ade80' }} />
                    <p className="text-white/60 text-sm">Сервер работает нормально</p>
                  </div>
                  <div className="px-4 py-3 flex items-center gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                    <p className="text-white/60 text-sm">Umberla v1.0.0</p>
                  </div>
                </Section>
              </motion.div>
            )}

            {/* ── Users ── */}
            {page === 'users' && (
              <motion.div key="users" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                <Section title={`Контакты (${contacts.length})`}>
                  {contacts.length === 0 && (
                    <p className="text-white/30 text-sm text-center py-6">Нет пользователей</p>
                  )}
                  {contacts.map((user, i) => (
                    <motion.button
                      key={user.id}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => { setSelectedUser(user); setPage('user-detail') }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                      style={{ borderBottom: i < contacts.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div className="relative flex-shrink-0">
                        <Avatar name={user.name} color={user.avatarColor} size="sm" />
                        {bannedUsers.has(user.id) && (
                          <div className="absolute inset-0 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.7)' }}>
                            <Ban size={10} className="text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white/85 text-sm font-medium truncate">{user.name}</p>
                        <p className="text-white/35 text-xs">{formatPhone(user.phone)}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {bannedUsers.has(user.id) && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                            БАН
                          </span>
                        )}
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${user.status === 'online' ? 'bg-green-400' : user.status === 'away' ? 'bg-yellow-400' : 'bg-white/20'}`} />
                        <ChevronRight size={13} className="text-white/20" />
                      </div>
                    </motion.button>
                  ))}
                </Section>
              </motion.div>
            )}

            {/* ── User detail ── */}
            {page === 'user-detail' && selectedUser && (
              <motion.div key="user-detail" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                {/* Profile card */}
                <div className="rounded-2xl p-4 mb-4 flex items-center gap-3"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <Avatar name={selectedUser.name} color={selectedUser.avatarColor} size="lg" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold truncate">{selectedUser.name}</p>
                    <p className="text-white/40 text-xs">{formatPhone(selectedUser.phone)}</p>
                    {selectedUser.username && <p className="text-purple-400 text-xs">@{selectedUser.username}</p>}
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${selectedUser.status === 'online' ? 'bg-green-400' : selectedUser.status === 'away' ? 'bg-yellow-400' : 'bg-white/20'}`} />
                      <span className="text-white/35 text-xs capitalize">{selectedUser.status === 'online' ? 'Онлайн' : selectedUser.status === 'away' ? 'Отошёл' : 'Офлайн'}</span>
                    </div>
                  </div>
                </div>

                <Section title="Действия">
                  <ActionRow
                    icon={bannedUsers.has(selectedUser.id) ? UserCheck : Ban}
                    label={bannedUsers.has(selectedUser.id) ? 'Разбанить пользователя' : 'Заблокировать пользователя'}
                    color={bannedUsers.has(selectedUser.id) ? '#4ade80' : '#f87171'}
                    onClick={() => toggleBan(selectedUser.id)}
                  />
                </Section>

                <Section title="Информация">
                  <InfoRow label="ID" value={selectedUser.id} />
                  <InfoRow label="Телефон" value={formatPhone(selectedUser.phone)} />
                  <InfoRow label="Статус" value={selectedUser.status === 'online' ? 'Онлайн' : selectedUser.status === 'away' ? 'Отошёл' : 'Офлайн'} />
                  {selectedUser.username && <InfoRow label="Username" value={`@${selectedUser.username}`} />}
                </Section>

                {bannedUsers.has(selectedUser.id) && (
                  <div className="rounded-2xl px-4 py-3 flex items-center gap-2"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
                    <p className="text-red-400 text-xs">Пользователь заблокирован</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Chats ── */}
            {page === 'chats' && (
              <motion.div key="chats" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                <Section title={`Все чаты (${chats.length})`}>
                  {chats.map((chat, i) => {
                    const icon = chat.type === 'channel' ? Radio : chat.type === 'group' ? Users : chat.type === 'saved' ? Hash : MessageSquare
                    const Icon = icon
                    return (
                      <motion.button
                        key={chat.id}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => { setSelectedChat(chat); setPage('chat-detail') }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                        style={{ borderBottom: i < chats.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        {chat.avatarEmoji ? (
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
                            style={{ background: `linear-gradient(135deg, ${chat.avatarColor ?? '#7c3aed'}, rgba(0,0,0,0.3))`, border: '1px solid rgba(255,255,255,0.1)' }}>
                            {chat.avatarEmoji}
                          </div>
                        ) : (
                          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: `${chat.avatarColor ?? '#7c3aed'}33`, border: `1px solid ${chat.avatarColor ?? '#7c3aed'}44` }}>
                            <Icon size={15} style={{ color: chat.avatarColor ?? '#7c3aed' }} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-white/85 text-sm font-medium truncate">{chat.name ?? chat.type}</p>
                          <p className="text-white/35 text-xs capitalize">{chat.type} · {chat.participants.length} участн.</p>
                        </div>
                        <ChevronRight size={13} className="text-white/20 flex-shrink-0" />
                      </motion.button>
                    )
                  })}
                </Section>
              </motion.div>
            )}

            {/* ── Chat detail ── */}
            {page === 'chat-detail' && selectedChat && (
              <motion.div key="chat-detail" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                <div className="rounded-2xl p-4 mb-4"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <p className="text-white font-bold truncate">{selectedChat.name ?? selectedChat.type}</p>
                  <p className="text-white/40 text-xs mt-0.5 capitalize">{selectedChat.type} · {selectedChat.participants.length} участников</p>
                  {selectedChat.description && (
                    <p className="text-white/50 text-xs mt-2 leading-relaxed">{selectedChat.description}</p>
                  )}
                </div>

                <Section title="Действия">
                  <ActionRow
                    icon={Trash2}
                    label="Очистить историю"
                    color="#f59e0b"
                    onClick={() => { clearHistory(selectedChat.id); goBack() }}
                  />
                  {!selectedChat.isSystem && (
                    <ActionRow
                      icon={Trash2}
                      label="Удалить чат"
                      color="#f87171"
                      onClick={() => { deleteChat(selectedChat.id); goBack() }}
                    />
                  )}
                </Section>

                <Section title="Информация">
                  <InfoRow label="ID" value={selectedChat.id} />
                  <InfoRow label="Тип" value={selectedChat.type} />
                  <InfoRow label="Участников" value={String(selectedChat.participants.length)} />
                  <InfoRow label="Непрочитанных" value={String(selectedChat.unreadCount)} />
                  {selectedChat.isSystem && <InfoRow label="Системный" value="Да" />}
                  {selectedChat.isPinned && <InfoRow label="Закреплён" value="Да" />}
                </Section>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ── Sub-components ── */

const NavRow: React.FC<{ icon: React.FC<any>; label: string; badge?: string; onClick: () => void }> = ({ icon: Icon, label, badge, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors"
    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
  >
    <Icon size={16} className="text-white/50 flex-shrink-0" />
    <span className="flex-1 text-white/80 text-sm">{label}</span>
    {badge && (
      <span className="text-xs text-white/30 mr-1">{badge}</span>
    )}
    <ChevronRight size={14} className="text-white/20" />
  </button>
)

const ActionRow: React.FC<{ icon: React.FC<any>; label: string; color: string; onClick: () => void }> = ({ icon: Icon, label, color, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors"
    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
  >
    <Icon size={16} style={{ color }} className="flex-shrink-0" />
    <span className="text-sm" style={{ color }}>{label}</span>
  </button>
)

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
    <span className="text-white/40 text-sm">{label}</span>
    <span className="text-white/70 text-sm font-mono truncate max-w-[55%] text-right">{value}</span>
  </div>
)
