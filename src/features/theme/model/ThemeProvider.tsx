import { useEffect, useState, type ReactNode } from 'react'
import { ThemeContext } from '@/features/theme/model/theme-context'
import {
  applyThemeToDocument,
  resolveInitialTheme,
  writeStoredTheme,
} from '@/features/theme/model/themeStorage'
import { THEMES, type Theme } from '@/features/theme/model/types'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => resolveInitialTheme())

  useEffect(() => {
    applyThemeToDocument(theme)
    writeStoredTheme(theme)
  }, [theme])

  function setTheme(next: Theme) {
    setThemeState(next)
  }

  function toggleTheme() {
    setThemeState((current) =>
      current === THEMES.light ? THEMES.dark : THEMES.light,
    )
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
