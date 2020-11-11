import React, { useContext, useEffect, useState } from 'react'
import { EventsContext } from '../../context'
import styled from 'styled-components'
import describe from '../../utils/time'

export default function PoolEvents() {
  const [currentTime, setCurrentTime] = useState(Date.now())
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [])
  const { poolEvents } = useContext(EventsContext)
  return (
    <PoolEventsTable>
      <thead>
        <tr>
          <PoolEventsTableHeader>Type</PoolEventsTableHeader>
          <PoolEventsTableHeader>Pair</PoolEventsTableHeader>
          <PoolEventsTableHeader>Shares</PoolEventsTableHeader>
          <PoolEventsTableHeaderTime>Time</PoolEventsTableHeaderTime>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colSpan={4}>&nbsp;</td>
        </tr>
        {poolEvents.map(({ type, asset, shares, time }, index) => (
          <tr key={index}>
            <td>{type}</td>
            <td>{asset}/KSM</td>
            <td>{shares}</td>
            <td>{describe(currentTime - time)} ago</td>
          </tr>
        ))}
      </tbody>
    </PoolEventsTable>
  )
}

const PoolEventsTable = styled.table`
  width: 100%;
`

const PoolEventsTableHeader = styled.th`
  width: 23%;
`

const PoolEventsTableHeaderTime = styled.th`
  width: 31%;
`
