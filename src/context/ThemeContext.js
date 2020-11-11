import React, { createContext } from 'react'
import { useDarkMode } from '../hooks'

const ThemeContext = createContext(null)

const ThemeContextProvider = (props) => {
  const { theme, themeConfigured, toggleTheme } = useDarkMode()
  return <ThemeContext.Provider value={{ theme, themeConfigured, toggleTheme }}>{props.children}</ThemeContext.Provider>
}

export { ThemeContext, ThemeContextProvider }
