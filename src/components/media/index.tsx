import React from 'react'

import { GetMediaFiles } from '@/lib/types'
import MediaUploadButton from './upload-button'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command'
import MediaCard from './media-card'

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
      <Command className="bg-transparent">
        <CommandInput placeholder="Search for file name..." />
        <CommandList className="pb-40 max-h-full">
          <CommandEmpty>No media file.</CommandEmpty>
          <div className="flex flex-wrap gap-4 pt-4">
            {data?.Media.map((file) => (
              <CommandItem
                key={file.id}
                className="p-0 max-w-[300px] w-full rounded-lg !bg-transparent !font-medium !text-white"
              >
                <MediaCard file={file} />
              </CommandItem>
            ))}
          </div>
        </CommandList>
      </Command>
    </div>
  )
}

export default MediaComponent
