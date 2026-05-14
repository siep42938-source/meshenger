import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Camera, Globe, Lock, ArrowRight } from 'lucide-react'
import { useChatStore } from '../../store/chatStore'
import { useAuthStore } from '../../store/authStore'

interface Props {
  onClose: () => void
  onCreated: (chatId: string) => void
}

const AVATAR_COLORS = ['#7c3aed','#db2777','#059669','#d97706','#dc2626','#0891b2','#1a5cff']

export const CreateChannelModal: React.FC<Props> = ({ onClose, onCreated }) => {
  const { currentUser } = useAuthStore()
  const { createChannel } = useChatStore()
  const [step, setStep] = useState<'info' | 'type'>('info')
  const [channelName, setChannelName] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [link, setLink] = useState('')
  const [color] = useState(AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)])

  const handleCreate = () => {
    if (!channelName.trim()) return
    const chatId = createChannel(channelName.trim(), description, isPublic, currentUser?.id ?? 'me', color)
    onCreated(chatId)
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 32, scale: 0.96 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm rounded-3xl overflow-hidden"
        style={{
          background: 'rgba(10,14,26,0.96)',
          backdropFilter: 'blur(48px) saturate(2)',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="font-semibold text-white">
            {step === 'info' ? 'Новый канал' : 'Тип канала'}
          </h3>
          <motion.button whileTap={{ scale: 0.9 }} onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.08)' }}>
            <X size={14} className="text-white/60" />
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {step === 'info' ? (
            <motion.div key="info" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} className="p-5 space-y-4">
              {/* Avatar + name */}
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center cursor-pointer transition-all hover:opacity-80"
                    style={{ background: color, boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
                    {channelName ? (
                      <span className="text-2xl font-bold text-white">{channelName[0].toUpperCase()}</span>
                    ) : (
                      <Camera size={24} className="text-white/60" />
                    )}
                  </div>
                </div>
                <input
                  type="text"
                  value={channelName}
                  onChange={e => setChannelName(e.target.value)}
                  placeholder="Название канала"
                  className="input-field flex-1"
                  autoFocus
                  maxLength={64}
                />
              </div>

              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Описание (необязательно)"
                rows={3}
                className="input-field resize-none"
                maxLength={255}
              />

              <div className="flex gap-3">
                <motion.button whileTap={{ scale: 0.97 }} onClick={onClose}
                  className="flex-1 py-3 rounded-2xl text-sm font-medium text-white/60"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}>
                  Отмена
                </motion.button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => channelName.trim() && setStep('type')}
                  disabled={!channelName.trim()}
                  className="btn-primary flex-1 flex items-center justify-center gap-2">
                  Далее <ArrowRight size={15} />
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="type" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="p-5 space-y-4">
              {/* Public */}
              <motion.button whileTap={{ scale: 0.99 }} onClick={() => setIsPublic(true)}
                className="w-full flex items-start gap-4 p-4 rounded-2xl transition-all text-left"
                style={{
                  background: isPublic ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.03)',
                  border: `1.5px solid ${isPublic ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.07)'}`,
                }}>
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ borderColor: isPublic ? 'var(--color-primary)' : 'rgba(255,255,255,0.25)' }}>
                  {isPublic && <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--color-primary)' }} />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Globe size={14} className="text-purple-400" />
                    <p className="text-white font-medium text-sm">Публичный канал</p>
                  </div>
                  <p className="text-white/40 text-xs leading-relaxed">Все могут найти канал через поиск и подписаться.</p>
                </div>
              </motion.button>

              {/* Private */}
              <motion.button whileTap={{ scale: 0.99 }} onClick={() => setIsPublic(false)}
                className="w-full flex items-start gap-4 p-4 rounded-2xl transition-all text-left"
                style={{
                  background: !isPublic ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.03)',
                  border: `1.5px solid ${!isPublic ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.07)'}`,
                }}>
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ borderColor: !isPublic ? 'var(--color-primary)' : 'rgba(255,255,255,0.25)' }}>
                  {!isPublic && <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--color-primary)' }} />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Lock size={14} className="text-white/50" />
                    <p className="text-white font-medium text-sm">Частный канал</p>
                  </div>
                  <p className="text-white/40 text-xs leading-relaxed">Подписаться можно только по ссылке-приглашению.</p>
                </div>
              </motion.button>

              {/* Link for public */}
              {isPublic && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                  <p className="text-white/40 text-xs mb-2">Ссылка на канал</p>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35 text-sm">umberla.app/</span>
                    <input
                      type="text"
                      value={link}
                      onChange={e => setLink(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="channel_name"
                      className="input-field pl-28"
                    />
                  </div>
                </motion.div>
              )}

              <div className="flex gap-3 pt-1">
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep('info')}
                  className="flex-1 py-3 rounded-2xl text-sm font-medium text-white/60"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}>
                  Назад
                </motion.button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleCreate}
                  className="btn-primary flex-1 flex items-center justify-center">
                  Создать
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
