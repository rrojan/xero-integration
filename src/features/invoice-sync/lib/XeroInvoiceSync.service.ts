import 'server-only'

import type { InvoiceCreatedEvent } from '@invoice-sync/types'
import { Invoice, LineAmountTypes } from 'xero-node'
import AuthenticatedXeroService from '@/lib/xero/AuthenticatedXero.service'
import { type CreateInvoicePayload, CreateInvoicePayloadSchema } from '@/lib/xero/types'
import { datetimeToDate } from '@/utils/date'
import { serializeLineItems } from './serializer'

class XeroInvoiceSyncService extends AuthenticatedXeroService {
  async syncInvoiceToXero(data: InvoiceCreatedEvent) {
    const lineItems = serializeLineItems(data.lineItems)
    const invoice = CreateInvoicePayloadSchema.parse({
      invoiceNumber: data.number,
      type: Invoice.TypeEnum.ACCREC,
      // TODO: Client ID is static for now, will be handled in upcoming ticket
      contact: { contactID: 'e74c821d-422a-42eb-926f-dd5db199bb81' },
      dueDate: datetimeToDate(data.dueDate),
      lineAmountTypes: LineAmountTypes.Exclusive,
      lineItems,
      status: Invoice.StatusEnum.SUBMITTED,
      date: datetimeToDate(data.sentDate),
    } satisfies CreateInvoicePayload)

    const syncedInvoice = await this.xero.createInvoice(this.connection.tenantId, [invoice])
    console.info(syncedInvoice)
  }

  // invoices: [
  //   {
  //     type: Invoice.TypeEnum.ACCREC,
  //     contact: {
  //       contactID: 'e74c821d-422a-42eb-926f-dd5db199bb81',
  //     },
  //     dueDate: '2026-06-06',
  //     lineItems: [
  //       {
  //       },
  //     ],
  //     status: Invoice.StatusEnum.AUTHORISED,
  //   },
  // ],
}

export default XeroInvoiceSyncService
