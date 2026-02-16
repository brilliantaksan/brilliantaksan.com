'use client';

import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  BriefcaseBusiness,
  Camera,
  Code2,
  Github,
  Home,
  GraduationCap,
  Instagram,
  Linkedin,
  Youtube
} from 'lucide-react';
import { useRef } from 'react';
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
  { href: 'https://instagram.com/brilliantaksan', icon: Instagram, label: 'Instagram' },
  { href: 'https://youtube.com/@brilliantaksan', icon: Youtube, label: 'YouTube' }
];

function DockIcon({
  mouseX,
  children,
  className
}: {
  mouseX: ReturnType<typeof useMotionValue<number>>;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  const distance = useTransform(mouseX, (value) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { left: 0, width: 0 };
    return value - bounds.left - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-140, 0, 140], [38, 62, 38]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 160, damping: 14 });

  return (
    <motion.div style={{ width }} ref={ref} className={cn('flex aspect-square items-center justify-center', className)}>
      {children}
    </motion.div>
  );
}

export function NavbarDock() {
  const mouseX = useMotionValue(Infinity);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-7 z-40 mx-auto mb-4 flex h-full max-h-14 origin-bottom">
      <div className="fixed inset-x-0 bottom-0 h-16 w-full bg-background/70 backdrop-blur-lg [mask-image:linear-gradient(to_top,black,transparent)]" />
      <div
        className={cn(
          'pointer-events-auto relative z-50 mx-auto flex h-full min-h-full items-center gap-1 rounded-full px-2',
          'border border-border/80 bg-background/90 shadow-[0_2px_10px_rgba(0,0,0,0.22)] backdrop-blur-xl',
          'dark:shadow-[0_-20px_80px_-20px_rgba(255,255,255,0.12)_inset]'
        )}
        onMouseMove={(event) => mouseX.set(event.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <DockIcon key={item.label} mouseX={mouseX}>
              <Link
                href={item.href}
                className="flex h-12 w-12 items-center justify-center rounded-full text-foreground transition hover:bg-secondary"
                title={item.label}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.6} />
              </Link>
            </DockIcon>
          );
        })}

        <div className="mx-1 h-8 w-px bg-border" />

        {socialItems.map((item) => {
          const Icon = item.icon;
          return (
            <DockIcon key={item.label} mouseX={mouseX}>
              <a
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="flex h-12 w-12 items-center justify-center rounded-full text-foreground transition hover:bg-secondary"
                title={item.label}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.7} />
              </a>
            </DockIcon>
          );
        })}

        <div className="mx-1 h-8 w-px bg-border" />

        <DockIcon mouseX={mouseX}>
          <div className="flex h-12 w-12 items-center justify-center rounded-full text-foreground transition hover:bg-secondary" title="Theme">
            <ModeToggle />
          </div>
        </DockIcon>
      </div>
    </div>
  );
}
