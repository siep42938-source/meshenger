import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export const socketService = {
  connect: (serverUrl: string, token: string) => {
    if (socket?.connected) return socket

    socket = io(serverUrl, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    socket.on('connect', () => {
      console.log('✅ WebSocket подключен')
    })

    socket.on('disconnect', () => {
      console.log('❌ WebSocket отключен')
    })

    socket.on('error', (error) => {
      console.error('WebSocket ошибка:', error)
    })

    return socket
  },

  disconnect: () => {
    if (socket) {
      socket.disconnect()
      socket = null
    }
  },

  getSocket: () => socket,

  // Отправить сообщение
  sendMessage: (chatId: string, message: string) => {
    socket?.emit('message:send', { chatId, message })
  },

  // Слушать входящие сообщения
  onMessage: (callback: (data: any) => void) => {
    socket?.on('message:receive', callback)
  },

  // Слушать статус доставки
  onMessageStatus: (callback: (data: any) => void) => {
    socket?.on('message:status', callback)
  },

  // Слушать печать
  onTyping: (callback: (data: any) => void) => {
    socket?.on('user:typing', callback)
  },

  // Отправить статус печати
  sendTyping: (chatId: string) => {
    socket?.emit('user:typing', { chatId })
  },

  // Слушать звонки
  onCall: (callback: (data: any) => void) => {
    socket?.on('call:incoming', callback)
  },

  // Ответить на звонок
  answerCall: (callId: string) => {
    socket?.emit('call:answer', { callId })
  },

  // Отклонить звонок
  rejectCall: (callId: string) => {
    socket?.emit('call:reject', { callId })
  },
}
