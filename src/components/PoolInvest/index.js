import React, { useState, useContext, useEffect, useCallback } from 'react'
import Hint from '../Hint'
import assets, { EDG_ASSET_ID, KSM_ASSET_ID, assetMap } from '../../assets'
import TokenInput from '../TokenInput'
import LabelOutput from '../LabelOutput'
import { TxButton } from '../TxButton'
import useSubstrate from '../../hooks/useSubstrate'
import { AccountContext, SettingsContext } from '../../context'
import { convertToAsset, convertBalance, shortenNumber } from '../../utils/conversion'
import BigNumber from 'bignumber.js'
import { PoolInputsContainer } from '../Pool'

export default function PoolInvest() {
  const { api, keyring } = useSubstrate()
  const { theme } = useContext(SettingsContext)
  const { account, balances } = useContext(AccountContext)
  const accountPair = account && keyring.getPair(account)
  const defaultHint = 'Invest your tokens to the liquidity pool and earn 3% of the trading fees'
  const [status, setStatus] = useState('')
  const [hint, setHint] = useState(defaultHint)
  const [fromAsset, setFromAsset] = useState(KSM_ASSET_ID)
  const [fromAssetAmount, setFromAssetAmount] = useState('')
  const [fromAssetError, setFromAssetError] = useState('')
  const [fromAssetPool, setFromAssetPool] = useState(new BigNumber(0))
  const [toAsset, setToAsset] = useState(EDG_ASSET_ID)
  const [toAssetAmount, setToAssetAmount] = useState('')
  const [toAssetError, setToAssetError] = useState('')
  const [toAssetPool, setToAssetPool] = useState(new BigNumber(0))
  const [poolInfo, setPoolInfo] = useState('')
  const [totalShares, setTotalShares] = useState(new BigNumber(0))
  const [shares, setShares] = useState(new BigNumber(0))
  const [sharesInfo, setSharesInfo] = useState('')
  const [exchangeExists, setExchangeExists] = useState(false)

  useEffect(() => {
    let unsubscribe
    if (fromAsset === toAsset) {
      clearPoolData()
    } else {
      const firstAsset = fromAsset < toAsset ? fromAsset : toAsset
      const secondAsset = fromAsset < toAsset ? toAsset : fromAsset
      api.query.dexPallet
        .exchanges(convertToAsset(firstAsset), convertToAsset(secondAsset), (exchange) => {
          if (exchange.get('invariant').toString() === '0') {
            setExchangeExists(false)
            setHint(
              `You are the first liquidity provider for 
            ${assetMap.get(fromAsset).symbol} / ${assetMap.get(toAsset).symbol}, 
            please click Launch button to start the new exchange`
            )
            clearPoolData()
          } else {
            setExchangeExists(true)
            setHint(defaultHint)
            const fromAssetPoolStr =
              fromAsset < toAsset
                ? exchange.get('first_asset_pool').toString()
                : exchange.get('second_asset_pool').toString()
            const fromAssetPoolBalance = convertBalance(fromAsset, fromAssetPoolStr)
            setFromAssetPool(fromAssetPoolBalance)
            const toAssetPoolStr =
              fromAsset < toAsset
                ? exchange.get('second_asset_pool').toString()
                : exchange.get('first_asset_pool').toString()
            const toAssetPoolBalance = convertBalance(toAsset, toAssetPoolStr)
            setToAssetPool(toAssetPoolBalance)
            setPoolInfo(
              `${shortenNumber(fromAssetPoolBalance.toString())} ${assetMap.get(fromAsset).symbol} + 
              ${shortenNumber(toAssetPoolBalance.toString())} ${assetMap.get(toAsset).symbol}`
            )
            const totalSharesStr = exchange.get('total_shares').toString()
            setTotalShares(new BigNumber(totalSharesStr))
            const sharesInfo = JSON.parse(exchange.get('shares').toString())
            setSharesInfo(
              sharesInfo[account]
                ? `${new BigNumber(sharesInfo[account]).multipliedBy(100).div(totalSharesStr)} %`
                : '0'
            )
          }
        })
        .then((unsub) => {
          unsubscribe = unsub
        })
        .catch(console.error)
    }
    return () => unsubscribe && unsubscribe()
  }, [fromAsset, toAsset, account, api.query.dexPallet])

  const clearPoolData = () => {
    setPoolInfo('')
    setSharesInfo('')
    setTotalShares(new BigNumber(0))
    setShares(new BigNumber(0))
    setFromAssetPool(new BigNumber(0))
    setToAssetPool(new BigNumber(0))
    setFromAssetAmount('')
  }

  useEffect(() => {
    if (!status) {
      setHint(defaultHint)
    } else {
      setHint(status)
    }
  }, [status])

  useEffect(() => {
    if (
      fromAssetAmount &&
      !isNaN(fromAssetAmount) &&
      Number.parseFloat(fromAssetAmount) > 0 &&
      fromAssetPool.gt(0) &&
      toAssetPool.gt(0) &&
      totalShares.gt(0)
    ) {
      setToAssetAmount(new BigNumber(toAssetPool).multipliedBy(fromAssetAmount).div(fromAssetPool).toString())
      setShares(new BigNumber(totalShares).multipliedBy(fromAssetAmount).div(fromAssetPool))
    } else {
      setShares(new BigNumber(0))
      if (!fromAssetAmount) {
        setToAssetAmount('')
      }
    }
  }, [fromAsset, fromAssetAmount, fromAssetPool, toAssetPool, totalShares])

  const validateAsset = useCallback(
    (amount, assetId, setErrorFunc) => {
      if (fromAsset === toAsset) {
        setFromAssetError('same asset')
        setToAssetError('same asset')
      } else if (amount && (isNaN(amount) || Number.parseFloat(amount) <= 0)) {
        setErrorFunc('invalid amount')
      } else if (balances.get(assetId) && balances.get(assetId).lt(new BigNumber(amount))) {
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
    account,
    setFromAssetError,
    validateAsset,
  ])

  useEffect(() => validateAsset(toAssetAmount, toAsset, setToAssetError), [
    toAssetAmount,
    toAsset,
    balances,
    account,
    setToAssetError,
    validateAsset,
  ])

  useEffect(() => setStatus(''), [fromAsset, fromAssetAmount, toAssetAmount, toAsset, account])

  const inProgress = () => {
    return !!status && !status.includes('Finalized') && !status.includes('Error')
  }

  const assetOptions = assets.map(({ assetId, symbol, lightLogo, darkLogo }) => ({
    key: assetId,
    value: assetId,
    text: symbol,
    image: theme === 'light' ? lightLogo : darkLogo,
  }))

  return (
    <PoolInputsContainer>
      <Hint text={hint} />
      <TokenInput
        options={assetOptions}
        label="Deposit"
        placeholder="Type here"
        error={fromAssetError}
        disabled={inProgress()}
        dropdownDisabled={inProgress()}
        onChangeAmount={(e) => setFromAssetAmount(e.target.value)}
        onChangeAsset={setFromAsset}
        asset={fromAsset}
        amount={fromAssetAmount}
      />
      <div>
        <TokenInput
          options={assetOptions}
          label="Deposit"
          placeholder="Read only"
          error={toAssetError}
          readOnly={true}
          disabled={inProgress()}
          dropdownDisabled={inProgress()}
          onChangeAmount={(e) => setToAssetAmount(e.target.value)}
          onChangeAsset={setToAsset}
          asset={toAsset}
          amount={toAssetAmount}
        />
        <LabelOutput label="Current pool" value={poolInfo} />
        <LabelOutput label="Your shares" value={sharesInfo} />
      </div>
      <TxButton
        accountPair={accountPair}
        disabled={!!fromAssetError || !!toAssetError || !exchangeExists || inProgress() || !shares}
        attrs={{
          palletRpc: 'dexPallet',
          callable: 'investLiquidity',
          inputParams: [convertToAsset(fromAsset), convertToAsset(toAsset), shares.toFixed(0, BigNumber.ROUND_DOWN)],
          paramFields: [false, false, false],
        }}
        setStatus={setStatus}
        type="SIGNED-TX"
        label="Invest"
      />
    </PoolInputsContainer>
  )
}
