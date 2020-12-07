import React, { useState, useContext, useEffect } from 'react'
import Hint from '../Hint'
import TokenInput from '../TokenInput'
import assets, { assetMap, EDG_ASSET_ID, KSM_ASSET_ID } from '../../assets'
import LabelOutput from '../LabelOutput'
import useSubstrate from '../../hooks/useSubstrate'
import { AccountContext, SettingsContext } from '../../context'
import { TxButton } from '../TxButton'
import { convertToAsset, convertBalance, convertAmountNoDecimal, shortenNumber } from '../../utils/conversion'
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
  const [fromAssetPool, setFromAssetPool] = useState(new BigNumber(0))
  const [fromAssetInPool, setFromAssetInPool] = useState(new BigNumber(0))
  const [fromAssetToReceive, setFromAssetToReceive] = useState('')
  const [toAsset, setToAsset] = useState(EDG_ASSET_ID)
  const [toAssetError, setToAssetError] = useState('')
  const [toAssetPool, setToAssetPool] = useState(new BigNumber(0))
  const [toAssetInPool, setToAssetInPool] = useState(new BigNumber(0))
  const [toAssetToReceive, setToAssetToReceive] = useState('')
  const [sharesToDivest, setSharesToDivest] = useState(new BigNumber(0))
  const [totalShares, setTotalShares] = useState(new BigNumber(0))
  const [poolInfo, setPoolInfo] = useState('')
  const [sharesInfo, setSharesInfo] = useState('')

  useEffect(() => {
    if (fromAsset === toAsset) {
      clearPoolData()
    } else {
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
            clearPoolData()
          } else {
            setHint(defaultHint)
            const totalShares = exchange.get('total_shares').toString()
            setTotalShares(new BigNumber(totalShares))
            const sharesMap = JSON.parse(exchange.get('shares').toString())
            const shares = sharesMap[account] || 0
            setSharesInfo(buildSharesInfo(sharesMap[account], totalShares))
            const fromAssetPoolStr =
              fromAsset < toAsset
                ? exchange.get('first_asset_pool').toString()
                : exchange.get('second_asset_pool').toString()
            const fromAssetPoolBalance = convertBalance(fromAsset, fromAssetPoolStr)
            setFromAssetPool(fromAssetPoolBalance)
            setFromAssetInPool(new BigNumber(shares).multipliedBy(fromAssetPoolBalance).div(totalShares))
            const toAssetPoolStr =
              fromAsset < toAsset
                ? exchange.get('second_asset_pool').toString()
                : exchange.get('first_asset_pool').toString()
            const toAssetPoolBalance = convertBalance(toAsset, toAssetPoolStr)
            setToAssetPool(toAssetPoolBalance)
            setToAssetInPool(new BigNumber(shares).multipliedBy(toAssetPoolBalance).div(totalShares))
            setPoolInfo(
              `${shortenNumber(fromAssetPoolBalance.toString())} ${assetMap.get(fromAsset).symbol} + 
              ${shortenNumber(toAssetPoolBalance.toString())} ${assetMap.get(toAsset).symbol}`
            )
          }
        })
        .then((unsub) => {
          unsubscribe = unsub
        })
        .catch(console.error)
      return () => unsubscribe && unsubscribe()
    }
  }, [fromAsset, toAsset, account, api.query.dexPallet])

  const buildSharesInfo = (shares, totalShares) => {
    if (!shares) return '0'
    return `${new BigNumber(shares).multipliedBy(100).div(totalShares).toFormat(2)} %`
  }

  const clearPoolData = () => {
    setPoolInfo('')
    setSharesInfo('')
    setTotalShares(new BigNumber(0))
    setFromAssetPool(new BigNumber(0))
    setFromAssetInPool(new BigNumber(0))
    setToAssetPool(new BigNumber(0))
    setToAssetInPool(new BigNumber(0))
  }

  useEffect(() => {
    if (fromAsset === toAsset) {
      setFromAssetError('same asset')
      setToAssetError('same asset')
    } else if (!fromAssetToReceive) {
      setFromAssetError('')
      setToAssetError('')
      setSharesToDivest(new BigNumber(0))
      setToAssetToReceive('')
    } else if (isNaN(fromAssetToReceive) || fromAssetToReceive <= 0) {
      setFromAssetError('invalid amount')
      setToAssetError('')
    } else if (new BigNumber(fromAssetToReceive).gt(fromAssetInPool)) {
      setFromAssetError('not enough in pool')
      setToAssetError('')
    } else if (totalShares.gt(0) && fromAssetPool.gt(0) && toAssetPool.gt(0)) {
      setFromAssetError('')
      setToAssetError('')
      setSharesToDivest(new BigNumber(fromAssetToReceive).multipliedBy(totalShares).div(fromAssetPool))
      setToAssetToReceive(new BigNumber(toAssetPool).multipliedBy(fromAssetToReceive).div(fromAssetPool).toString())
    }
  }, [fromAsset, toAsset, fromAssetToReceive, fromAssetInPool, fromAssetPool, totalShares, toAssetPool])

  useEffect(() => {
    if (!status) {
      setHint(defaultHint)
    } else {
      setHint(status)
    }
  }, [status])

  useEffect(() => setStatus(''), [fromAsset, toAsset, fromAssetToReceive, account])

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
        label={`${shortenNumber(fromAssetInPool.toString())} in Pool`}
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
          label={`${shortenNumber(toAssetInPool.toString())} in Pool`}
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
            sharesToDivest.toFixed(0, BigNumber.ROUND_UP),
            convertAmountNoDecimal(fromAsset, fromAssetToReceive, BigNumber.ROUND_DOWN),
            convertAmountNoDecimal(toAsset, toAssetToReceive, BigNumber.ROUND_DOWN),
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
