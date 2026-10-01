import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getHotelById } from '@/lib/hotel';
import { calculateTotalPrice, validateBooking } from '@/lib/booking';
import { createCheckoutSession } from '@/lib/stripe';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }

  const bookings = await prisma.booking.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return NextResponse.json({ ok: true, bookings });
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const booking = validateBooking(body);

    const hotel = getHotelById(booking.hotelId);

    if (!hotel) {
      return NextResponse.json(
        { ok: false, message: 'Hotel not found' },
        { status: 404 }
      );
    }

    const pricing = calculateTotalPrice({
      nightlyRate: hotel.price,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      guests: booking.guests,
      promoCode: booking.promoCode,
    });

    const dbBooking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        hotelId: booking.hotelId,
        checkIn: new Date(booking.checkIn),
        checkOut: new Date(booking.checkOut),
        guests: booking.guests,
        roomType: booking.roomType,
        nights: pricing.nights,
        basePrice: pricing.base,
        serviceFee: pricing.serviceFee,
        tax: pricing.tax,
        discount: pricing.discount,
        totalPrice: pricing.total,
        promoCode: booking.promoCode,
        paymentMethod: booking.paymentMethod || 'card',
        guestName: booking.guestName,
        guestEmail: booking.guestEmail,
      },
    });

    const stripeSession = await createCheckoutSession({
      bookingId: dbBooking.id,
      hotelName: hotel.name,
      totalPrice: pricing.total,
      nights: pricing.nights,
      guestEmail: booking.guestEmail,
      guestName: booking.guestName,
    });

    await prisma.booking.update({
      where: { id: dbBooking.id },
      data: { stripeSessionId: stripeSession.id },
    });

    return NextResponse.json({
      ok: true,
      message: 'Booking created',
      booking: dbBooking,
      checkoutUrl: stripeSession.url,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Booking failed';
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}
