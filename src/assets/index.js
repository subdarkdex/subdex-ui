import ksm from './ksm.png'
import btc from './btc.png'
import edg from './edg.png'

const KSM_ASSET_ID = '0'
const BTC_ASSET_ID = '1'
const EDG_ASSET_ID = '2'

const assets = [
  {
    assetId: KSM_ASSET_ID,
    symbol: 'KSM',
    logo: ksm,
    name: 'Kusama',
    decimals: 12,
  },

  {
    assetId: BTC_ASSET_ID,
    symbol: 'BTC',
    logo: btc,
    name: 'Bitcoin',
    decimals: 12,
  },

  {
    assetId: EDG_ASSET_ID,
    symbol: 'EDG',
    logo: edg,
    name: 'Edgeware',
    decimals: 12,
  },
]

const assetMap = new Map(assets.map((asset) => [asset.assetId, { ...asset }]))

export { assets as default, assetMap, KSM_ASSET_ID, BTC_ASSET_ID, EDG_ASSET_ID }
