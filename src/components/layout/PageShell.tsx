'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PageShellProps {
  children: React.ReactNode;
  /** Additional Tailwind classes on the outer wrapper */
  className?: string;
  /** Remove top padding (e.g. for full-bleed hero pages) */
  noTopPad?: boolean;
  /** Remove horizontal padding */
  noHorizPad?: boolean;
  /** Allow the shell to consume the full viewport height */
  fullHeight?: boolean;
  /** Skip entry animation */
  noAnimate?: boolean;
}

const pageVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

export default function PageShell({
  children,
  className,
  noTopPad = false,
  noHorizPad = false,
  fullHeight = false,
  noAnimate = false,
}: PageShellProps) {
  const Wrapper = noAnimate ? 'main' : motion.main;
  const animProps = noAnimate
    ? {}
    : {
        variants: pageVariants,
        initial: 'hidden',
        animate: 'visible',
        exit: 'exit',
      };

  return (
    <Wrapper
      {...(animProps as object)}
      className={cn(
        'min-w-0 bg-[#0a0a0a] text-white',
        fullHeight ? 'min-h-screen' : '',
        !noTopPad && 'pt-[68px]',
        !noHorizPad && 'pb-20 lg:pb-10',
        className
      )}
    >
      <div
        className={cn(
          'mx-auto max-w-[1800px]',
          !noHorizPad && 'px-4 sm:px-8 lg:px-12'
        )}
      >
        {children}
      </div>
    </Wrapper>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  /** Vertical spacing */
  spacing?: 'sm' | 'md' | 'lg';
}

const spacingMap = {
  sm: 'py-6',
  md: 'py-10 md:py-14',
  lg: 'py-14 md:py-20',
};

export function Section({ children, className, spacing = 'md' }: SectionProps) {
  return (
    <section className={cn(spacingMap[spacing], className)}>
      {children}
    </section>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ title, subtitle, action, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-end justify-between mb-4 md:mb-6 gap-4', className)}>
      <div>
        <h2 className="text-white text-lg md:text-xl font-bold tracking-tight leading-snug">
          {title}
        </h2>
        {subtitle && (
          <p className="text-zinc-500 text-sm mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
