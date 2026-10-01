import Link from 'next/link';
import { CalendarRange, CreditCard, ShieldCheck } from 'lucide-react';

export default function BookingSummary({
  hotelName,
  price,
  nights,
}: {
  hotelName: string;
  price: number;
  nights: number;
}) {
  const total = price * nights;

  return (
    <aside className="glass-panel p-5">
      <h3 className="text-xl font-bold text-slate-900">Your stay</h3>
      <div className="mt-4 space-y-4">
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="text-sm text-slate-500">Property</div>
          <div className="mt-2 text-lg font-bold text-slate-900">{hotelName}</div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
          <div className="rounded-xl bg-slate-50 p-3">
            <div className="flex items-center gap-2"><CalendarRange className="h-4 w-4 text-brand-600" /> Nights</div>
            <div className="mt-2 text-lg font-bold text-slate-900">{nights}</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <div className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-brand-600" /> Total</div>
            <div className="mt-2 text-lg font-bold text-slate-900">${total}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          <div className="flex items-center gap-2 font-semibold"><ShieldCheck className="h-4 w-4" /> Secure checkout</div>
          <div className="mt-1">Protected by end-to-end encryption and trusted cards.</div>
        </div>

        <Link href="/booking" className="block w-full rounded-full bg-brand-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-brand-700">
          Continue to payment
        </Link>
      </div>
    </aside>
  );
}
