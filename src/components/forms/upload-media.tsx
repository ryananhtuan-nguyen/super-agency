'use client'
import React from 'react'
import { useToast } from '../ui/use-toast'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { MediaFormSchema } from '@/lib/form-schemas/mediaFormSchema'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel } from '../ui/form'
import { createMedia, saveActivityLogsNotification } from '@/lib/queries'
import { Input } from '../ui/input'
import FileUpload from '../global/file-upload'
import { Button } from '../ui/button'

type Props = {
  subaccountId: string
}

const UploadMediaForm = ({ subaccountId }: Props) => {
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<z.infer<typeof MediaFormSchema>>({
    resolver: zodResolver(MediaFormSchema),
    mode: 'onSubmit',
    defaultValues: {
      link: '',
      name: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof MediaFormSchema>) => {
    try {
      const response = await createMedia(subaccountId, values)

      await saveActivityLogsNotification({
        description: `Uploaded a media file | ${response.name}`,
        subaccountId,
      })

      toast({
        title: 'Success',
        description: 'Uploaded media',
      })

      router.refresh()
    } catch (error) {
      console.log(error)
      toast({
        variant: 'destructive',
        title: 'Failed',
        description: 'Could not upload media',
      })
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Media Information</CardTitle>
        <CardDescription>
          Please enter the details for your file
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input placeholder="Your agency name" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Media File</FormLabel>
                  <FormControl>
                    <FileUpload
                      apiEndpoint="subaccountLogo"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" className="mt-4">
              Upload Media
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default UploadMediaForm
