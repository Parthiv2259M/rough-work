'use client';

import Link from 'next/link';
import { CalendarRange, MapPin, Search, SlidersHorizontal, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { hotels } from '@/data/hotels';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [guests, setGuests] = useState(2);

  const matches = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return hotels.filter((hotel) => {
      if (!normalized) return true;
      return [hotel.name, hotel.location, hotel.city, hotel.country, hotel.category]
        .join(' ')
        .toLowerCase()
        .includes(normalized);
    });
  }, [query]);

  const preview = matches.slice(0, 3);

  return (
    <div className="glass-panel p-4 sm:p-5">
      <div className="grid gap-4 md:grid-cols-[1.4fr_1fr_1fr_auto]">
        <label className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            <MapPin className="h-4 w-4 text-brand-600" />
            Destination
          </span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search city, resort, landmark"
            className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
        </label>

        <label className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            <CalendarRange className="h-4 w-4 text-brand-600" />
            Dates
          </span>
          <input
            type="date"
            className="w-full bg-transparent text-sm font-medium text-slate-800 focus:outline-none"
          />
        </label>

        <label className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            <Users className="h-4 w-4 text-brand-600" />
            Guests
          </span>
          <select
            value={guests}
            onChange={(event) => setGuests(Number(event.target.value))}
            className="w-full bg-transparent text-sm font-medium text-slate-800 focus:outline-none"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((count) => (
              <option key={count} value={count}>
                {count} guest{count > 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </label>

        <Link
          href={query ? `/hotels?query=${encodeURIComponent(query)}` : '/hotels'}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          <Search className="h-4 w-4" />
          Search
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
          <SlidersHorizontal className="h-4 w-4 text-brand-600" />
          Quick picks:
          {['Beach', 'City', 'Skylines', 'Spa'].map((pill) => (
            <button key={pill} type="button" onClick={() => setQuery(pill)} className="rounded-full bg-slate-100 px-2.5 py-1.5 transition hover:bg-slate-200">
              {pill}
            </button>
          ))}
        </div>

        <div className="text-sm text-slate-600">
          {preview.length > 0 ? `${preview.length} match${preview.length > 1 ? 'es' : ''} for “${query || 'all cities'}”` : 'No matches found'}
        </div>
      </div>
    </div>
  );
}
