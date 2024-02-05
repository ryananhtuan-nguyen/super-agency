import { CheckCircleIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { db } from '@/lib/db'

type Props = {
  params: {
    agencyId: string
  }
  searchParams: { code: string }
}

const LaunchPadPage = async ({ params, searchParams }: Props) => {
  const agencyDetails = await db.agency.findUnique({
    where: {
      id: params.agencyId,
    },
  })

  if (!agencyDetails) return null

  const allDetailsExist = !!(
    agencyDetails.address &&
    agencyDetails.agencyLogo &&
    agencyDetails.city &&
    agencyDetails.companyEmail &&
    agencyDetails.companyPhone &&
    agencyDetails.country &&
    agencyDetails.name &&
    agencyDetails.state &&
    agencyDetails.zipCode
  )

  console.log(agencyDetails, 'EXIST', allDetailsExist)
  return (
    <div className="flex flex-col justify-center items-center">
      <div className="w-full h-full max-w-[800px]">
        <Card className="border-none">
          <CardHeader>
            <CardTitle>Lets get started!</CardTitle>
            <CardDescription>
              Follow the steps below to get your account setup.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex justify-between items-center w-full p-4 border rounded-lg gap-2">
              <div className="flex md:items-center flex-col gap-4 md:!flex-row">
                <Image
                  src="/appstore.png"
                  alt="applogo"
                  width={80}
                  height={80}
                  className="rounded-md object-contain"
                />
                <p>Save the website as a shortcut on your mobile device</p>
              </div>
              <Button>Start</Button>
            </div>
            <div className="flex justify-between items-center w-full p-4 border rounded-lg gap-2">
              <div className="flex md:items-center flex-col gap-4 md:!flex-row">
                <Image
                  src="/stripelogo.png"
                  alt="stripelogo"
                  width={80}
                  height={80}
                  className="rounded-md object-contain"
                />
                <p>
                  Connect your stripe account to accept payments and see your
                  dashboard
                </p>
              </div>
              <Button>Start</Button>
            </div>
            <div className="flex justify-between items-center w-full p-4 border rounded-lg gap-2">
              <div className="flex md:items-center flex-col gap-4 md:!flex-row">
                <Image
                  src={agencyDetails.agencyLogo}
                  alt="applogo"
                  width={80}
                  height={80}
                  className="rounded-md object-contain"
                />
                <p>Fill in all your businesses details</p>
              </div>
              {allDetailsExist ? (
                <CheckCircleIcon
                  size={50}
                  className="text-primary p-2 flex-shrink-0"
                />
              ) : (
                <Link
                  className="bg-primary py-2 px-4 rounded-md text-white"
                  href={`/agency/${params.agencyId}/settings`}
                >
                  Start
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default LaunchPadPage
