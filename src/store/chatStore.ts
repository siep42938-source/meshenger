import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Chat, Message, User, NetworkMode } from '../types'

interface ChatStore {
  chats: Chat[]
  messages: Record<string, Message[]>
  contacts: User[]
  activeChatId: string | null
  networkMode: NetworkMode
  showArchive: boolean
  setNetworkMode: (mode: NetworkMode) => void
  setActiveChat: (id: string | null) => void
  sendMessage: (chatId: string, text: string, senderId: string) => void
  markRead: (chatId: string) => void
  addContact: (user: User) => void
  createDirectChat: (contactId: string, currentUserId: string) => string
  createGroup: (name: string, memberIds: string[], currentUserId: string, color: string) => string
  createChannel: (name: string, description: string, isPublic: boolean, currentUserId: string, color: string) => string
  addChannelAdmin: (chatId: string, userId: string, rights: import('../types').AdminRights) => void
  removeChannelAdmin: (chatId: string, userId: string) => void
  generateInviteLink: (chatId: string) => string
  canPostInChannel: (chatId: string, userId: string) => boolean
  initSystemChats: (userId: string) => void
  togglePin: (chatId: string) => void
  toggleMute: (chatId: string) => void
  toggleArchive: (chatId: string) => void
  deleteChat: (chatId: string) => void
  clearHistory: (chatId: string) => void
  setShowArchive: (v: boolean) => void
}

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

const AVATAR_COLORS = [
  '#1a5cff', '#7c3aed', '#db2777', '#059669',
  '#d97706', '#dc2626', '#0891b2', '#65a30d'
]

// ─── Demo contacts ────────────────────────────────────────────────────────────
const demoContacts: User[] = []

// ─── Umbrella Support messages ────────────────────────────────────────────────
const umbrellaMessages: Message[] = [
  {
    id: 'sys-1',
    chatId: 'umbrella-support',
    senderId: 'umbrella',
    text: '👋 Добро пожаловать в Umberla!\n\nЭто официальный канал поддержки. Здесь вы будете получать важные новости, обновления и советы по использованию приложения.',
    timestamp: new Date(Date.now() - 86400000 * 2),
    status: 'read',
    networkMode: 'internet',
  },
  {
    id: 'sys-2',
    chatId: 'umbrella-support',
    senderId: 'umbrella',
    text: '📡 Umberla работает без интернета!\n\nПриложение автоматически переключается между режимами:\n• 🌐 Интернет — обычная доставка\n• 📶 Wi-Fi Direct — без роутера, до 200м\n• 🔵 Bluetooth — до 100м\n• 📦 Офлайн — сообщения в очереди',
    timestamp: new Date(Date.now() - 86400000),
    status: 'read',
    networkMode: 'internet',
  },
  {
    id: 'sys-3',
    chatId: 'umbrella-support',
    senderId: 'umbrella',
    text: '🔐 Верификация по SMS\n\nВаш аккаунт привязан к номеру телефона. При входе с нового устройства вам придёт SMS с кодом подтверждения — это защищает ваш аккаунт.',
    timestamp: new Date(Date.now() - 3600000 * 3),
    status: 'read',
    networkMode: 'internet',
  },
  {
    id: 'sys-4',
    chatId: 'umbrella-support',
    senderId: 'umbrella',
    text: '✨ Версия 1.0.0 — первый релиз!\n\nМы рады представить Umberla. Поделитесь приложением с друзьями — просто скиньте ссылку, и оно сразу заработает без лишних настроек.',
    timestamp: new Date(Date.now() - 60000 * 5),
    status: 'delivered',
    networkMode: 'internet',
  },
]

// ─── Demo chat messages ───────────────────────────────────────────────────────
const demoMessages: Record<string, Message[]> = {
  'umbrella-support': umbrellaMessages,
  'saved-messages': [
    {
      id: 'saved-1',
      chatId: 'saved-messages',
      senderId: 'me',
      text: '📌 Это ваши сохранённые сообщения. Используйте как заметки или закладки.',
      timestamp: new Date(Date.now() - 86400000),
      status: 'read',
      networkMode: 'internet',
    },
  ],
}

