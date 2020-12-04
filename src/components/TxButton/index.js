import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { web3FromSource } from '@polkadot/extension-dapp'

import { useSubstrate } from '../../hooks'
import conversion from '../../utils/conversion'
import styled from 'styled-components'

function TxButton({
  accountPair = null,
  label,
  setStatus,
  color = 'blue',
  style = null,
  type = 'QUERY',
  attrs = null,
  disabled = false,
}) {
  // Hooks
  const { api } = useSubstrate()
  const [unsub, setUnsub] = useState(null)
  const [sudoKey, setSudoKey] = useState(null)

  const { palletRpc, callable, inputParams, paramFields } = attrs

  const isQuery = () => type === 'QUERY'
  const isSudo = () => type === 'SUDO-TX'
  const isUncheckedSudo = () => type === 'UNCHECKED-SUDO-TX'
  const isUnsigned = () => type === 'UNSIGNED-TX'
  const isSigned = () => type === 'SIGNED-TX'
  const isRpc = () => type === 'RPC'
  const isConstant = () => type === 'CONSTANT'

  const loadSudoKey = () => {
    ;(async function () {
      if (!api) {
        return
      }
      const sudo = await api.query.sudo
      if (sudo) {
        const sudoKey = await sudo.key()
        sudoKey.isEmpty ? setSudoKey(null) : setSudoKey(sudoKey.toString())
      } else {
        setSudoKey(null)
      }
    })()
  }

  useEffect(loadSudoKey, [api])

  const getFromAcct = async () => {
    const {
      address,
      meta: { source, isInjected },
    } = accountPair
    let fromAcct

    // signer is from Polkadot-js browser extension
    if (isInjected) {
      const injected = await web3FromSource(source)
      fromAcct = address
      api.setSigner(injected.signer)
    } else {
      fromAcct = accountPair
    }

    return fromAcct
  }

  const txResHandler = ({ status }) =>
    status.isFinalized
      ? setStatus(`😉 Finalized. Block hash: ${status.asFinalized.toString()}`)
      : setStatus(`Current transaction status: ${status.type}`)

  const txErrHandler = (err) => setStatus(`😞 Transaction Failed: ${err.toString()}`)

  const sudoTx = async () => {
    const fromAcct = await getFromAcct()
    const transformed = transformParams(paramFields, inputParams)
    // transformed can be empty parameters
    const txExecute = transformed
      ? api.tx.sudo.sudo(api.tx[palletRpc][callable](...transformed))
      : api.tx.sudo.sudo(api.tx[palletRpc][callable]())

    const unsub = txExecute.signAndSend(fromAcct, txResHandler).catch(txErrHandler)
    setUnsub(() => unsub)
  }

  const uncheckedSudoTx = async () => {
    const fromAcct = await getFromAcct()
    const txExecute = api.tx.sudo.sudoUncheckedWeight(api.tx[palletRpc][callable](...inputParams), 0)

    const unsub = txExecute.signAndSend(fromAcct, txResHandler).catch(txErrHandler)
    setUnsub(() => unsub)
  }

  const signedTx = async () => {
    const fromAcct = await getFromAcct()
    const transformed = transformParams(paramFields, inputParams)
    console.log('transformed', transformed)
    // transformed can be empty parameters

    const txExecute = transformed ? api.tx[palletRpc][callable](...transformed) : api.tx[palletRpc][callable]()

    const unsub = await txExecute.signAndSend(fromAcct, txResHandler).catch(txErrHandler)
    setUnsub(() => unsub)
  }

  const unsignedTx = async () => {
    const transformed = transformParams(paramFields, inputParams)
    // transformed can be empty parameters
    const txExecute = transformed ? api.tx[palletRpc][callable](...transformed) : api.tx[palletRpc][callable]()

    const unsub = await txExecute.send(txResHandler).catch(txErrHandler)
    setUnsub(() => unsub)
  }

  const queryResHandler = (result) => (result.isNone ? setStatus('None') : setStatus(result.toString()))

  const query = async () => {
    const transformed = transformParams(paramFields, inputParams)
    const unsub = await api.query[palletRpc][callable](...transformed, queryResHandler)
    setUnsub(() => unsub)
  }

  const rpc = async () => {
    const transformed = transformParams(paramFields, inputParams, { emptyAsNull: false })
    const unsub = await api.rpc[palletRpc][callable](...transformed, queryResHandler)
    setUnsub(() => unsub)
  }

  const constant = () => {
    const result = api.consts[palletRpc][callable]
    result.isNone ? setStatus('None') : setStatus(result.toString())
  }

  const transaction = async () => {
    if (unsub) {
      unsub()
      setUnsub(null)
    }

    setStatus('Sending...')
    ;(isSudo() && sudoTx()) ||
      (isUncheckedSudo() && uncheckedSudoTx()) ||
      (isSigned() && signedTx()) ||
      (isUnsigned() && unsignedTx()) ||
      (isQuery() && query()) ||
      (isRpc() && rpc()) ||
      (isConstant() && constant())
  }

  const transformParams = (paramFields, inputParams, opts = { emptyAsNull: true }) => {
    // if `opts.emptyAsNull` is true, empty param value will be added to res as `null`.
    //   Otherwise, it will not be added
    const paramVal = inputParams.map((inputParam) => {
      if (inputParam === 'object') {
        return inputParam.value.trim()
      }
      if (typeof inputParam === 'string') {
        return inputParam.trim()
      }
      return inputParam
    })
    const params = paramFields.map((field, ind) => ({ ...field, value: paramVal[ind] || null }))

    return params.reduce((memo, { type = 'string', value }) => {
      if (value == null || value === '') return opts.emptyAsNull ? [...memo, null] : memo

      let converted = value

      // Deal with a vector
      if (type.indexOf('Vec<') >= 0) {
        converted = converted.split(',').map((e) => e.trim())
        converted = converted.map((single) =>
          isNumType(type) ? (single.indexOf('.') >= 0 ? Number.parseFloat(single) : Number.parseInt(single)) : single
        )
        return [...memo, converted]
      }

      // Deal with a single value
      if (isNumType(type)) {
        converted = converted.indexOf('.') >= 0 ? Number.parseFloat(converted) : Number.parseInt(converted)
      }
      return [...memo, converted]
    }, [])
  }

  const isNumType = (type) => conversion.paramConversion.num.some((el) => type.indexOf(el) >= 0)

  const allParamsFilled = () => {
    if (paramFields.length === 0) {
      return true
    }

    return paramFields.every((paramField, ind) => {
      const param = inputParams[ind]
      if (paramField.optional) {
        return true
      }
      if (param == null) {
        return false
      }

      const value = typeof param === 'object' ? param.value : param
      return value !== null && value !== ''
    })
  }

  const isSudoer = (acctPair) => {
    if (!sudoKey || !acctPair) {
      return false
    }
    return acctPair.address === sudoKey
  }

  return (
    <Button
      color={color}
      style={style}
      type="submit"
      onClick={transaction}
      disabled={
        disabled ||
        !palletRpc ||
        !callable ||
        !allParamsFilled() ||
        ((isSudo() || isUncheckedSudo()) && !isSudoer(accountPair))
      }
    >
      <span>{label}</span>
    </Button>
  )
}

