import React from 'react'
import { Redirect } from 'react-router'

export function RedirectToSwapMarket({ location }) {
  return <Redirect to={{ ...location, pathname: '/swap' }} />
}
