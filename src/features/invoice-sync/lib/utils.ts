export const calculateTaxAmount = (
  itemAmount: number,
  quantity: number,
  taxRate: unknown,
): number => {
  return typeof taxRate === 'number'
    ? Number((((itemAmount * quantity) / 100) * (taxRate / 100)).toFixed(2))
    : 0
}
