import React, { useState, useContext, useEffect, useCallback } from 'react'
import Hint from '../Hint'
import assets, { assetMap, EDG_ASSET_ID, KSM_ASSET_ID } from '../../assets'
import TokenInput from '../TokenInput'
import LabelOutput from '../LabelOutput'
import { TxButton } from '../TxButton'
import useSubstrate from '../../hooks/useSubstrate'
import { AccountContext, SettingsContext } from '../../context'
import { convertToAsset, convertAmount, shortenNumber } from '../../utils/conversion'
import BigNumber from 'bignumber.js'
import { PoolInputsContainer } from '../Pool'

export default function PoolLaunch() {
  const { api, keyring } = useSubstrate()
  const { theme } = useContext(SettingsContext)
  const { account, balances } = useContext(AccountContext)
  const accountPair = account && keyring.getPair(account)
  const defaultHint = 'Cannot find the pool? Add the desirable token pair and become its first liquidity provider'
  const [hint, setHint] = useState(defaultHint)
  const [status, setStatus] = useState('')
  const [fromAsset, setFromAsset] = useState(KSM_ASSET_ID)
  const [fromAssetAmount, setFromAssetAmount] = useState('')
  const [fromAssetError, setFromAssetError] = useState('')
  const [toAsset, setToAsset] = useState(EDG_ASSET_ID)
  const [toAssetAmount, setToAssetAmount] = useState('')
  const [toAssetError, setToAssetError] = useState('')
  const [priceInfo, setPriceInfo] = useState('')
  const [exchangeExists, setExchangeExists] = useState(false)

  useEffect(() => {
    if (toAssetError || fromAssetError || !toAssetAmount || !fromAssetAmount) {
      setPriceInfo('')
    } else {
      setPriceInfo(
        `${getPrice(fromAssetAmount, toAssetAmount)} ${assetMap.get(toAsset).symbol} / ${
          assetMap.get(fromAsset).symbol
        }`
      )
    }
  }, [fromAsset, fromAssetAmount, toAsset, toAssetError, toAssetAmount, fromAssetError])

  useEffect(() => {
    if (!status) {
      setHint(defaultHint)
    } else {
      setHint(status)
    }
  }, [status])

  useEffect(() => {
    if (fromAsset !== toAsset) {
      let unsubscribe
      const firstAsset = fromAsset < toAsset ? fromAsset : toAsset
      const secondAsset = fromAsset < toAsset ? toAsset : fromAsset
      api.query.dexPallet
        .exchanges(convertToAsset(firstAsset), convertToAsset(secondAsset), (exchange) => {
          if (exchange.get('invariant').toString() !== '0') {
            setExchangeExists(true)
            setHint(
              `There is already liquidity for
            ${assetMap.get(fromAsset).symbol} / ${assetMap.get(toAsset).symbol}
            now, please click Invest button to add more liquidity`
            )
          } else {
            setExchangeExists(false)
            setHint(defaultHint)
          }
        })
        .then((unsub) => {
          unsubscribe = unsub
        })
        .catch(console.error)
      return () => unsubscribe && unsubscribe()
    }
  }, [api.query.dexPallet, fromAsset, toAsset])

  const getPrice = (fromAssetamount, toAssetAmount) => {
    return shortenNumber(new BigNumber(toAssetAmount).div(fromAssetamount).toString(), 18)
  }

  const validateAsset = useCallback(
    (amount, assetId, setErrorFunc) => {
      if (fromAsset === toAsset) {
        setErrorFunc('cannot be the same asset')
        setHint(defaultHint)
      } else if (amount && (isNaN(amount) || Number.parseFloat(amount) <= 0)) {
        setErrorFunc('invalid amount')
      } else if (balances.get(assetId) && balances.get(assetId).lte(new BigNumber(amount))) {
        setErrorFunc('exceeds the balance')
      } else {
        setErrorFunc('')
      }
    },
    [balances, fromAsset, toAsset]
  )

  useEffect(() => validateAsset(fromAssetAmount, fromAsset, setFromAssetError), [
    fromAssetAmount,
    fromAsset,
    balances,
    validateAsset,
    account,
  ])

  useEffect(() => validateAsset(toAssetAmount, toAsset, setToAssetError), [
    toAssetAmount,
    toAsset,
    balances,
    validateAsset,
    account,
  ])

  useEffect(() => setStatus(''), [fromAsset, toAsset, toAssetAmount, account])

  const assetOptions = assets.map(({ assetId, symbol, lightLogo, darkLogo }) => ({
    key: assetId,
    value: assetId,
    text: symbol,
    image: theme === 'light' ? lightLogo : darkLogo,
  }))

  const inProgress = () => {
    return !!status && !status.includes('Finalized') && !status.includes('Error')
  }

  return (
    <PoolInputsContainer>
      <Hint text={hint} />
      <TokenInput
        options={assetOptions}
        label="Deposit"
        placeholder="0.0"
        disabled={inProgress()}
        dropdownDisabled={inProgress()}
        error={fromAssetError}
        onChangeAsset={setFromAsset}
        onChangeAmount={(e) => setFromAssetAmount(e.target.value)}
        asset={fromAsset}
        amount={fromAssetAmount}
      />
      <div>
        <TokenInput
          options={assetOptions}
          label="Deposit"
          placeholder="0.0"
          disabled={inProgress()}
          dropdownDisabled={inProgress()}
          error={toAssetError}
          onChangeAmount={(e) => setToAssetAmount(e.target.value)}
          onChangeAsset={setToAsset}
          asset={toAsset}
          amount={toAssetAmount}
        />
        <LabelOutput label="Initial price" value={priceInfo} />
        <LabelOutput label="Your shares" value="100%" />
      </div>
      <TxButton
        accountPair={accountPair}
        disabled={!!fromAssetError || !!toAssetError || !!exchangeExists || inProgress()}
        attrs={{
          palletRpc: 'dexPallet',
          callable: 'initializeExchange',
          inputParams: [
            convertToAsset(fromAsset),
            convertAmount(fromAsset, fromAssetAmount),
            convertToAsset(toAsset),
            convertAmount(toAsset, toAssetAmount),
          ],
          paramFields: [false, false, false, false],
        }}
        setStatus={setStatus}
        type="SIGNED-TX"
        label="Launch"
      />
    </PoolInputsContainer>
  )
}
