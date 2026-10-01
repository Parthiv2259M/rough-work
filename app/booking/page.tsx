import Link from 'next/link';
import { ArrowLeft, CreditCard, ShieldCheck, UserRound } from 'lucide-react';
import PaymentGateway from '@/components/PaymentGateway';

export default function BookingPage() {
  return (
    <section className="container-shell py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Go back home
      </Link>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-panel p-6">
          <h1 className="text-3xl font-black text-slate-900">Book your stay</h1>
          <form className="mt-6 space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Check-in
                <input type="date" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none ring-0 focus:border-brand-500" />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Check-out
                <input type="date" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none ring-0 focus:border-brand-500" />
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Guests
                <input type="number" defaultValue={2} min={1} max={8} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none ring-0 focus:border-brand-500" />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Room type
                <select defaultValue="Deluxe" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none ring-0 focus:border-brand-500">
                  <option>Deluxe</option>
                  <option>Ocean View</option>
                  <option>Family Suite</option>
                </select>
              </label>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><UserRound className="h-4 w-4 text-brand-600" /> Guest details</div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <input placeholder="First name" className="rounded-xl border border-slate-200 bg-white px-3 py-3" />
                <input placeholder="Last name" className="rounded-xl border border-slate-200 bg-white px-3 py-3" />
              </div>
            </div>

            <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700">
              <CreditCard className="h-4 w-4" /> Continue to secure payment
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <PaymentGateway amount={389} />
          <div className="glass-panel p-6 text-sm text-slate-600">
            <div className="flex items-center gap-2 font-semibold text-slate-800"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Included</div>
            <ul className="mt-4 space-y-3">
              <li>Free cancellation up to 48 hours before arrival</li>
              <li>Instant email confirmation</li>
              <li>Flexible payment with 3D secure verification</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
