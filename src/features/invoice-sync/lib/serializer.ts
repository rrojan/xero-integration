import {
  type ContactCreatePayload,
  ContactCreatePayloadSchema,
  type InvoiceCreatedEvent,
} from '@invoice-sync/types'
import type { TaxRate, LineItem as XeroLineItem } from 'xero-node'
import type { ClientResponse } from '@/lib/copilot/types'
import { AccountCode } from '@/lib/xero/constants'
import { type LineItem, LineItemSchema } from '@/lib/xero/types'

export const serializeLineItems = (
  copilotItems: InvoiceCreatedEvent['lineItems'],
  taxRate?: TaxRate,
): LineItem[] => {
  const xeroLineItems: LineItem[] = []
  for (const item of copilotItems) {
    const serializedItem = LineItemSchema.parse({
      description: item.description,
      quantity: item.quantity,
      unitAmount: item.amount / 100,
      taxAmount: typeof taxRate?.effectiveRate === 'number' ? taxRate.effectiveRate : 0,
      taxType: taxRate?.taxType,
      accountCode: AccountCode.SALES,
    } satisfies XeroLineItem)
    xeroLineItems.push(serializedItem)
  }

  return xeroLineItems
}

export const serializeContact = (client: ClientResponse): ContactCreatePayload => {
  return ContactCreatePayloadSchema.parse({
    name: `${client.givenName} ${client.familyName}`,
    firstName: client.givenName,
    lastName: client.familyName,
    emailAddress: client.email,
  } satisfies ContactCreatePayload)
}
