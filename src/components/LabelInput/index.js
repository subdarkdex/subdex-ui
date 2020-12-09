import React from 'react'
import styled from 'styled-components'
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
    <LabelInputContainer>
      <LabelAndError>
        <Label>{label || ''}</Label>
        {error ? <Error>{error}</Error> : ''}
      </LabelAndError>
      <Input value={value} {...rest} style={{ fontSize: calcFontSize(value) }} />
    </LabelInputContainer>
  )
}

const LabelInputContainer = styled.div`
  width: 350px;
  height: 70px;
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 20px;
  padding: 10px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`

const LabelAndError = styled.div`
  font-weight: lighter;
  font-size: 14px;
  display: flex;
`

const Label = styled.div`
  margin-right: 20px;
`

const Error = styled.div`
  color: ${({ theme }) => theme.errorColor};
`

const Input = styled.input`
  background: transparent;
  border: none;
  font-weight: lighter;
  font-size: 19px;
  color: ${({ theme }) => theme.textColor};
  &:focus {
    outline: 0;
  }
`

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
