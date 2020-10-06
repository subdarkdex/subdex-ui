import React, { useState, useContext } from 'react'
import './token-input.css'
import PropTypes from 'prop-types'
import { Dropdown } from 'semantic-ui-react'
import BalanceAnnotation from '../BalanceAnnotation'
import { AccountContext } from '../../context/AccountContext'
import { assetMap } from '../../assets'

function TokenInput(props) {
  const { account } = useContext(AccountContext)
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
    <div className="token-input-container">
      <div className="label-error-balance">
        <div>{label || ''}</div>
        <div className={error ? 'token-input-error' : 'token-input-no-error'}>{error}</div>
        <div>
          <BalanceAnnotation address={account} assetId={assetId} label="Balance: " />
        </div>
      </div>
      <div className="input-and-dropdown">
        <input onChange={onChangeAmount} value={amount} {...rest} style={{ fontSize: calcFontSize(amount) }} />
        <img src={assetMap.get(assetId).logo} alt="" width={22} />
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
      </div>
    </div>
  )
}

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
