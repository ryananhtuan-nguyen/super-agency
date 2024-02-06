import InforBar from '@/components/global/inforbar'
import Sidebar from '@/components/sidebar'
import Unauthorized from '@/components/unauthorized'
import {
  getAuthUserDetails,
  getNotificationAndUser,
  verifyAndAcceptInvitation,
} from '@/lib/queries'
import { currentUser } from '@clerk/nextjs'
import { Role } from '@prisma/client'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {
  children: React.ReactNode
  params: {
    subaccountId: string
  }
}

const SubaccountLayout = async ({ children, params }: Props) => {
  const agencyId = await verifyAndAcceptInvitation()
  if (!agencyId) return <Unauthorized />

  const user = await currentUser()

  if (!user) return redirect('/')
  if (!user.privateMetadata.role) return <Unauthorized />

  const allPermissions = await getAuthUserDetails()
  const hasPermission = allPermissions?.Permissions.find(
    (perm) => perm.access && perm.subAccountId === params.subaccountId
  )

  if (!hasPermission) return <Unauthorized />

  let notifications: any = []
  const allNotification = await getNotificationAndUser(agencyId)

  const userCurrentRole = user.privateMetadata.role as Role

  if (
    userCurrentRole === 'AGENCY_ADMIN' ||
    userCurrentRole === 'AGENCY_OWNER'
  ) {
    notifications = allNotification
  } else {
    const filteredNoti = allNotification?.filter(
      (item) => item.subAccountId === params.subaccountId
    )
    if (filteredNoti) notifications = filteredNoti
  }

  return (
    <div className="h-screen overflow-hidden">
      <Sidebar id={params.subaccountId} type="subaccount" />
      <div className="md:pl-[300px">
        <InforBar
          notifications={notifications}
          role={userCurrentRole}
          subAccountId={params.subaccountId}
        />
        <div className="relative">{children}</div>
      </div>
    </div>
  )
}

export default SubaccountLayout
