import React, { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuthStore } from './store/authStore'
import { useThemeStore } from './store/themeStore'
import { useCallStore } from './store/callStore'
import { PhoneScreen } from './components/auth/PhoneScreen'
import { OtpScreen } from './components/auth/OtpScreen'
import { ProfileScreen } from './components/auth/ProfileScreen'
import { MainLayout } from './components/layout/MainLayout'
import { CallScreen } from './components/call/CallScreen'

export default function App() {
  const { auth } = useAuthStore()
  const { applyTheme } = useThemeStore()
  const { call } = useCallStore()

  useEffect(() => { applyTheme() }, [])

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <AnimatePresence mode="wait">
        {auth.step === 'done' ? (
          <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 overflow-hidden">
            <MainLayout />
          </motion.div>
        ) : (
          <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 relative overflow-hidden">
            <div className="absolute inset-0" style={{ background: 'var(--color-bg)' }} />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)' }} />
            <div className="relative h-full">
              <AnimatePresence mode="wait">
                {auth.step === 'phone'   && <PhoneScreen   key="phone" />}
                {auth.step === 'otp'     && <OtpScreen     key="otp" />}
                {auth.step === 'profile' && <ProfileScreen key="profile" />}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Call overlay — поверх всего */}
      <AnimatePresence>
        {call.active && <CallScreen key="call" />}
      </AnimatePresence>
    </div>
  )
}
