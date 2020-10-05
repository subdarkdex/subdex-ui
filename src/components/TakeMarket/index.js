import React from 'react'
import Take from '../Take'
import TakeEvents from '../TakeEvents'
import Market from '../Market'

export default function TakeMarket() {
  return <Market marketPlace={<Take />} marketEvents={<TakeEvents />} />
}
