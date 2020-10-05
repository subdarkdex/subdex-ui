import React, { useState, useContext } from 'react'
import useSubstrate from '../../hooks/useSubstrate'
import { Dropdown } from 'semantic-ui-react'
import './node.css'
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
    <div className="nodeContainer">
      <div>
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
      </div>
    </div>
  )
}
