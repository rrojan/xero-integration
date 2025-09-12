import 'server-only'

import { serializeLineItems } from '@invoice-sync/lib/serializer'
import XeroContactService from '@invoice-sync/lib/XeroContact.service'
import XeroTaxService from '@invoice-sync/lib/XeroTax.service'
import type { InvoiceCreatedEvent } from '@invoice-sync/types'
import { and, eq } from 'drizzle-orm'
import status from 'http-status'
import { Invoice } from 'xero-node'
import db from '@/db'
import { type SyncedInvoiceCreatePayload, syncedInvoices } from '@/db/schema/syncedInvoices.schema'
import APIError from '@/errors/APIError'
import AuthenticatedXeroService from '@/lib/xero/AuthenticatedXero.service'
import {
  CreateInvoicePayloadSchema,
  type CreateInvoicePayload as InvoiceCreatePayload,
} from '@/lib/xero/types'
import { datetimeToDate } from '@/utils/date'

class XeroInvoiceSyncService extends AuthenticatedXeroService {
  async syncInvoiceToXero(data: InvoiceCreatedEvent): Promise<{
    copilotInvoiceId: string
    xeroInvoiceId: string | null
    status: SyncedInvoiceCreatePayload['status']
  }> {
    // Prepare invoid payload fields
    const xeroTaxService = new XeroTaxService(this.user, this.connection)
    const taxRate = data.taxAmount
      ? await xeroTaxService.getTaxRateForItem(data.taxPercentage)
      : undefined

    const lineItems = serializeLineItems(data.lineItems, taxRate)
    const xeroContactService = new XeroContactService(this.user, this.connection)
    const { contactID } = await xeroContactService.getSyncedContact(data.clientId)

    // Prepare invoice creation payload
    const invoice = CreateInvoicePayloadSchema.parse({
      type: Invoice.TypeEnum.ACCREC,
      invoiceNumber: data.number,
      contact: { contactID },
      dueDate: datetimeToDate(data.dueDate),
      lineItems,
      status: Invoice.StatusEnum.AUTHORISED,
      date: datetimeToDate(data.sentDate),
    } satisfies InvoiceCreatePayload)

    // Add a "pending" invoice to db
    let syncedInvoiceRecord = await this.getOrCreateInvoiceRecord(data)
    if (syncedInvoiceRecord.status === 'success') {
      console.info(
        `XeroInvoiceSyncService#syncInvoiceToXero :: Ignoring ${syncedInvoiceRecord.status} sync`,
      )
      return syncedInvoiceRecord
    }

    // Create and save invoice status
    try {
      const syncedInvoice = await this.xero.createInvoice(this.connection.tenantId, invoice)
      syncedInvoiceRecord = await this.updateInvoiceRecord(
        data,
        syncedInvoice,
        syncedInvoice ? 'success' : 'failed',
      )
    } catch (e: unknown) {
      syncedInvoiceRecord = await this.updateInvoiceRecord(data, undefined, 'failed')
      throw new APIError('Failed to store synced invoice record', status.INTERNAL_SERVER_ERROR, e)
    }

    console.info(
      `XeroInvoiceSyncService#syncInvoiceToXero :: Synced Copilot invoice ${syncedInvoiceRecord.copilotInvoiceId} to Xero invoice ${syncedInvoiceRecord.xeroInvoiceId} for portalId ${this.connection.portalId}`,
    )
    return syncedInvoiceRecord
  }

  private async getOrCreateInvoiceRecord(
    data: InvoiceCreatedEvent,
    syncedInvoice?: Invoice,
    status?: SyncedInvoiceCreatePayload['status'], // allow db to default to 'pending'
  ) {
    const returning = {
      copilotInvoiceId: syncedInvoices.copilotInvoiceId,
      xeroInvoiceId: syncedInvoices.xeroInvoiceId,
      status: syncedInvoices.status,
    }
    const prevInvoices = await db
      .select(returning)
      .from(syncedInvoices)
      .where(
        and(
          eq(syncedInvoices.portalId, this.user.portalId),
          eq(syncedInvoices.copilotInvoiceId, data.id),
        ),
      )
    if (prevInvoices[0]) return prevInvoices[0]

    const [invoice] = await db
      .insert(syncedInvoices)
      .values({
        portalId: this.user.portalId,
        tenantId: this.connection.tenantId,
        copilotInvoiceId: data.id,
        xeroInvoiceId: syncedInvoice?.invoiceID,
        status,
      })
      .returning(returning)
    return invoice
  }

  private async updateInvoiceRecord(
    data: InvoiceCreatedEvent,
    syncedInvoice?: Invoice,
    status?: SyncedInvoiceCreatePayload['status'],
  ) {
    const [invoice] = await db
      .update(syncedInvoices)
      .set({
        xeroInvoiceId: syncedInvoice?.invoiceID,
        portalId: this.user.portalId,
        tenantId: this.connection.tenantId,
        status,
      })
      .where(
        and(
          eq(syncedInvoices.portalId, this.user.portalId),
          eq(syncedInvoices.copilotInvoiceId, data.id),
        ),
      )
      .returning({
        copilotInvoiceId: syncedInvoices.copilotInvoiceId,
        xeroInvoiceId: syncedInvoices.xeroInvoiceId,
        status: syncedInvoices.status,
      })
    return invoice
  }
}

export default XeroInvoiceSyncService
