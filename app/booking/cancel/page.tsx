import Link from 'next/link';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function BookingCancelPage() {
  return (
    <section className="container-shell py-12">
      <div className="max-w-2xl">
        <div className="glass-panel overflow-hidden">
          <div className="border-b border-slate-200 bg-amber-50 p-8">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-amber-600" />
              <div>
                <h1 className="text-3xl font-black text-amber-900">Payment cancelled</h1>
                <p className="mt-1 text-amber-700">Your booking was not completed</p>
              </div>
            </div>
          </div>

          <div className="space-y-6 p-8">
            <p className="text-slate-600">Your booking session has expired or was cancelled. Your hotel reservation was not confirmed.</p>

            <div className="rounded-2xl bg-slate-50 p-6">
              <h3 className="font-bold text-slate-900">What can you do?</h3>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li>• Try booking again with a different payment method</li>
                <li>• Contact support if you have payment issues</li>
                <li>• Check your bank for any pending charges (usually reversed within 24 hours)</li>
              </ul>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/booking" className="flex-1 rounded-full bg-brand-600 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-brand-700">
                Try again
              </Link>
              <Link href="/hotels" className="flex-1 rounded-full border border-slate-300 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-400">
                <ArrowLeft className="inline h-4 w-4" /> Back to hotels
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
