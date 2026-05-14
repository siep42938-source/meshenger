import React from 'react'
import { Wifi, Bluetooth, Globe, WifiOff } from 'lucide-react'
import type { NetworkMode } from '../../types'

interface NetworkBadgeProps {
  mode: NetworkMode
  className?: string
}

const config: Record<NetworkMode, { label: string; Icon: React.FC<any>; cls: string }> = {
  internet:     { label: 'Интернет',    Icon: Globe,    cls: 'internet' },
  'wifi-direct':{ label: 'Wi-Fi Direct',Icon: Wifi,     cls: 'wifi-direct' },
  bluetooth:    { label: 'Bluetooth',   Icon: Bluetooth,cls: 'bluetooth' },
  offline:      { label: 'Офлайн',      Icon: WifiOff,  cls: 'offline' },
}

export const NetworkBadge: React.FC<NetworkBadgeProps> = ({ mode, className }) => {
  const { label, Icon, cls } = config[mode]
  return (
    <span className={`net-badge ${cls} ${className ?? ''}`}>
      <Icon size={10} strokeWidth={2.5} />
      {label}
    </span>
  )
}
