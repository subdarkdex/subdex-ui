import React, { useContext } from 'react'
import styled from 'styled-components'
import { Radio } from 'semantic-ui-react'
import { SettingsContext } from '../../context'

function DarkMode() {
  const { theme, toggleTheme } = useContext(SettingsContext)
  return (
    <DarkModeContainer>
      <div>Toggle Dark Mode</div>
      <Radio toggle={true} checked={theme === 'dark'} onClick={toggleTheme} />
    </DarkModeContainer>
  )
}

const DarkModeContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`

export default DarkMode
