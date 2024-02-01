'use server'

import { clerkClient, currentUser } from '@clerk/nextjs'
import { db } from './db'
import { redirect } from 'next/navigation'
import { Agency, Permissions, Plan, User } from '@prisma/client'

//==============================================================================
//==============================================================================
//======================GET USER DETAIL ========================================
//=================FROM DATABASE USING AUTH DETAILS=============================
//==============================================================================
//==============================================================================

export const getAuthUserDetails = async () => {
  const user = await currentUser()
  if (!user) return null

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
//==============================================================================
//==============================================================================
//============================= Notification WRAPPER ===========================
//==============================================================================
//==============================================================================

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

//==============================================================================
//==============================================================================
//========================CREATE TEAM USER =====================================
//==============================================================================
//==============================================================================

export const createTeamUser = async (
  agencyId: string,
  user: Omit<User, 'createdAt' | 'updatedAt'>
) => {
  if (user.role === 'AGENCY_OWNER') return null

  const response = await db.user.create({ data: { ...user } })

  return response
}
//==============================================================================
//==============================================================================
//=============VERIFY AND ACCEPT TEAM INVITATION================================
//==============================================================================
//==============================================================================

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

export const deleteAgency = async (agencyId: string) => {
  const response = await db.agency.delete({ where: { id: agencyId } })
  return response
}

export const initUser = async (newUser: Partial<User>) => {
  const user = await currentUser()
  if (!user) return

  const userData = await db.user.upsert({
    where: {
      email: user.emailAddresses[0].emailAddress,
    },
    update: newUser,
    create: {
      id: user.id,
      avatarUrl: user.imageUrl,
      email: user.emailAddresses[0].emailAddress,
      name: `${user.firstName} ${user.lastName}`,
      role: newUser.role || 'SUBACCOUNT_USER',
    },
  })

  await clerkClient.users.updateUserMetadata(user.id, {
    privateMetadata: {
      role: newUser.role || 'SUBACCOUNT_USER',
    },
  })

  return userData
}

export const upsertAgency = async (agency: Agency, price?: Plan) => {
  if (!agency.companyEmail) return null

  try {
    const agencyDetails = await db.agency.upsert({
      where: {
        id: agency.id,
      },
      update: agency,
      create: {
        users: {
          connect: {
            email: agency.companyEmail,
          },
        },

        ...agency,
        SidebarOption: {
          create: [
            {
              name: 'Dashboard',
              icon: 'category',
              link: `/agency/${agency.id}`,
            },
            {
              name: 'Launchpad',
              icon: 'clipboardIcon',
              link: `/agency/${agency.id}/launchpad`,
            },
            {
              name: 'Billing',
              icon: 'payment',
              link: `/agency/${agency.id}/billing`,
            },
            {
              name: 'Settings',
              icon: 'settings',
              link: `/agency/${agency.id}/settings`,
            },
            {
              name: 'Sub Accounts',
              icon: 'person',
              link: `/agency/${agency.id}/all-subaccounts`,
            },
            {
              name: 'Team',
              icon: 'shield',
              link: `/agency/${agency.id}/team`,
            },
          ],
        },
      },
    })

    return agencyDetails
  } catch (error) {
    console.log('🔴 Error upserting agency 🔴')
  }
}
