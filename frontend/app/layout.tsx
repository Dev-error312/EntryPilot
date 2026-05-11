import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'EntryPilot - Visa Processing Management',
  description: 'Multi-tenant SaaS visa processing management platform',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
