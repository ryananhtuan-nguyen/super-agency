import Sidebar from '@/components/sidebar'
import React from 'react'

const AgencyIdPage = ({ params }: { params: { agencyId: string } }) => {
  return (
    <div>
      <Sidebar id={params.agencyId} type="agency" />
      {params.agencyId}
    </div>
  )
}

export default AgencyIdPage
