import React, { useState, useContext, useEffect, useCallback } from 'react'
import Hint from '../Hint'
import assets, { assetMap, EDG_ASSET_ID, KSM_ASSET_ID } from '../../assets'
import TokenInput from '../TokenInput'
import LabelOutput from '../LabelOutput'
import { TxButton } from '../TxButton'
import useSubstrate from '../../hooks/useSubstrate'
import { AccountContext } from '../../context/AccountContext'
import { convertAmount, shortenNumber } from '../../utils/conversion'
import BigNumber from 'bignumber.js'
import { PoolInputsContainer } from '../Pool'
import { ThemeContext } from '../../context/ThemeContext'

export default function PoolLaunch() {
  const { api, keyring } = useSubstrate()
  const { theme } = useContext(ThemeContext)
  const { account, balances } = useContext(AccountContext)
  const accountPair = account && keyring.getPair(account)
  const defaultHint = 'Cannot find the pool? Add the desirable token pair and become its first liquidity provider'
  const [hint, setHint] = useState(defaultHint)
  const [status, setStatus] = useState('')
  const [ksmAmount, setKsmAmount] = useState('')
  const [ksmAssetError, setKsmAssetError] = useState('')
  const [asset, setAsset] = useState(EDG_ASSET_ID)
  const [assetAmount, setAssetAmount] = useState('')
  const [assetError, setAssetError] = useState('')
  const [priceInfo, setPriceInfo] = useState('')
  const [exchangeExists, setExchangeExists] = useState(false)

  useEffect(() => {
    if (assetError || ksmAssetError || !assetAmount || !ksmAmount) {
      setPriceInfo('')
    } else {
      setPriceInfo(`${getPrice(ksmAmount, assetAmount)} ${assetMap.get(asset).symbol} / KSM`)
    }
  }, [ksmAmount, asset, assetError, assetAmount, ksmAssetError])

  useEffect(() => {
    if (!status) {
      setHint(defaultHint)
    } else {
      setHint(status)
    }
  }, [status])

  useEffect(() => {
    let unsubscribe
    api.query.dexPallet
      .exchanges(asset, (exchange) => {
        console.log('invariant', exchange.get('invariant').toString())
        if (exchange.get('invariant').toString() !== '0') {
          setExchangeExists(true)
          setHint(
            `There is already liquidity for ${
              assetMap.get(asset).symbol
            } now, please click Invest button to add more liquidity`
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
  }, [api.query.dexPallet, asset])

  const getPrice = (ksmAmount, assetAmount) => {
    return shortenNumber(new BigNumber(assetAmount).div(ksmAmount).toString(), 18)
  }

  const validateAsset = useCallback(
    (amount, assetId, setErrorFunc) => {
      if (amount && (isNaN(amount) || Number.parseFloat(amount) <= 0)) {
        setErrorFunc('invalid amount')
      } else if (balances.get(assetId) && balances.get(assetId).lte(new BigNumber(amount))) {
        setErrorFunc('exceeds the balance')
      } else {
        setErrorFunc('')
      }
    },
    [balances]
  )

  useEffect(() => validateAsset(ksmAmount, KSM_ASSET_ID, setKsmAssetError), [ksmAmount, balances, validateAsset])

  useEffect(() => validateAsset(assetAmount, asset, setAssetError), [assetAmount, asset, balances, validateAsset])

  useEffect(() => setStatus(''), [asset, assetAmount, account])

  const ksmAssetOptions = assets
    .filter((asset) => asset.assetId === KSM_ASSET_ID)
    .map(({ assetId, symbol, lightLogo, darkLogo }) => ({
      key: assetId,
      value: assetId,
      text: symbol,
      image: theme === 'light' ? lightLogo : darkLogo,
    }))

  const assetOptions = assets
    .filter((asset) => asset.assetId !== KSM_ASSET_ID)
    .map(({ assetId, symbol, lightLogo, darkLogo }) => ({
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
        options={ksmAssetOptions}
        label="Deposit"
        placeholder="0.0"
        disabled={inProgress()}
        dropdownDisabled={inProgress()}
        error={ksmAssetError}
        onChangeAmount={(e) => setKsmAmount(e.target.value)}
        asset={KSM_ASSET_ID}
        amount={ksmAmount}
      />
      <div>
        <TokenInput
          options={assetOptions}
          label="Deposit"
          placeholder="0.0"
          disabled={inProgress()}
          dropdownDisabled={inProgress()}
          error={assetError}
          onChangeAmount={(e) => setAssetAmount(e.target.value)}
          onChangeAsset={setAsset}
          asset={asset}
          amount={assetAmount}
        />
        <LabelOutput label="Initial price" value={priceInfo} />
        <LabelOutput label="Your shares" value="100%" />
      </div>
      <TxButton
        accountPair={accountPair}
        disabled={!!ksmAssetError || !!assetError || !!exchangeExists || inProgress()}
        attrs={{
          palletRpc: 'dexPallet',
          callable: 'initializeExchange',
          inputParams: [convertAmount(KSM_ASSET_ID, ksmAmount), asset, convertAmount(asset, assetAmount)],
          paramFields: [false, false, false],
        }}
        setStatus={setStatus}
        type="SIGNED-TX"
        label="Launch"
      />
    </PoolInputsContainer>
  )
}
