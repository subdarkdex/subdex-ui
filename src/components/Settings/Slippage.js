import React, { useContext } from 'react'
import styled from 'styled-components'
import 'react-tippy/dist/tippy.css'
import { Tooltip } from 'react-tippy'
import { Form } from 'semantic-ui-react'
import { SettingsContext } from '../../context'

function Slippage() {
  const { slippage, saveSlippage } = useContext(SettingsContext)
  const handleChange = (e, { value }) => saveSlippage(value)
  return (
    <SlippageContainer>
      <Tooltip
        html={<Tip>Your transaction will revert if the price changes unfavorably by this percentage</Tip>}
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

const Tip = styled.div`
  width: 180px;
  text-align: left;
`
export default Slippage
