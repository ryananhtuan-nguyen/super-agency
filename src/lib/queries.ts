'use server'

import { clerkClient, currentUser } from '@clerk/nextjs'
import { db } from './db'
import { redirect } from 'next/navigation'
import {
  Agency,
  Permissions,
  Plan,
  Role,
  SubAccount,
  User,
} from '@prisma/client'
import { v4 } from 'uuid'
import { CreateMediaType } from './types'

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

//==============================================================================
//==============================================================================
//=========================UPDATE AGENCY DETAILS================================
//==============================================================================
//==============================================================================

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

//==============================================================================
//==============================================================================
//==============================DELETE AN AGENCY================================
//==============================================================================
//==============================================================================

export const deleteAgency = async (agencyId: string) => {
  const response = await db.agency.delete({ where: { id: agencyId } })
  return response
}

//==============================================================================
//==============================================================================
//==========================INITIALIZE AN USER==================================
//====================INSERT METADATA TO CLERK USER=============================
//==============================================================================
//==============================================================================

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

//==============================================================================
//==============================================================================
//==========================UPSERT AN AGENCY====================================
//==============================================================================
//==============================================================================

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

//==============================================================================
//==============================================================================
//==========================GET NOTIFICATIONS===================================
//===============ALSO RETURN USER TO CHECK IN FRONT-END=========================
//==============================================================================
//==============================================================================

