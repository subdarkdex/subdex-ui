import React, { useContext, useState, useEffect } from 'react'
import { EventsContext } from '../../context'
import styled from 'styled-components'
import describe from '../../utils/time'
import shorten from '../../utils/address'

export default function TakeEvents() {
  const [currentTime, setCurrentTime] = useState(Date.now())
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [])
  const { takeEvents } = useContext(EventsContext)
  return (
    <TakeEventsTable>
      <thead>
        <tr>
          <TakeEventsTableHeaderUser>User</TakeEventsTableHeaderUser>
          <TakeEventsTableHeaderAsset>Asset</TakeEventsTableHeaderAsset>
          <TakeEventsTableHeaderTime>Time</TakeEventsTableHeaderTime>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colSpan={3}>&nbsp;</td>
        </tr>
        {takeEvents.map(({ account, asset, amount, time }) => (
          <tr>
            <td>{shorten(account)}</td>
            <td>
              {amount} {asset}
            </td>
            <td>{describe(currentTime - time)} ago</td>
          </tr>
        ))}
      </tbody>
    </TakeEventsTable>
  )
}

const TakeEventsTable = styled.table`
  width: 100%;
`

const TakeEventsTableHeaderUser = styled.th`
  width: 35%;
`

const TakeEventsTableHeaderAsset = styled.th`
  width: 35%;
`

const TakeEventsTableHeaderTime = styled.th`
  width: 30%;
`
