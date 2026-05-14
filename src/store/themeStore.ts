import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'dark' | 'light' | 'midnight' | 'aurora'
export type AccentColor = 'blue' | 'purple' | 'pink' | 'green' | 'orange' | 'red' | 'cyan' | 'gold'

export interface Theme {
  mode: ThemeMode
  accent: AccentColor
  bubbleStyle: 'rounded' | 'sharp' | 'bubble'
  fontSize: 'sm' | 'md' | 'lg'
  wallpaper: string | null
}

const ACCENTS: Record<AccentColor, { primary: string; glow: string; bubble: string }> = {
  blue:   { primary: '#1a5cff', glow: 'rgba(26,92,255,0.4)',   bubble: '#1a5cff' },
  purple: { primary: '#7c3aed', glow: 'rgba(124,58,237,0.4)',  bubble: '#7c3aed' },
  pink:   { primary: '#db2777', glow: 'rgba(219,39,119,0.4)',  bubble: '#db2777' },
  green:  { primary: '#059669', glow: 'rgba(5,150,105,0.4)',   bubble: '#059669' },
  orange: { primary: '#d97706', glow: 'rgba(217,119,6,0.4)',   bubble: '#d97706' },
  red:    { primary: '#dc2626', glow: 'rgba(220,38,38,0.4)',   bubble: '#dc2626' },
  cyan:   { primary: '#0891b2', glow: 'rgba(8,145,178,0.4)',   bubble: '#0891b2' },
  gold:   { primary: '#b45309', glow: 'rgba(180,83,9,0.4)',    bubble: '#b45309' },
}

const THEMES: Record<ThemeMode, { bg: string; surface: string; label: string; preview: string[] }> = {
  dark:     { bg: '#0d1520', surface: '#1e2a3a', label: 'Ночная',    preview: ['#0d1520','#1e2a3a','#1a5cff'] },
  light:    { bg: '#f0f4f8', surface: '#ffffff', label: 'Дневная',   preview: ['#f0f4f8','#ffffff','#1a5cff'] },
  midnight: { bg: '#080c14', surface: '#111827', label: 'Полночь',   preview: ['#080c14','#111827','#7c3aed'] },
  aurora:   { bg: '#0a1628', surface: '#0f2040', label: 'Аврора',    preview: ['#0a1628','#0f2040','#059669'] },
}

interface ThemeStore {
  theme: Theme
  setMode: (mode: ThemeMode) => void
  setAccent: (accent: AccentColor) => void
  setBubbleStyle: (style: Theme['bubbleStyle']) => void
  setFontSize: (size: Theme['fontSize']) => void
  setWallpaper: (url: string | null) => void
  getAccentColors: () => typeof ACCENTS[AccentColor]
  getThemeColors: () => typeof THEMES[ThemeMode]
  applyTheme: () => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: {
        mode: 'dark',
        accent: 'blue',
        bubbleStyle: 'rounded',
        fontSize: 'md',
        wallpaper: null,
      },

      setMode: (mode) => {
        set(s => ({ theme: { ...s.theme, mode } }))
        get().applyTheme()
      },
      setAccent: (accent) => {
        set(s => ({ theme: { ...s.theme, accent } }))
        get().applyTheme()
      },
      setBubbleStyle: (bubbleStyle) => set(s => ({ theme: { ...s.theme, bubbleStyle } })),
      setFontSize: (fontSize) => {
        set(s => ({ theme: { ...s.theme, fontSize } }))
        get().applyTheme()
      },
      setWallpaper: (wallpaper) => set(s => ({ theme: { ...s.theme, wallpaper } })),

      getAccentColors: () => ACCENTS[get().theme.accent],
      getThemeColors:  () => THEMES[get().theme.mode],

      applyTheme: () => {
        const { theme } = get()
        const accent = ACCENTS[theme.accent]
        const colors = THEMES[theme.mode]
        const root   = document.documentElement

        root.style.setProperty('--color-bg',      colors.bg)
        root.style.setProperty('--color-surface',  colors.surface)
        root.style.setProperty('--color-primary',  accent.primary)
        root.style.setProperty('--color-glow',     accent.glow)
        root.style.setProperty('--color-bubble',   accent.bubble)

        const fontSizes = { sm: '13px', md: '15px', lg: '17px' }
        root.style.setProperty('--font-size-base', fontSizes[theme.fontSize])

        // Toggle light class
        if (theme.mode === 'light') {
          root.classList.add('light-theme')
        } else {
          root.classList.remove('light-theme')
        }
      },
    }),
    { name: 'Umberla-theme' }
  )
)

export { ACCENTS, THEMES }
