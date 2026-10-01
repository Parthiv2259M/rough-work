import { describe, expect, it } from 'vitest';
import { GET as getHotels } from '@/app/api/hotels/route';
import { GET as getHealth } from '@/app/api/health/route';
import { POST as createCheckout } from '@/app/api/checkout/route';

describe('api routes', () => {
  it('returns healthy service status', async () => {
    const response = await getHealth();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.status).toBe('healthy');
  });

  it('returns available hotels', async () => {
    const response = await getHotels();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(payload.hotels)).toBe(true);
    expect(payload.total).toBeGreaterThan(0);
  });

  it('creates a checkout session for a valid booking request', async () => {
    const response = await createCheckout(
      new Request('http://localhost/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelId: 'azure-cove-resort',
          checkIn: '2026-05-10',
          checkOut: '2026-05-13',
          guests: 2,
          roomType: 'Deluxe',
          promoCode: 'SAVE10',
        }),
      }),
    );

    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.session).toMatchObject({ status: 'pending' });
  });

  it('rejects invalid checkout requests', async () => {
    const response = await createCheckout(
      new Request('http://localhost/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelId: '',
          checkIn: '2026-05-10',
          checkOut: '2026-05-08',
          guests: 0,
          roomType: '',
        }),
      }),
    );

    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.ok).toBe(false);
  });
});
