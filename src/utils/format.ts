import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns'
import { ru } from 'date-fns/locale'

export function formatTime(date: Date): string {
  return format(date, 'HH:mm')
}

export function formatChatDate(date: Date): string {
  if (isToday(date)) return format(date, 'HH:mm')
  if (isYesterday(date)) return 'Вчера'
  return format(date, 'd MMM', { locale: ru })
}

export function formatLastSeen(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true, locale: ru })
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
}

export function formatPhone(phone: string): string {
  // Simple formatter: +7 (999) 123-45-67
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11 && digits[0] === '7') {
    return `+7 (${digits.slice(1,4)}) ${digits.slice(4,7)}-${digits.slice(7,9)}-${digits.slice(9,11)}`
  }
  return phone
}
