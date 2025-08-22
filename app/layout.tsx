import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BGHS Alumni - Barasat Govt. High School',
  description: 'Connect with fellow alumni, stay updated with school events, and contribute to your alma mater.',
  keywords: 'BGHS, Barasat Govt. High School, Alumni, Events, Donations',
  authors: [{ name: 'BGHS Alumni Association' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
