export default function StatsBar() {
  const stats = [
    { label: 'Guest satisfaction', value: '98%' },
    { label: 'Properties verified', value: '1200+' },
    { label: 'Avg. nightly value', value: '$184' },
    { label: 'Cities covered', value: '57' },
  ];

  return (
    <section className="container-shell py-10">
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-panel p-6 text-center">
            <div className="text-3xl font-black text-slate-900">{stat.value}</div>
            <div className="mt-2 text-sm text-slate-600">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
