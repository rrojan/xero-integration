import 'server-only'

import XeroInvoiceSyncService from '@invoice-sync/lib/XeroInvoiceSync.service'
import { InvoiceCreatedEventSchema, type WebhookEvent } from '@invoice-sync/types'
import status from 'http-status'
import APIError from '@/errors/APIError'
import AuthenticatedXeroService from '@/lib/xero/AuthenticatedXero.service'

class WebhookService extends AuthenticatedXeroService {
  async handleEvent(data: WebhookEvent) {
    console.info(
      'WebhookService#handleEvent :: Handling webhook for user',
      this.user.portalId,
      this.user.token,
    )
    console.info('WebhookService#handleEvent :: Received webhook event data', JSON.stringify(data))

    const eventHandlerMap: Record<
      WebhookEvent['eventType'],
      (eventData: WebhookEvent['data']) => object
    > = {
      'invoice.created': this.handleInvoiceCreated,
    }
    const handler = eventHandlerMap[data.eventType]
    return await handler(data.data)
  }

  private handleInvoiceCreated = async (eventData: WebhookEvent['data']) => {
    const data = await InvoiceCreatedEventSchema.parse(eventData)

    if (data.status === 'draft') {
      throw new APIError(`Ignoring draft invoice ${eventData.id}`, status.OK)
    }

    const xeroInvoiceSyncService = new XeroInvoiceSyncService(this.user, this.connection)
    return await xeroInvoiceSyncService.syncInvoiceToXero(data)
  }
}

export default WebhookService
