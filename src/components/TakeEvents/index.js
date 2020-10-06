import React, { useContext, useState, useEffect } from 'react'
import { EventsContext } from '../../context/EventsContext'
import './take-events.css'
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
    <table className="take-events">
      <thead>
        <tr>
          <th className="take-events-user">User</th>
          <th className="take-events-asset">Asset</th>
          <th className="take-events-time">Time</th>
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
    </table>
  )
}
