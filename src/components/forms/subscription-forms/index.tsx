'use client'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { Plan } from '@prisma/client'
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import React, { useState } from 'react'

type Props = {
  selectedPriceId: string | Plan
}

const SubscriptionForm = ({ selectedPriceId }: Props) => {
  const elements = useElements()
  const stripeHook = useStripe()
  const [priceError, setPriceError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedPriceId) {
      setPriceError('You need to select a plan to subscribe')
      return
    }
    setPriceError('')
    if (!stripeHook || !elements) return

    try {
      const { error } = await stripeHook.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${process.env.NEXT_PUBLIC_URL}/agency`,
        },
      })

      if (error) throw new Error()

      toast({
        title: 'Payment successful',
        description: 'Your payment has been successfully processed.',
      })
    } catch (error) {
      console.log(error, 'Client Subscription form error 🔴')
      toast({
        variant: 'default',
        title: 'Failed',
        description:
          'We couldnt process your payment. Please try a different card or try again later.',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <small className="text-destructive">{priceError}</small>
      <PaymentElement />
      <Button disabled={!stripeHook} className="mt-4 w-full">
        Submit
      </Button>
    </form>
  )
}

export default SubscriptionForm
