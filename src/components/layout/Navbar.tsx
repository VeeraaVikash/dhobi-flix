'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Download,
  List,
  Film,
  Menu,
  X,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';
import type { Profile } from '@/types/profile';
import { useSession, signOut } from 'next-auth/react';

const NAV_LINKS = [
  { label: 'Home', href: ROUTES.HOME },
  { label: 'TV Shows', href: '/tv' },
  { label: 'Movies', href: '/movies' },
  { label: 'New & Popular', href: '/new' },
  { label: 'My List', href: ROUTES.MY_LIST },
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
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled
          ? 'bg-[#0a0a0a]/95 backdrop-blur-md shadow-[0_1px_0_rgba(255,255,255,0.06)]'
          : 'bg-gradient-to-b from-black/80 via-black/30 to-transparent'
      )}
    >
      <div className="mx-auto px-4 sm:px-8 lg:px-12 max-w-[1800px]">
        <div className="flex items-center h-16 lg:h-[72px] gap-6 lg:gap-10">
          {/* Logo (Left) */}
          <div className="flex-1 flex items-center">
            {/* Mobile Hamburger */}
            <div ref={mobileMenuRef} className="lg:hidden relative mr-4">
              <button
                onClick={() => setMobileMenuOpen((v) => !v)}
                className="text-zinc-300 hover:text-white transition-colors p-1"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              <AnimatePresence>
                {mobileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-4 w-48 bg-[#141414] border border-zinc-800 rounded-md shadow-2xl py-2 z-50 flex flex-col"
                  >
                    {NAV_LINKS.map(({ label, href }) => {
                      const active = pathname === href || pathname.startsWith(href + '?');
                      return (
                        <Link
                          key={label}
                          href={href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            'px-4 py-3 text-sm font-medium transition-colors',
                            active ? 'text-white border-l-2 border-[#e50914] bg-white/5' : 'text-zinc-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
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

            <Link
              href={ROUTES.HOME}
              className="flex-shrink-0 flex items-center gap-2 group"
              aria-label="DhobiFlix Home"
            >
              <Film
                size={22}
                className="text-[#e50914] group-hover:scale-110 transition-transform duration-200"
              />
              <span className="text-white font-black text-xl tracking-tight hidden sm:block">
                Dhobi<span className="text-[#e50914]">Flix</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation (Center) */}
          <nav className="hidden lg:flex items-center gap-2 justify-center flex-1" aria-label="Main navigation">
            {NAV_LINKS.map(({ label, href }) => {
              const active = pathname === href || pathname.startsWith(href + '?');
              return (
                <Link
                  key={label}
                  href={href}
                  className={cn(
                    'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150',
                    active
                      ? 'text-white'
                      : 'text-zinc-400 hover:text-white'
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex-1 flex items-center justify-end gap-2 lg:gap-3">
            {/* Search */}
            <AnimatePresence mode="wait">
              {searchOpen ? (
                <motion.form
                  key="search-open"
                  initial={{ width: 32, opacity: 0 }}
                  animate={{ width: 260, opacity: 1 }}
                  exit={{ width: 32, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  onSubmit={handleSearch}
                  className="flex items-center bg-black/70 border border-zinc-700 rounded-sm overflow-hidden"
                >
                  <Search size={15} className="ml-3 text-zinc-400 flex-shrink-0" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onBlur={() => {
                      if (!searchValue) setSearchOpen(false);
                    }}
                    placeholder="Titles, people, genres"
                    className="bg-transparent text-white text-sm px-3 py-2 outline-none placeholder:text-zinc-500 w-full"
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
                  className="p-2 text-zinc-300 hover:text-white transition-colors rounded-md"
                  aria-label="Open search"
                >
                  <Search size={20} />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Notifications */}
            <button
              className="p-2 text-zinc-300 hover:text-white transition-colors rounded-md hidden sm:flex"
              aria-label="Notifications"
            >
              <Bell size={20} />
            </button>

            {/* Profile Menu */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-2 p-1 rounded-md hover:bg-white/10 transition-colors group"
                aria-label="Profile menu"
                aria-expanded={profileOpen}
              >
                <div className="w-8 h-8 rounded-sm bg-[#e50914] flex items-center justify-center text-sm font-bold select-none overflow-hidden">
                  {session?.user?.image ? (
                    <img src={session.user.image} alt={session.user.name || ''} className="w-full h-full object-cover" />
                  ) : (
                    (session?.user as any)?.avatarEmoji ?? <User size={16} />
                  )}
                </div>
                <ChevronDown
                  size={14}
                  className={cn(
                    'text-zinc-400 transition-transform duration-200 hidden sm:block',
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
                    className="absolute right-0 top-full mt-2 w-52 bg-[#141414] border border-zinc-800 rounded-md shadow-2xl overflow-hidden z-50"
                  >
                    {session?.user && (
                      <div className="px-4 py-3 border-b border-zinc-800">
                        <p className="text-white text-sm font-semibold truncate">{session.user.name}</p>
                        <p className="text-zinc-500 text-xs mt-0.5 truncate">
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
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <Icon size={15} className="text-zinc-500" />
                          {label}
                        </Link>
                      ))}
                    </div>
                    <div className="border-t border-zinc-800 py-1">
                      <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors w-full"
                      >
                        <LogOut size={15} className="text-zinc-500" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
