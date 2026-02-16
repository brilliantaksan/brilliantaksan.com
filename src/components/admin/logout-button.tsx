'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
      await fetch('/api/admin/session', { method: 'DELETE' });
    } finally {
      router.replace('/admin');
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold transition hover:bg-secondary disabled:opacity-60"
    >
      {loading ? 'Signing out...' : 'Sign out'}
    </button>
  );
}
