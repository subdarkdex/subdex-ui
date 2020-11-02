import React, { useState } from 'react'
import Tabs from '../Tabs'
import OptionButton from '../OptionButton'
import PoolInvest from '../PoolInvest'
import PoolDivest from '../PoolDivest'
import PoolLaunch from '../PoolLaunch'
import styled from 'styled-components'

export default function Pool() {
  const [option, setOption] = useState('invest')
  return (
    <>
      <Tabs active={'pool'} />
      <PoolOptionsContainer>
        <OptionButton selected={option === 'invest'} onClick={() => setOption('invest')}>
          Invest
        </OptionButton>
        <OptionButton selected={option === 'divest'} onClick={() => setOption('divest')}>
          Divest
        </OptionButton>
        <OptionButton selected={option === 'launch'} onClick={() => setOption('launch')}>
          Launch
        </OptionButton>
      </PoolOptionsContainer>
      {option === 'invest' && <PoolInvest />}
      {option === 'divest' && <PoolDivest />}
      {option === 'launch' && <PoolLaunch />}
    </>
  )
}

const PoolOptionsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 27px;
`

export const PoolInputsContainer = styled.div`
  height: 365px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  align-content: center;
`
