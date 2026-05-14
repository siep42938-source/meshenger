import { create } from 'zustand'
import type { CallState } from '../types'

interface CallStore {
  call: CallState
  startCall: (chatId: string, type: 'audio' | 'video') => void
  endCall: () => void
  acceptCall: () => void
}

export const useCallStore = create<CallStore>((set) => ({
  call: { active: false, chatId: null, type: 'audio', status: 'ended' },

  startCall: (chatId, type) => set({
    call: { active: true, chatId, type, status: 'calling', startedAt: new Date() }
  }),

  endCall: () => set({
    call: { active: false, chatId: null, type: 'audio', status: 'ended' }
  }),

  acceptCall: () => set(s => ({
    call: { ...s.call, status: 'connected', startedAt: new Date() }
  })),
}))
