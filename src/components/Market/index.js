import React from 'react'
import logo from './logo.png'
import Panel from '../Panel'
import './market.css'
import PropTypes from 'prop-types'

function Market({ marketPlace, marketEvents }) {
  return (
    <div className="market">
      <img className="logo" src={logo} alt="Logo" />
      <Panel>{marketPlace}</Panel>
      <Panel>{marketEvents}</Panel>
    </div>
  )
}

Market.propTypes = {
  marketPlace: PropTypes.object.isRequired,
  marketEvents: PropTypes.object.isRequired,
}

export default Market
