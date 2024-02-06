import { z } from 'zod'

export const MediaFormSchema = z.object({
  link: z.string().min(1, { message: 'Media file is required' }),
  name: z.string().min(1, { message: 'Name is required' }),
})
