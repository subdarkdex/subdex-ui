import { useEffect, useState } from 'react'

const useSlippage = () => {
  const [slippage, setSlippage] = useState(5)

  const saveSlippage = (value) => {
    window.localStorage.setItem('slippage', value)
    setSlippage(value)
  }

  useEffect(() => {
    const savedSlippage = window.localStorage.getItem('slippage')
    if (savedSlippage) {
      setSlippage(parseInt(savedSlippage))
    }
  }, [])

  return { slippage, saveSlippage }
}

export default useSlippage
