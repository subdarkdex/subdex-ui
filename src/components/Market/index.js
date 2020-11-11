import React, { useContext } from 'react'
import darkLogo from './dark-logo.png'
import lightLogo from './light-logo.png'
import Panel from '../Panel'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { ThemeContext } from '../../context'

function Market({ marketPlace, marketEvents }) {
  const { theme } = useContext(ThemeContext)
  return (
    <MarketContainer>
      <Img src={theme === 'light' ? lightLogo : darkLogo} alt="Logo" />
      <Panel>{marketPlace}</Panel>
      <Panel>{marketEvents}</Panel>
    </MarketContainer>
  )
}

const MarketContainer = styled.div`
  @media (min-width: 900px) {
    display: flex;
    margin: 0;
    position: absolute;
    top: 50%;
    left: 50%;
    -ms-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
  }

  @media (max-width: 900px) {
    margin: 0;
    position: absolute;
    left: 50%;
    -ms-transform: translateX(-50%);
    transform: translateX(-50%);
  }
`

const Img = styled.img`
  filter: ${({ theme }) => theme.logoFilter};
  @media (min-width: 900px) and (min-height: 700px) {
    position: absolute;
    top: -68px;
    left: 50%;
    -ms-transform: translateX(-50%);
    transform: translateX(-50%);
  }

  @media (min-width: 900px) and (max-height: 700px) {
    display: none;
  }

  @media (max-width: 900px) {
    display: none;
  }
`

export const MarketPlace = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  align-content: center;
  height: 100%;
`

Market.propTypes = {
  marketPlace: PropTypes.object.isRequired,
  marketEvents: PropTypes.object.isRequired,
}

export default Market
