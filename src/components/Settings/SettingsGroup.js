import React from 'react'
import styled from 'styled-components'

function SettingsGroup(props) {
  const { header } = props
  return (
    <SettingsGroupContainer>
      <Header>{header}</Header>
      {props.children}
    </SettingsGroupContainer>
  )
}

const SettingsGroupContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: flex-start;
`

const Header = styled.div`
  font-weight: 600;
  margin-bottom: 10px;
`

export default SettingsGroup
