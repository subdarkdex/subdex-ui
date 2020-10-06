export default function describe(milliseconds) {
  const seconds = Math.ceil(milliseconds / 1000)
  if (seconds < 60) {
    return `${seconds} sec`
  } else {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    if (minutes < 60) {
      return `${minutes} min ${remainingSeconds} sec`
    } else {
      const hours = Math.floor(minutes / 60)
      return `${hours} hr ${minutes} min`
    }
  }
}
