import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, AtSign, Phone, UserPlus } from 'lucide-react'
import { useChatStore } from '../../store/chatStore'
import { useAuthStore } from '../../store/authStore'
import { Avatar } from '../ui/Avatar'
import { UserProfile } from '../profile/UserProfile'
import type { User } from '../../types'

interface Props {
  onClose: () => void
  onOpenChat: (chatId: string) => void
}

export const NewChatModal: React.FC<Props> = ({ onClose, onOpenChat }) => {
  const { contacts, createDirectChat } = useChatStore()
  const { currentUser } = useAuthStore()
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const filtered = contacts.filter(c => {
    if (!search) return true
    const q = search.toLowerCase().replace('@', '')
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(search) ||
      (c.username?.toLowerCase().includes(q))
    )
  })

  const handleSelect = (contact: User) => {
    const chatId = createDirectChat(contact.id, currentUser?.id ?? 'me')
    onOpenChat(chatId)
    onClose()
  }

  return (
    <>
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
            className="w-full max-w-sm rounded-3xl overflow-hidden"
            style={{
              background: 'rgba(12,18,32,0.95)',
              backdropFilter: 'blur(40px) saturate(2)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="font-semibold text-white">Новый чат</h3>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.08)' }}
              >
                <X size={14} className="text-white/60" />
              </button>
            </div>

            {/* Search */}
            <div className="px-4 py-3">
              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Имя, @username или номер"
                  className="input-field pl-9 py-2.5 text-sm"
                  autoFocus
                />
              </div>
              {search.startsWith('@') && (
                <p className="text-white/30 text-xs mt-1.5 px-1 flex items-center gap-1">
                  <AtSign size={10} /> Поиск по username
                </p>
              )}
            </div>

            {/* Results */}
            <div className="max-h-72 overflow-y-auto pb-3">
              {filtered.length > 0 ? filtered.map(contact => (
                <div key={contact.id} className="flex items-center gap-3 px-4 py-2.5 group">
                  <button
                    onClick={() => setSelectedUser(contact)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                  >
                    <Avatar name={contact.name} color={contact.avatarColor} size="sm" online={contact.status === 'online'} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{contact.name}</p>
                      <p className="text-white/30 text-xs truncate">
                        {contact.username ? `@${contact.username}` : contact.phone}
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleSelect(contact)}
                    className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all opacity-0 group-hover:opacity-100"
                    style={{
                      background: 'rgba(124,58,237,0.2)',
                      border: '1px solid rgba(124,58,237,0.3)',
                      color: '#a78bfa',
                    }}
                  >
                    Написать
                  </button>
                </div>
              )) : (
                <div className="flex flex-col items-center py-10 text-center px-6">
                  <UserPlus size={28} className="text-white/20 mb-3" />
                  <p className="text-white/30 text-sm">Не найдено</p>
                  <p className="text-white/20 text-xs mt-1">Попробуйте @username или номер телефона</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* User profile modal */}
      {selectedUser && (
        <UserProfile
          user={selectedUser}
          chatId={`chat-${selectedUser.id}`}
          onClose={() => setSelectedUser(null)}
          onMessage={() => handleSelect(selectedUser)}
        />
      )}
    </>
  )
}
