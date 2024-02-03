'use client'
import {
  AuthUserWithAgencySigebarOptionsSubAccounts,
  UserWithPermissionsAndSubAccounts,
} from '@/lib/types'
import { useModal } from '@/providers/modal-provider'
import { SubAccount, User } from '@prisma/client'
import React, { useEffect, useState } from 'react'
import { useToast } from '../ui/use-toast'
import { useRouter } from 'next/navigation'
import {
  getAuthUserDetails,
  getUserPermissions,
  saveActivityLogsNotification,
  updateUser,
} from '@/lib/queries'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { UserDataSchema } from '@/lib/form-schemas/userDataSchema'
import { zodResolver } from '@hookform/resolvers/zod'

type Props = {
  id: string | null
  type: 'agency' | 'subaccount'
  userData?: Partial<User>
  subAccounts?: SubAccount[]
}

const UserDetails = ({ id, type, subAccounts, userData }: Props) => {
  const [subAccountPermissions, setSubAccountPermissions] =
    useState<UserWithPermissionsAndSubAccounts>(null)

  const { data, setClose } = useModal()
  const { toast } = useToast()
  const router = useRouter()

  const [authUserData, setAuthUserData] =
    useState<AuthUserWithAgencySigebarOptionsSubAccounts>(null)
  const [roleState, setRoleState] = useState('')
  const [loadingPermission, setLoadingPermissions] = useState(false)

  //get authuser

  useEffect(() => {
    if (data.user) {
      const fetchDetails = async () => {
        const response = await getAuthUserDetails()
        if (response) setAuthUserData(response)
      }
      fetchDetails()
    }
  }, [])

  const form = useForm<z.infer<typeof UserDataSchema>>({
    resolver: zodResolver(UserDataSchema),
    mode: 'onChange',
    defaultValues: {
      name: userData ? userData.name : data?.user?.name,
      email: userData ? userData.email : data?.user?.email,
      avatarUrl: userData ? userData.avatarUrl : data?.user?.avatarUrl,
      role: userData ? userData.role : data?.user?.role,
    },
  })

  //fetching permissions

  useEffect(() => {
    if (!data.user) return
    const getPermissions = async () => {
      if (!data.user) return
      const permission = await getUserPermissions(data.user.id)
      setSubAccountPermissions(permission)
    }
    getPermissions()
  }, [data, form])

  //reset form
  useEffect(() => {
    if (data.user) {
      form.reset(data.user)
    }

    if (userData) {
      form.reset(userData)
    }
  }, [data, userData])

  //form handling
  const onSubmit = async (values: z.infer<typeof UserDataSchema>) => {
    if (!id) return
    if (userData || data?.user) {
      const updatedUser = await updateUser(values)

      authUserData?.Agency?.SubAccount.filter((subacc) =>
        authUserData.Permissions.find(
          (p) => p.subAccountId === subacc.id && p.access
        )
      ).forEach(async (subaccount) => {
        await saveActivityLogsNotification({
          description: `Updated ${userData?.name} information`,
          subaccountId: subaccount.id,
        })
      })

      //successfully updated user
      if (updatedUser) {
        toast({
          title: 'Success',
          description: 'Updated user information',
        })
        setClose()
        router.refresh()
      } else {
        toast({
          title: 'Failed',
          variant: 'destructive',
          description: 'Could not update user information',
        })
      }
    } else {
      console.log('Error could not submit')
    }
  }

  return <div>UserDetails</div>
}

export default UserDetails
