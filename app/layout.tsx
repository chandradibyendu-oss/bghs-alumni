import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BGHS Alumni - বারাসাত গভঃ হাই স্কুল প্রাক্তন ছাত্র সমিতি',
  description: 'BGHS Alumni: Connect with fellow alumni from Barasat Peary Charan Sarkar Government High School. Stay updated with school events, network with former classmates, and contribute to your alma mater\'s legacy.',
  keywords: 'BGHS Alumni, Barasat Govt. High School, Barasat Peary Charan Sarkar Government High School, Alumni Association, Events, Directory, Donations, Barasat, West Bengal, বারাসাত গভঃ হাই স্কুল প্রাক্তন ছাত্র সমিতি',
  authors: [{ name: 'BGHS Alumni Association' }],
  viewport: 'width=device-width, initial-scale=1',
  openGraph: {
    title: 'BGHS Alumni - বারাসাত গভঃ হাই স্কুল প্রাক্তন ছাত্র সমিতি',
    description: 'Connect with fellow alumni from Barasat Peary Charan Sarkar Government High School',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BGHS Alumni - বারাসাত গভঃ হাই স্কুল প্রাক্তন ছাত্র সমিতি',
    description: 'Connect with fellow alumni from Barasat Peary Charan Sarkar Government High School',
  },
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
