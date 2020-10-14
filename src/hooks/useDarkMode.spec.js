import { renderHook, act } from '@testing-library/react-hooks'
import { useDarkMode } from './useDarkMode'
import MatchMediaMock from 'jest-matchmedia-mock'
import 'jest-localstorage-mock'

describe('useDarkMode hook tests', () => {
  let matchMedia

  beforeAll(() => {
    matchMedia = new MatchMediaMock()
  })

  beforeEach(() => {
    matchMedia.clear()
    localStorage.clear()
  })

  it('should use light theme by default', () => {
    const { result } = renderHook(() => useDarkMode())
    expect(result.current.theme).toBe('light')
  })

  it('should use dark theme if the media preference is dark', () => {
    matchMedia.useMediaQuery('(prefers-color-scheme: dark)')
    const { result } = renderHook(() => useDarkMode())
    expect(result.current.theme).toBe('dark')
  })

  it('should use light theme if the media preference is light', () => {
    matchMedia.useMediaQuery('(prefers-color-scheme: light)')
    const { result } = renderHook(() => useDarkMode())
    expect(result.current.theme).toBe('light')
  })

  it('should use the theme that user sets explicitly in the app regardless of media preference', () => {
    matchMedia.useMediaQuery('(prefers-color-scheme: light)')
    const { result } = renderHook(() => useDarkMode())
    expect(result.current.theme).toBe('light')
    const { toggleTheme } = result.current
    act(() => toggleTheme())
    expect(localStorage.getItem('theme')).toBe('dark')
    expect(result.current.theme).toBe('dark')
  })
})
