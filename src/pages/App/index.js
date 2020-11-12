import React, { createRef, useContext } from 'react'
import { HashRouter, Route, Switch } from 'react-router-dom'
import SwapMarket from '../../components/SwapMarket'
import PoolMarket from '../../components/PoolMarket'
import TakeMarket from '../../components/TakeMarket'
import { RedirectToSwapMarket } from '../../utils/redirects'
import useSubstrate from '../../hooks/useSubstrate'
import {
  SubstrateContextProvider,
  AccountContextProvider,
  EventsContextProvider,
  SettingsContext,
  SettingsContextProvider,
} from '../../context'
import { Grid, Message, Dimmer, Loader } from 'semantic-ui-react'
import Header from '../../components/Header'
import DeveloperConsole from '../../components/DeveloperConsole'
import { GlobalStyles } from './GlobalStyles'
import { lightTheme, darkTheme } from './themes'
import { ThemeProvider } from 'styled-components'

function Main() {
  const { apiState, keyringState, apiError } = useSubstrate()
  const { theme, themeConfigured } = useContext(SettingsContext)
  if (!themeConfigured) {
    return <div />
  }

  const loader = (text) => (
    <Dimmer active>
      <Loader size="small">{text}</Loader>
    </Dimmer>
  )

  const message = (err) => (
    <Grid centered columns={2} padded>
      <Grid.Column>
        <Message negative compact floating header="Error Connecting to the Node" content={`${err}`} />
      </Grid.Column>
    </Grid>
  )

  if (apiState === 'ERROR') {
    return message(apiError)
  } else if (apiState !== 'READY') {
    return loader('Connecting to the Node')
  }

  if (keyringState !== 'READY') {
    return loader("Loading accounts (please review any extension's authorization)")
  }

  const contextRef = createRef()

  return (
    <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
      <GlobalStyles />
      <div ref={contextRef}>
        <HashRouter>
          <Header />
          <EventsContextProvider>
            <Switch>
              <Route exact strict path="/swap" component={SwapMarket} />
              <Route exact strict path="/pool" component={PoolMarket} />
              <Route exact strict path="/take" component={TakeMarket} />
              <Route component={RedirectToSwapMarket} />
            </Switch>
          </EventsContextProvider>
        </HashRouter>
        <DeveloperConsole />
      </div>
    </ThemeProvider>
  )
}

export default function App() {
  return (
    <SettingsContextProvider>
      <SubstrateContextProvider>
        <AccountContextProvider>
          <Main />
        </AccountContextProvider>
      </SubstrateContextProvider>
    </SettingsContextProvider>
  )
}
