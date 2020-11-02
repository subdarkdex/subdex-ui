import React from 'react'
import PropTypes from 'prop-types'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

export function Tabs({ active }) {
  return (
    <TabsContainer>
      <NavLink to={'/swap'} isActive={() => active === 'swap'}>
        Swap
      </NavLink>
      <NavLink to={'/pool'} isActive={() => active === 'pool'}>
        Pool
      </NavLink>
      <NavLink to={'/take'} isActive={() => active === 'take'}>
        Take
      </NavLink>
    </TabsContainer>
  )
}

const TabsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 22px;
  font-weight: normal;
  padding-left: 20px;
  padding-right: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.borderColor};
  & a.active {
    color: ${({ theme }) => theme.textColor};
    font-size: 22px;
    font-weight: 500;
  }
  & a {
    color: ${({ theme }) => theme.textColor};
    font-weight: 300;
  }
`

Tabs.propTypes = {
  active: PropTypes.string.isRequired,
}

export default Tabs
