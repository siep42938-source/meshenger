import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Loader2, RefreshCw } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { formatPhone } from '../../utils/format'

const OTP_LENGTH = 6

export const OtpScreen: React.FC = () => {
  const { auth, verifyOtp, sendOtp } = useAuthStore()
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(60)
  const [resending, setResending] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Countdown
  useEffect(() => {
    if (resendTimer <= 0) return
    const t = setTimeout(() => setResendTimer(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [resendTimer])

  // Auto-submit
  useEffect(() => {
    const code = digits.join('')
    if (code.length === OTP_LENGTH && !loading) handleVerify(code)
  }, [digits])

  const handleVerify = async (code: string) => {
    setLoading(true)
    setError('')
    const result = await verifyOtp(code)
    setLoading(false)
    if (!result.valid) {
      setError(result.error ?? 'Неверный код. Попробуйте ещё раз.')
      setDigits(Array(OTP_LENGTH).fill(''))
      setTimeout(() => inputRefs.current[0]?.focus(), 50)
    }
  }

  const handleInput = (i: number, val: string) => {
    if (val.length > 1) {
      const pasted = val.replace(/\D/g, '').slice(0, OTP_LENGTH)
      const next = Array(OTP_LENGTH).fill('')
      for (let j = 0; j < pasted.length; j++) next[j] = pasted[j]
      setDigits(next)
      inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus()
      return
    }
    const digit = val.replace(/\D/g, '')
    const next = [...digits]
    next[i] = digit
    setDigits(next)
    if (digit && i < OTP_LENGTH - 1) inputRefs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      const next = [...digits]
      next[i - 1] = ''
      setDigits(next)
      inputRefs.current[i - 1]?.focus()
    }
  }

  const handleResend = async () => {
    setResending(true)
    setError('')
    await sendOtp(auth.phone, 'dev', '')
    setResending(false)
    setResendTimer(60)
    setDigits(Array(OTP_LENGTH).fill(''))
    setTimeout(() => inputRefs.current[0]?.focus(), 50)
  }

  const goBack = () => useAuthStore.setState(s => ({
    auth: { ...s.auth, step: 'phone' },
  }))

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center min-h-full px-6 py-12 relative"
    >
      {/* Back */}
      <button onClick={goBack} className="absolute top-6 left-4 btn-ghost flex items-center gap-1.5 text-sm">
        <ArrowLeft size={18} /> Назад
      </button>

      {/* Icon */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
        className="mb-6 flex flex-col items-center gap-3"
      >
        <div className="w-20 h-20 rounded-3xl bg-surface-800 border border-surface-700/50 flex items-center justify-center text-4xl">
          💬
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-white">Введите код</h2>
          <p className="text-surface-400 text-sm mt-1">
            Код отправлен на{' '}
            <span className="text-white font-medium">{formatPhone(auth.phone)}</span>
          </p>
        </div>
      </motion.div>

      {/* OTP inputs */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex gap-3 mb-6"
      >
        {digits.map((d, i) => (
          <input
            key={i}
            ref={el => { inputRefs.current[i] = el }}
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={d}
            onChange={e => handleInput(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            onFocus={e => e.target.select()}
            className={`otp-input ${d ? 'filled' : ''}`}
            autoFocus={i === 0}
            aria-label={`Цифра ${i + 1}`}
          />
        ))}
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-red-400 text-sm mb-4 text-center"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 text-surface-400 text-sm mb-4">
          <Loader2 size={16} className="animate-spin" />
          Проверяем код...
        </div>
      )}

      {/* Resend */}
      <div className="text-center">
        {resendTimer > 0 ? (
          <p className="text-surface-500 text-sm">
            Повторная отправка через{' '}
            <span className="text-surface-300 font-mono">{resendTimer}с</span>
          </p>
        ) : (
          <button
            onClick={handleResend}
            disabled={resending}
            className="btn-ghost flex items-center gap-2 mx-auto text-sm"
          >
            {resending ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Отправить снова
          </button>
        )}
      </div>
    </motion.div>
  )
}