export const getNotificationAndUser = async (agencyId: string) => {
  try {
    const response = await db.notification.findMany({
      where: { agencyId },
      include: { User: true },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return response
  } catch (error) {
    console.log('🔴 Error getting Notifications 🔴')
    return null
  }
}

//==============================================================================
//==============================================================================
//==========================UPSERT AN SUBACCOUNT================================
//==============================================================================
//==============================================================================

export const upsertSubAccount = async (subAccount: SubAccount) => {
  if (!subAccount.companyEmail) return null
  const agencyOwner = await db.user.findFirst({
    where: {
      Agency: {
        id: subAccount.agencyId,
      },
      role: 'AGENCY_OWNER',
    },
  })

  if (!agencyOwner) {
    console.log('🔴 Error: Could not create subaccount 🔴')
    return null
  }

  const permissionId = v4()
  const response = await db.subAccount.upsert({
    where: {
      id: subAccount.id,
    },
    update: subAccount,
    create: {
      ...subAccount,
      Permissions: {
        create: {
          access: true,
          email: agencyOwner.email,
          id: permissionId,
        },
        connect: {
          subAccountId: subAccount.id,
          id: permissionId,
        },
      },
      Pipeline: {
        create: {
          name: 'Lead Cycle',
        },
      },
      SidebarOption: {
        create: [
          {
            name: 'Launchpad',
            icon: 'clipboardIcon',
            link: `/subaccount/${subAccount.id}/launchpad`,
          },
          {
            name: 'Settings',
            icon: 'settings',
            link: `/subaccount/${subAccount.id}/settings`,
          },
          {
            name: 'Funnels',
            icon: 'pipelines',
            link: `/subaccount/${subAccount.id}/funnels`,
          },
          {
            name: 'Media',
            icon: 'database',
            link: `/subaccount/${subAccount.id}/media`,
          },
          {
            name: 'Automations',
            icon: 'chip',
            link: `/subaccount/${subAccount.id}/automations`,
          },
          {
            name: 'Pipelines',
            icon: 'flag',
            link: `/subaccount/${subAccount.id}/pipelines`,
          },
          {
            name: 'Contacts',
            icon: 'person',
            link: `/subaccount/${subAccount.id}/contacts`,
          },
          {
            name: 'Dashboard',
            icon: 'category',
            link: `/subaccount/${subAccount.id}`,
          },
        ],
      },
    },
  })
  return response
}

//==============================================================================
//==============================================================================
//==========================GET USER PERMISSIONS================================
//==============================================================================
//==============================================================================

export const getUserPermissions = async (userId: string) => {
  const response = await db.user.findUnique({
    where: {
      id: userId,
    },
    select: { Permissions: { include: { SubAccount: true } } },
  })
  return response
}

//==============================================================================
//==============================================================================
//==============================UPDATE USER=====================================
//==============================================================================
//==============================================================================

export const updateUser = async (user: Partial<User>) => {
  const updatedUser = await db.user.update({
    where: {
      email: user.email,
    },
    data: { ...user },
  })

  await clerkClient.users.updateUserMetadata(updatedUser.id, {
    privateMetadata: {
      role: user.role || 'SUBACCOUNT_USER',
    },
  })

  return updatedUser
}

//==============================================================================
//==============================================================================
//==============================changeUserPermission============================
//==============================================================================
//==============================================================================

export const changeUserPermission = async (
  permissionId: string | undefined,
  userEmail: string,
  subAccountId: string,
  permission: boolean
) => {
  try {
    const response = await db.permissions.upsert({
      where: { id: permissionId },
      update: { access: permission },
      create: {
        access: permission,
        email: userEmail,
        subAccountId: subAccountId,
      },
    })

    return response
  } catch (error) {
    console.log('🔴 Could not change permission', error)
    return null
  }
}

//==============================================================================
//==============================================================================
//==============================GET SUBACCOUNT DETAILS==========================
//==============================================================================
//==============================================================================

export const getSubaccountDetails = async (subaccountId: string) => {
  const response = await db.subAccount.findUnique({
    where: {
      id: subaccountId,
    },
  })
  return response
}

//==============================================================================
//==============================================================================
//=================================DELETE SUBACCOUNT============================
//==============================================================================
//==============================================================================

export const deleteSubAccount = async (subaccountId: string) => {
  const response = await db.subAccount.delete({
    where: {
      id: subaccountId,
    },
  })

  return response
}

//==============================================================================
//==============================================================================
//===============================GET USER BY ID=================================
//==============================================================================
//==============================================================================

export const getUser = async (id: string) => {
  const user = await db.user.findUnique({
    where: {
      id,
    },
  })

  return user
}

//==============================================================================
//==============================================================================
//============================DELETE USER BY ID=================================
//==============================================================================
//==============================================================================

export const deleteUser = async (userId: string) => {
  await clerkClient.users.updateUserMetadata(userId, {
    privateMetadata: {
      role: undefined,
    },
  })
  const deletedUser = await db.user.delete({ where: { id: userId } })

  return deletedUser
}

//==============================================================================
//==============================================================================
//============================SEND INVITATION===================================
//==============================================================================
//==============================================================================

export const sendInvitation = async (
  role: Role,
  email: string,
  agencyId: string
) => {
  const resposne = await db.invitation.create({
    data: { email, agencyId, role },
  })

  try {
    const invitation = await clerkClient.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: process.env.NEXT_PUBLIC_URL,
      publicMetadata: {
        throughInvitation: true,
        role,
      },
    })
  } catch (error) {
    console.log(error)
    throw error
  }

  return resposne
}

//==============================================================================
//==============================================================================
//=========================GET SUBACCOUNT MEDIA ================================
//==============================================================================
//==============================================================================

export const getMedia = async (subaccountId: string) => {
  const mediaFiles = await db.subAccount.findUnique({
    where: {
      id: subaccountId,
    },
    include: {
      Media: true,
    },
  })

  return mediaFiles
}

//==============================================================================
//==============================================================================
//=======================CREATE SUBACCOUNT MEDIA ===============================
//==============================================================================
//==============================================================================

export const createMedia = async (
  subaccountId: string,
  mediaFile: CreateMediaType
) => {
  const response = await db.media.create({
    data: {
      link: mediaFile.link,
      name: mediaFile.name,
      subAccountId: subaccountId,
    },
  })

  return response
}

//==============================================================================
//==============================================================================
//========================DELETE SUBACCOUNT MEDIA ==============================
//==============================================================================
//==============================================================================

export const deleteMedia = async (id: string) => {
  const response = await db.media.delete({
    where: {
      id,
    },
  })

  return response
}

//==============================================================================
//==============================================================================
//========================GET PIPELINES DETAILS=================================
//==============================================================================
//==============================================================================

export const getPipelineDetails = async (pipelineId: string) => {
  const response = await db.pipeline.findUnique({
    where: {
      id: pipelineId,
    },
  })

  return response
}
