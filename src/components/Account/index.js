import React, { useEffect, useContext } from 'react'
import useSubstrate from '../../hooks/useSubstrate'
import { AccountContext } from '../../context/AccountContext.js'
import './account.css'
import { Dropdown } from 'semantic-ui-react'
import shorten from '../../utils/address'
import BalanceAnnotation from '../BalanceAnnotation'
import { KSM_ASSET_ID } from '../../assets'
import Identicon from '@polkadot/react-identicon'

function Main() {
  const { keyring } = useSubstrate()
  const { account, setAccount } = useContext(AccountContext)

  // Get the list of accounts we possess the private key for
  const keyringOptions = keyring.getPairs().map((account) => ({
    key: account.address,
    value: account.address,
    text: shorten(account.address),
    icon: <Identicon value={account.address} theme={'beachball'} size={20} style={{ paddingRight: 10 }} />,
  }))

  const initialAddress = keyringOptions.length > 0 ? keyringOptions[0].value : ''

  // Set the initial address
  useEffect(() => {
    setAccount(initialAddress)
  }, [initialAddress, setAccount])

  const onChange = (address) => {
    // Update state with new account address
    setAccount(address)
  }

  return (
    <div className="account-container">
      <div className="account-item-right">
        <Dropdown
          fluid
          search
          selection
          placeholder="Select an account"
          options={keyringOptions}
          onChange={(_, dropdown) => {
            onChange(dropdown.value)
          }}
          value={account}
        />
      </div>
      <BalanceAnnotation
        address={account}
        assetId={KSM_ASSET_ID}
        showAssetSymbol={true}
        className="account-item-left"
      />
    </div>
  )
}

export default function Account() {
  const { api, keyring } = useSubstrate()
  return keyring.getPairs && api.query ? <Main /> : null
}
