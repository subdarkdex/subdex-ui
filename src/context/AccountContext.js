import React, { createContext, useState } from 'react'

const AccountContext = createContext(null)

const AccountContextProvider = (props) => {
  const [account, setAccount] = useState(null)
  const [balances, setBalances] = useState(new Map())
  return (
    <AccountContext.Provider value={{ account, setAccount, balances, setBalances }}>
      {props.children}
    </AccountContext.Provider>
  )
}

export { AccountContext, AccountContextProvider }
