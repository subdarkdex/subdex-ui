import { assetMap, KSM_ASSET_ID } from '../assets'
import BigNumber from 'bignumber.js'

const conversion = {
  paramConversion: {
    num: ['Compact<Balance>', 'BalanceOf', 'u8', 'u16', 'u32', 'u64', 'u128', 'i8', 'i16', 'i32', 'i64', 'i128'],
  },
}

const convertToAsset = (assetId) => {
  if (assetId === KSM_ASSET_ID) {
    return { MainNetworkCurrency: null }
  }
  return { ParachainAsset: assetId }
}

const convertToAssetId = (asset) => {
  if (asset === 'MainNetworkCurrency') {
    return KSM_ASSET_ID
  }
  return JSON.parse(asset).ParachainAsset.toString()
}

const convertAmount = (assetId, amount) => {
  if (!amount || isNaN(amount) || Number.parseFloat(amount) < 0) {
    return null
  }
  const decimals = assetMap.get(assetId).decimals
  return new BigNumber(amount).multipliedBy(new BigNumber(10).pow(decimals)).toString()
}

const convertShares = (shares) => {
  const denominator = new BigNumber(10).pow(15)
  return new BigNumber(shares).div(denominator)
}

const convertBalance = (assetId, balance) => {
  if (!balance) {
    return null
  }
  const bn = new BigNumber(balance)
  const decimals = assetMap.get(assetId).decimals
  const denominator = new BigNumber(10).pow(decimals)
  return bn.div(denominator)
}

const shortenNumber = (number, maxLength = 9) => {
  if (number && number.length > maxLength) {
    return number.substr(0, maxLength) + '...'
  }
  return number
}

const truncDecimals = (asset, amount) => {
  if (amount && amount.indexOf('.') >= 0) {
    const index = amount.indexOf('.')
    const decimals = assetMap.get(asset).decimals
    let decimalPart = amount.substr(index + 1)
    if (decimalPart.length > decimals) {
      decimalPart = decimalPart.substr(0, decimals)
    }
    return amount.substr(0, index + 1) + decimalPart
  }
  return amount
}

export {
  conversion as default,
  convertToAsset,
  convertToAssetId,
  convertAmount,
  convertShares,
  convertBalance,
  shortenNumber,
  truncDecimals,
}
