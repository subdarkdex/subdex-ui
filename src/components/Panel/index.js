import styled from 'styled-components'

const Panel = styled.div`
  width: 450px;
  height: 550px;
  padding: 50px 50px;
  border-radius: 1.2em;
  border: 0.2em solid transparent;
  margin-top: 20px;
  margin-left: 20px;
  margin-right: 20px;
  box-shadow: ${({ theme }) => theme.panelBoxShadow};
  background: ${({ theme }) => theme.panelBackground};
`

export default Panel
