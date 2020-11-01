import ksmDark from './ksm-dark.png'
import ksmLight from './ksm-light.png'
import btcDark from './btc-dark.png'
import btcLight from './btc-light.png'
import edgDark from './edg-dark.png'
import edgLight from './edg-light.png'

const KSM_ASSET_ID = '0'
const BTC_ASSET_ID = '1'
const EDG_ASSET_ID = '2'

const assets = [
  {
    assetId: KSM_ASSET_ID,
    symbol: 'KSM',
    darkLogo: ksmDark,
    lightLogo: ksmLight,
    name: 'Kusama',
    decimals: 12,
  },

  {
    assetId: BTC_ASSET_ID,
    symbol: 'BTC',
    darkLogo: btcDark,
    lightLogo: btcLight,
    name: 'Bitcoin',
    decimals: 12,
  },

  {
    assetId: EDG_ASSET_ID,
    symbol: 'EDG',
    darkLogo: edgDark,
    lightLogo: edgLight,
    name: 'Edgeware',
    decimals: 12,
  },
]

const assetMap = new Map(assets.map((asset) => [asset.assetId, { ...asset }]))

export { assets as default, assetMap, KSM_ASSET_ID, BTC_ASSET_ID, EDG_ASSET_ID }
