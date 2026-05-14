import React, { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChatList } from '../chat/ChatList'
import { ChatWindow } from '../chat/ChatWindow'
import { NewChatModal } from '../chat/NewChatModal'
import { CreateGroupModal } from '../chat/CreateGroupModal'
import { CreateChannelModal } from '../chat/CreateChannelModal'
import { SettingsPage } from '../settings/SettingsPage'
import { UserProfile } from '../profile/UserProfile'
import { AdminPanel } from '../admin/AdminPanel'
import { SideMenu } from './SideMenu'
import { useChatStore } from '../../store/chatStore'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import { networkService } from '../../services/networkService'
import { socketService } from '../../services/socketService'

export type GlobalModal = 'settings' | 'profile' | 'createGroup' | 'createChannel' | 'admin' | null

export const MainLayout: React.FC = () => {
  const { activeChatId, setActiveChat, setNetworkMode, initSystemChats } = useChatStore()
  const { currentUser } = useAuthStore()
  const { applyTheme } = useThemeStore()
  const [showMenu, setShowMenu]       = useState(false)
  const [showNewChat, setShowNewChat] = useState(false)
  const [modal, setModal]             = useState<GlobalModal>(null)

  useEffect(() => { applyTheme() }, [])
  useEffect(() => {
    if (currentUser) initSystemChats(currentUser.id)
  }, [currentUser?.id])
  useEffect(() => {
    const unsub = networkService.onModeChange(m => setNetworkMode(m))
    networkService.detectAndConnect().then(m => setNetworkMode(m))
    return unsub
  }, [])

  // Подключаем WebSocket при входе
  useEffect(() => {
    const token = localStorage.getItem('Umberla-session-token')
    if (!token || !currentUser) return

    socketService.connect(token)

    // Слушаем входящие сообщения
    socketService.onMessage((data) => {
      const { chatId, userId, message, timestamp } = data
      if (userId === currentUser.id) return // своё сообщение уже добавлено локально
      // Добавляем сообщение в чат
      useChatStore.getState().receiveMessage(chatId, userId, message, timestamp)
    })

    // Онлайн статус
    socketService.onUserOnline(({ userId }) => {
      useChatStore.getState().setContactOnline(userId, true)
    })
    socketService.onUserOffline(({ userId }) => {
      useChatStore.getState().setContactOnline(userId, false)
    })

    // Ping каждые 25 секунд чтобы Render не засыпал
    const pingInterval = setInterval(() => {
      fetch(`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'}/api/health`)
        .catch(() => {})
    }, 25000)

    return () => {
      clearInterval(pingInterval)
      socketService.disconnect()
    }
  }, [currentUser?.id])

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024
  const closeModal = () => setModal(null)

  return (
    <div className="flex h-full w-full overflow-hidden" style={{ background: 'var(--color-bg)' }}>

      {/* Sidebar */}
      <div className={`${activeChatId && isMobile ? 'hidden' : 'flex'} lg:flex flex-col w-full lg:w-80 xl:w-96 flex-shrink-0 relative overflow-hidden sidebar-bg`}>
        <ChatList
          onOpenMenu={() => setShowMenu(true)}
          onNewChat={() => setShowNewChat(true)}
        />
      </div>

      {/* Main area */}
      <div className={`${!activeChatId && isMobile ? 'hidden' : 'flex'} lg:flex flex-col flex-1 min-w-0 relative chat-bg`}>
        <AnimatePresence mode="wait">
          {activeChatId ? (
            <motion.div key={activeChatId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }} className="absolute inset-0">
              <ChatWindow chatId={activeChatId} onBack={() => setActiveChat(null)} />
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full text-center px-8">
              <div
                className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 0 40px rgba(124,58,237,0.4), 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)' }}
              >
                <span className="text-5xl">☂️</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Umberla</h2>
              <p className="text-sm max-w-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Выберите чат или начните новый разговор
              </p>
              <div className="flex gap-2 mt-5 flex-wrap justify-center">
                {(['internet','bluetooth','wifi-direct'] as const).map(m => (
                  <span key={m} className={`net-badge ${m}`}>
                    {m === 'internet' ? '🌐 Интернет' : m === 'bluetooth' ? '🔵 Bluetooth' : '📶 Wi-Fi Direct'}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Side menu — передаём setModal чтобы открывать модалы снаружи */}
      <AnimatePresence>
        {showMenu && (
          <SideMenu
            onClose={() => setShowMenu(false)}
            onOpenChat={(id) => { setActiveChat(id); setShowMenu(false) }}
            onOpenModal={(m) => { setModal(m); setShowMenu(false) }}
          />
        )}
      </AnimatePresence>

      {/* New chat */}
      <AnimatePresence>
        {showNewChat && (
          <NewChatModal
            onClose={() => setShowNewChat(false)}
            onOpenChat={(id) => { setActiveChat(id); setShowNewChat(false) }}
          />
        )}
      </AnimatePresence>

      {/* ── Global modals — z-index 60, поверх всего ── */}
      <AnimatePresence>
        {modal === 'settings' && <SettingsPage onClose={closeModal} />}
      </AnimatePresence>

      <AnimatePresence>
        {modal === 'profile' && currentUser && (
          <UserProfile user={currentUser} onClose={closeModal} isOwnProfile={true} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modal === 'createGroup' && (
          <CreateGroupModal
            onClose={closeModal}
            onCreated={(id) => { setActiveChat(id); closeModal() }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modal === 'createChannel' && (
          <CreateChannelModal
            onClose={closeModal}
            onCreated={(id) => { setActiveChat(id); closeModal() }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modal === 'admin' && <AdminPanel onClose={closeModal} />}
      </AnimatePresence>
    </div>
  )
}
