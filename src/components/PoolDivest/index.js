import React, { useState, useContext, useEffect } from 'react'
import Hint from '../Hint'
import TokenInput from '../TokenInput'
import assets, { assetMap, EDG_ASSET_ID, KSM_ASSET_ID } from '../../assets'
import LabelInput from '../LabelInput'
import LabelOutput from '../LabelOutput'
import useSubstrate from '../../hooks/useSubstrate'
import { AccountContext } from '../../context/AccountContext'
import { TxButton } from '../TxButton'
import { convertBalance, shortenNumber } from '../../utils/conversion'
import BigNumber from 'bignumber.js'
import { PoolInputsContainer } from '../Pool'
import { ThemeContext } from '../../context/ThemeContext'

export default function PoolInvest() {
  const { api, keyring } = useSubstrate()
  const { theme } = useContext(ThemeContext)
  const { account } = useContext(AccountContext)
  const accountPair = account && keyring.getPair(account)
  const defaultHint = 'Divest your tokens from the liquidity pool by burning your DarkDEX shares'
  const [status, setStatus] = useState('')
  const [currentAssetShares, setCurrentAssetShares] = useState(0)
  const [hint, setHint] = useState(defaultHint)
  const [divestAsset, setDivestAsset] = useState(EDG_ASSET_ID)
  const [divestAssetError, setDivestAssetError] = useState('')
  const [ksmPool, setKsmPool] = useState()
  const [tokenPool, setTokenPool] = useState()
  const [divestInfo, setDivestInfo] = useState('')
  const [sharesToDivest, setSharesToDivest] = useState('')
  const [totalShares, setTotalShares] = useState('')
  const [poolInfo, setPoolInfo] = useState('')
  const [sharesInfo, setSharesInfo] = useState('')
  const [ksmToReceive, setKsmToReceive] = useState('')
  const [assetToReceive, setAssetToReceive] = useState('')

  useEffect(() => {
    let unsubscribe
    api.query.dexPallet
      .exchanges(divestAsset, (exchange) => {
        if (exchange.get('invariant').toString() === '0') {
          setHint(
            `There is no exchange for ${
              assetMap.get(divestAsset).symbol
            }, you probably can click Launch button to start the new exchange`
          )
          setPoolInfo('')
          setSharesInfo('')
          setTotalShares('')
          setCurrentAssetShares(0)
        } else {
          setHint(defaultHint)
          const ksmPoolStr = exchange.get('ksm_pool').toString()
          setKsmPool(ksmPoolStr)
          const ksmPoolBalance = shortenNumber(convertBalance(KSM_ASSET_ID, ksmPoolStr).toString())
          const tokenPoolStr = exchange.get('token_pool').toString()
          setTokenPool(tokenPoolStr)
          const tokenPoolBalance = shortenNumber(convertBalance(divestAsset, tokenPoolStr).toString())
          setPoolInfo(`${ksmPoolBalance} KSM + ${tokenPoolBalance} ${assetMap.get(divestAsset).symbol}`)
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
  }, [divestAsset, account, api.query.dexPallet])

  const buildSharesInfo = (shares, totalShares) => {
    if (!shares) return '0'
    return `${new BigNumber(shares).multipliedBy(100).div(totalShares).toFormat(2)} %`
  }

  useEffect(() => {
    if (!divestAssetError && sharesToDivest && ksmPool && totalShares) {
      const ksmToReceive = new BigNumber(ksmPool).multipliedBy(sharesToDivest).div(totalShares).toFixed(0, 1)
      setKsmToReceive(ksmToReceive.toString())
      const assetToReceive = new BigNumber(tokenPool).multipliedBy(sharesToDivest).div(totalShares).toFixed(0, 1)
      setAssetToReceive(assetToReceive.toString())
      setDivestInfo(
        `${convertBalance(KSM_ASSET_ID, ksmToReceive)} KSM + ${convertBalance(divestAsset, assetToReceive)} ${
          assetMap.get(divestAsset).symbol
        }`
      )
    } else {
      setKsmToReceive('')
      setAssetToReceive('')
      setDivestInfo('')
    }
  }, [divestAsset, sharesToDivest, divestAssetError, ksmPool, totalShares, tokenPool])

  useEffect(() => {
    if (!status) {
      setHint(defaultHint)
    } else {
      setHint(status)
    }
  }, [status])

  useEffect(() => setStatus(''), [divestAsset, sharesToDivest, account])

  useEffect(() => {
    if (sharesToDivest && (isNaN(sharesToDivest) || sharesToDivest <= 0)) {
      setDivestAssetError('invalid amount')
    } else if (Number.parseFloat(sharesToDivest) > currentAssetShares) {
      setDivestAssetError('not enough shares')
    } else {
      setDivestAssetError('')
    }
  }, [sharesToDivest, currentAssetShares])

  const divestAssetOptions = assets
    .filter((asset) => asset.assetId !== KSM_ASSET_ID)
    .map(({ assetId, symbol, darkLogo, lightLogo }) => ({
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
        options={divestAssetOptions}
        label={'Shares (' + currentAssetShares + ')'}
        placeholder="0.0"
        disabled={inProgress()}
        dropdownDisabled={inProgress()}
        error={divestAssetError}
        onChangeAmount={(e) => setSharesToDivest(e.target.value)}
        onChangeAsset={setDivestAsset}
        asset={divestAsset}
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
        disabled={!!divestAssetError || inProgress()}
        attrs={{
          palletRpc: 'dexPallet',
          callable: 'divestLiquidity',
          inputParams: [divestAsset, sharesToDivest, ksmToReceive, assetToReceive],
          paramFields: [false, false, false, false],
        }}
        setStatus={setStatus}
        type="SIGNED-TX"
        label="Divest"
      />
    </PoolInputsContainer>
  )
}
