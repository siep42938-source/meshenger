import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PhoneOff, Mic, MicOff, Video, VideoOff,
  Volume2, VolumeX, RotateCcw
} from 'lucide-react'
import { useCallStore } from '../../store/callStore'
import { useChatStore } from '../../store/chatStore'
import { useAuthStore } from '../../store/authStore'
import { Avatar } from '../ui/Avatar'

export const CallScreen: React.FC = () => {
  const { call, endCall, acceptCall } = useCallStore()
  const { contacts, chats } = useChatStore()
  const { currentUser } = useAuthStore()
  const [muted, setMuted] = useState(false)
  const [videoOff, setVideoOff] = useState(false)
  const [speakerOff, setSpeakerOff] = useState(false)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    if (call.status !== 'connected') return
    const t = setInterval(() => setDuration(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [call.status])

  // Auto-connect after 3s (demo)
  useEffect(() => {
    if (call.status !== 'calling') return
    const t = setTimeout(() => acceptCall(), 3000)
    return () => clearTimeout(t)
  }, [call.status])

  if (!call.active) return null

  const chat = chats.find(c => c.id === call.chatId)
  const otherId = chat?.participants.find(p => p !== 'me' && p !== currentUser?.id)
  const contact = contacts.find(c => c.id === otherId)
  const name = contact?.name ?? 'Неизвестный'
  const color = contact?.avatarColor ?? '#7c3aed'

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-between py-16 px-6"
        style={{
          background: `radial-gradient(ellipse at top, ${color}40 0%, rgba(8,12,24,0.98) 60%)`,
          backdropFilter: 'blur(40px)',
        }}
      >
        {/* Status */}
        <div className="text-center">
          <p className="text-white/50 text-sm">
            {call.type === 'video' ? '📹 Видеозвонок' : '📞 Голосовой звонок'}
          </p>
        </div>

        {/* Avatar + name */}
        <div className="flex flex-col items-center gap-4">
          {/* Pulsing rings */}
          {call.status === 'calling' && (
            <div className="relative">
              {[1,2,3].map(i => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full"
                  style={{ border: `2px solid ${color}40` }}
                  animate={{ scale: [1, 1.5 + i * 0.3], opacity: [0.6, 0] }}
                  transition={{ duration: 2, delay: i * 0.4, repeat: Infinity }}
                />
              ))}
              <Avatar name={name} color={color} size="xl" />
            </div>
          )}
          {call.status === 'connected' && (
            <Avatar name={name} color={color} size="xl" />
          )}

          <div className="text-center">
            <h2 className="text-white font-bold text-2xl">{name}</h2>
            <p className="text-white/50 text-sm mt-1">
              {call.status === 'calling' ? 'Вызов...' : formatDuration(duration)}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full max-w-xs">
          {/* Secondary controls */}
          <div className="flex justify-center gap-6 mb-8">
            {[
              { icon: muted ? MicOff : Mic, label: muted ? 'Вкл. микр.' : 'Выкл. микр.', action: () => setMuted(!muted), active: muted },
              { icon: speakerOff ? VolumeX : Volume2, label: 'Динамик', action: () => setSpeakerOff(!speakerOff), active: speakerOff },
              ...(call.type === 'video' ? [{ icon: videoOff ? VideoOff : Video, label: 'Камера', action: () => setVideoOff(!videoOff), active: videoOff }] : []),
              { icon: RotateCcw, label: 'Камера', action: () => {}, active: false },
            ].map(({ icon: Icon, label, action, active }) => (
              <button
                key={label}
                onClick={action}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center transition-all"
                  style={{
                    background: active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.12)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  <Icon size={22} className={active ? 'text-gray-900' : 'text-white'} />
                </div>
                <span className="text-white/40 text-xs">{label}</span>
              </button>
            ))}
          </div>

          {/* End call */}
          <div className="flex justify-center">
            <button
              onClick={endCall}
              className="w-16 h-16 rounded-full flex items-center justify-center transition-all"
              style={{
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                boxShadow: '0 0 24px rgba(239,68,68,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <PhoneOff size={26} className="text-white" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
