import React from 'react'
import styled from 'styled-components'
import 'react-tippy/dist/tippy.css'
import { Tooltip } from 'react-tippy'
import { Form } from 'semantic-ui-react'
import { useSlippage } from '../../hooks'

function Slippage() {
  const { slippage, saveSlippage } = useSlippage()
  const handleChange = (e, { value }) => saveSlippage(value)
  return (
    <SlippageContainer>
      <Tooltip
        html={'Your transaction will revert if the price changes unfavorably by this percentage'}
        duration={1000}
        animation="fade"
        position="left"
        trigger="mouseenter"
        arrow={true}
      >
        <Form.Input
          label={`Slippage tolerance ${slippage / 10}%`}
          min={1}
          max={10}
          name="slippage"
          step={1}
          type="range"
          style={{ width: '100%' }}
          onChange={handleChange}
          value={slippage}
        />
      </Tooltip>
    </SlippageContainer>
  )
}

const SlippageContainer = styled.div`
  display: flex;
  justify-content: space-evenly;
  width: 100%;
`

export default Slippage
