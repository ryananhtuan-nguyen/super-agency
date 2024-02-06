'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { Pipeline } from '@prisma/client'

import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { deletePipeline, saveActivityLogsNotification } from '@/lib/queries'
import { toast } from '@/components/ui/use-toast'
import CreatePipelineForm from '@/components/forms/create-pipeline-form'

type Props = {
  pipelineId: string
  subaccountId: string
  pipelines: Pipeline[]
}

const PipelineSettings = ({ pipelineId, pipelines, subaccountId }: Props) => {
  const router = useRouter()
  return (
    <AlertDialog>
      <div>
        <div className="flex items-center justify-between mb-4">
          <AlertDialogTrigger asChild>
            <Button variant={'destructive'}>Delete Pipeline</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="items-center">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  try {
                    const response = await deletePipeline(pipelineId)
                    //Challenge: Activity log
                    await saveActivityLogsNotification({
                      description: `Deleted pipeline | ${response.name}`,
                      subaccountId: subaccountId,
                    })
                    toast({
                      title: 'Deleted',
                      description: 'Pipeline is deleted',
                    })
                    router.replace(`/subaccount/${subaccountId}/pipelines`)
                  } catch (error) {
                    toast({
                      variant: 'destructive',
                      title: 'Oppse!',
                      description: 'Could Delete Pipeline',
                    })
                  }
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </div>

        <CreatePipelineForm
          subaccountId={subaccountId}
          defaultData={pipelines.find((p) => p.id === pipelineId)}
        />
      </div>
    </AlertDialog>
  )
}

export default PipelineSettings
