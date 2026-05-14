import React from 'react'
import { Check, CheckCheck, Clock, AlertCircle } from 'lucide-react'
import type { Message } from '../../types'
import clsx from 'clsx'

interface Props {
  status: Message['status']
  className?: string
}

export const MessageStatus: React.FC<Props> = ({ status, className }) => {
  const base = clsx('inline-flex items-center', className)
  if (status === 'sending')   return <Clock size={12} className={clsx(base, 'text-white/50')} />
  if (status === 'sent')      return <Check size={12} className={clsx(base, 'text-white/60')} />
  if (status === 'delivered') return <CheckCheck size={12} className={clsx(base, 'text-white/70')} />
  if (status === 'read')      return <CheckCheck size={12} className={clsx(base, 'text-blue-300')} />
  if (status === 'failed')    return <AlertCircle size={12} className={clsx(base, 'text-red-400')} />
  return null
}
