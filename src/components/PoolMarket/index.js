import React from 'react'
import Market from '../Market'
import PoolEvents from '../PoolEvents'
import Pool from '../Pool'

export default function PoolMarket() {
  return <Market marketPlace={<Pool />} marketEvents={<PoolEvents />} />
}
