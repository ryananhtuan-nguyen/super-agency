import { ThemeProvider } from '@/providers/theme-provider'
import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'
import ModalProvider from '@/providers/modal-provider'
import { Toaster } from '@/components/ui/toaster'

const inter = DM_Sans({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SuperAgency | S#A',
  description: 'All in one Agency Solution',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ModalProvider>{children}</ModalProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
