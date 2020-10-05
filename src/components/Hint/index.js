import React from 'react'
import './hint.css'
import PropTypes from 'prop-types'

function Hint(props) {
  return (
    <div className="hint">
      <div>&#9432;</div>
      <div className="hint-text">{props.text}</div>
    </div>
  )
}

Hint.propTypes = {
  text: PropTypes.string.isRequired,
}

export default Hint
