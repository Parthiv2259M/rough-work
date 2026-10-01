import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Missing signature or secret' },
      { status: 400 }
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;

    const booking = await prisma.booking.findUnique({
      where: { stripeSessionId: session.id },
    });

    if (booking) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          paymentStatus: 'completed',
          status: 'confirmed',
          stripePaymentId: session.payment_intent,
        },
      });

      await prisma.paymentLog.create({
        data: {
          bookingId: booking.id,
          stripeEventId: event.id,
          eventType: 'checkout.session.completed',
          status: 'success',
          amount: session.amount_total || 0,
          currency: session.currency || 'usd',
        },
      });
    }
  }

  if (event.type === 'charge.failed') {
    const charge = event.data.object as any;

    const booking = await prisma.booking.findFirst({
      where: {
        stripePaymentId: charge.payment_intent,
      },
    });

    if (booking) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { paymentStatus: 'failed' },
      });

      await prisma.paymentLog.create({
        data: {
          bookingId: booking.id,
          stripeEventId: event.id,
          eventType: 'charge.failed',
          status: 'failed',
          amount: charge.amount || 0,
          currency: charge.currency || 'usd',
          description: charge.failure_message,
        },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
