import { io, Socket } from 'socket.io-client'

const SERVER_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'

let socket: Socket | null = null
let messageCallback: ((data: any) => void) | null = null
let typingCallback: ((data: any) => void) | null = null
let onlineCallback: ((data: any) => void) | null = null
let offlineCallback: ((data: any) => void) | null = null

export const socketService = {
  connect: (token: string) => {
    if (socket?.connected) return socket

    socket = io(SERVER_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', () => {
      console.log('✅ WebSocket подключен')
    })

    socket.on('disconnect', () => {
      console.log('❌ WebSocket отключен')
    })

    socket.on('connect_error', (err) => {
      console.warn('WebSocket ошибка:', err.message)
    })

    socket.on('message:receive', (data) => {
      messageCallback?.(data)
    })

    socket.on('user:typing', (data) => {
      typingCallback?.(data)
    })

    socket.on('user:online', (data) => {
      onlineCallback?.(data)
    })

    socket.on('user:offline', (data) => {
      offlineCallback?.(data)
    })

    return socket
  },

  disconnect: () => {
    if (socket) {
      socket.disconnect()
      socket = null
    }
  },

  isConnected: () => socket?.connected ?? false,

  // Отправить сообщение
  sendMessage: (chatId: string, message: string, recipientId: string) => {
    socket?.emit('message:send', { chatId, message, recipientId })
  },

  // Присоединиться к чату
  joinChat: (chatId: string) => {
    socket?.emit('chat:join', chatId)
  },

  // Статус печати
  sendTyping: (chatId: string) => {
    socket?.emit('user:typing', { chatId })
  },

  // Колбэки
  onMessage: (cb: (data: any) => void) => { messageCallback = cb },
  onTyping: (cb: (data: any) => void) => { typingCallback = cb },
  onUserOnline: (cb: (data: any) => void) => { onlineCallback = cb },
  onUserOffline: (cb: (data: any) => void) => { offlineCallback = cb },

  // Звонки
  initiateCall: (recipientId: string, callData: any) => {
    socket?.emit('call:initiate', { recipientId, callData })
  },
  answerCall: (callerId: string) => {
    socket?.emit('call:answer', { callerId })
  },
  rejectCall: (callerId: string) => {
    socket?.emit('call:reject', { callerId })
  },
  onCall: (cb: (data: any) => void) => {
    socket?.on('call:incoming', cb)
  },
}
