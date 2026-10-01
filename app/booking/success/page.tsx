'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Mail, MapPin } from 'lucide-react';
import { getCheckoutSession } from '@/lib/stripe';

export default function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;

    const fetchBooking = async () => {
      const session = await getCheckoutSession(sessionId);
      setBooking(session);
      setLoading(false);
    };

    fetchBooking();
  }, [sessionId]);

  if (loading) {
    return (
      <section className="container-shell flex min-h-screen items-center justify-center py-12">
        <div className="glass-panel p-8 text-center">
          <div className="animate-spin">
            <CheckCircle className="h-12 w-12 text-brand-600" />
          </div>
          <p className="mt-4 text-slate-600">Confirming your booking...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="container-shell py-12">
      <div className="max-w-2xl">
        <div className="glass-panel overflow-hidden">
          <div className="border-b border-slate-200 bg-emerald-50 p-8">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
              <div>
                <h1 className="text-3xl font-black text-emerald-900">Booking confirmed!</h1>
                <p className="mt-1 text-emerald-700">Your reservation has been secured</p>
              </div>
            </div>
          </div>

          <div className="space-y-6 p-8">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Booking ID</div>
                <div className="mt-2 text-lg font-bold text-slate-900">{booking?.id || sessionId}</div>
              </div>

              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Amount paid</div>
                <div className="mt-2 text-lg font-bold text-slate-900">${(booking?.amount_total || 0) / 100}</div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-6">
              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-3 text-slate-700">
                  <Mail className="h-5 w-5 text-brand-600" />
                  <span>Confirmation email sent to {booking?.customer_email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700">
                  <MapPin className="h-5 w-5 text-brand-600" />
                  <span>Check your email for itinerary and hotel details</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <h3 className="font-bold text-slate-900">What's next?</h3>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li>✓ You'll receive a confirmation email with booking details</li>
                <li>✓ Hotel may contact you 48 hours before arrival</li>
                <li>✓ Check-in is typically from 3 PM, check-out at 11 AM</li>
                <li>✓ Questions? Visit your dashboard or contact support</li>
              </ul>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/dashboard" className="flex-1 rounded-full bg-brand-600 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-brand-700">
                View my bookings
              </Link>
              <Link href="/hotels" className="flex-1 rounded-full border border-slate-300 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-400">
                Book another stay
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
