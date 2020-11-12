import React, { createContext } from 'react'
import { useDarkMode, useSlippage } from '../hooks'

const SettingsContext = createContext(null)

const SettingsContextProvider = (props) => {
  return (
    <SettingsContext.Provider value={{ ...useSlippage(), ...useDarkMode() }}>{props.children}</SettingsContext.Provider>
  )
}

export { SettingsContext, SettingsContextProvider }
