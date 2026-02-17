'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type ModeToggleProps = {
  compact?: boolean;
};

export function ModeToggle({ compact = false }: ModeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={cn(compact ? 'h-4 w-4' : 'h-5 w-5')} />;
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={cn(
        'relative inline-flex items-center justify-center rounded-full',
        compact ? 'h-8 w-8' : 'h-10 w-10',
        'text-foreground transition hover:bg-secondary'
      )}
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      <Sun className={cn('rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0', compact ? 'h-4 w-4' : 'h-5 w-5')} />
      <Moon className={cn('absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100', compact ? 'h-4 w-4' : 'h-5 w-5')} />
    </button>
  );
}
