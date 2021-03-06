import React, { useContext, useState, useEffect } from 'react'
import Tabs from '../Tabs'
import TokenInput from '../TokenInput'
import assets, { assetMap, EDG_ASSET_ID, KSM_ASSET_ID } from '../../assets'
import LabelInput from '../LabelInput'
import { TxButton } from '../TxButton'
import useSubstrate from '../../hooks/useSubstrate'
import { AccountContext, SettingsContext } from '../../context'
import LabelOutput from '../LabelOutput'
import { isValidAddress } from '../../utils/address'
import BigNumber from 'bignumber.js'
import { convertToAsset, convertAmount, convertBalance, shortenNumber, truncDecimals } from '../../utils/conversion'
import { MarketPlace } from '../Market'

export default function Swap() {
  const { api, keyring } = useSubstrate()
  const { theme, slippage } = useContext(SettingsContext)
  const { account, balances } = useContext(AccountContext)
  const accountPair = account && keyring.getPair(account)
  const [status, setStatus] = useState('')
  const [fromAsset, setFromAsset] = useState(KSM_ASSET_ID)
  const [fromAssetAmount, setFromAssetAmount] = useState('')
  const [fromAssetError, setFromAssetError] = useState('')
  const [fromAssetPool, setFromAssetPool] = useState('')
  const [toAsset, setToAsset] = useState(EDG_ASSET_ID)
  const [toAssetAmount, setToAssetAmount] = useState('')
  const [toAssetPool, setToAssetPool] = useState('')
  const [toAssetError, setToAssetError] = useState('')
  const [receiver, setReceiver] = useState(account)
  const [receiverError, setReceiverError] = useState('')
  const [price, setPrice] = useState('')
  const [minReceived, setMinReceived] = useState('')
  const [exchangeInvariant, setExchangeInvariant] = useState('')
  const [exchangeExists, setExchangeExists] = useState(false)

  const feeRate = new BigNumber(3)
  const feePrecision = new BigNumber(1000)
  const minReceivedPercent = feePrecision.minus(new BigNumber(slippage)).div(feePrecision)

  useEffect(() => setReceiver(account), [account])

  useEffect(() => validateReceiver(receiver), [receiver])

  useEffect(() => setStatus(''), [fromAsset, fromAssetAmount, toAsset, toAssetAmount, account])

  useEffect(() => {
    let unsubscribe
    const firstAsset = fromAsset < toAsset ? fromAsset : toAsset
    const secondAsset = fromAsset < toAsset ? toAsset : fromAsset
    api.query.dexPallet
      .exchanges(convertToAsset(firstAsset), convertToAsset(secondAsset), (exchange) => {
        if (exchange.get('invariant').toString() === '0') {
          setExchangeExists(false)
          setFromAssetPool('')
          setToAssetPool('')
          setExchangeInvariant('')
        } else {
          setExchangeExists(true)
          const fromAssetPool =
            fromAsset < toAsset ? exchange.get('first_asset_pool') : exchange.get('second_asset_pool')
          const toAssetPool = fromAsset < toAsset ? exchange.get('second_asset_pool') : exchange.get('first_asset_pool')
          setFromAssetPool(fromAssetPool.toString())
          setToAssetPool(toAssetPool.toString())
          setExchangeInvariant(exchange.get('invariant').toString())
        }
      })
      .then((unsub) => {
        unsubscribe = unsub
      })
      .catch(console.error)
    return () => unsubscribe && unsubscribe()
  }, [api.query.dexPallet, fromAsset, toAsset])

  useEffect(() => {
    const validate = (fromAsset, fromAssetAmount, toAsset, toAssetAmount, exchangeExists) => {
      if (fromAsset === toAsset) {
        setFromAssetError('cannot be the same asset')
        setToAssetError('cannot be the same asset')
      } else if (!exchangeExists) {
        setFromAssetError('no exchange exists')
        setToAssetError('no exchange exists')
      } else {
        if (fromAssetAmount && (isNaN(fromAssetAmount) || fromAssetAmount <= 0)) {
          setFromAssetError('invalid amount')
        } else if (!!fromAssetPool && new BigNumber(fromAssetPool).lt(convertAmount(fromAsset, fromAssetAmount))) {
          setFromAssetError(
            `exceeds pool size: ${shortenNumber(convertBalance(fromAsset, fromAssetPool).toString(), 8)}`
          )
        } else if (balances.get(fromAsset) && balances.get(fromAsset).lt(new BigNumber(fromAssetAmount))) {
          setFromAssetError('exceeds the balance')
        } else {
          setFromAssetError('')
        }
        if (toAssetAmount && (isNaN(toAssetAmount) || toAssetAmount <= 0)) {
          setToAssetError('invalid amount')
        } else if (!!toAssetPool && new BigNumber(toAssetPool).lt(convertAmount(toAsset, toAssetAmount))) {
          setToAssetError(`exceeds pool size: ${shortenNumber(convertBalance(toAsset, toAssetPool).toString(), 8)}`)
        } else if (balances.get(toAsset) && balances.get(toAsset).lt(new BigNumber(toAssetAmount))) {
          setToAssetError('exceeds the balance')
        } else {
          setToAssetError('')
        }
      }
    }

    const calculateAmountOut = (amountIn, fromAssetPool, toAssetPool, invariant) => {
      const newFromAssetPool = new BigNumber(fromAssetPool).plus(amountIn)
      const fee = new BigNumber(amountIn).multipliedBy(feeRate).div(feePrecision)
      const tempFromAssetPool = newFromAssetPool.minus(fee)
      const newToAssetPool = new BigNumber(invariant).div(tempFromAssetPool)
      return new BigNumber(toAssetPool).minus(newToAssetPool)
    }

    const setToAssetAmountAndPrice = (amountIn, amountOut) => {
      const toAssetAmount = truncDecimals(toAsset, convertBalance(toAsset, amountOut).toString())
      const minToAssetAmount = truncDecimals(
        toAsset,
        convertBalance(toAsset, amountOut.multipliedBy(minReceivedPercent)).toString()
      )
      setToAssetAmount(toAssetAmount)
      setMinReceived(minToAssetAmount)
      setPrice(
        `${amountOut.div(amountIn).toString()} ${assetMap.get(toAsset).symbol} /  ${assetMap.get(fromAsset).symbol}`
      )
    }

    validate(fromAsset, fromAssetAmount, toAsset, toAssetAmount, exchangeExists)
    if (!fromAssetError && fromAssetAmount) {
      const amountIn = convertAmount(fromAsset, fromAssetAmount)
      const amountOut = calculateAmountOut(amountIn, fromAssetPool, toAssetPool, exchangeInvariant)
      setToAssetAmountAndPrice(amountIn, amountOut)
    } else {
      setToAssetAmount('')
      setPrice('')
      setMinReceived('')
    }
  }, [
    fromAsset,
    fromAssetError,
    fromAssetAmount,
    fromAssetPool,
    toAsset,
    toAssetError,
    toAssetPool,
    toAssetAmount,
    exchangeExists,
    exchangeInvariant,
    minReceivedPercent,
    feePrecision,
    feeRate,
    balances,
    account,
  ])

  const validateReceiver = (receiver) => {
    if (receiver && !isValidAddress(receiver)) {
      setReceiverError('invalid address')
    } else {
      setReceiverError('')
    }
  }

  useEffect(() => {
    if (status && status.includes('Finalized')) {
      setFromAssetAmount('')
    }
  }, [status])

  const inProgress = () => {
    return !!status && !status.includes('Finalized') && !status.includes('Error')
  }

  const options = assets.map(({ assetId, symbol, lightLogo, darkLogo }) => ({
    key: assetId,
    value: assetId,
    text: symbol,
    image: theme === 'light' ? lightLogo : darkLogo,
  }))

  return (
    <>
      <Tabs active={'swap'} />
      <MarketPlace>
        <TokenInput
          options={options}
          label="Send"
          placeholder="Type here"
          disabled={inProgress()}
          dropdownDisabled={inProgress()}
          error={fromAssetError}
          onChangeAmount={(e) => {
            setFromAssetAmount(e.target.value)
          }}
          onChangeAsset={setFromAsset}
          asset={fromAsset}
          amount={fromAssetAmount}
        />
        <TokenInput
          options={options}
          label="Receive"
          placeholder="Read only"
          error={toAssetError}
          disabled={inProgress()}
          dropdownDisabled={inProgress()}
          onChangeAsset={setToAsset}
          asset={toAsset}
          amount={toAssetAmount}
        />
        <div>
          <LabelInput
            label="Receiver"
            placeholder="receiving address"
            value={receiver || ''}
            error={receiverError}
            disabled={inProgress()}
            onChange={(e) => setReceiver(e.target.value)}
          />
          <LabelOutput label="Price" value={price} />
          <LabelOutput label="Min Received" value={minReceived} />
        </div>
        <TxButton
          accountPair={accountPair}
          disabled={!!fromAssetError || !!toAssetError || !!receiverError || inProgress()}
          attrs={{
            palletRpc: 'dexPallet',
            callable: 'swapExactTo',
            inputParams: [
              convertToAsset(fromAsset),
              convertAmount(fromAsset, fromAssetAmount),
              convertToAsset(toAsset),
              convertAmount(toAsset, minReceived),
              receiver,
            ],
            paramFields: [false, false, false, false, false],
          }}
          setStatus={setStatus}
          type="SIGNED-TX"
          label="Swap"
        />
      </MarketPlace>
    </>
  )
}
