import { createGlobalStyle } from 'styled-components'

export const GlobalStyles = createGlobalStyle`
  body {
    background-color: ${({ theme }) => theme.backgroundColor};
    background-image: ${({ theme }) => theme.backgroundImage};
    color: ${({ theme }) => theme.textColor};
    font-family: Gill Sans, Gill Sans MT, Calibri, sans-serif;
  }
  
  .center {
    display: block;
    margin-left: auto;
    margin-right: auto;
  }
  
  table {
    border-collapse: collapse;
    border-spacing: 0;
  }
  
  th {
    font-size: 21px;
    font-weight: lighter;
    border-bottom: 1px solid #9381ff;
    padding-bottom: 16px;
  }
  
  thead {
    margin-bottom: 33px;
  }
  
  td {
    text-align: center;
    vertical-align: bottom;
  }
  
  .ui.selection.dropdown > .dropdown.icon {
    color: ${({ theme }) => theme.textColor};
  }
  
  div.ui.selection.dropdown .menu {
    background: ${({ theme }) => theme.dropdownBackground};
    width: calc(140% + 2px);
    left: -40%;
    border-radius: 0.5em;
  }
  
  div.ui.dropdown > .text {
    color: ${({ theme }) => theme.textColor};
    font-family: Gill Sans, Gill Sans MT, Calibri, sans-serif;
  }
  
  div.ui.search.dropdown {
    background-color: transparent;
    border-width: 0;
    font-family: Gill Sans, Gill Sans MT, Calibri, sans-serif;
    border-radius: 1.2em;
  }
  
  div.ui.dropdown .menu > .item {
    display: flex;
    align-items: center;
  }
`
