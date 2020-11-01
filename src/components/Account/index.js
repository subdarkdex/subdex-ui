import React, { useEffect, useContext } from 'react'
import useSubstrate from '../../hooks/useSubstrate'
import { AccountContext } from '../../context/AccountContext.js'
import styled from 'styled-components'
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
    <AccountContainer>
      <AccountItemRight>
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
      </AccountItemRight>
      <AccountItemLeft>
        <BalanceAnnotation address={account} assetId={KSM_ASSET_ID} showAssetSymbol={true} />
      </AccountItemLeft>
    </AccountContainer>
  )
}

const AccountContainer = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  border-radius: 1.2em;
  box-shadow: ${({ theme }) => theme.panelBoxShadow};
  background: ${({ theme }) => theme.panelBackground};
  border: 0.2em solid transparent;
  width: 251px;
  justify-items: center;
  font-size: 14px;
`

const AccountItemRight = styled.div`
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: auto;
  justify-content: center;
  width: 50%;
  order: 2;
`

const AccountItemLeft = styled.div`
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: auto;
  justify-content: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 50%;
  margin-left: 1.2em;
  border-right: 1px solid ${({ theme }) => theme.borderColor};
  order: 1;
`

export default function Account() {
  const { api, keyring } = useSubstrate()
  return keyring.getPairs && api.query ? <Main /> : null
}
