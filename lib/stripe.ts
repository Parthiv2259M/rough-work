import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
  typescript: true,
});

export async function createCheckoutSession({
  bookingId,
  hotelName,
  totalPrice,
  nights,
  guestEmail,
  guestName,
}: {
  bookingId: string;
  hotelName: string;
  totalPrice: number;
  nights: number;
  guestEmail?: string | null;
  guestName?: string | null;
}) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: hotelName,
            description: `Hotel booking for ${nights} night${nights > 1 ? 's' : ''}`,
            metadata: {
              bookingId,
            },
          },
          unit_amount: totalPrice * 100,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/cancel`,
    customer_email: guestEmail || undefined,
    metadata: {
      bookingId,
      hotelName,
    },
  });

  return session;
}

export async function getCheckoutSession(sessionId: string) {
  return stripe.checkout.sessions.retrieve(sessionId);
}

export async function retrievePaymentIntent(intentId: string) {
  return stripe.paymentIntents.retrieve(intentId);
}
