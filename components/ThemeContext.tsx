'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export type Theme = 'deansgate-light' | 'deansgate-dark' | 'deansgate-serenity'

interface ThemeContextType {
  theme: Theme
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'deansgate-serenity',
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('deansgate-light')

  useEffect(() => {
    const saved = localStorage.getItem('dh-theme') as Theme | null
    if (saved) setThemeState(saved)
    else setThemeState('deansgate-light')
  }, [])

  const setTheme = (t: Theme) => {
    setThemeState(t)
    localStorage.setItem('dh-theme', t)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div data-theme={theme} className="contents">
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
