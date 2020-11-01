import React, { useState, useEffect } from 'react'
import Tabs from '../Tabs'
import LabelInput from '../LabelInput'
import { TxButton } from '../TxButton'
import { MarketPlace } from '../Market'

export default function Take() {
  const [, setStatus] = useState('')

  const [publicInput, setPublicInput] = useState('')
  const [publicInputError, setPublicInputError] = useState('')

  const [provingKey, setProvingKey] = useState('')
  const [provingKeyError, setProvingKeyError] = useState('')

  const [privateWitness, setPrivateWitness] = useState('')
  const [privateWitnessError, setPrivateWitnessError] = useState('')

  useEffect(() => {
    if (publicInput) {
      setPublicInputError('we are working on this')
    } else {
      setPublicInputError('')
    }
  }, [publicInput])

  useEffect(() => {
    if (provingKey) {
      setProvingKeyError('we are working on this')
    } else {
      setProvingKeyError('')
    }
  }, [provingKey])

  useEffect(() => {
    if (privateWitness) {
      setPrivateWitnessError('we are working on this')
    } else {
      setPrivateWitnessError('')
    }
  }, [privateWitness])

  return (
    <>
      <Tabs active={'take'} />
      <MarketPlace>
        <LabelInput
          label="Public input"
          placeholder="Provide the public input."
          value={publicInput || ''}
          error={publicInputError}
          onChange={(e) => setPublicInput(e.target.value)}
        />
        <LabelInput
          label="Proving key"
          placeholder="Provide the proving key."
          value={provingKey || ''}
          error={provingKeyError}
          onChange={(e) => setProvingKey(e.target.value)}
        />
        <LabelInput
          label="Private witness"
          placeholder="Provide the private witness."
          value={privateWitness || ''}
          error={privateWitnessError}
          onChange={(e) => setPrivateWitness(e.target.value)}
        />
        <TxButton
          disabled={publicInputError || provingKeyError || privateWitnessError}
          attrs={{
            palletRpc: 'dexPallet',
            callable: 'withdraw',
            inputParams: [publicInput, provingKey, privateWitness],
            paramFields: [false, false, false],
          }}
          setStatus={setStatus}
          type="SIGNED-TX"
          label="Withdraw"
        />
      </MarketPlace>
    </>
  )
}
