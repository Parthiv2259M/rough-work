import { LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react';

export default function PaymentGateway({ amount = 389, currency = 'USD' }: { amount?: number; currency?: string }) {
  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Payment</p>
          <h3 className="mt-2 text-2xl font-black text-slate-900">Secure checkout</h3>
        </div>
        <div className="rounded-full bg-emerald-100 p-3 text-emerald-700">
          <ShieldCheck className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-slate-900 p-5 text-white">
        <div className="flex items-center justify-between text-sm text-slate-300">
          <span>Amount</span>
          <span>USD</span>
        </div>
        <div className="mt-3 text-4xl font-black">${amount}</div>
        <div className="mt-6 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-400">
          <span>Stripe</span>
          <span>PCI compliant</span>
        </div>
      </div>

      <div className="mt-5 space-y-3 text-sm text-slate-600">
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
          <LockKeyhole className="h-4 w-4 text-brand-600" />
          Card details securely transmitted through Stripe test mode.
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
          <Sparkles className="h-4 w-4 text-brand-600" />
          Instant confirmation and easy cancellation policy included.
        </div>
      </div>
    </div>
  );
}
