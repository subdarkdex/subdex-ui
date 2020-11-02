import React from 'react'
import Node from '../Node'
import Account from '../Account'
import styled from 'styled-components'
import Settings from '../Settings'

export default function Header() {
  return (
    <HeaderBar>
      <Node />
      <AccountAndSettings>
        <Account />
        <Settings />
      </AccountAndSettings>
    </HeaderBar>
  )
}

const HeaderBar = styled.div`
  width: 100%;
  max-width: 1680px;
  margin-top: 20px;
  margin-right: auto;
  margin-left: auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
`

const AccountAndSettings = styled.div`
  display: flex;
  align-items: center;
  justify-items: center;
`
