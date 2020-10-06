import useSubstrate from '../../hooks/useSubstrate'

export default function DeveloperConsole(props) {
  const { api } = useSubstrate()
  window.api = api
  return null
}
