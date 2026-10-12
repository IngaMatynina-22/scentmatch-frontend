export const THEMES = {
  light: 'light',
  dark: 'dark',
} as const

export type Theme = (typeof THEMES)[keyof typeof THEMES]

export function isTheme(value: unknown): value is Theme {
  return value === THEMES.light || value === THEMES.dark
}
