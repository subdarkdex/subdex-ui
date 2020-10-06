import React, { useContext, useState, useEffect } from 'react'
import { EventsContext } from '../../context/EventsContext'
import './swap-events.css'
import describe from '../../utils/time'
import { convertBalance, shortenNumber } from '../../utils/conversion'
import { assetMap } from '../../assets'
import { Tooltip } from 'react-tippy'

export default function SwapEvents() {
  const [currentTime, setCurrentTime] = useState(Date.now())
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [])
  const { swapEvents } = useContext(EventsContext)
  return (
    <table className="swap-events">
      <thead>
        <tr>
          <th className="swap-events-sold">Sold</th>
          <th className="swap-events-bought">Bought</th>
          <th className="swap-events-time">Time</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colSpan={3}>&nbsp;</td>
        </tr>
        {swapEvents.map(({ soldAssetId, soldAmount, boughtAssetId, boughtAmount, time }, index) => (
          <tr key={index}>
            <td>
              <Tooltip
                title={convertBalance(soldAssetId, soldAmount).toString()}
                duration={1000}
                animation="fade"
                position="bottom"
                trigger="mouseenter"
                arrow={true}
              >
                {shortenNumber(convertBalance(soldAssetId, soldAmount).toString())}
              </Tooltip>
              &nbsp;
              {assetMap.get(soldAssetId).symbol}
            </td>
            <td>
              <Tooltip
                title={convertBalance(boughtAssetId, boughtAmount).toString()}
                duration={1000}
                animation="fade"
                position="bottom"
                trigger="mouseenter"
                arrow={true}
              >
                {shortenNumber(convertBalance(boughtAssetId, boughtAmount).toString())}
              </Tooltip>
              &nbsp;
              {assetMap.get(boughtAssetId).symbol}
            </td>
            <td>{describe(currentTime - time)} ago</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
