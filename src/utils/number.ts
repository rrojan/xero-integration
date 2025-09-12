/**
 * Robust equality checker that also works for numbers with a lot of trailing decimal points
 * Uses epsilon (1e-6) as the default threshold
 */
export const areNumbersEqual = (a?: number, b?: number, threshold = 1e-6) => {
  if (a === undefined || b === undefined) return false
  if (a === b) return true // handle exact equality

  const diff = Math.abs(a - b)
  return diff <= threshold * Math.max(1, Math.abs(a), Math.abs(b))
}
