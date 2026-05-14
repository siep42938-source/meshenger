import React from 'react'
import { motion } from 'framer-motion'
import { Check, Moon, Sun, Zap, Leaf } from 'lucide-react'
import { useThemeStore, ACCENTS, THEMES, type ThemeMode, type AccentColor } from '../../store/themeStore'
import clsx from 'clsx'

const THEME_ICONS: Record<ThemeMode, React.FC<any>> = {
  dark: Moon, light: Sun, midnight: Zap, aurora: Leaf
}

const ACCENT_LABELS: Record<AccentColor, string> = {
  blue: '🔵', purple: '🟣', pink: '🩷', green: '🟢',
  orange: '🟠', red: '🔴', cyan: '🩵', gold: '🟡'
}

export const ThemePanel: React.FC = () => {
  const { theme, setMode, setAccent, setBubbleStyle, setFontSize } = useThemeStore()

  return (
    <div className="space-y-6">
      {/* Themes */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-surface-400 mb-3 px-1">Тема</p>
        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(THEMES) as [ThemeMode, any][]).map(([mode, t]) => {
            const Icon = THEME_ICONS[mode]
            const isActive = theme.mode === mode
            return (
              <motion.button
                key={mode}
                whileTap={{ scale: 0.96 }}
                onClick={() => setMode(mode)}
                className={clsx(
                  'relative rounded-2xl p-3 border-2 transition-all text-left overflow-hidden',
                  isActive ? 'border-primary-500 shadow-glow' : 'border-surface-700/40 hover:border-surface-600'
                )}
                style={{ background: t.bg }}
              >
                {/* Preview bubbles */}
                <div className="flex flex-col gap-1 mb-2">
                  <div className="h-2 rounded-full w-3/4 ml-auto" style={{ background: t.preview[2] }} />
                  <div className="h-2 rounded-full w-2/3" style={{ background: t.preview[1], opacity: 0.6 }} />
                  <div className="h-2 rounded-full w-1/2 ml-auto" style={{ background: t.preview[2], opacity: 0.7 }} />
                </div>
                <div className="flex items-center gap-1.5">
                  <Icon size={12} style={{ color: t.preview[2] }} />
                  <span className="text-xs font-medium" style={{ color: mode === 'light' ? '#1e293b' : '#e2e8f0' }}>
                    {t.label}
                  </span>
                </div>
                {isActive && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary-500 flex items-center justify-center">
                    <Check size={10} className="text-white" />
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Accent colors */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-surface-400 mb-3 px-1">Акцентный цвет</p>
        <div className="flex gap-2 flex-wrap">
          {(Object.entries(ACCENTS) as [AccentColor, any][]).map(([accent, colors]) => (
            <motion.button
              key={accent}
              whileTap={{ scale: 0.9 }}
              onClick={() => setAccent(accent)}
              className="relative w-9 h-9 rounded-full transition-transform hover:scale-110"
              style={{
                background: colors.primary,
                boxShadow: theme.accent === accent ? `0 0 0 3px ${colors.primary}40, 0 0 12px ${colors.glow}` : 'none',
                outline: theme.accent === accent ? `2px solid ${colors.primary}` : 'none',
                outlineOffset: '2px',
              }}
            >
              {theme.accent === accent && (
                <Check size={14} className="text-white absolute inset-0 m-auto" />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Bubble style */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-surface-400 mb-3 px-1">Стиль пузырей</p>
        <div className="grid grid-cols-3 gap-2">
          {(['rounded', 'sharp', 'bubble'] as const).map(style => (
            <button
              key={style}
              onClick={() => setBubbleStyle(style)}
              className={clsx(
                'py-2.5 rounded-xl text-xs font-medium border transition-all',
                theme.bubbleStyle === style
                  ? 'border-primary-500 bg-primary-500/15 text-white'
                  : 'border-surface-700/40 text-surface-400 hover:border-surface-600'
              )}
            >
              {style === 'rounded' ? 'Округлый' : style === 'sharp' ? 'Острый' : 'Пузырь'}
            </button>
          ))}
        </div>
      </div>

      {/* Font size */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-surface-400 mb-3 px-1">Размер текста</p>
        <div className="grid grid-cols-3 gap-2">
          {(['sm', 'md', 'lg'] as const).map(size => (
            <button
              key={size}
              onClick={() => setFontSize(size)}
              className={clsx(
                'py-2.5 rounded-xl border transition-all font-medium',
                theme.fontSize === size
                  ? 'border-primary-500 bg-primary-500/15 text-white'
                  : 'border-surface-700/40 text-surface-400 hover:border-surface-600',
                size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
              )}
            >
              {size === 'sm' ? 'Мелкий' : size === 'md' ? 'Средний' : 'Крупный'}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
