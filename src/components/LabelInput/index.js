import React from 'react'
import './label-input.css'
import PropTypes from 'prop-types'

function LabelInput(props) {
  const { label, error, value, ...rest } = props
  const calcFontSize = (value) => {
    if (!value || value.length < 20) return 19
    if (value.length < 36) return 16
    if (value.length < 45) return 13
    if (value.length < 48) return 12
    return 10
  }
  return (
    <div className="label-input-container">
      <div className="label-and-error">
        <div className="label-input-label">{label || ''}</div>
        <div className={error ? 'label-input-error' : 'label-input-no-error'}>{error}</div>
      </div>
      <input value={value} {...rest} style={{ fontSize: calcFontSize(value) }} />
    </div>
  )
}

LabelInput.propTypes = {
  label: PropTypes.string,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  type: PropTypes.string,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  tabIndex: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
}

export default LabelInput
