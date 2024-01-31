import {
  generateUploadButton,
  generateUploadDropzone,
  generateUploader,
} from '@uploadthing/react'

import { generateReactHelpers } from '@uploadthing/react/hooks'

import { type OurFileRouter } from '@/app/api/uploadthing/core'

export const UploadButton = generateUploadButton<OurFileRouter>()

export const UploadDropzone = generateUploadDropzone<OurFileRouter>()

export const Uploader = generateUploader<OurFileRouter>()

export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>()
