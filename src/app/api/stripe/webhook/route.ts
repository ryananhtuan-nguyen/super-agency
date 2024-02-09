import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'

import { stripe } from '@/lib/stripe'
import { subscriptionCreated } from '@/lib/stripe/stripe-actions'

const stripeWebhookEvents = new Set([
  'product.created',
  'product.updated',
  'price.created',
  'price.updated',
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
])

export async function POST(req: NextRequest) {
  let stripeEvent: Stripe.Event
  const body = await req.text()
  const sig = headers().get('Stripe-Signature')

  const webhookSecret =
    process.env.STRIPE_WEBHOOK_SECRET_LIVE ?? process.env.STRIPE_WEBHOOK_SECRET

  try {
    if (!sig || !webhookSecret) {
      console.log('Error stripe webhook secret/signature does not exist 🔴 ')
      return
    }
    stripeEvent = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (error) {
    console.log(`🔴 Error stripe webhook`, error)
    return new NextResponse(
      `Webhook Error: ${
        error instanceof Error ? error.message : 'Something went wrong'
      }`,
      { status: 400 }
    )
  }

  // check events

  try {
    if (stripeWebhookEvents.has(stripeEvent.type)) {
      const subscription = stripeEvent.data.object as Stripe.Subscription

      if (
        !subscription.metadata.connectAccountPayments &&
        !subscription.metadata.connectAccountSubscriptions
      ) {
        switch (stripeEvent.type) {
          case 'customer.subscription.created':
          case 'customer.subscription.updated':
            {
              if (subscription.status === 'active') {
                await subscriptionCreated(
                  subscription,
                  subscription.customer as string
                )

                console.log('CREATED FROM WEBHOOK 🟢', subscription)
              } else {
                console.log(
                  'SKIPPED AT CREATED FROM WEBHOOK, subscription is not active 🟠',
                  subscription
                )
              }
            }
            break
          default:
            console.log('Unhandled relevant event!', stripeEvent.type)
        }
      } else {
        console.log(
          'SKIPPED FROM WEBHOOK, subscription was from a connected account not for the application 🟠'
        )
      }
    }
  } catch (error) {
    console.log(error, '🔴')
    return new NextResponse('🔴 Webhook event handling error', { status: 400 })
  }

  return NextResponse.json(
    {
      webhookActionReceived: true,
    },
    {
      status: 200,
    }
  )
}
