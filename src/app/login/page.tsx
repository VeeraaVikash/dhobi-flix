'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Film, Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { MOCK_PROFILES } from '@/data/mockProfiles';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await signIn('credentials', {
      email,
      password,
      callbackUrl: '/',
    });
    // setIsLoading(false) is not needed as page unmounts on successful redirect
  };

  const handleProfileSelect = async (profileId: string) => {
    setSelectedProfile(profileId);
    setIsLoading(true);
    await signIn('credentials', {
      profileId,
      callbackUrl: '/',
    });
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signIn('google', { callbackUrl: '/' });
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-zinc-950 to-[#0a0a0a]" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#e50914]/5 rounded-full blur-[128px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#e50914]/3 rounded-full blur-[128px]" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-16">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-2.5 mb-12"
        >
          <Film size={28} className="text-[#e50914]" />
          <span className="text-white font-black text-3xl tracking-tight">
            Dhobi<span className="text-[#e50914]">Flix</span>
          </span>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md bg-zinc-900/80 backdrop-blur-lg border border-zinc-800 rounded-lg p-8 md:p-10 shadow-2xl"
        >
          <h1 className="text-white text-2xl font-bold mb-8">Sign In</h1>

          <form onSubmit={handleSignIn} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="text-zinc-400 text-xs font-medium uppercase tracking-wider"
              >
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full h-12 px-4 bg-zinc-800 border border-zinc-700 rounded-sm text-white text-sm placeholder:text-zinc-600 outline-none focus:border-zinc-500 transition-colors"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-password"
                className="text-zinc-400 text-xs font-medium uppercase tracking-wider"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full h-12 px-4 pr-12 bg-zinc-800 border border-zinc-700 rounded-sm text-white text-sm placeholder:text-zinc-600 outline-none focus:border-zinc-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-zinc-400 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 accent-[#e50914]"
                />
                Remember me
              </label>
              <button
                type="button"
                className="text-zinc-500 hover:text-white transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#e50914] text-white text-sm font-bold rounded-sm hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading && !selectedProfile ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing In…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Google Sign In */}
          <div className="mt-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full h-12 bg-white text-black text-sm font-bold rounded-sm hover:bg-zinc-200 transition-colors flex items-center justify-center gap-3 disabled:opacity-60"
            >
              <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
              Sign in with Google
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-8">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-zinc-600 text-xs uppercase tracking-wider">
              or select a profile
            </span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          {/* Profile Selector */}
          <div className="grid grid-cols-3 gap-3">
            {MOCK_PROFILES.map((profile) => (
              <motion.button
                key={profile.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleProfileSelect(profile.id)}
                disabled={isLoading}
                className={cn(
                  'flex flex-col items-center gap-2 p-3 rounded-sm border transition-all duration-200',
                  selectedProfile === profile.id
                    ? 'border-[#e50914] bg-[#e50914]/10'
                    : 'border-zinc-800 hover:border-zinc-600 bg-zinc-800/40'
                )}
              >
                <div className="w-14 h-14 rounded-sm bg-zinc-800 flex items-center justify-center text-2xl select-none">
                  {profile.avatarEmoji}
                </div>
                <span className="text-zinc-300 text-xs font-medium truncate w-full text-center">
                  {profile.name}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Footer */}
          <p className="text-zinc-600 text-xs mt-8 text-center">
            New to DhobiFlix?{' '}
            <Link href="/" className="text-white font-medium hover:underline">
              Sign up now
            </Link>
          </p>
        </motion.div>

        {/* Bottom caption */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-zinc-700 text-xs mt-8 text-center max-w-sm"
        >
          This is a demo project. No real authentication is performed.
        </motion.p>
      </div>
    </main>
  );
}
