import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

function OptionButton(props) {
  return props.selected ? (
    <OptionButtonSelected onClick={props.onClick}>{props.children}</OptionButtonSelected>
  ) : (
    <OptionButtonUnselected onClick={props.onClick}>{props.children}</OptionButtonUnselected>
  )
}

const OptionButtonSelected = styled.div`
  width: 100px;
  height: 40px;
  border: 1px solid #9381ff;
  border-radius: 20px;
  opacity: 1;
  font-size: 14px;
  display: flex;
  align-items: center;
  align-content: center;
  justify-content: center;
  font-weight: bold;
  &:hover {
    cursor: pointer;
  }
`

const OptionButtonUnselected = styled.div`
  width: 100px;
  height: 40px;
  border: 1px solid #9381ff;
  border-radius: 20px;
  opacity: 1;
  font-size: 14px;
  display: flex;
  align-items: center;
  align-content: center;
  justify-content: center;
  font-weight: lighter;
  &:hover {
    cursor: pointer;
  }
`

OptionButton.propTypes = {
  selected: PropTypes.bool,
  onClick: PropTypes.func,
}

export default OptionButton
