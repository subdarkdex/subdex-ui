import React, { useState, useContext, useEffect, useCallback } from 'react'
import Hint from '../Hint'
import assets, { EDG_ASSET_ID, KSM_ASSET_ID, assetMap } from '../../assets'
import TokenInput from '../TokenInput'
import LabelOutput from '../LabelOutput'
import { TxButton } from '../TxButton'
import useSubstrate from '../../hooks/useSubstrate'
import { AccountContext } from '../../context/AccountContext'
import { convertAmount, convertBalance, shortenNumber } from '../../utils/conversion'
import BigNumber from 'bignumber.js'

export default function PoolInvest() {
  const { api, keyring } = useSubstrate()
  const { account, balances } = useContext(AccountContext)
  const accountPair = account && keyring.getPair(account)
  const defaultHint = 'Invest your tokens to the liquidity pool and earn 3% of the trading fees'
  const [status, setStatus] = useState('')
  const [hint, setHint] = useState(defaultHint)
  const [ksmAmount, setKsmAmount] = useState('')
  const [ksmAssetError, setKsmAssetError] = useState('')
  const [asset, setAsset] = useState(EDG_ASSET_ID)
  const [assetAmount, setAssetAmount] = useState('')
  const [assetError, setAssetError] = useState('')
  const [ksmPool, setKsmPool] = useState()
  const [tokenPool, setTokenPool] = useState()
  const [poolInfo, setPoolInfo] = useState('')
  const [totalShares, setTotalShares] = useState(0)
  const [shares, setShares] = useState(0)
  const [sharesInfo, setSharesInfo] = useState('')
  const [exchangeExists, setExchangeExists] = useState(false)

  useEffect(() => {
    let unsubscribe
    api.query.dexPallet
      .exchanges(asset, (exchange) => {
        if (exchange.get('invariant').toString() === '0') {
          setExchangeExists(false)
          setHint(
            `You are the first liquidity provider for ${
              assetMap.get(asset).symbol
            }, please click Launch button to start the new exchange`
          )
          setPoolInfo('')
          setSharesInfo('')
          setTotalShares(0)
          setShares(0)
        } else {
          setExchangeExists(true)
          setHint(defaultHint)
          const ksmPoolStr = exchange.get('ksm_pool').toString()
          const ksmPoolBalance = shortenNumber(convertBalance(KSM_ASSET_ID, ksmPoolStr).toString())
          setKsmPool(ksmPoolStr)
          const tokenPoolStr = exchange.get('token_pool').toString()
          const tokenPoolBalance = shortenNumber(convertBalance(asset, tokenPoolStr).toString())
          setTokenPool(tokenPoolStr)
          setPoolInfo(`${ksmPoolBalance} KSM + ${tokenPoolBalance} ${assetMap.get(asset).symbol}`)
          const totalSharesNumber = exchange.get('total_shares').toNumber()
          setTotalShares(totalSharesNumber)
          const sharesInfo = JSON.parse(exchange.get('shares').toString())
          setSharesInfo(sharesInfo[account] ? `${(sharesInfo[account] * 100) / totalSharesNumber} %` : '0')
        }
      })
      .then((unsub) => {
        unsubscribe = unsub
      })
      .catch(console.error)
    return () => unsubscribe && unsubscribe()
  }, [asset, account, api.query.dexPallet])

  useEffect(() => {
    if (!status) {
      setHint(defaultHint)
    } else {
      setHint(status)
    }
  }, [status])

  useEffect(() => {
    if (ksmAmount && !isNaN(ksmAmount) && Number.parseFloat(ksmAmount) > 0 && ksmPool && tokenPool && totalShares) {
      setAssetAmount(new BigNumber(tokenPool).multipliedBy(ksmAmount).div(ksmPool).toString())
      setShares(
        Number.parseInt(
          new BigNumber(totalShares).multipliedBy(convertAmount(KSM_ASSET_ID, ksmAmount)).div(ksmPool).toFixed(0, 1)
        )
      )
    } else {
      setShares(0)
      if (!ksmAmount) {
        setAssetAmount('')
      }
    }
  }, [ksmAmount, ksmPool, tokenPool, totalShares])

  const validateAsset = useCallback((amount, assetId, setErrorFunc) => {
    if (amount && (isNaN(amount) || Number.parseFloat(amount) <= 0)) {
      setErrorFunc('invalid amount')
    } else if (balances.get(assetId) && balances.get(assetId).lte(new BigNumber(amount))) {
      setErrorFunc('exceeds the balance')
    } else {
      setErrorFunc('')
    }
  })

  useEffect(() => validateAsset(ksmAmount, KSM_ASSET_ID, setKsmAssetError), [
    ksmAmount,
    balances,
    setKsmAssetError,
    validateAsset,
  ])

  useEffect(() => validateAsset(assetAmount, asset, setAssetError), [
    assetAmount,
    asset,
    balances,
    setAssetError,
    validateAsset,
  ])

  useEffect(() => setStatus(''), [ksmAmount, assetAmount, asset, account])

  const inProgress = () => {
    return !!status && !status.includes('Finalized') && !status.includes('Error')
  }

  const ksmAssetOptions = assets
    .filter((asset) => asset.assetId === KSM_ASSET_ID)
    .map(({ assetId, symbol, logo }) => ({
      key: assetId,
      value: assetId,
      text: symbol,
      image: logo,
    }))

  const assetOptions = assets
    .filter((asset) => asset.assetId !== KSM_ASSET_ID)
    .map(({ assetId, symbol, logo }) => ({
      key: assetId,
      value: assetId,
      text: symbol,
      image: logo,
    }))

  return (
    <div className="pool-inputs-container">
      <Hint text={hint} />
      <TokenInput
        options={ksmAssetOptions}
        label="Deposit"
        placeholder="Type here"
        error={ksmAssetError}
        disabled={inProgress()}
        dropdownDisabled={inProgress()}
        onChangeAmount={(e) => setKsmAmount(e.target.value)}
        asset={KSM_ASSET_ID}
        amount={ksmAmount}
      />
      <div>
        <TokenInput
          options={assetOptions}
          label="Deposit"
          placeholder="Read only"
          error={assetError}
          readOnly={true}
          disabled={inProgress()}
          dropdownDisabled={inProgress()}
          onChangeAmount={(e) => setAssetAmount(e.target.value)}
          onChangeAsset={setAsset}
          asset={asset}
          amount={assetAmount}
        />
        <LabelOutput label="Current pool" value={poolInfo} />
        <LabelOutput label="Your shares" value={sharesInfo} />
      </div>
      <TxButton
        accountPair={accountPair}
        disabled={!!ksmAssetError || !!assetError || !exchangeExists || inProgress() || !shares}
        attrs={{
          palletRpc: 'dexPallet',
          callable: 'investLiquidity',
          inputParams: [asset, shares],
          paramFields: [false, false],
        }}
        setStatus={setStatus}
        type="SIGNED-TX"
        label="Invest"
      />
    </div>
  )
}
