export type NetworkMode = 'internet' | 'wifi-direct' | 'bluetooth' | 'offline'

export interface User {
  id: string
  phone: string
  name: string
  username?: string          // @username
  avatar?: string
  avatarColor: string
  status: 'online' | 'offline' | 'away'
  lastSeen?: Date
  bio?: string
  isAdmin?: boolean
}

export interface Message {
  id: string
  chatId: string
  senderId: string
  text?: string
  type?: 'text' | 'video-note' | 'image' | 'call'
  videoNote?: string         // base64 или URL
  imageUrl?: string
  callData?: { duration: number; missed: boolean; video: boolean }
  timestamp: Date
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
  networkMode: NetworkMode
  replyTo?: string
  edited?: boolean
}

export type ChatType = 'direct' | 'group' | 'channel' | 'saved'

export interface AdminRights {
  canPost: boolean
  canEditInfo: boolean
  canAddMembers: boolean
  canDeleteMessages: boolean
  canBanUsers: boolean
  canAddAdmins: boolean
}

export interface ChatMember {
  userId: string
  role: 'owner' | 'admin' | 'member'
  rights?: AdminRights
  joinedAt: Date
}

export interface Chat {
  id: string
  type: ChatType
  name?: string
  description?: string
  participants: string[]
  members?: ChatMember[]
  ownerId?: string           // создатель канала/группы
  lastMessage?: Message
  unreadCount: number
  isPinned?: boolean
  isMuted?: boolean
  isReadOnly?: boolean
  isSystem?: boolean
  isPublic?: boolean
  inviteLink?: string        // ссылка-приглашение (для приватных — только у админов)
  avatar?: string
  avatarColor?: string
  avatarEmoji?: string
  archived?: boolean
}

export interface AuthState {
  step: 'phone' | 'otp' | 'profile' | 'done'
  phone: string
  countryCode: string
  otp: string
  otpSentAt?: Date
  user?: User
}

export interface CallState {
  active: boolean
  chatId: string | null
  type: 'audio' | 'video'
  status: 'calling' | 'connected' | 'ended'
  startedAt?: Date
}
