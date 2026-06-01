'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Check, Crown, User, Users } from 'lucide-react';
import PageShell, { SectionHeader } from '@/components/layout/PageShell';
import { MOCK_PROFILES } from '@/data/mockProfiles';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

export default function ProfilesPage() {
  const { data: session } = useSession();
  const activeName = session?.user?.name ?? 'Guest';
  const activeEmail = session?.user?.email;
  const activeImage = session?.user?.image;

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl space-y-8 pt-4 md:pt-8">
        <SectionHeader
          title="Profiles"
          subtitle="Choose who is watching and manage your DhobiFlix experience."
        />

        <section className="rounded-md border border-zinc-800 bg-zinc-950/60 p-5 md:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-gradient-to-br from-[#e50914] to-[#8f0610] text-lg font-black text-white shadow-[0_0_0_1px_rgba(255,255,255,0.12)]">
                {activeImage ? (
                  <span
                    aria-hidden="true"
                    className="h-full w-full bg-cover bg-center"
                    style={{ backgroundImage: `url("${activeImage}")` }}
                  />
                ) : (
                  <User size={24} />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-lg font-bold text-white">{activeName}</p>
                {activeEmail && (
                  <p className="mt-0.5 truncate text-sm text-zinc-500">{activeEmail}</p>
                )}
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-sm border border-[#e50914]/30 bg-[#e50914]/10 px-2 py-1 text-xs font-semibold text-[#ff6b72]">
                  <Crown size={12} />
                  Active account
                </div>
              </div>
            </div>

            <Link
              href={ROUTES.SETTINGS}
              className="inline-flex items-center justify-center rounded-sm border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
            >
              Account settings
            </Link>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            <Users size={15} className="text-[#e50914]" />
            Demo Profiles
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {MOCK_PROFILES.map((profile) => {
              const isActive = profile.name === activeName;

              return (
                <div
                  key={profile.id}
                  className={cn(
                    'rounded-md border bg-zinc-950/60 p-4 transition-colors',
                    isActive
                      ? 'border-[#e50914]/60'
                      : 'border-zinc-800 hover:border-zinc-700'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-md bg-zinc-900 text-zinc-400">
                      <User size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-white">{profile.name}</p>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        {profile.isKidsProfile ? 'Kids profile' : 'Standard profile'}
                      </p>
                    </div>
                    {isActive && <Check size={18} className="text-[#e50914]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
