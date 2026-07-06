import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Header from '@/components/header'
import { siteMetadata } from '@/metadata'
import { Analytics } from '@vercel/analytics/next'
import Providers from '@/components/providers'
import { ReactScan } from '@/components/react-scan'

const fontSans = Geist({
  variable: '--font-sans',
  subsets: ['latin']
})

const fontMono = Geist_Mono({
  variable: '--font-mono',
  subsets: ['latin']
})

export const metadata: Metadata = siteMetadata

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${fontSans.variable} ${fontMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers>
          <Header />
          {children}
        </Providers>
        <Analytics />
        <ReactScan />
      </body>
    </html>
  )
}
