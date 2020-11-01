import useSubstrate from '../../hooks/useSubstrate'
import React, { useEffect, useState, useContext } from 'react'
import { convertBalance, shortenNumber } from '../../utils/conversion'
import { assetMap } from '../../assets'
import PropTypes from 'prop-types'
import 'react-tippy/dist/tippy.css'
import { Tooltip } from 'react-tippy'
import { AccountContext } from '../../context/AccountContext'

function BalanceAnnotation(props) {
  const { balances, setBalances } = useContext(AccountContext)
  const { assetId, address, label, showAssetSymbol } = props
  const { api } = useSubstrate()
  const [accountBalance, setAccountBalance] = useState(' ') // KEEP the space, it's required by Tooltip

  // When account address changes, update subscriptions
  useEffect(() => {
    let unsubscribe
    assetId !== undefined &&
      assetId !== null &&
      address &&
      api.query.genericAsset
        .freeBalance(assetId, address, (balance) => {
          const assetBalance = convertBalance(assetId, balance.toString())
          setBalances(balances.set(assetId, assetBalance))
          setAccountBalance(assetBalance.toString())
        })
        .then((unsub) => {
          unsubscribe = unsub
        })
        .catch(console.error)

    return () => unsubscribe && unsubscribe()
  }, [api, assetId, address, setBalances, balances])

  return address ? (
    <div>
      {label || ''}
      <Tooltip
        html={accountBalance}
        duration={1000}
        animation="fade"
        position="bottom"
        trigger="mouseenter"
        arrow={true}
      >
        {shortenNumber(accountBalance)}
      </Tooltip>
      {showAssetSymbol && assetMap.get(assetId).symbol}
    </div>
  ) : null
}

BalanceAnnotation.propTypes = {
  assetId: PropTypes.string.isRequired,
  address: PropTypes.string,
  label: PropTypes.string,
  showAssetSymbol: PropTypes.bool,
}

export default BalanceAnnotation
