import { serializeContact } from '@invoice-sync/lib/serializer'
import { and, eq } from 'drizzle-orm'
import type { Contact } from 'xero-node'
import z from 'zod'
import db from '@/db'
import { clientContactMappings } from '@/db/schema/clientContactMappings.schema'
import { CopilotAPI } from '@/lib/copilot/CopilotAPI'
import AuthenticatedXeroService from '@/lib/xero/AuthenticatedXero.service'

class XeroContactService extends AuthenticatedXeroService {
  async getSyncedXeroContact(clientId: string): Promise<Contact> {
    const syncedContacts = await db
      .select({ contactID: clientContactMappings.contactId })
      .from(clientContactMappings)
      .where(
        and(
          eq(clientContactMappings.portalId, this.user.portalId),
          eq(clientContactMappings.clientId, clientId),
        ),
      )

    let contact = syncedContacts[0]
    // If contact exists, return it and end method. Else, delete existing contact sync to create a new one.
    if (contact) {
      const xeroContact = await this.xero.getContact(this.connection.tenantId, contact.contactID)
      if (xeroContact) return xeroContact
      await db
        .delete(clientContactMappings)
        .where(
          and(
            eq(clientContactMappings.portalId, this.user.portalId),
            eq(clientContactMappings.clientId, clientId),
          ),
        )
    }
    console.info(
      `XeroContactService#getSyncedXeroContact :: Couldn't find existing client... creating a new one for ${clientId}`,
    )
    contact = await this.createXeroContact(clientId)
    return contact
  }

  async createXeroContact(clientId: string): Promise<Contact & { contactID: string }> {
    const copilot = new CopilotAPI(this.user.token)
    const client = await copilot.getClient(clientId)
    const contactPayload = serializeContact(client)
    const contact = await this.xero.createContact(this.connection.tenantId, contactPayload)
    await db.insert(clientContactMappings).values({
      portalId: this.user.portalId,
      clientId,
      contactId: z.string().parse(contact.contactID),
      tenantId: this.connection.tenantId,
    })
    return {
      ...contact,
      contactID: z.string().parse(contact.contactID),
    }
  }
}

export default XeroContactService
