import React, { useContext, useState } from 'react'
import useSubstrate from '../../hooks/useSubstrate'
import { Dropdown } from 'semantic-ui-react'
import styled from 'styled-components'
import { SubstrateContext } from '../../context'
import dev from '../../config/development.json'
import prod from '../../config/production.json'

export default function Node() {
  const { socket } = useSubstrate()
  const [currentSocket, setCurrentSocket] = useState(socket)
  const [, dispatch] = useContext(SubstrateContext)

  const nodeOptions = [
    {
      key: 'dev',
      value: dev.PROVIDER_SOCKET,
      text: `${dev.PROVIDER_SOCKET} (Local)`,
    },
    {
      key: 'prod',
      value: prod.PROVIDER_SOCKET,
      text: `${prod.PROVIDER_SOCKET} (Hosted)`,
    },
  ]

  const onChange = (newSocket) => {
    setCurrentSocket(newSocket)
    dispatch({
      type: 'RESET_SOCKET',
      payload: newSocket,
    })
  }

  return (
    <NodeContainer>
      <Dropdown
        fluid
        search
        selection
        placeholder="Select a Node"
        options={nodeOptions}
        onChange={(_, dropdown) => {
          onChange(dropdown.value)
        }}
        value={currentSocket}
      />
    </NodeContainer>
  )
}

const NodeContainer = styled.div`
  border-radius: 1.2em;
  border: 0.2em solid transparent;
  width: 251px;
  font-size: 14px;
  box-shadow: ${({ theme }) => theme.panelBoxShadow};
  background: ${({ theme }) => theme.panelBackground};
  & .ui.selection.dropdown .menu {
    width: 100%;
    left: 0px;
  }
`
