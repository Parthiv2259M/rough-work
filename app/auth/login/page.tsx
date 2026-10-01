'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email,
      redirect: false,
    });

    if (result?.ok) {
      router.push('/dashboard');
    } else {
      setError(result?.error || 'Login failed');
    }

    setLoading(false);
  };

  return (
    <section className="container-shell flex min-h-screen items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="glass-panel p-8">
          <div className="mb-6 flex items-center justify-center gap-2">
            <LogIn className="h-6 w-6 text-brand-600" />
            <h1 className="text-2xl font-black text-slate-900">Sign in</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Email address
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-500"
              />
            </label>

            {error && (
              <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            New to StayCastle?{' '}
            <Link href="/" className="font-semibold text-brand-600 hover:underline">
              Start exploring
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
