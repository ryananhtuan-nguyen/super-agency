import Navigation from '@/components/site/navigation'
import React, { PropsWithChildren } from 'react'

const SiteLayout = ({ children }: PropsWithChildren) => {
  return (
    <main className="h-full">
      <Navigation />
      {children}
    </main>
  )
}

export default SiteLayout
