'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Activity, CreditCard, LogOut, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;

    const fetchBookings = async () => {
      const response = await fetch('/api/bookings');
      const data = await response.json();

      if (data.ok) {
        setBookings(data.bookings);
      }

      setLoading(false);
    };

    fetchBookings();
  }, [status]);

  if (status === 'loading' || loading) {
    return (
      <section className="container-shell flex min-h-screen items-center justify-center py-12">
        <div className="text-slate-600">Loading your dashboard...</div>
      </section>
    );
  }

  if (status !== 'authenticated') {
    return null;
  }

  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed').length;
  const totalSpent = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const upcomingBookings = bookings.filter((b) => new Date(b.checkIn) > new Date()).length;

  return (
    <section className="container-shell py-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">My Dashboard</h1>
          <p className="mt-2 text-slate-600">Welcome back, {session?.user?.name}</p>
        </div>
        <form
          action={async () => {
            const response = await fetch('/api/auth/signout', { method: 'POST' });
            if (response.ok) router.push('/');
          }}
        >
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </form>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <div className="glass-panel p-6">
          <div className="inline-flex rounded-2xl bg-brand-50 p-3 text-brand-600">
            <Activity className="h-5 w-5" />
          </div>
          <div className="mt-5 text-3xl font-black text-slate-900">{confirmedBookings}</div>
          <div className="mt-2 text-sm text-slate-600">Confirmed bookings</div>
        </div>

        <div className="glass-panel p-6">
          <div className="inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-600">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="mt-5 text-3xl font-black text-slate-900">${totalSpent}</div>
          <div className="mt-2 text-sm text-slate-600">Total spent</div>
        </div>

        <div className="glass-panel p-6">
          <div className="inline-flex rounded-2xl bg-cyan-50 p-3 text-cyan-600">
            <CreditCard className="h-5 w-5" />
          </div>
          <div className="mt-5 text-3xl font-black text-slate-900">{upcomingBookings}</div>
          <div className="mt-2 text-sm text-slate-600">Upcoming stays</div>
        </div>
      </div>

      <div className="glass-panel p-6">
        <h2 className="text-xl font-bold text-slate-900">Your bookings</h2>

        <div className="mt-6 space-y-4">
          {bookings.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 p-6 text-center text-slate-600">
              <p>No bookings yet.</p>
              <Link href="/hotels" className="mt-3 inline-block text-brand-600 font-semibold hover:underline">
                Start booking →
              </Link>
            </div>
          ) : (
            bookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
                <div>
                  <div className="font-semibold text-slate-900">{booking.hotelId}</div>
                  <div className="mt-1 flex gap-4 text-sm text-slate-600">
                    <span>{new Date(booking.checkIn).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{booking.nights} nights</span>
                    <span>•</span>
                    <span className={`font-semibold ${booking.status === 'confirmed' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {booking.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-slate-900">${booking.totalPrice}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
