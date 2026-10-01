import { describe, expect, it } from 'vitest';
import { calculateNights, calculateTotalPrice, createCheckoutSession, validateBooking } from '@/lib/booking';

describe('booking logic', () => {
  it('calculates nights correctly', () => {
    expect(calculateNights('2026-05-10', '2026-05-13')).toBe(3);
  });

  it('throws for invalid checkout date', () => {
    expect(() => calculateNights('2026-05-15', '2026-05-12')).toThrow('Check-out must be after check-in.');
  });

  it('calculates a discounted total with fees and taxes', () => {
    const result = calculateTotalPrice({
      nightlyRate: 200,
      checkIn: '2026-06-01',
      checkOut: '2026-06-04',
      guests: 2,
      promoCode: 'SAVE10',
    });

    expect(result.nights).toBe(3);
    expect(result.base).toBe(600);
    expect(result.discount).toBe(60);
    expect(result.serviceFee).toBeGreaterThan(0);
    expect(result.tax).toBeGreaterThan(0);
    expect(result.total).toBeGreaterThan(600);
  });

  it('validates booking payloads correctly', () => {
    const payload = {
      hotelId: 'azure-cove-resort',
      checkIn: '2026-05-10',
      checkOut: '2026-05-13',
      guests: 2,
      roomType: 'Deluxe',
      paymentMethod: 'card',
    };

    const result = validateBooking(payload);
    expect(result.hotelId).toBe('azure-cove-resort');
  });

  it('rejects invalid bookings', () => {
    expect(() => {
      validateBooking({
        hotelId: '',
        checkIn: '2026-05-10',
        checkOut: '2026-05-13',
        guests: 0,
        roomType: '',
      });
    }).toThrow();
  });

  it('creates a checkout session with pricing', () => {
    const session = createCheckoutSession(
      {
        hotelId: 'azure-cove-resort',
        checkIn: '2026-05-10',
        checkOut: '2026-05-13',
        guests: 2,
        roomType: 'Ocean View',
        paymentMethod: 'card',
      },
      200
    );

    expect(session.currency).toBe('USD');
    expect(session.paymentStatus).toBe('pending');
    expect(session.amount).toBeGreaterThan(0);
  });
});
