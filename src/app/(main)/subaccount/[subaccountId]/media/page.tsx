import MediaComponent from '@/components/media'
import { getMedia } from '@/lib/queries'
import React from 'react'

type Props = {
  params: {
    subaccountId: string
  }
}

const MediaPage = async ({ params }: Props) => {
  const data = await getMedia(params.subaccountId)

  return <MediaComponent data={data} subaccountId={params.subaccountId} />
}

export default MediaPage
