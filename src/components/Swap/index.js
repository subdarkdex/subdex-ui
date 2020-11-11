import React, { useContext, useState, useEffect, useCallback } from 'react'
import Tabs from '../Tabs'
import TokenInput from '../TokenInput'
import assets, { assetMap, EDG_ASSET_ID, KSM_ASSET_ID } from '../../assets'
import LabelInput from '../LabelInput'
import { TxButton } from '../TxButton'
import useSubstrate from '../../hooks/useSubstrate'
import { AccountContext } from '../../context/AccountContext'
import LabelOutput from '../LabelOutput'
import { isValidAddress } from '../../utils/address'
import BigNumber from 'bignumber.js'
import { convertAmount, convertBalance, shortenNumber, truncDecimals } from '../../utils/conversion'
import { MarketPlace } from '../Market'
import { ThemeContext } from '../../context/ThemeContext'

export default function Swap() {
  const { api, keyring } = useSubstrate()
  const { theme } = useContext(ThemeContext)
  const { account, balances } = useContext(AccountContext)
  const accountPair = account && keyring.getPair(account)
  const [status, setStatus] = useState('')
  const [fromAsset, setFromAsset] = useState(KSM_ASSET_ID)
  const [fromAssetAmount, setFromAssetAmount] = useState('')
  const [fromAssetError, setFromAssetError] = useState('')
  const [fromAssetPool, setFromAssetPool] = useState('')
  const [fromKsmPool, setFromKsmPool] = useState('')
  const [fromExchangeInvariant, setFromExchangeInvariant] = useState('')
  const [toAsset, setToAsset] = useState(EDG_ASSET_ID)
  const [toAssetAmount, setToAssetAmount] = useState('')
  const [toAssetPool, setToAssetPool] = useState('')
  const [toKsmPool, setToKsmPool] = useState('')
  const [toExchangeInvariant, setToExchangeInvariant] = useState('')
  const [toAssetError, setToAssetError] = useState('')
  const [receiver, setReceiver] = useState(account)
  const [receiverError, setReceiverError] = useState('')
  const [price, setPrice] = useState('')
  const [minReceived, setMinReceived] = useState('')
  const [fromExchangeExists, setFromExchangeExists] = useState(false)
  const [toExchangeExists, setToExchangeExists] = useState(false)

  const validate = useCallback(
    (fromAsset, fromAssetAmount, toAsset, toAssetAmount) => {
      if (fromAsset === toAsset) {
        setFromAssetError('it cannot be the same asset')
        setToAssetError('it cannot be the same asset')
      } else {
        if (fromAssetAmount && (isNaN(fromAssetAmount) || fromAssetAmount <= 0)) {
          setFromAssetError('invalid amount')
        } else if (
          fromAsset === KSM_ASSET_ID &&
          !!toKsmPool &&
          new BigNumber(toKsmPool).lte(convertAmount(fromAsset, fromAssetAmount))
        ) {
          setFromAssetError(
            `exceeds pool size: ${shortenNumber(convertBalance(KSM_ASSET_ID, toKsmPool).toString(), 8)}`
          )
        } else if (!!fromAssetPool && new BigNumber(fromAssetPool).lte(convertAmount(fromAsset, fromAssetAmount))) {
          setFromAssetError(
            `exceeds pool size: ${shortenNumber(convertBalance(fromAsset, fromAssetPool).toString(), 8)}`
          )
        } else if (balances.get(fromAsset) && balances.get(fromAsset).lte(new BigNumber(fromAssetAmount))) {
          setFromAssetError('exceeds the balance')
        } else {
          setFromAssetError('')
        }
        if (toAssetAmount && (isNaN(toAssetAmount) || toAssetAmount <= 0)) {
          setToAssetError('invalid amount')
        } else if (
          toAsset === KSM_ASSET_ID &&
          !!fromKsmPool &&
          new BigNumber(fromKsmPool).lte(convertAmount(toAsset, toAssetAmount))
        ) {
          setToAssetError(
            `exceeds pool size: ${shortenNumber(convertBalance(KSM_ASSET_ID, fromKsmPool).toString(), 8)}`
          )
        } else if (!!toAssetPool && new BigNumber(toAssetPool).lte(convertAmount(toAsset, toAssetAmount))) {
          setToAssetError(`exceeds pool size: ${shortenNumber(convertBalance(toAsset, toAssetPool).toString(), 8)}`)
        } else if (balances.get(toAsset) && balances.get(toAsset).lte(new BigNumber(toAssetAmount))) {
          setToAssetError('exceeds the balance')
        } else {
          setToAssetError('')
        }
      }
    },
    [balances, fromAssetPool, fromKsmPool, toAssetPool, toKsmPool]
  )

  useEffect(() => setReceiver(account), [account])

  useEffect(() => validateReceiver(receiver), [receiver])

  useEffect(() => setStatus(''), [fromAsset, fromAssetAmount, toAsset, toAssetAmount, account])

  useEffect(() => {
    validate(fromAsset, fromAssetAmount, toAsset, toAssetAmount)
    let fromAssetUnsub, toAssetUnsub
    if (fromAsset === KSM_ASSET_ID) {
      setFromExchangeExists(true)
    } else {
      api.query.dexPallet
        .exchanges(fromAsset, (exchange) => {
          updateFromAssetStates(exchange)
        })
        .then((unsub) => {
          fromAssetUnsub = unsub
        })
        .catch(console.error)
    }
    if (toAsset === KSM_ASSET_ID) {
      setToExchangeExists(true)
    } else {
      api.query.dexPallet
        .exchanges(toAsset, (exchange) => {
          updateToAssetStates(exchange)
        })
        .then((unsub) => {
          toAssetUnsub = unsub
        })
        .catch(console.error)
    }
    return () => {
      fromAssetUnsub && fromAssetUnsub()
      toAssetUnsub && toAssetUnsub()
    }
  }, [api.query.dexPallet, fromAsset, fromAssetAmount, toAsset, toAssetAmount, validate])

  useEffect(() => {
    const setToAssetAmountAndPrice = (amountIn, amountOut) => {
      const toAssetAmount = truncDecimals(toAsset, convertBalance(toAsset, amountOut).toString())
      setToAssetAmount(toAssetAmount)
      setMinReceived(toAssetAmount)
      setPrice(
        `${amountOut.div(amountIn).toString()} ${assetMap.get(toAsset).symbol} /  ${assetMap.get(fromAsset).symbol}`
      )
    }
    if (!fromAssetError && !toAssetError && fromAssetAmount && fromExchangeExists && toExchangeExists) {
      const amountIn = convertAmount(fromAsset, fromAssetAmount)
      if (fromAsset === KSM_ASSET_ID) {
        const amountOut = calculateAmountOut(amountIn, fromAsset, toAsset, toKsmPool, toAssetPool, toExchangeInvariant)
        setToAssetAmountAndPrice(amountIn, amountOut)
      } else if (toAsset === KSM_ASSET_ID) {
        const amountOut = calculateAmountOut(
          amountIn,
          fromAsset,
          toAsset,
          fromAssetPool,
          fromKsmPool,
          fromExchangeInvariant
        )
        setToAssetAmountAndPrice(amountIn, amountOut)
      } else {
        const ksmAmount = calculateAmountOut(
          amountIn,
          fromAsset,
          KSM_ASSET_ID,
          fromAssetPool,
          fromKsmPool,
          fromExchangeInvariant
        )
        const amountOut = calculateAmountOut(
          ksmAmount,
          KSM_ASSET_ID,
          toAsset,
          toKsmPool,
          toAssetPool,
          toExchangeInvariant
        )
        setToAssetAmountAndPrice(amountIn, amountOut)
      }
    } else {
      setToAssetAmount('')
      setPrice('')
      setMinReceived('')
    }
  }, [
    fromAssetError,
    fromAssetAmount,
    toAssetError,
    toAsset,
    fromExchangeExists,
    toExchangeExists,
    fromAsset,
    toKsmPool,
    toAssetPool,
    toExchangeInvariant,
    fromAssetPool,
    fromKsmPool,
    fromExchangeInvariant,
  ])

  const updateFromAssetStates = (exchange) => {
    if (exchange.get('invariant').toString() === '0') {
      setFromExchangeExists(false)
      setFromAssetError('no exchange exists')
      setFromKsmPool('')
      setFromAssetPool('')
      setFromExchangeInvariant('')
    } else {
      setFromExchangeExists(true)
      setFromKsmPool(exchange.get('ksm_pool').toString())
      setFromAssetPool(exchange.get('token_pool').toString())
      setFromExchangeInvariant(exchange.get('invariant').toString())
    }
  }

  function updateToAssetStates(exchange) {
    if (exchange.get('invariant').toString() === '0') {
      setToExchangeExists(false)
      setToAssetError('no exchange exists')
      setToKsmPool('')
      setToAssetPool('')
      setToExchangeInvariant('')
    } else {
      setToExchangeExists(true)
      setToKsmPool(exchange.get('ksm_pool').toString())
      setToAssetPool(exchange.get('token_pool').toString())
      setToExchangeInvariant(exchange.get('invariant').toString())
    }
  }

  const calculateAmountOut = (amountIn, fromAssetId, toAssetId, fromAssetPool, toAssetPool, invariant) => {
    const newFromAssetPool = new BigNumber(fromAssetPool).plus(amountIn)
    const fee = new BigNumber(amountIn).multipliedBy(3).div(1000)
    const tempFromAssetPool = newFromAssetPool.minus(fee)
    const newToAssetPool = new BigNumber(invariant).div(tempFromAssetPool)
    return new BigNumber(toAssetPool).minus(newToAssetPool)
  }

  const validateReceiver = (receiver) => {
    if (receiver && !isValidAddress(receiver)) {
      setReceiverError('invalid address')
    } else {
      setReceiverError('')
    }
  }

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
          onChangeAmount={(e) => setFromAssetAmount(e.target.value)}
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
          readOnly={true}
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
            callable: 'swap',
            inputParams: [
              fromAsset,
              convertAmount(fromAsset, fromAssetAmount),
              toAsset,
              convertAmount(toAsset, toAssetAmount),
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
