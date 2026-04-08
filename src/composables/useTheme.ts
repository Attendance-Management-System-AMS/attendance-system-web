import { useStorage } from '@vueuse/core'

export interface ThemeConfig {
  name: string
  label: string
  primary: string // OKLCH value
  primaryForeground: string // OKLCH value
  ring?: string
}

export const THEMES: ThemeConfig[] = [
  {
    name: 'indigo',
    label: 'Indigo (Mặc định)',
    primary: '0.511 0.262 276.966',
    primaryForeground: '0.98 0.01 260',
    ring: '0.511 0.262 276.966'
  },
  {
    name: 'emerald',
    label: 'Emerald (Xanh lục)',
    primary: '0.64 0.17 160',
    primaryForeground: '0.98 0.01 160'
  },
  {
    name: 'rose',
    label: 'Rose (Hồng đỏ)',
    primary: '0.6 0.18 20',
    primaryForeground: '0.98 0.01 20'
  },
  {
    name: 'amber',
    label: 'Amber (Vàng hổ phách)',
    primary: '0.77 0.15 80',
    primaryForeground: '0.1 0.05 80'
  },
  {
    name: 'violet',
    label: 'Violet (Tím hoa cà)',
    primary: '0.6 0.2 290',
    primaryForeground: '0.98 0.01 290'
  }
]

const activeThemeName = useStorage('ams-active-theme', 'indigo')

export function useTheme() {
  const applyTheme = (themeName: string) => {
    const theme = THEMES.find(t => t.name === themeName) ?? THEMES[0]

    // Cập nhật biến CSS vào thẻ :root
    const root = document.documentElement
    root.style.setProperty('--primary', `oklch(${theme?.primary})`)
    root.style.setProperty('--primary-foreground', `oklch(${theme?.primaryForeground})`)
    root.style.setProperty('--ring', `oklch(${theme?.primary} / 0.5)`)

    activeThemeName.value = themeName
  }

  const initTheme = () => {
    applyTheme(activeThemeName.value)
  }

  return {
    activeThemeName,
    THEMES,
    applyTheme,
    initTheme
  }
}
