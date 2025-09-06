import 'server-only'

import z from 'zod'
import { copilotBottleneck } from '@/lib/copilot/bottleneck'
import type User from '@/lib/copilot/models/User.model'

export const sendAuthorizationFailedNotification = async (user: User, e?: unknown) => {
  const internalUsers = await user.copilot.getInternalUsers()

  const notificationPromises = []

  for (const internalUser of internalUsers.data) {
    const promise = user.copilot.createNotification({
      senderId: z.uuid().parse(user.internalUserId),
      senderType: 'internalUser',
      recipientInternalUserId: internalUser.id,
      deliveryTargets: {
        inProduct: {
          title: 'Xero Integration Has Stopped Working',
          body: 'Your Xero integration encountered an error and has stopped syncing. Please reconnect to avoid any disruptions.',
        },
        email: {
          header: 'Your Xero Sync has stopped working',
          subject: 'Your Xero Sync has stopped working',
          body: 'Your Xero integration encountered an error and has stopped syncing. Please reconnect to avoid any disruptions.',
          title: 'Reconnect Xero',
        },
      },
    })
    notificationPromises.push(copilotBottleneck.schedule(() => promise))
  }

  await Promise.all(notificationPromises)

  if (e && e instanceof Error) {
    console.error(
      'XeroConection.helpers#sendAuthorizationFailedNotification :: Xero authorization failed:',
      e,
    )
  }
}