const Button = styled.button`
  width: 177px;
  height: 45px;
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 16px;
  opacity: 1;
  background-color: ${({ theme }) => theme.buttonBackground};
  color: ${({ theme }) => theme.textColor};
  font-family: Gill Sans, Gill Sans MT, Calibri, sans-serif;
  font-size: 18px;
  font-weight: 600;
  -webkit-transition-duration: 0.4s; /* Safari */
  transition-duration: 0.4s;
  &:focus {
    outline: 0;
  }
  &:hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.buttonBackground};
  }
  &:active {
    background-color: ${({ theme }) => theme.buttonBackgroundActive};
  }
  & span {
    cursor: pointer;
    display: inline-block;
    position: relative;
    transition: 0.5s;
  }
  & span:after {
    content: '\\00bb';
    position: absolute;
    opacity: 0;
    top: 0;
    right: -10px;
    transition: 0.5s;
  }
  &:hover span {
    padding-right: 15px;
  }
  &:hover span:after {
    opacity: 1;
    right: 0;
  }
  &[disabled] {
    color: ${({ theme }) => theme.buttonTextColorDisabled};
  }
  &[disabled]:hover {
    cursor: default;
    background-color: ${({ theme }) => theme.buttonBackground};
  }
  &[disabled] span {
    cursor: default;
  }
  &[disabled] span:after {
    content: '';
    position: absolute;
    opacity: 0;
    top: 0;
    right: 0;
    transition: 0.5s;
  }
  &[disabled]:hover span {
    padding-right: 0;
  }
`

// prop typechecking
TxButton.propTypes = {
  accountPair: PropTypes.object,
  setStatus: PropTypes.func.isRequired,
  type: PropTypes.oneOf(['QUERY', 'RPC', 'SIGNED-TX', 'UNSIGNED-TX', 'SUDO-TX', 'UNCHECKED-SUDO-TX', 'CONSTANT'])
    .isRequired,
  attrs: PropTypes.shape({
    palletRpc: PropTypes.string,
    callable: PropTypes.string,
    inputParams: PropTypes.array,
    paramFields: PropTypes.array,
  }).isRequired,
}

export { TxButton }
