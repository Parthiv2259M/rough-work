import { Activity, CreditCard, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const metrics = [
    { label: 'Bookings today', value: '284', icon: Activity },
    { label: 'Revenue this month', value: '$84.2k', icon: TrendingUp },
    { label: 'Payment success', value: '99.4%', icon: CreditCard },
  ];

  return (
    <section className="container-shell py-12">
      <h1 className="text-4xl font-black tracking-tight text-slate-900">Operator dashboard</h1>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {metrics.map(({ label, value, icon: Icon }) => (
          <div key={label} className="glass-panel p-6">
            <div className="inline-flex rounded-2xl bg-brand-50 p-3 text-brand-600">
              <Icon className="h-5 w-5" />
            </div>
            <div className="mt-5 text-3xl font-black text-slate-900">{value}</div>
            <div className="mt-2 text-sm text-slate-600">{label}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-panel p-6">
          <h2 className="text-xl font-bold text-slate-900">Recent bookings</h2>
          <div className="mt-5 space-y-4">
            {[
              ['Azure Cove Resort', 'Mar 18 - Mar 21', '$567'],
              ['Harbor Light Hotel', 'Mar 22 - Mar 25', '$730'],
              ['Alpine Peak Lodge', 'Apr 01 - Apr 05', '$1,280'],
            ].map(([hotel, dates, amount]) => (
              <div key={hotel} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <div>
                  <div className="font-semibold text-slate-900">{hotel}</div>
                  <div className="text-sm text-slate-600">{dates}</div>
                </div>
                <div className="text-lg font-black text-slate-900">{amount}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6">
          <h2 className="text-xl font-bold text-slate-900">Live performance</h2>
          <div className="mt-6 space-y-4">
            {[
              ['Occupancy', '72%'],
              ['Avg. nightly rate', '$218'],
              ['Guest reviews', '4.9/5'],
            ].map(([label, value]) => (
              <div key={label}>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>{label}</span>
                  <span className="font-semibold text-slate-900">{value}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-brand-600" style={{ width: label === 'Occupancy' ? '72%' : '86%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
