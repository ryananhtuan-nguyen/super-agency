'use client'
import {
  deleteSubAccount,
  getSubaccountDetails,
  saveActivityLogsNotification,
} from '@/lib/queries'
import { useRouter } from 'next/navigation'

type Props = {
  subaccountId: string
}

const DeleteButton = ({ subaccountId }: Props) => {
  const router = useRouter()
  const handleClick = async () => {
    const response = await getSubaccountDetails(subaccountId)
    await saveActivityLogsNotification({
      description: `Deleted a subaccount | ${response?.name}`,
      subaccountId,
    })

    await deleteSubAccount(subaccountId)

    router.refresh()
  }
  return <div onClick={handleClick}>Delete Subaccount</div>
}

export default DeleteButton
