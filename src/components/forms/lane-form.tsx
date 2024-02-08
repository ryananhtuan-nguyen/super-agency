'use client'
import { Lane } from '@prisma/client'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'
import { useModal } from '@/providers/modal-provider'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { LaneFormSchema } from '@/lib/form-schemas/pipelineRelatedFormSchemas'
import {
  getPipelineDetails,
  saveActivityLogsNotification,
  upsertLane,
} from '@/lib/queries'
import { toast } from '../ui/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel } from '../ui/form'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import Loading from '../global/loading'

type Props = {
  defaultData?: Lane
  pipelineId: string
}

const LaneForm = ({ defaultData, pipelineId }: Props) => {
  const { setClose } = useModal()
  const router = useRouter()

  const form = useForm<z.infer<typeof LaneFormSchema>>({
    mode: 'onChange',
    resolver: zodResolver(LaneFormSchema),
    defaultValues: {
      name: defaultData?.name || '',
    },
  })
  const isLoading = form.formState.isSubmitting

  useEffect(() => {
    if (defaultData) {
      form.reset({
        name: defaultData.name || '',
      })
    }
  }, [defaultData])

  const onSubmit = async (values: z.infer<typeof LaneFormSchema>) => {
    if (!pipelineId) return

    try {
      const response = await upsertLane({
        ...values,
        id: defaultData?.id,
        pipelineId: pipelineId,
        order: defaultData?.order,
      })

      const currentDetails = await getPipelineDetails(pipelineId)
      if (!currentDetails) return

      await saveActivityLogsNotification({
        description: `Updated a lane ${response.name}`,
        subaccountId: currentDetails.subAccountId,
      })

      toast({
        title: 'Success',
        description: 'Saved pipeline details',
      })

      router.refresh()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed',
        description: 'Could not save pipeline details',
      })
    } finally {
      setClose()
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Lane Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              disabled={isLoading}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lane Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter lane's name" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button className="w-20 mt-4" disabled={isLoading} type="submit">
              {isLoading ? <Loading /> : 'Save'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default LaneForm
