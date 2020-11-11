import React, { useState, useContext } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { Dropdown } from 'semantic-ui-react'
import BalanceAnnotation from '../BalanceAnnotation'
import { AccountContext, ThemeContext } from '../../context'
import { assetMap } from '../../assets'

function TokenInput(props) {
  const { account } = useContext(AccountContext)
  const { theme } = useContext(ThemeContext)
  const { label, asset, amount, options, error, onChangeAsset, onChangeAmount, dropdownDisabled, ...rest } = props
  const [assetId, setAssetId] = useState(asset)
  const handleChangeAsset = (assetId) => {
    setAssetId(assetId)
    onChangeAsset && onChangeAsset(assetId)
  }
  const calcFontSize = (value) => {
    if (!value || value.length < 20) return 19
    if (value.length < 25) return 16
    if (value.length < 30) return 14
    return 12
  }
  return (
    <TokenInputContainer>
      <LabelErrorBalance>
        <div>{label || ''}</div>
        {error ? <Error>{error}</Error> : ''}
        <div>
          <BalanceAnnotation address={account} assetId={assetId} label="Balance: " />
        </div>
      </LabelErrorBalance>
      <InputAndDropdown>
        <input onChange={onChangeAmount} value={amount} {...rest} style={{ fontSize: calcFontSize(amount) }} />
        <img
          src={theme === 'light' ? assetMap.get(assetId).lightLogo : assetMap.get(assetId).darkLogo}
          alt=""
          width={22}
        />
        <Dropdown
          fluid
          search
          selection
          options={options}
          disabled={dropdownDisabled}
          onChange={(_, dropdown) => {
            handleChangeAsset(dropdown.value)
          }}
          value={asset}
        />
      </InputAndDropdown>
    </TokenInputContainer>
  )
}

const TokenInputContainer = styled.div`
  width: 350px;
  height: 70px;
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 20px;
  padding: 10px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`

const LabelErrorBalance = styled.div`
  font-weight: lighter;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
`

const Error = styled.div`
  color: orangered;
`

const InputAndDropdown = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  & > input {
    background: transparent;
    border: none;
    font-weight: lighter;
    font-size: 19px;
    color: ${({ theme }) => theme.textColor};
    width: 80%;
  }
  & > input:focus {
    outline: 0;
  }
  & > .ui.fluid.dropdown {
    width: 20%;
    padding-left: 0;
  }
  & > .ui.search.dropdown > .text {
    left: 10px;
  }
  & > .ui.selection.dropdown > .dropdown.icon {
    right: 0;
  }
  & > .ui.dropdown .menu > .item {
    display: flex;
    align-items: center;
  }
  & > .ui.dropdown .menu > .item > .image {
    width: 22px;
  }
  & > .ui.selection.dropdown .menu {
    width: calc(150% + 2px);
    left: -50%;
  }
  & > .ui.dropdown > .text > img {
    display: none;
  }
`

TokenInput.propTypes = {
  label: PropTypes.string,
  asset: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  options: PropTypes.array.isRequired,
  onChangeAsset: PropTypes.func,
  onChangeAmount: PropTypes.func,
  type: PropTypes.string,
  disabled: PropTypes.bool,
  dropdownDisabled: PropTypes.bool,
  tabIndex: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
}

export default TokenInput
