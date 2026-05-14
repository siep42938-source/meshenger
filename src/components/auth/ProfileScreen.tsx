import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, ArrowRight, Loader2 } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const AVATAR_COLORS = [
  '#1a5cff', '#7c3aed', '#db2777', '#059669',
  '#d97706', '#dc2626', '#0891b2', '#65a30d'
]

export const ProfileScreen: React.FC = () => {
  const { setProfile } = useAuthStore()
  const [name, setName] = useState('')
  const [color, setColor] = useState(AVATAR_COLORS[0])
  const [loading, setLoading] = useState(false)

  const initials = name.trim()
    ? name.trim().split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : '?'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    await setProfile(name.trim())
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center min-h-full px-6 py-12"
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl font-bold text-white">Ваш профиль</h2>
        <p className="text-surface-400 text-sm mt-1">Как вас зовут?</p>
      </motion.div>

      {/* Avatar preview */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative mb-6"
      >
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-glow cursor-pointer"
          style={{ background: color }}
        >
          {initials}
        </div>
        <button className="absolute bottom-0 right-0 w-8 h-8 bg-surface-700 border border-surface-600 rounded-full flex items-center justify-center hover:bg-surface-600 transition-colors">
          <Camera size={14} className="text-surface-300" />
        </button>
      </motion.div>

      {/* Color picker */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex gap-2 mb-8"
      >
        {AVATAR_COLORS.map(c => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className="w-7 h-7 rounded-full transition-transform hover:scale-110"
            style={{ background: c, outline: color === c ? `3px solid ${c}` : 'none', outlineOffset: '2px' }}
            aria-label={`Цвет ${c}`}
          />
        ))}
      </motion.div>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-sm space-y-4"
      >
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Ваше имя"
          className="input-field"
          autoFocus
          maxLength={32}
        />

        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading
            ? <Loader2 size={20} className="animate-spin" />
            : <>Начать <ArrowRight size={18} /></>
          }
        </button>
      </motion.form>
    </motion.div>
  )
}
