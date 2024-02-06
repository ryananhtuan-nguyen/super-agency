import React from 'react'

type Props = {
  params: {
    subaccountId: string
    pipelineId: string
  }
}

const PipelineIdPage = async ({ params }: Props) => {
  const pipelineDetails = await getPipelineDetails(params.pipelineId)

  return <div>PipelineIdPage</div>
}

export default PipelineIdPage
