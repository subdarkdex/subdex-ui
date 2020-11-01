import styled from 'styled-components'

const Panel = styled.div`
  width: 400px;
  height: 500px;
  padding: 25px 25px;
  border-radius: 2em;
  border: 0.2em solid transparent;
  margin-top: 20px;
  margin-left: 25px;
  margin-right: 25px;
  box-shadow: ${({ theme }) => theme.panelBoxShadow};
  background: ${({ theme }) => theme.panelBackground};
`

export default Panel
