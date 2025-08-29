import { timestamp } from 'drizzle-orm/pg-core'

export const timestamps = {
  // use timestamptz for timezone support via withTimezone: true
  createdAt: timestamp({ withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
}
