import React, { useState, useContext, useEffect } from 'react'
import Hint from '../Hint'
import TokenInput from '../TokenInput'
import assets, { assetMap, EDG_ASSET_ID, KSM_ASSET_ID } from '../../assets'
import LabelInput from '../LabelInput'
import LabelOutput from '../LabelOutput'
import useSubstrate from '../../hooks/useSubstrate'
import { AccountContext, SettingsContext } from '../../context'
import { TxButton } from '../TxButton'
import { convertBalance, shortenNumber } from '../../utils/conversion'
import BigNumber from 'bignumber.js'
import { PoolInputsContainer } from '../Pool'

export default function PoolInvest() {
  const { api, keyring } = useSubstrate()
  const { theme } = useContext(SettingsContext)
  const { account } = useContext(AccountContext)
  const accountPair = account && keyring.getPair(account)
  const defaultHint = 'Divest your tokens from the liquidity pool by burning your DarkDEX shares'
  const [status, setStatus] = useState('')
  const [currentAssetShares, setCurrentAssetShares] = useState(0)
  const [hint, setHint] = useState(defaultHint)
  const [fromAsset, setFromAsset] = useState(KSM_ASSET_ID)
  const [fromAssetError, setFromAssetError] = useState('')
  const [fromAssetPool, setFromAssetPool] = useState()
  const [toAsset, setToAsset] = useState(EDG_ASSET_ID)
  const [toAssetError, setToAssetError] = useState('')
  const [toAssetPool, setToAssetPool] = useState()
  const [divestInfo, setDivestInfo] = useState('')
  const [sharesToDivest, setSharesToDivest] = useState('')
  const [totalShares, setTotalShares] = useState('')
  const [poolInfo, setPoolInfo] = useState('')
  const [sharesInfo, setSharesInfo] = useState('')
  const [fromAssetToReceive, setFromAssetToReceive] = useState('')
  const [toAssetToReceive, setToAssetToReceive] = useState('')

  useEffect(() => {
    if (fromAsset === toAsset) {
      setFromAssetError('Cannot be the same asset')
      return
    }
    let unsubscribe
    const firstAsset = fromAsset < toAsset ? fromAsset : toAsset
    const secondAsset = fromAsset < toAsset ? toAsset : fromAsset
    api.query.dexPallet
      .exchanges(firstAsset, secondAsset, (exchange) => {
        if (exchange.get('invariant').toString() === '0') {
          setHint(
            `There is no exchange for ${
              assetMap.get(toAsset).symbol
            }, you probably can click Launch button to start the new exchange`
          )
          setPoolInfo('')
          setSharesInfo('')
          setTotalShares('')
          setCurrentAssetShares(0)
        } else {
          setHint(defaultHint)
          const fromAssetPoolStr =
            fromAsset < toAsset
              ? exchange.get('first_asset_pool').toString()
              : exchange.get('second_asset_pool').toString()
          setFromAssetPool(fromAssetPoolStr)
          const fromAssetPoolBalance = shortenNumber(convertBalance(KSM_ASSET_ID, fromAssetPoolStr).toString())
          const toAssetPoolStr =
            fromAsset < toAsset
              ? exchange.get('second_asset_pool').toString()
              : exchange.get('first_asset_pool').toString()
          setToAssetPool(toAssetPoolStr)
          const toAssetPoolBalance = shortenNumber(convertBalance(toAsset, toAssetPoolStr).toString())
          setPoolInfo(
            `${fromAssetPoolBalance} ${assetMap.get(fromAsset).symbol} + ${toAssetPoolBalance} ${
              assetMap.get(toAsset).symbol
            }`
          )
          const totalShares = exchange.get('total_shares').toString()
          setTotalShares(totalShares)
          const sharesInfo = JSON.parse(exchange.get('shares').toString())
          setCurrentAssetShares(sharesInfo[account] || 0)
          setSharesInfo(buildSharesInfo(sharesInfo[account], totalShares))
        }
      })
      .then((unsub) => {
        unsubscribe = unsub
      })
      .catch(console.error)
    return () => unsubscribe && unsubscribe()
  }, [fromAsset, toAsset, account, api.query.dexPallet])

  const buildSharesInfo = (shares, totalShares) => {
    if (!shares) return '0'
    return `${new BigNumber(shares).multipliedBy(100).div(totalShares).toFormat(2)} %`
  }

  useEffect(() => {
    if (!toAssetError && sharesToDivest && fromAssetPool && totalShares) {
      const fromAssetToReceive = new BigNumber(fromAssetPool)
        .multipliedBy(sharesToDivest)
        .div(totalShares)
        .toFixed(0, 1)
      setFromAssetToReceive(fromAssetToReceive.toString())
      const assetToReceive = new BigNumber(toAssetPool).multipliedBy(sharesToDivest).div(totalShares).toFixed(0, 1)
      setToAssetToReceive(assetToReceive.toString())
      setDivestInfo(
        `${convertBalance(fromAsset, fromAssetToReceive)} KSM + ${convertBalance(toAsset, assetToReceive)} ${
          assetMap.get(toAsset).symbol
        }`
      )
    } else {
      setFromAssetToReceive('')
      setToAssetToReceive('')
      setDivestInfo('')
    }
  }, [fromAsset, toAsset, sharesToDivest, toAssetError, fromAssetPool, totalShares, toAssetPool])

  useEffect(() => {
    if (!status) {
      setHint(defaultHint)
    } else {
      setHint(status)
    }
  }, [status])

  useEffect(() => setStatus(''), [toAsset, sharesToDivest, account])

  useEffect(() => {
    if (sharesToDivest && (isNaN(sharesToDivest) || sharesToDivest <= 0)) {
      setToAssetError('invalid amount')
    } else if (Number.parseFloat(sharesToDivest) > currentAssetShares) {
      setToAssetError('not enough shares')
    } else {
      setToAssetError('')
    }
  }, [sharesToDivest, currentAssetShares])

  const assetOptions = assets.map(({ assetId, symbol, darkLogo, lightLogo }) => ({
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
        label={'Shares (' + currentAssetShares + ')'}
        placeholder="0.0"
        error={fromAssetError}
        disabled={true}
        dropdownDisabled={inProgress()}
        onChangeAsset={setFromAsset}
        asset={fromAsset}
      />
      <TokenInput
        options={assetOptions}
        label={'Shares (' + currentAssetShares + ')'}
        placeholder="0.0"
        disabled={inProgress()}
        dropdownDisabled={inProgress()}
        error={toAssetError}
        onChangeAmount={(e) => setSharesToDivest(e.target.value)}
        onChangeAsset={setToAsset}
        asset={toAsset}
        amount={sharesToDivest}
      />
      <div>
        <LabelInput
          label="Output (estimated)"
          placeholder="assets you'll receive from the pool"
          value={divestInfo || ''}
          readOnly={true}
        />
        <LabelOutput label="Current pool" value={poolInfo} />
        <LabelOutput label="Your shares" value={sharesInfo} />
      </div>
      <TxButton
        accountPair={accountPair}
        disabled={!!toAssetError || inProgress()}
        attrs={{
          palletRpc: 'dexPallet',
          callable: 'divestLiquidity',
          inputParams: [fromAsset, toAsset, sharesToDivest, fromAssetToReceive, toAssetToReceive],
          paramFields: [false, false, false, false],
        }}
        setStatus={setStatus}
        type="SIGNED-TX"
        label="Divest"
      />
    </PoolInputsContainer>
  )
}
