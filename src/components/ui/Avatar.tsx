import React from 'react'
import { getInitials } from '../../utils/format'
import clsx from 'clsx'

interface AvatarProps {
  name: string
  color?: string
  src?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  online?: boolean
  className?: string
}

const sizes = {
  xs: 'w-7 h-7 text-xs',
  sm: 'w-9 h-9 text-sm',
  md: 'w-11 h-11 text-base',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
}

export const Avatar: React.FC<AvatarProps> = ({
  name, color = '#1a5cff', src, size = 'md', online, className
}) => {
  return (
    <div className={clsx('relative flex-shrink-0', className)}>
      <div
        className={clsx('avatar', sizes[size])}
        style={{ background: src ? undefined : color }}
      >
        {src
          ? <img src={src} alt={name} className="w-full h-full rounded-full object-cover" />
          : <span className="text-white">{getInitials(name)}</span>
        }
      </div>
      {online !== undefined && (
        <span
          className={clsx(
            'status-dot absolute bottom-0 right-0',
            online ? 'bg-green-400' : 'bg-surface-500'
          )}
        />
      )}
    </div>
  )
}
