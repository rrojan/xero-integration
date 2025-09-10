import 'server-only'

import type { InvoiceCreatedEvent } from '@invoice-sync/types'
import { Invoice, LineAmountTypes } from 'xero-node'
import AuthenticatedXeroService from '@/lib/xero/AuthenticatedXero.service'
import { CreateInvoicePayloadSchema } from '@/lib/xero/types'
import { datetimeToDate } from '@/utils/date'
import { serializeLineItems } from './serializer'
import XeroContactService from './XeroContact.service'

class XeroInvoiceSyncService extends AuthenticatedXeroService {
  async syncInvoiceToXero(data: InvoiceCreatedEvent) {
    // Prepare invoid payload fields
    const lineItems = serializeLineItems(data.lineItems)
    const xeroContactService = new XeroContactService(this.user, this.connection)
    const { contactID } = await xeroContactService.getSyncedContact(data.clientId)

    const invoice = CreateInvoicePayloadSchema.parse({
      type: Invoice.TypeEnum.ACCREC,
      invoiceNumber: data.number,
      contact: { contactID },
      dueDate: datetimeToDate(data.dueDate),
      lineAmountTypes: LineAmountTypes.Exclusive,
      lineItems,
      status: Invoice.StatusEnum.SUBMITTED,
      date: datetimeToDate(data.sentDate),
    } satisfies Invoice)

    const syncedInvoice = await this.xero.createInvoices(this.connection.tenantId, [invoice])
    console.info(syncedInvoice)
  }
}

export default XeroInvoiceSyncService
