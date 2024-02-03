import Navigation from '@/components/site/navigation'
import { ClerkProvider, currentUser } from '@clerk/nextjs'
import React, { PropsWithChildren } from 'react'
import { dark } from '@clerk/themes'

const SiteLayout = async ({ children }: PropsWithChildren) => {
  const user = await currentUser()
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <main className="min-h-screen">
        <Navigation user={user} />
        {children}
      </main>
    </ClerkProvider>
  )
}

export default SiteLayout
