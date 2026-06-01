'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  ChevronDown,
  Download,
  Film,
  List,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
  X,
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Home', href: ROUTES.HOME, matchPaths: [ROUTES.HOME] },
  { label: 'TV Shows', href: '/tv', matchPaths: ['/tv'] },
  { label: 'Movies', href: '/movies', matchPaths: ['/movies', '/movie'] },
  { label: 'New & Popular', href: '/new', matchPaths: ['/new'] },
  { label: 'My List', href: ROUTES.MY_LIST, matchPaths: [ROUTES.MY_LIST] },
] as const;

const PROFILE_MENU = [
  { label: 'My List', href: ROUTES.MY_LIST, icon: List },
  { label: 'Downloads', href: ROUTES.DOWNLOADS, icon: Download },
  { label: 'Settings', href: ROUTES.SETTINGS, icon: Settings },
] as const;

export default function Navbar() {
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const isActiveRoute = (href: string, matchPaths: readonly string[]) => {
    if (href === ROUTES.HOME) {
      return pathname === ROUTES.HOME;
    }

    return matchPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  };

  const getProfileInitial = () => {
    const displayName = session?.user?.name || session?.user?.email;
    return displayName?.trim().charAt(0).toUpperCase();
  };

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }

      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (searchValue.trim().length >= 2) {
      router.push(`${ROUTES.SEARCH}?q=${encodeURIComponent(searchValue.trim())}`);
      setSearchOpen(false);
      setSearchValue('');
    }
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'fixed left-0 right-0 top-0 z-50 h-[68px] transition-all duration-500',
        scrolled
          ? 'bg-gradient-to-b from-[#050505]/95 via-[#050505]/80 to-[#050505]/20 backdrop-blur-xl shadow-[0_1px_0_rgba(255,255,255,0.06)]'
          : 'bg-gradient-to-b from-black/80 via-black/55 to-transparent backdrop-blur-md'
      )}
    >
      <div className="mx-auto flex h-full max-w-[1800px] items-center justify-between px-4 sm:px-8 lg:px-12">
        <div className="flex min-w-0 items-center gap-5 lg:gap-9">
          <Link
            href={ROUTES.HOME}
            className="group flex flex-shrink-0 items-center gap-2.5"
            aria-label="DhobiFlix Home"
          >
            <Film
              size={27}
              className="text-[#e50914] drop-shadow-[0_0_12px_rgba(229,9,20,0.35)] transition-transform duration-200 group-hover:scale-105"
            />
            <span className="whitespace-nowrap text-xl font-black tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.75)] sm:text-2xl">
              Dhobi<span className="text-[#e50914]">Flix</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
            {NAV_LINKS.map(({ label, href, matchPaths }) => {
              const active = isActiveRoute(href, matchPaths);

              return (
                <Link
                  key={label}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors duration-150 drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)] xl:px-3.5',
                    active
                      ? 'font-bold text-white'
                      : 'font-medium text-zinc-400 hover:text-white'
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-shrink-0 items-center justify-end gap-1.5 sm:gap-2">
          <AnimatePresence mode="wait">
            {searchOpen ? (
              <motion.form
                key="search-open"
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 14 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                onSubmit={handleSearch}
                className="absolute left-4 right-4 top-3 z-20 flex h-11 items-center overflow-hidden rounded-md border border-white/20 bg-black/90 shadow-2xl backdrop-blur-xl sm:static sm:h-9 sm:w-64"
              >
                <Search size={16} className="ml-3 flex-shrink-0 text-zinc-400" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setSearchOpen(false);
                      setSearchValue('');
                    }
                  }}
                  onBlur={() => {
                    if (!searchValue) setSearchOpen(false);
                  }}
                  placeholder="Titles, people, genres"
                  className="w-full bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500"
                  aria-label="Search"
                />
              </motion.form>
            ) : (
              <motion.button
                key="search-icon"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSearchOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Open search"
              >
                <Search size={19} />
              </motion.button>
            )}
          </AnimatePresence>

          <button
            className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Notifications"
          >
            <Bell size={19} />
          </button>

          <div ref={profileRef} className="relative">
            <button
              onClick={() => setProfileOpen((v) => !v)}
              className="group flex h-9 items-center gap-1.5 rounded-md px-1 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Profile menu"
              aria-expanded={profileOpen}
            >
              <span className="flex h-8 w-8 select-none items-center justify-center overflow-hidden rounded-md bg-gradient-to-br from-[#e50914] to-[#8f0610] text-sm font-bold text-white shadow-[0_0_0_1px_rgba(255,255,255,0.12)]">
                {session?.user?.image ? (
                  <span
                    aria-hidden="true"
                    className="h-full w-full bg-cover bg-center"
                    style={{ backgroundImage: `url("${session.user.image}")` }}
                  />
                ) : (
                  getProfileInitial() || <User size={16} />
                )}
              </span>
              <ChevronDown
                size={15}
                className={cn(
                  'hidden text-zinc-400 transition-transform duration-200 group-hover:text-white sm:block',
                  profileOpen && 'rotate-180'
                )}
              />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute right-0 top-full z-50 mt-3 w-56 overflow-hidden rounded-md border border-white/10 bg-[#141414]/95 shadow-2xl backdrop-blur-xl"
                >
                  {session?.user && (
                    <div className="border-b border-white/10 px-4 py-3">
                      <p className="truncate text-sm font-semibold text-white">
                        {session.user.name}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-zinc-500">
                        {session.user.email}
                      </p>
                    </div>
                  )}
                  <div className="py-1">
                    {PROFILE_MENU.map(({ label, href, icon: Icon }) => (
                      <Link
                        key={label}
                        href={href}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
                      >
                        <Icon size={15} className="text-zinc-500" />
                        {label}
                      </Link>
                    ))}
                  </div>
                  <div className="border-t border-zinc-800 py-1">
                    <button
                      onClick={() => signOut({ callbackUrl: '/login' })}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      <LogOut size={15} className="text-zinc-500" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div ref={mobileMenuRef} className="relative lg:hidden">
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Toggle mobile menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
            </button>

            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute right-0 top-full z-50 mt-3 flex w-52 flex-col overflow-hidden rounded-md border border-white/10 bg-[#141414]/95 py-1 shadow-2xl backdrop-blur-xl"
                >
                  {NAV_LINKS.map(({ label, href, matchPaths }) => {
                    const active = isActiveRoute(href, matchPaths);

                    return (
                      <Link
                        key={label}
                        href={href}
                        onClick={() => setMobileMenuOpen(false)}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'whitespace-nowrap border-l-2 px-4 py-3 text-sm transition-colors',
                          active
                            ? 'border-[#e50914] bg-white/5 font-bold text-white'
                            : 'border-transparent font-medium text-zinc-400 hover:bg-white/5 hover:text-white'
                        )}
                      >
                        {label}
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
