'use client';

import { useState, useEffect } from 'react';
import PageShell, { SectionHeader } from '@/components/layout/PageShell';
import { Save } from 'lucide-react';

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState('');
  const [language, setLanguage] = useState('en');
  const [maturity, setMaturity] = useState('Adult');
  const [isSaved, setIsSaved] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('dhobiflix-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setDisplayName(parsed.displayName || '');
        setLanguage(parsed.language || 'en');
        setMaturity(parsed.maturity || 'Adult');
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
    setIsLoaded(true);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const settings = { displayName, language, maturity, theme: 'dark' };
    localStorage.setItem('dhobiflix-settings', JSON.stringify(settings));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  if (!isLoaded) return <PageShell><div className="pt-4 h-64 flex items-center"><SectionHeader title="Settings" />Loading...</div></PageShell>;

  return (
    <PageShell>
      <div className="pt-8 max-w-2xl">
        <SectionHeader title="Profile Settings" />
        <form onSubmit={handleSave} className="space-y-8 bg-zinc-900/50 p-6 md:p-10 rounded-sm border border-zinc-800">
          
          <div className="space-y-2">
            <label htmlFor="displayName" className="text-zinc-400 text-sm font-medium">Display Name</label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-sm px-4 py-3 text-white outline-none focus:border-zinc-500"
              placeholder="Your name"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="language" className="text-zinc-400 text-sm font-medium">Language Preference</label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-sm px-4 py-3 text-white outline-none focus:border-zinc-500"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="maturity" className="text-zinc-400 text-sm font-medium">Maturity Rating</label>
            <select
              id="maturity"
              value={maturity}
              onChange={(e) => setMaturity(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-sm px-4 py-3 text-white outline-none focus:border-zinc-500"
            >
              <option value="Adult">Adult (18+)</option>
              <option value="Teen">Teen (13+)</option>
              <option value="Kids">Kids (All Ages)</option>
            </select>
            <p className="text-zinc-500 text-xs pt-1">Show titles that fit this maturity rating.</p>
          </div>

          <div className="space-y-2">
            <label className="text-zinc-400 text-sm font-medium">Theme</label>
            <div className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-sm px-4 py-3 text-zinc-500 cursor-not-allowed">
              Dark Theme (Always On)
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
            <button
              type="submit"
              className="flex items-center gap-2 bg-white text-black px-6 py-3 text-sm font-bold rounded-sm hover:bg-zinc-200 transition-colors"
            >
              <Save size={16} />
              Save Preferences
            </button>
            {isSaved && (
              <span className="text-green-500 text-sm font-medium">Preferences saved!</span>
            )}
          </div>
        </form>
      </div>
    </PageShell>
  );
}
