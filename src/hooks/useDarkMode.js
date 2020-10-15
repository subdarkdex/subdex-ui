import { useEffect, useState } from 'react'

export const useDarkMode = () => {
  const [theme, setTheme] = useState('light')
  const [themeConfigured, setThemeConfigured] = useState(false)

  const saveTheme = (mode) => {
    window.localStorage.setItem('theme', mode)
    setTheme(mode)
  }

  const toggleTheme = () => {
    if (theme === 'light') {
      saveTheme('dark')
    } else {
      saveTheme('light')
    }
  }

  useEffect(() => {
    const localTheme = window.localStorage.getItem('theme')
    if (localTheme) {
      setTheme(localTheme)
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark')
    } else {
      setTheme('light')
    }
    setThemeConfigured(true)
  }, [])

  return { theme, toggleTheme, themeConfigured }
}
