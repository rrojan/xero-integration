import 'server-only'

import { serializeLineItems } from '@invoice-sync/lib/serializer'
import XeroContactService from '@invoice-sync/lib/XeroContact.service'
import XeroTaxService from '@invoice-sync/lib/XeroTax.service'
import type { InvoiceCreatedEvent } from '@invoice-sync/types'
import { Invoice, LineAmountTypes } from 'xero-node'
import AuthenticatedXeroService from '@/lib/xero/AuthenticatedXero.service'
import {
  CreateInvoicePayloadSchema,
  type CreateInvoicePayload as InvoiceCreatePayload,
} from '@/lib/xero/types'
import { datetimeToDate } from '@/utils/date'

class XeroInvoiceSyncService extends AuthenticatedXeroService {
  async syncInvoiceToXero(data: InvoiceCreatedEvent) {
    // Prepare invoid payload fields
    const lineItems = serializeLineItems(data.lineItems)
    const xeroContactService = new XeroContactService(this.user, this.connection)
    const { contactID } = await xeroContactService.getSyncedContact(data.clientId)
    const xeroTaxService = new XeroTaxService(this.user, this.connection)
    await xeroTaxService.getTaxRateForItem(5)

    const invoice = CreateInvoicePayloadSchema.parse({
      type: Invoice.TypeEnum.ACCREC,
      invoiceNumber: data.number,
      contact: { contactID },
      dueDate: datetimeToDate(data.dueDate),
      lineAmountTypes: LineAmountTypes.Exclusive,
      lineItems,
      status: Invoice.StatusEnum.AUTHORISED,
      date: datetimeToDate(data.sentDate),
    } satisfies InvoiceCreatePayload)

    const syncedInvoice = await this.xero.createInvoices(this.connection.tenantId, [invoice])
    console.info(syncedInvoice)
  }
}

export default XeroInvoiceSyncService
