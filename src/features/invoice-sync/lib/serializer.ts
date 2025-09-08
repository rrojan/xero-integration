import { AccountCode } from '@/lib/xero/constants'
import type { LineItem } from '@/lib/xero/types'
import type { InvoiceCreatedEvent } from '../types'

export const serializeLineItems = (copilotItems: InvoiceCreatedEvent['lineItems']): LineItem[] => {
  const xeroLineItems: LineItem[] = []
  for (const item of copilotItems) {
    const serializedItem: LineItem = {
      description: item.description,
      quantity: item.quantity,
      unitAmount: item.amount / item.quantity,
      // TODO: Implement tax in later ticket
      taxAmount: 0,
      accountCode: AccountCode.SALES,
    }
    xeroLineItems.push(serializedItem)
  }

  return xeroLineItems
}
