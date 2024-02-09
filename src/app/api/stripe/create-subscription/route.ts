import { db } from '@/lib/db'
import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { customerId, priceId } = await req.json()

  if (!customerId || !priceId) {
    return new NextResponse('Customer ID or Price ID is missing', {
      status: 400,
    })
  }

  const subscriptionExists = await db.agency.findFirst({
    where: { customerId },
    include: {
      Subscription: true,
    },
  })

  try {
    if (
      subscriptionExists?.Subscription?.subscriptionId &&
      subscriptionExists.Subscription.active
    ) {
      //check if Id exists, update instead of creating one
      if (!subscriptionExists.Subscription.subscriptionId) {
        throw new Error('Could not find subscription Id')
      }
      //else
      console.log('🟠 Updating subscription')

      const currentSubscriptionDetails = await stripe.subscriptions.retrieve(
        subscriptionExists.Subscription.subscriptionId
      )

      const subscription = await stripe.subscriptions.update(
        subscriptionExists.Subscription.subscriptionId,
        {
          items: [
            {
              id: currentSubscriptionDetails.items.data[0].id,
              deleted: true,
            },
            {
              price: priceId,
            },
          ],
          expand: ['latest_invoice.payment_intent'],
        }
      )
      console.log('🟢 Updated subscription')
      return NextResponse.json({
        subscriptionId: subscription.id,
        clientSecret:
          //@ts-ignore
          subscriptionExists.latest_invoice.payment_intent.client_secret,
      })
    } else {
      console.log('🟠 Creating a subscription')

      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [
          {
            price: priceId,
          },
        ],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      })

      console.log('🟢 Created subscription')
      console.log('SUBID', subscription.id)
      console.log('DATA', subscription)

      return NextResponse.json({
        subscriptionId: subscription.id,
        clientSecret:
          //@ts-ignore
          subscription.latest_invoice.payment_intent.client_secret,
      })
    }
  } catch (error) {
    console.log('🔴 Error in stripe create/update sub', error)
    return new NextResponse('Internal Server Error', {
      status: 500,
    })
  }
}
