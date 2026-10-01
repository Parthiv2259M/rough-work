import { describe, expect, it } from 'vitest';
import { calculateNights, calculateTotalPrice, createCheckoutSession, validateBookingRequest } from '@/lib/booking';

describe('booking logic', () => {
  it('calculates nights correctly', () => {
    expect(calculateNights('2026-05-10', '2026-05-13')).toBe(3);
  });

  it('throws for invalid checkout date', () => {
    expect(() => calculateNights('2026-05-15', '2026-05-12')).toThrow('Check-out must be after check-in.');
  });

  it('calculates a discounted total', () => {
    const result = calculateTotalPrice(200, '2026-06-01', '2026-06-04', 2, 'SAVE10');

    expect(result.nights).toBe(3);
    expect(result.base).toBe(600);
    expect(result.discount).toBe(60);
    expect(result.total).toBe(540);
  });

  it('validates booking payloads', () => {
    expect(
      validateBookingRequest({
        hotelId: 'azure-cove-resort',
        checkIn: '2026-05-10',
        checkOut: '2026-05-13',
        guests: 2,
        roomType: 'Deluxe',
      }),
    ).toMatchObject({ hotelId: 'azure-cove-resort', roomType: 'Deluxe' });
  });

  it('creates a checkout session', () => {
    const session = createCheckoutSession(
      {
        hotelId: 'azure-cove-resort',
        checkIn: '2026-05-10',
        checkOut: '2026-05-13',
        guests: 2,
        roomType: 'Ocean View',
        promoCode: 'SAVE10',
      },
      200,
    );

    expect(session.currency).toBe('USD');
    expect(session.status).toBe('pending');
    expect(session.amount).toBeGreaterThan(0);
  });
});
