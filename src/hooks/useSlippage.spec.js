import { renderHook, act } from '@testing-library/react-hooks'
import 'jest-localstorage-mock'
import useSlippage from './useSlippage'

describe('useSlippage hook tests', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should have 5 as default slippage', () => {
    const { result } = renderHook(() => useSlippage())
    expect(result.current.slippage).toBe(5)
  })

  it('should save slippage successfully', () => {
    const { result } = renderHook(() => useSlippage())
    const { saveSlippage } = result.current
    act(() => saveSlippage(6))
    expect(localStorage.getItem('slippage')).toBe('6')
    expect(result.current.slippage).toBe(6)
  })
})
