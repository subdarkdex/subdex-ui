import React from 'react'
import './label-output.css'
import PropTypes from 'prop-types'

function LabelOutput(props) {
  const { label, value } = props
  return (
    <div className="label-output-container">
      <div>{label}:</div>
      <div>{value || '???'}</div>
    </div>
  )
}

LabelOutput.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
}

export default LabelOutput
