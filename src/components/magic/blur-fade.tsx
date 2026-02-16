'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BlurFadeProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  yOffset?: number;
  blur?: number;
}

export function BlurFade({
  children,
  className,
  delay = 0,
  duration = 0.55,
  yOffset = 14,
  blur = 8
}: BlurFadeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset, filter: `blur(${blur}px)` }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-70px' }}
      transition={{ delay: 0.06 + delay, duration, ease: [0.16, 1, 0.3, 1] }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
