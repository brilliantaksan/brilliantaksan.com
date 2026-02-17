'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  AlertCircle,
  BriefcaseBusiness,
  Camera,
  Check,
  Code2,
  Github,
  Home,
  GraduationCap,
  Instagram,
  Loader2,
  Linkedin,
  Save
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  ADMIN_CONTENT_SAVE_REQUEST_EVENT,
  ADMIN_CONTENT_SAVE_RESULT_EVENT,
  ADMIN_CONTENT_SAVE_STATE_EVENT,
  type AdminContentSaveResultDetail,
  type AdminContentSaveStateDetail
} from '@/lib/admin-content-events';
import { ModeToggle } from '@/components/portfolio/mode-toggle';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '#home', icon: Home, label: 'Home' },
  { href: '#experience', icon: BriefcaseBusiness, label: 'Experience' },
  { href: '#education', icon: GraduationCap, label: 'Education' },
  { href: '#projects', icon: Code2, label: 'Projects' },
  { href: '#creative', icon: Camera, label: 'Creative' }
];

const socialItems = [
  { href: 'https://github.com/brilliantaksan', icon: Github, label: 'GitHub' },
  { href: 'https://linkedin.com/in/brilliantaksan', icon: Linkedin, label: 'LinkedIn' },
  { href: 'https://instagram.com/brilliantaksan', icon: Instagram, label: 'Instagram' }
];

function DockIcon({
  mouseX,
  compact = false,
  children,
  className
}: {
  mouseX: ReturnType<typeof useMotionValue<number>>;
  compact?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  const distance = useTransform(mouseX, (value) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { left: 0, width: 0 };
    return value - bounds.left - bounds.width / 2;
  });

  const widthSync = useTransform(
    distance,
    compact ? [-120, 0, 120] : [-140, 0, 140],
    compact ? [32, 38, 32] : [38, 62, 38]
  );
  const width = useSpring(widthSync, compact ? { mass: 0.12, stiffness: 185, damping: 20 } : { mass: 0.1, stiffness: 160, damping: 14 });

  return (
    <motion.div style={{ width }} ref={ref} className={cn('flex aspect-square items-center justify-center', className)}>
      {children}
    </motion.div>
  );
}

