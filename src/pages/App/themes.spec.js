import { lightTheme, darkTheme } from './themes'

describe('themes tests', () => {
  it('should have lightTheme defined', () => {
    expect(lightTheme).toBeDefined()
  })

  it('should have darkTheme defined', () => {
    expect(darkTheme).toBeDefined()
  })

  it('should have the same properties in lightTheme and darkTheme', () => {
    expect(JSON.stringify(Object.keys(lightTheme).sort())).toEqual(JSON.stringify(Object.keys(darkTheme).sort()))
  })
})
