import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ArrowRight, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { parsePhoneNumber, isValidPhoneNumber, getCountries, getCountryCallingCode, AsYouType } from 'libphonenumber-js'
import { useAuthStore } from '../../store/authStore'

const POPULAR_COUNTRIES = [
  { code: 'RU', flag: '🇷🇺', name: 'Россия' },
  { code: 'UA', flag: '🇺🇦', name: 'Украина' },
  { code: 'BY', flag: '🇧🇾', name: 'Беларусь' },
  { code: 'KZ', flag: '🇰🇿', name: 'Казахстан' },
  { code: 'US', flag: '🇺🇸', name: 'США' },
  { code: 'GB', flag: '🇬🇧', name: 'Великобритания' },
  { code: 'DE', flag: '🇩🇪', name: 'Германия' },
  { code: 'FR', flag: '🇫🇷', name: 'Франция' },
  { code: 'TR', flag: '🇹🇷', name: 'Турция' },
  { code: 'AZ', flag: '🇦🇿', name: 'Азербайджан' },
  { code: 'GE', flag: '🇬🇪', name: 'Грузия' },
  { code: 'AM', flag: '🇦🇲', name: 'Армения' },
  { code: 'UZ', flag: '🇺🇿', name: 'Узбекистан' },
]

export const PhoneScreen: React.FC = () => {
  const { sendOtp, setPhone } = useAuthStore()
  const [country, setCountry] = useState(POPULAR_COUNTRIES[0])
  const [phone, setPhoneVal] = useState('')
  const [showCountries, setShowCountries] = useState(false)
  const [loading, setLoading] = useState(false)
  const [countrySearch, setCountrySearch] = useState('')
  const [phoneStatus, setPhoneStatus] = useState<'new' | 'exists' | null>(null)

  const dialCode = '+' + getCountryCallingCode(country.code as any)

  // Форматируем номер по мере ввода
  const formatted = useMemo(() => {
    if (!phone) return ''
    try {
      return new AsYouType(country.code as any).input(phone)
    } catch {
      return phone
    }
  }, [phone, country.code])

  // Валидация номера
  const validation = useMemo(() => {
    const raw = dialCode + phone.replace(/\D/g, '')
    if (phone.replace(/\D/g, '').length < 4) return null
    try {
      const parsed = parsePhoneNumber(raw)
      if (!parsed) return { valid: false, info: 'Неверный формат' }
      const valid = isValidPhoneNumber(raw)
      if (!valid) return { valid: false, info: 'Номер не существует' }
      const type = parsed.getType()
      const typeLabel: Record<string, string> = {
        MOBILE: '📱 Мобильный',
        FIXED_LINE: '☎️ Стационарный',
        FIXED_LINE_OR_MOBILE: '📱 Мобильный',
        VOIP: '🌐 VoIP',
        PREMIUM_RATE: '💰 Платный',
        TOLL_FREE: '🆓 Бесплатный',
      }
      return {
        valid: true,
        info: typeLabel[type || ''] || '📱 Мобильный',
        national: parsed.formatNational(),
        international: parsed.formatInternational(),
      }
    } catch {
      return { valid: false, info: 'Неверный формат' }
    }
  }, [phone, dialCode])

  const filteredCountries = POPULAR_COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validation?.valid) return
    setLoading(true)
    const fullPhone = dialCode + phone.replace(/\D/g, '')
    setPhone(fullPhone, dialCode)
    const result = await sendOtp(fullPhone, 'dev', '')
    if (result.isRegistered !== undefined) {
      setPhoneStatus(result.isRegistered ? 'exists' : 'new')
    }
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
            onClick={() => { setShowCountries(!showCountries); setCountrySearch('') }}
            className="input-field w-full flex items-center gap-3 text-left"
          >
            <span className="text-xl">{country.flag}</span>
            <span className="flex-1 text-white">{country.name}</span>
            <span className="font-mono text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{dialCode}</span>
            <ChevronDown
              size={16}
              style={{
                color: 'rgba(255,255,255,0.4)',
                transform: showCountries ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s',
              }}
            />
          </button>

          <AnimatePresence>
            {showCountries && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden z-50"
                style={{
                  background: 'rgba(10,14,26,0.98)',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                }}
              >
                <div className="p-2">
                  <input
                    type="text"
                    value={countrySearch}
                    onChange={e => setCountrySearch(e.target.value)}
                    placeholder="Поиск страны..."
                    className="input-field py-2 text-sm"
                    autoFocus
                  />
                </div>
                <div className="max-h-48 overflow-y-auto pb-2">
                  {filteredCountries.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => { setCountry(c); setShowCountries(false); setPhoneVal('') }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span className="text-xl">{c.flag}</span>
                      <span className="flex-1 text-white text-sm">{c.name}</span>
                      <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        +{getCountryCallingCode(c.code as any)}
                      </span>
                    </button>
                  ))}
                </div>
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
            {dialCode}
          </div>
          <div className="relative flex-1">
            <input
              type="tel"
              value={phone}
              onChange={e => setPhoneVal(e.target.value.replace(/[^\d\s\-()]/g, ''))}
              placeholder="999 123-45-67"
              className="input-field w-full pr-10"
              autoFocus
              inputMode="tel"
            />
            {/* Иконка валидации */}
            {validation && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {validation.valid
                  ? <CheckCircle size={18} className="text-emerald-400" />
                  : <XCircle size={18} className="text-red-400" />
                }
              </div>
            )}
          </div>
        </div>

        {/* Инфо о номере */}
        <AnimatePresence>
          {validation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div
                className="px-3 py-2 rounded-xl text-xs flex items-center gap-2"
                style={{
                  background: validation.valid ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)',
                  border: `1px solid ${validation.valid ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}`,
                  color: validation.valid ? '#6ee7b7' : '#fca5a5',
                }}
              >
                {validation.valid ? (
                  <>
                    <span>{validation.info}</span>
                    <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>{validation.international}</span>
                  </>
                ) : (
                  <span>{validation.info}</span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Статус номера после отправки */}
        <AnimatePresence>
          {phoneStatus && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div
                className="px-3 py-2.5 rounded-xl text-xs text-center font-medium"
                style={{
                  background: phoneStatus === 'exists' ? 'rgba(251,191,36,0.1)' : 'rgba(52,211,153,0.08)',
                  border: `1px solid ${phoneStatus === 'exists' ? 'rgba(251,191,36,0.3)' : 'rgba(52,211,153,0.2)'}`,
                  color: phoneStatus === 'exists' ? '#fbbf24' : '#6ee7b7',
                }}
              >
                {phoneStatus === 'exists'
                  ? '⚠️ Этот номер уже зарегистрирован — вы войдёте в существующий аккаунт'
                  : '✅ Новый аккаунт — код отправлен'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={loading || !validation?.valid}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading
            ? <Loader2 size={20} className="animate-spin" />
            : <>{phoneStatus === 'exists' ? 'Войти' : 'Получить код'} <ArrowRight size={18} /></>
          }
        </button>
      </motion.form>

      <p className="text-xs text-center mt-6 max-w-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
        Код придёт в Telegram боту @umbrellaSup_bot
      </p>
    </motion.div>
  )
}
