import React from 'react'
import Market from '../Market'
import Swap from '../Swap'
import SwapEvents from '../SwapEvents'

export default function SwapMarket() {
  return <Market marketPlace={<Swap />} marketEvents={<SwapEvents />} />
}
