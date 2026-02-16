'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';

function normalizeNextPath(value: string | null) {
  if (!value || !value.startsWith('/admin')) return '/admin/studio';
  if (value === '/admin' || value === '/admin/') return '/admin/studio';
  return value;
}

export function AdminLoginForm({ initialNextPath }: { initialNextPath: string | null }) {
  const nextPath = useMemo(() => normalizeNextPath(initialNextPath), [initialNextPath]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        const response = await fetch('/api/admin/session', { cache: 'no-store' });
        if (!response.ok) return;
        const data = (await response.json()) as { authenticated?: boolean };
        if (isMounted && data.authenticated) {
          window.location.assign('/admin/studio');
        }
      } finally {
        if (isMounted) setCheckingSession(false);
      }
    }

    void checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        throw signInError;
      }

      const accessToken = data.session?.access_token;
      if (!accessToken) {
        throw new Error('No Supabase access token returned.');
      }

      const response = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken })
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || 'Admin session setup failed.');
      }

      window.location.assign(nextPath);
    } catch (loginError) {
      const message = loginError instanceof Error ? loginError.message : 'Login failed.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const hasSupabaseEnv = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (checkingSession) {
    return <main className="mx-auto max-w-md px-5 py-20 text-sm text-muted-foreground">Checking admin session...</main>;
  }

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-md items-center px-5 py-16">
      <section className="w-full space-y-5 rounded-2xl border border-border bg-card/90 p-6 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Admin Login</h1>
          <p className="text-sm text-muted-foreground">Sign in with your Supabase admin account to open Content Studio.</p>
        </div>

        {!hasSupabaseEnv ? (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            Missing `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block space-y-1">
              <span className="text-sm text-muted-foreground">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-sm text-muted-foreground">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        )}

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </section>
    </main>
  );
}
