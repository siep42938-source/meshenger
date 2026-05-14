import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ArrowRight, Loader2 } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const COUNTRIES = [
  { code: '+7',   flag: '🇷🇺', name: 'Россия' },
  { code: '+380', flag: '🇺🇦', name: 'Украина' },
  { code: '+375', flag: '🇧🇾', name: 'Беларусь' },
  { code: '+1',   flag: '🇺🇸', name: 'США' },
  { code: '+44',  flag: '🇬🇧', name: 'Великобритания' },
  { code: '+49',  flag: '🇩🇪', name: 'Германия' },
  { code: '+33',  flag: '🇫🇷', name: 'Франция' },
  { code: '+86',  flag: '🇨🇳', name: 'Китай' },
  { code: '+81',  flag: '🇯🇵', name: 'Япония' },
]

export const PhoneScreen: React.FC = () => {
  const { sendOtp, setPhone } = useAuthStore()
  const [country, setCountry] = useState(COUNTRIES[0])
  const [phone, setPhoneVal] = useState('')
  const [showCountries, setShowCountries] = useState(false)
  const [loading, setLoading] = useState(false)

  const fullPhone = country.code + phone.replace(/\D/g, '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (phone.replace(/\D/g, '').length < 7) return
    setLoading(true)
    setPhone(fullPhone, country.code)
    await sendOtp(fullPhone, 'dev', '')
    setLoading(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
      className="flex flex-col items-center justify-center min-h-full px-6 py-12"
    >
      {/* Logo */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        className="mb-8 flex flex-col items-center gap-3"
      >
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
            boxShadow: '0 0 32px rgba(124,58,237,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
          }}
        >
          <span className="text-4xl">☂️</span>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">Umberla</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Работает везде — с интернетом и без
          </p>
        </div>
      </motion.div>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-sm space-y-3"
      >
        <p className="text-sm text-center" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Введите номер телефона для входа
        </p>

        {/* Country selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowCountries(!showCountries)}
            className="input-field w-full flex items-center gap-3 text-left"
          >
            <span className="text-xl">{country.flag}</span>
            <span className="flex-1 text-white">{country.name}</span>
            <span className="font-mono text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{country.code}</span>
            <ChevronDown
              size={16}
              style={{ color: 'rgba(255,255,255,0.4)', transform: showCountries ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
            />
          </button>

          <AnimatePresence>
            {showCountries && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden z-50 max-h-56 overflow-y-auto"
                style={{
                  background: 'rgba(10,14,26,0.97)',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                }}
              >
                {COUNTRIES.map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { setCountry(c); setShowCountries(false) }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span className="text-xl">{c.flag}</span>
                    <span className="flex-1 text-white text-sm">{c.name}</span>
                    <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{c.code}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Phone input */}
        <div className="flex gap-2">
          <div
            className="rounded-2xl px-3 flex items-center flex-shrink-0 font-mono text-sm"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1.5px solid rgba(255,255,255,0.09)',
              color: 'rgba(255,255,255,0.5)',
              padding: '14px 12px',
            }}
          >
            {country.code}
          </div>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhoneVal(e.target.value)}
            placeholder="999 123-45-67"
            className="input-field flex-1"
            autoFocus
            inputMode="tel"
          />
        </div>

        <button
          type="submit"
          disabled={loading || phone.replace(/\D/g, '').length < 7}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading
            ? <Loader2 size={20} className="animate-spin" />
            : <>Получить код <ArrowRight size={18} /></>
          }
        </button>
      </motion.form>

      <p className="text-xs text-center mt-6 max-w-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
        Продолжая, вы соглашаетесь с условиями использования.
      </p>
    </motion.div>
  )
}
