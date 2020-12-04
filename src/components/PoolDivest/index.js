import React, { useState, useContext, useEffect } from 'react'
import Hint from '../Hint'
import TokenInput from '../TokenInput'
import assets, { assetMap, EDG_ASSET_ID, KSM_ASSET_ID } from '../../assets'
import LabelOutput from '../LabelOutput'
import useSubstrate from '../../hooks/useSubstrate'
import { AccountContext, SettingsContext } from '../../context'
import { TxButton } from '../TxButton'
import { convertToAsset, convertBalance, convertAmount, shortenNumber } from '../../utils/conversion'
import BigNumber from 'bignumber.js'
import { PoolInputsContainer } from '../Pool'

export default function PoolInvest() {
  const { api, keyring } = useSubstrate()
  const { theme } = useContext(SettingsContext)
  const { account } = useContext(AccountContext)
  const accountPair = account && keyring.getPair(account)
  const defaultHint = 'Divest your tokens from the liquidity pool by burning your DarkDEX shares'
  const [status, setStatus] = useState('')
  const [hint, setHint] = useState(defaultHint)
  const [fromAsset, setFromAsset] = useState(KSM_ASSET_ID)
  const [fromAssetError, setFromAssetError] = useState('')
  const [fromAssetPool, setFromAssetPool] = useState()
  const [toAsset, setToAsset] = useState(EDG_ASSET_ID)
  const [toAssetError, setToAssetError] = useState('')
  const [toAssetPool, setToAssetPool] = useState()
  const [sharesToDivest, setSharesToDivest] = useState('')
  const [totalShares, setTotalShares] = useState('')
  const [poolInfo, setPoolInfo] = useState('')
  const [sharesInfo, setSharesInfo] = useState('')
  const [fromAssetInPool, setFromAssetInPool] = useState(new BigNumber(0))
  const [toAssetInPool, setToAssetInPool] = useState(new BigNumber(0))
  const [fromAssetToReceive, setFromAssetToReceive] = useState('')
  const [toAssetToReceive, setToAssetToReceive] = useState('')

  useEffect(() => {
    if (fromAsset === toAsset) {
      setFromAssetError('same asset')
      setToAssetError('same asset')
      setPoolInfo('')
      return
    }
    let unsubscribe
    const firstAsset = fromAsset < toAsset ? fromAsset : toAsset
    const secondAsset = fromAsset < toAsset ? toAsset : fromAsset
    api.query.dexPallet
      .exchanges(convertToAsset(firstAsset), convertToAsset(secondAsset), (exchange) => {
        if (exchange.get('invariant').toString() === '0') {
          setHint(
            `There is no exchange for
            ${assetMap.get(fromAsset).symbol} / ${assetMap.get(toAsset).symbol},
            you probably can click Launch button to start the new exchange`
          )
          setPoolInfo('')
          setSharesInfo('')
          setTotalShares('')
        } else {
          setHint(defaultHint)
          const totalShares = exchange.get('total_shares').toString()
          setTotalShares(totalShares)
          const sharesInfo = JSON.parse(exchange.get('shares').toString())
          const shares = sharesInfo[account] || 0
          setSharesInfo(buildSharesInfo(sharesInfo[account], totalShares))
          const fromAssetPoolStr =
            fromAsset < toAsset
              ? exchange.get('first_asset_pool').toString()
              : exchange.get('second_asset_pool').toString()
          const fromAssetPoolBalance = convertBalance(KSM_ASSET_ID, fromAssetPoolStr).toString()
          setFromAssetPool(fromAssetPoolBalance)
          setFromAssetInPool(
            convertBalance(fromAsset, new BigNumber(shares).multipliedBy(fromAssetPoolStr).div(totalShares))
          )
          const toAssetPoolStr =
            fromAsset < toAsset
              ? exchange.get('second_asset_pool').toString()
              : exchange.get('first_asset_pool').toString()
          const toAssetPoolBalance = convertBalance(toAsset, toAssetPoolStr).toString()
          setToAssetPool(toAssetPoolBalance)
          setToAssetInPool(convertBalance(toAsset, new BigNumber(shares).multipliedBy(toAssetPoolStr).div(totalShares)))
          setPoolInfo(
            `${shortenNumber(fromAssetPoolBalance)} ${assetMap.get(fromAsset).symbol} + ${shortenNumber(
              toAssetPoolBalance
            )} ${assetMap.get(toAsset).symbol}`
          )
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
    if (fromAssetToReceive && (isNaN(fromAssetToReceive) || fromAssetToReceive <= 0)) {
      setFromAssetError('invalid amount')
    } else if (new BigNumber(fromAssetToReceive).gt(fromAssetInPool)) {
      setFromAssetError('not enough in pool')
      setToAssetError('not enough in pool')
    } else if (fromAssetToReceive) {
      setFromAssetError('')
      setToAssetError('')
      setSharesToDivest(
        new BigNumber(fromAssetToReceive).multipliedBy(totalShares).div(fromAssetPool).toFixed(0, 0).toString()
      )
      setToAssetToReceive(new BigNumber(toAssetPool).multipliedBy(fromAssetToReceive).div(fromAssetPool).toString())
    } else {
      setFromAssetError('')
      setToAssetError('')
      setSharesToDivest('')
      setToAssetToReceive('')
    }
  }, [fromAssetToReceive, fromAssetInPool, fromAssetPool, totalShares, toAssetPool])

  useEffect(() => {
    if (!status) {
      setHint(defaultHint)
    } else {
      setHint(status)
    }
  }, [status])

  useEffect(() => setStatus(''), [toAsset, fromAssetToReceive, account])

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
        label={`${shortenNumber(fromAssetInPool)} in Pool`}
        placeholder="0.0"
        error={fromAssetError}
        disabled={inProgress()}
        dropdownDisabled={inProgress()}
        onChangeAmount={(e) => setFromAssetToReceive(e.target.value)}
        onChangeAsset={setFromAsset}
        asset={fromAsset}
      />
      <div>
        <TokenInput
          options={assetOptions}
          label={`${shortenNumber(toAssetInPool)} in Pool`}
          placeholder="Read only"
          readOnly={true}
          disabled={inProgress()}
          dropdownDisabled={inProgress()}
          error={toAssetError}
          onChangeAsset={setToAsset}
          asset={toAsset}
          amount={toAssetToReceive}
        />
        <LabelOutput label="Current pool" value={poolInfo} />
        <LabelOutput label="Your shares" value={sharesInfo} />
      </div>
      <TxButton
        accountPair={accountPair}
        disabled={!!fromAssetError || !!toAssetError || inProgress()}
        attrs={{
          palletRpc: 'dexPallet',
          callable: 'divestLiquidity',
          inputParams: [
            convertToAsset(fromAsset),
            convertToAsset(toAsset),
            sharesToDivest,
            convertAmount(fromAsset, fromAssetToReceive),
            convertAmount(toAsset, toAssetToReceive),
          ],
          paramFields: [false, false, false, false, false],
        }}
        setStatus={setStatus}
        type="SIGNED-TX"
        label="Divest"
      />
    </PoolInputsContainer>
  )
}
