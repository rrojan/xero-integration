export const calculateTaxAmount = (itemAmount: number, quantity: number, taxRate: unknown) => {
  return typeof taxRate === 'number'
    ? Number(((taxRate / 100) * (itemAmount / 100) * quantity).toFixed(2))
    : 0
}