export function NavbarDock() {
  const mouseX = useMotionValue(Infinity);
  const [isCompact, setIsCompact] = useState(false);
  const [isSavingContent, setIsSavingContent] = useState(false);
  const [saveResult, setSaveResult] = useState<'idle' | 'success' | 'error'>('idle');
  const pathname = usePathname();
  const isAdminStudio = pathname === '/admin/studio';

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 639px)');
    const syncCompactState = () => setIsCompact(mediaQuery.matches);

    syncCompactState();
    mediaQuery.addEventListener('change', syncCompactState);
    return () => mediaQuery.removeEventListener('change', syncCompactState);
  }, []);

  useEffect(() => {
    if (!isAdminStudio) {
      setIsSavingContent(false);
      setSaveResult('idle');
      return;
    }

    const onSaveState = (event: Event) => {
      const detail = (event as CustomEvent<AdminContentSaveStateDetail>).detail;
      const saving = Boolean(detail?.saving);
      setIsSavingContent(saving);
      if (saving) {
        setSaveResult('idle');
      }
    };

    const onSaveResult = (event: Event) => {
      const detail = (event as CustomEvent<AdminContentSaveResultDetail>).detail;
      setSaveResult(detail?.status === 'error' ? 'error' : 'success');
    };

    window.addEventListener(ADMIN_CONTENT_SAVE_STATE_EVENT, onSaveState as EventListener);
    window.addEventListener(ADMIN_CONTENT_SAVE_RESULT_EVENT, onSaveResult as EventListener);

    return () => {
      window.removeEventListener(ADMIN_CONTENT_SAVE_STATE_EVENT, onSaveState as EventListener);
      window.removeEventListener(ADMIN_CONTENT_SAVE_RESULT_EVENT, onSaveResult as EventListener);
    };
  }, [isAdminStudio]);

  useEffect(() => {
    if (saveResult === 'idle') return;
    const timeoutId = window.setTimeout(() => setSaveResult('idle'), 2500);
    return () => window.clearTimeout(timeoutId);
  }, [saveResult]);

  function requestContentSave() {
    window.dispatchEvent(new Event(ADMIN_CONTENT_SAVE_REQUEST_EVENT));
  }

  const saveButtonTitle = isSavingContent
    ? 'Saving changes...'
    : saveResult === 'success'
      ? 'Saved successfully'
      : saveResult === 'error'
        ? 'Save failed'
        : 'Save all changes';

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[max(0.5rem,env(safe-area-inset-bottom))] z-40 flex justify-center px-1 sm:bottom-7 sm:px-0">
      <div className="fixed inset-x-0 bottom-0 h-16 w-full bg-background/70 backdrop-blur-lg [mask-image:linear-gradient(to_top,black,transparent)]" />
      <div
        className={cn(
          'pointer-events-auto relative z-50 mx-auto flex w-fit max-w-[calc(100vw-0.75rem)] items-center rounded-full px-1.5 py-1 sm:px-2',
          isCompact ? 'gap-0' : 'gap-1',
          'border border-border/80 bg-background/90 shadow-[0_2px_10px_rgba(0,0,0,0.22)] backdrop-blur-xl',
          'dark:shadow-[0_-20px_80px_-20px_rgba(255,255,255,0.12)_inset]'
        )}
        onMouseMove={(event) => mouseX.set(event.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <DockIcon key={item.label} mouseX={mouseX} compact={isCompact}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center justify-center rounded-full text-foreground transition hover:bg-secondary',
                  isCompact ? 'h-8 w-8' : 'h-12 w-12'
                )}
                title={item.label}
              >
                <Icon className={cn(isCompact ? 'h-[15px] w-[15px]' : 'h-[18px] w-[18px]')} strokeWidth={1.6} />
              </Link>
            </DockIcon>
          );
        })}

        <div className={cn('w-px bg-border', isCompact ? 'mx-0.5 h-6' : 'mx-1 h-8')} />

        {socialItems.map((item) => {
          const Icon = item.icon;
          return (
            <DockIcon key={item.label} mouseX={mouseX} compact={isCompact}>
              <a
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  'flex items-center justify-center rounded-full text-foreground transition hover:bg-secondary',
                  isCompact ? 'h-8 w-8' : 'h-12 w-12'
                )}
                title={item.label}
              >
                <Icon className={cn(isCompact ? 'h-[15px] w-[15px]' : 'h-[18px] w-[18px]')} strokeWidth={1.7} />
              </a>
            </DockIcon>
          );
        })}

        {isAdminStudio ? (
          <>
            <div className={cn('w-px bg-border', isCompact ? 'mx-0.5 h-6' : 'mx-1 h-8')} />
            <DockIcon mouseX={mouseX} compact={isCompact}>
              <button
                type="button"
                onClick={requestContentSave}
                disabled={isSavingContent}
                className={cn(
                  'flex items-center justify-center rounded-full transition',
                  isCompact ? 'h-8 w-8' : 'h-12 w-12',
                  saveResult === 'success'
                    ? 'bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-300'
                    : saveResult === 'error'
                      ? 'bg-destructive/15 text-destructive hover:bg-destructive/20'
                      : 'bg-primary text-primary-foreground hover:opacity-90',
                  'disabled:opacity-60'
                )}
                title={saveButtonTitle}
                aria-label={saveButtonTitle}
              >
                {isSavingContent ? (
                  <Loader2 className={cn(isCompact ? 'h-[15px] w-[15px]' : 'h-[18px] w-[18px]', 'animate-spin')} strokeWidth={1.8} />
                ) : saveResult === 'success' ? (
                  <Check className={cn(isCompact ? 'h-[15px] w-[15px]' : 'h-[18px] w-[18px]')} strokeWidth={1.9} />
                ) : saveResult === 'error' ? (
                  <AlertCircle className={cn(isCompact ? 'h-[15px] w-[15px]' : 'h-[18px] w-[18px]')} strokeWidth={1.9} />
                ) : (
                  <Save className={cn(isCompact ? 'h-[15px] w-[15px]' : 'h-[18px] w-[18px]')} strokeWidth={1.8} />
                )}
              </button>
            </DockIcon>
          </>
        ) : null}

        <>
          <div className={cn('w-px bg-border', isCompact ? 'mx-0.5 h-6' : 'mx-1 h-8')} />
          <DockIcon mouseX={mouseX} compact={isCompact}>
            <ModeToggle compact={isCompact} />
          </DockIcon>
        </>
      </div>
    </div>
  );
}
