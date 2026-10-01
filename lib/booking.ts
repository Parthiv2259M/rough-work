export interface BookingInput {
  hotelId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  roomType: string;
  promoCode?: string;
}

export function calculateNights(checkIn: string, checkOut: string) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error('Invalid date values supplied.');
  }

  const diff = end.getTime() - start.getTime();
  const hours = 1000 * 60 * 60 * 24;
  const nights = diff / hours;

  if (nights <= 0) {
    throw new Error('Check-out must be after check-in.');
  }

  return nights;
}

export function calculateTotalPrice(
  nightlyRate: number,
  checkIn: string,
  checkOut: string,
  guests: number,
  promoCode?: string,
) {
  const nights = calculateNights(checkIn, checkOut);
  const occupancyMultiplier = guests > 2 ? 1.15 : 1;
  const base = nightlyRate * nights * occupancyMultiplier;
  const discount = promoCode === 'SAVE10' ? base * 0.1 : 0;

  return {
    base,
    discount,
    total: Math.round(base - discount),
    nights,
  };
}

export function validateBookingRequest(payload: BookingInput) {
  if (!payload.hotelId || !payload.checkIn || !payload.checkOut) {
    throw new Error('Hotel, check-in, and check-out are required.');
  }

  if (payload.guests < 1 || payload.guests > 8) {
    throw new Error('Guests must be between 1 and 8.');
  }

  if (!payload.roomType) {
    throw new Error('Room type is required.');
  }

  calculateNights(payload.checkIn, payload.checkOut);

  return payload;
}

export function createCheckoutSession(payload: BookingInput, hotelPrice: number) {
  const validated = validateBookingRequest(payload);
  const { total } = calculateTotalPrice(
    hotelPrice,
    validated.checkIn,
    validated.checkOut,
    validated.guests,
    validated.promoCode,
  );

  return {
    sessionId: `cs_${Math.random().toString(36).slice(2, 10)}`,
    amount: total,
    currency: 'USD',
    status: 'pending',
  };
}
