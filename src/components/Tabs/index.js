import React from 'react'
import PropTypes from 'prop-types'
import { NavLink } from 'react-router-dom'
import './tabs.css'

export function Tabs({ active }) {
  return (
    <div className="tabs">
      <NavLink to={'/swap'} isActive={() => active === 'swap'}>
        Swap
      </NavLink>
      <NavLink to={'/pool'} isActive={() => active === 'pool'}>
        Pool
      </NavLink>
      <NavLink to={'/take'} isActive={() => active === 'take'}>
        Take
      </NavLink>
    </div>
  )
}

Tabs.propTypes = {
  active: PropTypes.string.isRequired,
}

export default Tabs
