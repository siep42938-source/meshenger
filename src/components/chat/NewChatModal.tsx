import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, UserPlus, Loader } from 'lucide-react'
import { useChatStore } from '../../store/chatStore'
import { useAuthStore } from '../../store/authStore'
import { Avatar } from '../ui/Avatar'
import { UserProfile } from '../profile/UserProfile'
import type { User } from '../../types'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

interface Props {
  onClose: () => void
  onOpenChat: (chatId: string) => void
}

export const NewChatModal: React.FC<Props> = ({ onClose, onOpenChat }) => {
  const { contacts, createDirectChat, addContact } = useChatStore()
  const { currentUser } = useAuthStore()
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Поиск через сервер
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!search || search.trim().length < 2) {
      // Показываем локальные контакты если нет поиска
      setResults(contacts)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem('Umberla-session-token')
        const res = await fetch(`${API}/users/search?q=${encodeURIComponent(search)}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        const data = await res.json()
        setResults(data.users || [])
      } catch {
        // Fallback на локальные контакты
        const q = search.toLowerCase().replace('@', '')
        setResults(contacts.filter(c =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(search) ||
          c.username?.toLowerCase().includes(q)
        ))
      } finally {
        setLoading(false)
      }
    }, 400)
  }, [search, contacts])

  // При открытии показываем контакты
  useEffect(() => {
    setResults(contacts)
  }, [])

  const handleSelect = (contact: User) => {
    // Добавляем в локальные контакты если ещё нет
    const exists = contacts.find(c => c.id === contact.id)
    if (!exists) addContact(contact)

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
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', padding: '0' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            className="w-full sm:max-w-sm sm:rounded-3xl rounded-t-3xl overflow-hidden"
            style={{
              background: 'rgba(12,18,32,0.98)',
              backdropFilter: 'blur(40px) saturate(2)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 -8px 40px rgba(0,0,0,0.5)',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Handle bar (mobile) */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="font-semibold text-white text-base">Новый чат</h3>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.08)' }}
              >
                <X size={14} className="text-white/60" />
              </button>
            </div>

            {/* Search */}
            <div className="px-4 py-3 flex-shrink-0">
              <div className="relative">
                {loading
                  ? <Loader size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 animate-spin" />
                  : <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                }
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Имя, @username или номер телефона"
                  className="input-field pl-9 py-2.5 text-sm w-full"
                  autoFocus
                />
              </div>
              <p className="text-white/25 text-xs mt-1.5 px-1">
                Введите минимум 2 символа для поиска
              </p>
            </div>

            {/* Results */}
            <div className="overflow-y-auto pb-4 flex-1">
              {results.length > 0 ? results.map(contact => (
                <div key={contact.id} className="flex items-center gap-3 px-4 py-3">
                  <button
                    onClick={() => setSelectedUser(contact)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                  >
                    <Avatar name={contact.name} color={contact.avatarColor || '#7c3aed'} size="sm" online={contact.status === 'online'} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{contact.name}</p>
                      <p className="text-white/30 text-xs truncate">
                        {contact.username ? `@${contact.username}` : contact.phone}
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleSelect(contact)}
                    className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
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
                  <p className="text-white/30 text-sm">
                    {search.length >= 2 ? 'Пользователь не найден' : 'Нет контактов'}
                  </p>
                  <p className="text-white/20 text-xs mt-1">
                    {search.length >= 2
                      ? 'Попробуйте другое имя или номер'
                      : 'Введите имя или номер для поиска'}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

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
