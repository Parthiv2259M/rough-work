import { NextResponse } from 'next/server';
import { getHotelById } from '@/lib/hotel';
import { calculateTotalPrice, createCheckoutSession, validateBookingRequest } from '@/lib/booking';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    validateBookingRequest(body);

    const hotel = getHotelById(body.hotelId);

    if (!hotel) {
      return NextResponse.json({ ok: false, message: 'Hotel not found.' }, { status: 404 });
    }

    const pricing = calculateTotalPrice(
      hotel.price,
      body.checkIn,
      body.checkOut,
      body.guests,
      body.promoCode,
    );

    const session = createCheckoutSession(body, hotel.price);

    return NextResponse.json({
      ok: true,
      message: 'Checkout session created.',
      session,
      pricing,
      hotel: {
        id: hotel.id,
        name: hotel.name,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Booking failed';
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}
