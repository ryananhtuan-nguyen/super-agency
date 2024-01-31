'use server'

import { clerkClient, currentUser } from '@clerk/nextjs'
import { db } from './db'
import { redirect } from 'next/navigation'
import { Agency, User } from '@prisma/client'

/*
=====================GET USER DETAIL =================
==========FROM DATABASE USING AUTH DETAILS===============
*/
export const getAuthUserDetails = async () => {
  const user = await currentUser()
  if (!user) return

  const userData = await db.user.findUnique({
    where: {
      email: user.emailAddresses[0].emailAddress,
    },
    include: {
      Agency: {
        include: {
          SidebarOption: true,
          SubAccount: {
            include: {
              SidebarOption: true,
            },
          },
        },
      },
      Permissions: true,
    },
  })

  return userData
}

/*
============ Notification WRAPPER======================
*/
export const saveActivityLogsNotification = async ({
  agencyId,
  description,
  subaccountId,
}: {
  agencyId?: string
  description: string
  subaccountId?: string
}) => {
  //get auth details
  const authUser = await currentUser()
  let userData

  //if not yet sign-up with Clerk
  if (!authUser) {
    //find user in db
    const response = await db.user.findFirst({
      where: {
        Agency: {
          SubAccount: {
            some: {
              id: subaccountId,
            },
          },
        },
      },
    })
    //if use exists
    if (response) {
      userData = response
    }
  } else {
    //find user from db
    userData = await db.user.findUnique({
      where: {
        email: authUser.emailAddresses[0].emailAddress,
      },
    })
  }

  //if userdata still not exists
  if (!userData) {
    console.log('🔴 Could not find an user 🔴')
    return
  }

  //finding agency

  let foundAgencyId = agencyId

  if (!foundAgencyId) {
    //throw error if both agencyId and subaccountId are not provided
    if (!subaccountId) {
      throw new Error('AgencyID OR SubaccountID is required 🟠')
    }

    //if no agencyId provided but subaccountId is provided
    const response = await db.subAccount.findUnique({
      where: {
        id: subaccountId,
      },
    })

    if (response) foundAgencyId = response.agencyId
  }

  //Save notification
  //to Subaccount Id if exists

  if (subaccountId) {
    await db.notification.create({
      data: {
        notification: `${userData.name} | ${description}`,
        User: {
          connect: {
            id: userData.id,
          },
        },
        Agency: {
          connect: {
            id: foundAgencyId,
          },
        },
        SubAccount: {
          connect: {
            id: subaccountId,
          },
        },
      },
    })
  } else {
    //if there are no subaccountId
    await db.notification.create({
      data: {
        notification: `${userData.name} | ${description}`,
        User: {
          connect: {
            id: userData.id,
          },
        },
        Agency: {
          connect: {
            id: foundAgencyId,
          },
        },
      },
    })
  }
}

export const createTeamUser = async (agencyId: string, user: User) => {
  if (user.role === 'AGENCY_OWNER') return null

  const response = await db.user.create({ data: { ...user } })

  return response
}

export const verifyAndAcceptInvitation = async () => {
  const user = await currentUser()
  if (!user) return redirect('/sign-in')

  const invitationExists = await db.invitation.findUnique({
    where: { email: user.emailAddresses[0].emailAddress, status: 'PENDING' },
  })

  //If invitation found in db

  if (invitationExists) {
    //create new Team member
    const userDetails = await createTeamUser(invitationExists.agencyId, {
      email: invitationExists.email,
      agencyId: invitationExists.agencyId,
      avatarUrl: user.imageUrl,
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      role: invitationExists.role,
    })

    //Save notification
    await saveActivityLogsNotification({
      agencyId: invitationExists.agencyId,
      description: `Joined`,
    })

    //Successfully create new team member, attach role to clerk metadata

    if (userDetails) {
      await clerkClient.users.updateUserMetadata(user.id, {
        privateMetadata: {
          role: userDetails.role || 'SUBACCOUNT_USER',
        },
      })

      //delete the invitation after joined
      await db.invitation.delete({
        where: {
          email: userDetails.email,
        },
      })

      return userDetails.agencyId
    } else {
      return null
    }
  } else {
    const agency = await db.user.findUnique({
      where: {
        email: user.emailAddresses[0].emailAddress,
      },
    })

    return agency ? agency.agencyId : null
  }
}

export const updateAgencyDetails = async (
  agencyId: string,
  agencyDetails: Partial<Agency>
) => {
  const response = await db.agency.update({
    where: { id: agencyId },
    data: {
      ...agencyDetails,
    },
  })

  return response
}
