import React from 'react'
import './option-button.css'
import PropTypes from 'prop-types'

function OptionButton(props) {
  return (
    <div className={props.selected ? 'option-button selected' : 'option-button unselected'} onClick={props.onClick}>
      {props.children}
    </div>
  )
}

OptionButton.propTypes = {
  selected: PropTypes.bool,
  onClick: PropTypes.func,
}

export default OptionButton
