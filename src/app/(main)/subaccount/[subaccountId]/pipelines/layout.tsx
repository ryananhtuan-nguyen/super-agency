import BlurPage from '@/components/global/blur-page'
import React, { PropsWithChildren } from 'react'

const PipelinesLayout = ({ children }: PropsWithChildren) => {
  return <BlurPage>{children}</BlurPage>
}

export default PipelinesLayout
