import 'server-only'

import { serializeLineItems } from '@invoice-sync/lib/serializer'
import XeroContactService from '@invoice-sync/lib/XeroContact.service'
import XeroTaxService from '@invoice-sync/lib/XeroTax.service'
import type { InvoiceCreatedEvent } from '@invoice-sync/types'
import { Invoice } from 'xero-node'
import AuthenticatedXeroService from '@/lib/xero/AuthenticatedXero.service'
import {
  CreateInvoicePayloadSchema,
  type CreateInvoicePayload as InvoiceCreatePayload,
} from '@/lib/xero/types'
import { datetimeToDate } from '@/utils/date'

class XeroInvoiceSyncService extends AuthenticatedXeroService {
  async syncInvoiceToXero(data: InvoiceCreatedEvent) {
    // Prepare invoid payload fields
    const xeroTaxService = new XeroTaxService(this.user, this.connection)
    const taxRate = data.taxAmount
      ? await xeroTaxService.getTaxRateForItem(data.taxPercentage)
      : undefined

    const lineItems = serializeLineItems(data.lineItems, taxRate)
    const xeroContactService = new XeroContactService(this.user, this.connection)
    const { contactID } = await xeroContactService.getSyncedContact(data.clientId)

    const invoice = CreateInvoicePayloadSchema.parse({
      type: Invoice.TypeEnum.ACCREC,
      invoiceNumber: data.number,
      contact: { contactID },
      dueDate: datetimeToDate(data.dueDate),
      lineItems,
      status: Invoice.StatusEnum.AUTHORISED,
      date: datetimeToDate(data.sentDate),
    } satisfies InvoiceCreatePayload)

    const syncedInvoice = await this.xero.createInvoices(this.connection.tenantId, [invoice])
    console.info(syncedInvoice)
  }
}

export default XeroInvoiceSyncService
