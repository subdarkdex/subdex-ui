import React, { createContext, useState, useEffect } from 'react'
import useSubstrate from '../hooks/useSubstrate'
import { assetMap } from '../assets'
import { convertToAssetId } from '../utils/conversion'

const QUEUE_LENGTH = 19

const EventsContext = createContext(null)

const EventsContextProvider = (props) => {
  const [swapEvents, setSwapEvents] = useState([])
  const [poolEvents, setPoolEvents] = useState([])
  const [takeEvents, setTakeEvents] = useState([])
  const { api } = useSubstrate()
  useEffect(() => {
    api.query.system.events((events) => {
      events.forEach((record) => {
        const { event } = record
        const eventName = event.method
        const params = event.data.map((data) => data.toString())
        console.log(eventName, params)
        switch (eventName) {
          case 'Exchanged':
            setSwapEvents((e) => {
              const copy = [
                {
                  soldAssetId: convertToAssetId(params[1]),
                  soldAmount: params[2],
                  boughtAssetId: convertToAssetId(params[3]),
                  boughtAmount: params[4],
                  time: Date.now(),
                },
                ...e,
              ]
              if (copy.length >= QUEUE_LENGTH) {
                copy.pop()
              }
              return copy
            })
            break
          case 'Invested':
            setPoolEvents((e) => {
              console.log(params[1], 'converted to', convertToAssetId(params[1]))
              console.log(params[2], 'converted to', convertToAssetId(params[2]))
              const copy = [
                {
                  type: 'Add',
                  asset1: assetMap.get(convertToAssetId(params[1])).symbol,
                  asset2: assetMap.get(convertToAssetId(params[2])).symbol,
                  shares: params[3],
                  time: Date.now(),
                },
                ...e,
              ]
              if (copy.length >= QUEUE_LENGTH) {
                copy.pop()
              }
              return copy
            })
            break
          case 'Divested':
            setPoolEvents((e) => {
              const copy = [
                {
                  type: 'Remove',
                  asset1: assetMap.get(convertToAssetId(params[1])).symbol,
                  asset2: assetMap.get(convertToAssetId(params[2])).symbol,
                  shares: params[3],
                  time: Date.now(),
                },
                ...e,
              ]
              if (copy.length >= QUEUE_LENGTH) {
                copy.pop()
              }
              return copy
            })
            break
          case 'Withdrawn':
            setTakeEvents((e) => {
              const copy = [
                {
                  account: params[0],
                  asset: assetMap.get(convertToAssetId(params[1])).symbol,
                  amount: params[2],
                  time: Date.now(),
                },
                ...e,
              ]
              if (copy.length >= QUEUE_LENGTH) {
                copy.pop()
              }
              return copy
            })
            break
          default:
          // do nothing
        }
      })
    })
  }, [api.query.system])
  return (
    <EventsContext.Provider value={{ swapEvents, poolEvents, takeEvents }}>{props.children}</EventsContext.Provider>
  )
}

export { EventsContext, EventsContextProvider }
