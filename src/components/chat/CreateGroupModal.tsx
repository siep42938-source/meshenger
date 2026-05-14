import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Camera, ArrowRight, Check, Users } from 'lucide-react'
import { useChatStore } from '../../store/chatStore'
import { useAuthStore } from '../../store/authStore'
import { Avatar } from '../ui/Avatar'

interface Props {
  onClose: () => void
  onCreated: (chatId: string) => void
}

const AVATAR_COLORS = ['#7c3aed','#db2777','#059669','#d97706','#dc2626','#0891b2','#1a5cff','#65a30d']

export const CreateGroupModal: React.FC<Props> = ({ onClose, onCreated }) => {
  const { contacts, createGroup } = useChatStore()
  const { currentUser } = useAuthStore()
  const [step, setStep] = useState<'members' | 'name'>('members')
  const [selected, setSelected] = useState<string[]>([])
  const [name, setName] = useState('')
  const [color] = useState(AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)])

  const toggle = (id: string) =>
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])

  const handleCreate = () => {
    if (!name.trim() || selected.length === 0) return
    const chatId = createGroup(name.trim(), selected, currentUser?.id ?? 'me', color)
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
        className="w-full max-w-sm rounded-3xl overflow-hidden flex flex-col"
        style={{
          background: 'rgba(10,14,26,0.96)',
          backdropFilter: 'blur(48px) saturate(2)',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
          maxHeight: '80vh',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="font-semibold text-white">
            {step === 'members' ? 'Новая группа' : 'Название группы'}
          </h3>
          <motion.button whileTap={{ scale: 0.9 }} onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.08)' }}>
            <X size={14} className="text-white/60" />
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {step === 'members' ? (
            <motion.div key="members" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} className="flex flex-col flex-1 overflow-hidden">
              {/* Selected chips */}
              {selected.length > 0 && (
                <div className="flex gap-2 px-4 py-3 flex-wrap flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {selected.map(id => {
                    const c = contacts.find(x => x.id === id)
                    if (!c) return null
                    return (
                      <motion.button key={id} initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                        onClick={() => toggle(id)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa' }}>
                        {c.name.split(' ')[0]}
                        <X size={10} />
                      </motion.button>
                    )
                  })}
                </div>
              )}

              {/* Contact list */}
              <div className="flex-1 overflow-y-auto py-2">
                {contacts.map(contact => (
                  <motion.button key={contact.id} whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }} whileTap={{ scale: 0.99 }}
                    onClick={() => toggle(contact.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 transition-all text-left">
                    <Avatar name={contact.name} color={contact.avatarColor} size="sm" online={contact.status === 'online'} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white/85 text-sm font-medium truncate">{contact.name}</p>
                      <p className="text-white/35 text-xs">{contact.status === 'online' ? 'в сети' : 'не в сети'}</p>
                    </div>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                      style={{
                        background: selected.includes(contact.id) ? 'var(--color-primary)' : 'rgba(255,255,255,0.08)',
                        border: selected.includes(contact.id) ? 'none' : '1.5px solid rgba(255,255,255,0.15)',
                      }}>
                      {selected.includes(contact.id) && <Check size={11} className="text-white" />}
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Next */}
              <div className="px-4 py-4 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => selected.length > 0 && setStep('name')}
                  disabled={selected.length === 0}
                  className="btn-primary w-full flex items-center justify-center gap-2">
                  Далее ({selected.length}) <ArrowRight size={16} />
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="name" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="flex flex-col p-5 gap-5">
              {/* Avatar + name input */}
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                    style={{ background: color, boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
                    {name ? name[0].toUpperCase() : <Camera size={24} className="text-white/60" />}
                  </div>
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Название группы"
                  className="input-field flex-1"
                  autoFocus
                  maxLength={64}
                />
              </div>

              {/* Members preview */}
              <div>
                <p className="text-white/35 text-xs mb-2 flex items-center gap-1.5">
                  <Users size={11} /> {selected.length} участников
                </p>
                <div className="flex gap-2 flex-wrap">
                  {selected.map(id => {
                    const c = contacts.find(x => x.id === id)
                    if (!c) return null
                    return <Avatar key={id} name={c.name} color={c.avatarColor} size="xs" />
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep('members')}
                  className="flex-1 py-3 rounded-2xl text-sm font-medium text-white/60 transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}>
                  Назад
                </motion.button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleCreate}
                  disabled={!name.trim()}
                  className="btn-primary flex-1 flex items-center justify-center gap-2">
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
