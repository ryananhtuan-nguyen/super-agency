import { z } from 'zod'

export const UserInvitationSchema = z.object({
  email: z.string().email(),
  role: z.enum(['AGENCY_ADMIN', 'SUBACCOUNT_USER', 'SUBACCOUNT_GUEST']),
})
