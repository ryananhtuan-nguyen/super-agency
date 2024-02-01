import { z } from 'zod'

export const AgencyFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Agency name must be minimum of 2 characters.' }),
  companyEmail: z.string().min(1),
  companyPhone: z.string().min(1),
  whiteLabel: z.boolean(),
  address: z.string().min(1),
  city: z.string().min(1),
  zipCode: z.string().min(1),
  state: z.string().min(1),
  country: z.string().min(1),
  agencyLogo: z.string().min(1),
})
