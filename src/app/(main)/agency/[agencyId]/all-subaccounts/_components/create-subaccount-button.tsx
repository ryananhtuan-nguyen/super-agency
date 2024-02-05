'use client'
import SubAccountDetails from '@/components/forms/subaccount-details'
import CustomModal from '@/components/global/custom-modal'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useModal } from '@/providers/modal-provider'
import { Agency, AgencySidebarOption, SubAccount, User } from '@prisma/client'
import { PlusCircleIcon } from 'lucide-react'
import React from 'react'

type Props = {
  user: User & {
    Agency:
      | (
          | Agency
          | (null & {
              SubAccount: SubAccount[]
              SideBarOption: AgencySidebarOption[]
            })
        )
      | null
  }
  id: string
  className: string
}

const CreateSubaccountButton = ({ className, id, user }: Props) => {
  const { setOpen } = useModal()
  const agencyDetails = user.Agency
  if (!agencyDetails) return null

  const handleOnClick = () => {
    setOpen(
      <CustomModal
        title="Create a Subaccount"
        subheading="You can switch between"
      >
        <SubAccountDetails
          agencyDetails={agencyDetails}
          userId={user.id}
          userName={user.name}
        />
      </CustomModal>
    )
  }

  return (
    <Button
      className={cn('w-full flex gap-4', className)}
      onClick={handleOnClick}
    >
      <PlusCircleIcon size={15} />
      Create Subaccount
    </Button>
  )
}

export default CreateSubaccountButton
