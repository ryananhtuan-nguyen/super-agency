import { ClerkProvider } from '@clerk/nextjs'
import React, { PropsWithChildren } from 'react'
import { dark } from '@clerk/themes'
const MainLayout = ({ children }: PropsWithChildren) => {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>{children}</ClerkProvider>
  )
}

export default MainLayout
