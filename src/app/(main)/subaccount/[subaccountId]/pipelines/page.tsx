import { redirect } from 'next/navigation'
import React from 'react'

import { db } from '@/lib/db'

type Props = {
  params: {
    subaccountId: string
  }
}

const PipelinesPage = async ({ params }: Props) => {
  const pipelineExists = await db.pipeline.findFirst({
    where: {
      subAccountId: params.subaccountId,
    },
  })

  if (pipelineExists) {
    return redirect(
      `/subaccount/${params.subaccountId}/pipelines/${pipelineExists.id}`
    )
  } else {
    let newPipelineId = ''
    try {
      const response = await db.pipeline.create({
        data: { name: 'First Pipeline', subAccountId: params.subaccountId },
      })

      newPipelineId = response.id
    } catch (error) {
      console.log(error)
    }

    if (newPipelineId !== '') {
      return redirect(
        `/subaccount/${params.subaccountId}/pipelines/${newPipelineId}`
      )
    }
  }
}

export default PipelinesPage
