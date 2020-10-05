import { decodeAddress } from '@polkadot/util-crypto'

function shorten(address) {
  return address.substring(0, 4) + '...' + address.substring(address.length - 5, address.length)
}

function isValidAddress(address) {
  try {
    return decodeAddress(address).length === 32
  } catch (e) {
    return false
  }
}

export { shorten as default, isValidAddress }
