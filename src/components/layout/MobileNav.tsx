'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Search, Download, List, User } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

interface MobileNavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  matchPaths?: string[];
}

const NAV_ITEMS: MobileNavItem[] = [
  {
    label: 'Home',
    href: ROUTES.HOME,
    icon: Home,
    matchPaths: [ROUTES.HOME, ROUTES.BROWSE],
  },
  {
    label: 'Search',
    href: ROUTES.SEARCH,
    icon: Search,
  },
  {
    label: 'Downloads',
    href: ROUTES.DOWNLOADS,
    icon: Download,
  },
  {
    label: 'My List',
    href: ROUTES.MY_LIST,
    icon: List,
  },
  {
    label: 'Profile',
    href: ROUTES.PROFILES,
    icon: User,
  },
];

export default function MobileNav() {
  const pathname = usePathname();

  const isActive = (item: MobileNavItem) => {
    if (item.matchPaths) {
      return item.matchPaths.some((p) => pathname === p || pathname.startsWith(p + '/'));
    }
    return pathname === item.href || pathname.startsWith(item.href + '/');
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-[#0a0a0a]/95 backdrop-blur-md border-t border-zinc-800/60 safe-area-inset-bottom"
      aria-label="Mobile navigation"
    >
      <div className="flex items-stretch h-16 px-2">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-2 group"
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              <div className="relative flex items-center justify-center">
                {active && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute inset-0 w-10 h-10 -m-1 bg-[#e50914]/10 rounded-xl"
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  />
                )}
                <Icon
                  size={22}
                  className={cn(
                    'relative z-10 transition-colors duration-200',
                    active
                      ? 'text-[#e50914]'
                      : 'text-zinc-500 group-hover:text-zinc-300'
                  )}
                  strokeWidth={active ? 2.5 : 2}
                />
              </div>
              <span
                className={cn(
                  'text-[10px] font-medium transition-colors duration-200 leading-none',
                  active ? 'text-[#e50914]' : 'text-zinc-500 group-hover:text-zinc-400'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
      {/* safe area spacer */}
      <div className="h-safe-area-inset-bottom bg-[#0a0a0a]" />
    </nav>
  );
}
