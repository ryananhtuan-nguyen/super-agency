import { GetMediaFiles } from '@/lib/types'
import React from 'react'
import MediaUploadButton from './upload-button'

type Props = {
  data: GetMediaFiles
  subaccountId: string
}

const MediaComponent = ({ data, subaccountId }: Props) => {
  return (
    <div className="flex flex-col gap-4 h-full w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl">Media Bucket</h1>
        <MediaUploadButton subaccountId={subaccountId} />
      </div>
    </div>
  )
}

export default MediaComponent
