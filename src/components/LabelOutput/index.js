import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

function LabelOutput(props) {
  const { label, value } = props
  return (
    <LabelOutputContainer>
      <div>{label}:</div>
      <div>{value || '???'}</div>
    </LabelOutputContainer>
  )
}

const LabelOutputContainer = styled.div`
  display: flex;
  font-size: small;
  font-weight: lighter;
  justify-content: space-between;
  width: 100%;
  padding-left: 20px;
  padding-right: 20px;
`

LabelOutput.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
}

export default LabelOutput