// ─── System / pinned chats ────────────────────────────────────────────────────
const systemChats: Chat[] = [
  {
    id: 'umbrella-support',
    type: 'channel',
    name: 'Umbrella Support',
    participants: ['umbrella'],
    lastMessage: umbrellaMessages[umbrellaMessages.length - 1],
    unreadCount: 1,
    isPinned: true,
    isReadOnly: true,
    isSystem: true,
    avatarColor: '#1a5cff',
    avatarEmoji: '☂️',
  } as Chat,
  {
    id: 'saved-messages',
    type: 'saved',
    name: 'Избранное',
    participants: ['me'],
    lastMessage: demoMessages['saved-messages'][0],
    unreadCount: 0,
    isPinned: true,
    avatarColor: '#059669',
    avatarEmoji: '🔖',
  } as Chat,
]

const demoChats: Chat[] = []

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      chats: [...systemChats, ...demoChats],
      messages: demoMessages,
      contacts: demoContacts,
      activeChatId: null,
      networkMode: 'internet',

      setNetworkMode: (mode) => set({ networkMode: mode }),

      setActiveChat: (id) => {
        set({ activeChatId: id })
        if (id) get().markRead(id)
      },

      // Called after login to ensure system chats exist
      initSystemChats: (_userId) => {
        set(s => {
          const ids = s.chats.map(c => c.id)
          const missing = systemChats.filter(sc => !ids.includes(sc.id))
          if (missing.length === 0) return s
          return {
            chats: [...missing, ...s.chats],
            messages: {
              ...s.messages,
              ...Object.fromEntries(
                missing
                  .filter(sc => !s.messages[sc.id])
                  .map(sc => [sc.id, demoMessages[sc.id] ?? []])
              ),
            },
          }
        })
      },

      sendMessage: (chatId, text, senderId) => {
        const { networkMode } = get()
        const msg: Message = {
          id: generateId(),
          chatId,
          senderId,
          text,
          timestamp: new Date(),
          status: 'sending',
          networkMode,
        }
        set(s => ({
          messages: {
            ...s.messages,
            [chatId]: [...(s.messages[chatId] || []), msg],
          },
          chats: s.chats.map(c =>
            c.id === chatId ? { ...c, lastMessage: msg } : c
          ),
        }))
        // Simulate delivery
        setTimeout(() => {
          set(s => ({
            messages: {
              ...s.messages,
              [chatId]: (s.messages[chatId] || []).map(m =>
                m.id === msg.id ? { ...m, status: 'delivered' } : m
              ),
            },
          }))
        }, 800)
        // Demo auto-reply for regular chats
        if (chatId.startsWith('chat-u')) {
          setTimeout(() => {
            const replies = ['Понял, принял 👍', 'Отлично!', 'Ок, спасибо!', 'Хорошо 👌', '🔥']
            const reply: Message = {
              id: generateId(),
              chatId,
              senderId: chatId.replace('chat-', ''),
              text: replies[Math.floor(Math.random() * replies.length)],
              timestamp: new Date(),
              status: 'delivered',
              networkMode,
            }
            set(s => ({
              messages: {
                ...s.messages,
                [chatId]: [...(s.messages[chatId] || []), reply],
              },
              chats: s.chats.map(c =>
                c.id === chatId
                  ? { ...c, lastMessage: reply, unreadCount: s.activeChatId === chatId ? 0 : c.unreadCount + 1 }
                  : c
              ),
            }))
          }, 1500 + Math.random() * 1000)
        }
      },

      markRead: (chatId) =>
        set(s => ({
          chats: s.chats.map(c => c.id === chatId ? { ...c, unreadCount: 0 } : c),
        })),

      addContact: (user) =>
        set(s => ({ contacts: [...s.contacts, user] })),

      createDirectChat: (contactId, currentUserId) => {
        const existing = get().chats.find(
          c => c.type === 'direct' &&
               c.participants.includes(contactId) &&
               c.participants.includes(currentUserId)
        )
        if (existing) return existing.id
        const contact = get().contacts.find(c => c.id === contactId)
        const chatId = `chat-${contactId}`
        const chat: Chat = {
          id: chatId, type: 'direct',
          participants: [currentUserId, contactId],
          unreadCount: 0,
          avatarColor: contact?.avatarColor || AVATAR_COLORS[0],
        }
        set(s => ({ chats: [chat, ...s.chats] }))
        return chatId
      },

      createGroup: (name, memberIds, currentUserId, color) => {
        const chatId = `group-${generateId()}`
        const welcomeMsg: Message = {
          id: generateId(), chatId,
          senderId: 'system',
          text: `Группа "${name}" создана`,
          timestamp: new Date(), status: 'delivered', networkMode: 'internet',
        }
        const chat: Chat = {
          id: chatId, type: 'group', name,
          participants: [currentUserId, ...memberIds],
          unreadCount: 0, avatarColor: color,
          lastMessage: welcomeMsg,
        }
        set(s => ({
          chats: [chat, ...s.chats],
          messages: { ...s.messages, [chatId]: [welcomeMsg] },
        }))
        return chatId
      },

      createChannel: (name, description, isPublic, currentUserId, color) => {
        const chatId = `channel-${generateId()}`
        const welcomeMsg: Message = {
          id: generateId(), chatId,
          senderId: 'system',
          text: `Канал "${name}" создан${description ? `\n\n${description}` : ''}`,
          timestamp: new Date(), status: 'delivered', networkMode: 'internet',
        }
        const chat: Chat = {
          id: chatId, type: 'channel', name,
          participants: [currentUserId],
          unreadCount: 0, avatarColor: color,
          isReadOnly: false, // владелец может писать
          lastMessage: welcomeMsg,
        }
        set(s => ({
          chats: [chat, ...s.chats],
          messages: { ...s.messages, [chatId]: [welcomeMsg] },
        }))
        return chatId
      },

      showArchive: false,
      setShowArchive: (v) => set({ showArchive: v }),

      togglePin: (chatId) =>
        set(s => ({ chats: s.chats.map(c => c.id === chatId ? { ...c, isPinned: !c.isPinned } : c) })),

      toggleMute: (chatId) =>
        set(s => ({ chats: s.chats.map(c => c.id === chatId ? { ...c, isMuted: !c.isMuted } : c) })),

      toggleArchive: (chatId) =>
        set(s => ({ chats: s.chats.map(c => c.id === chatId ? { ...c, archived: !(c as any).archived } : c) })),

      deleteChat: (chatId) =>
        set(s => ({
          chats: s.chats.filter(c => c.id !== chatId),
          messages: Object.fromEntries(Object.entries(s.messages).filter(([k]) => k !== chatId)),
          activeChatId: s.activeChatId === chatId ? null : s.activeChatId,
        })),

      clearHistory: (chatId) =>
        set(s => ({ messages: { ...s.messages, [chatId]: [] } })),

      addChannelAdmin: (chatId, userId, rights) =>
        set(s => ({
          chats: s.chats.map(c => {
            if (c.id !== chatId) return c
            const members = c.members || []
            const existing = members.find(m => m.userId === userId)
            if (existing) {
              return { ...c, members: members.map(m => m.userId === userId ? { ...m, role: 'admin' as const, rights } : m) }
            }
            return { ...c, members: [...members, { userId, role: 'admin' as const, rights, joinedAt: new Date() }] }
          }),
        })),

      removeChannelAdmin: (chatId, userId) =>
        set(s => ({
          chats: s.chats.map(c =>
            c.id === chatId
              ? { ...c, members: (c.members || []).map(m => m.userId === userId ? { ...m, role: 'member' as const, rights: undefined } : m) }
              : c
          ),
        })),

      generateInviteLink: (chatId) => {
        const link = `https://umberla.app/join/${chatId}-${Math.random().toString(36).slice(2)}`
        set(s => ({
          chats: s.chats.map(c => c.id === chatId ? { ...c, inviteLink: link } : c),
        }))
        return link
      },

      canPostInChannel: (chatId, userId) => {
        const state = get()
        const chat = state.chats.find(c => c.id === chatId)
        if (!chat) return false
        if (chat.type !== 'channel') return true
        if (chat.ownerId === userId) return true
        const member = (chat.members || []).find(m => m.userId === userId)
        if (!member) return false
        if (member.role === 'admin' || member.role === 'owner') return member.rights?.canPost ?? true
        return false
      },
    }),
    {
      name: 'Umberla-chats',
      partialize: (s) => ({ contacts: s.contacts, chats: s.chats, messages: s.messages }),
    }
  )
)
