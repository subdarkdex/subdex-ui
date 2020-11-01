import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

function Hint(props) {
  return (
    <HintContainer>
      <div>&#9432;</div>
      <HintText>{props.text}</HintText>
    </HintContainer>
  )
}

const HintContainer = styled.div`
  width: 100%;
  display: flex;
  font-size: 12px;
  align-items: baseline;
  padding-left: 5px;
  color: ${({ theme }) => theme.hintColor};
`

const HintText = styled.div`
  width: 95%;
  font-weight: lighter;
  padding-left: 10px;
  word-wrap: break-word;
`

Hint.propTypes = {
  text: PropTypes.string.isRequired,
}

export default Hint
