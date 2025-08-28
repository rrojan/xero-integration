import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import 'copilot-design-system/dist/styles/main.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  title: 'Copilot Xero Integration',
  description: 'Sync Copilot invoices with Xero effortlessly',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  )
}
