import type { Profile, Account } from '@/types/profile';

const now = new Date().toISOString();

export const MOCK_ACCOUNT: Account = {
  id: 'account_001',
  email: 'veeraa@dhobiflix.in',
  plan: 'premium',
  country: 'IN',
  profiles: [], // populated below
  createdAt: '2024-01-15T00:00:00.000Z',
  updatedAt: now,
};

const profileVeeraa: Profile = {
  id: 'profile_veeraa',
  accountId: 'account_001',
  name: 'Veeraa',
  avatarEmoji: '🦁',
  isKidsProfile: false,
  pin: undefined,
  preferences: {
    language: 'en',
    subtitleLanguage: 'en',
    audioLanguage: 'en',
    autoPlayNextEpisode: true,
    autoPlayPreviews: true,
    maturityRating: 'A',
    dataUsage: 'auto',
    downloadQuality: 'high',
    // Action, Crime, Thriller, Drama, Science Fiction
    preferredGenreIds: [28, 80, 53, 18, 878],
    notifications: {
      newContent: true,
      recommendations: true,
      accountActivity: true,
    },
  },
  watchHistory: [
    {
      mediaId: 238,
      mediaType: 'movie',
      progressSeconds: 5400,
      durationSeconds: 10500,
      completed: false,
      watchedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      mediaId: 1396,
      mediaType: 'tv',
      seasonNumber: 1,
      episodeNumber: 1,
      progressSeconds: 2800,
      durationSeconds: 2700,
      completed: true,
      watchedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  myList: [
    { mediaId: 550, mediaType: 'movie', addedAt: '2024-03-01T00:00:00.000Z' },
    { mediaId: 1399, mediaType: 'tv', addedAt: '2024-03-10T00:00:00.000Z' },
  ],
  ratings: [
    { mediaId: 238, mediaType: 'movie', rating: 5, ratedAt: '2024-02-20T00:00:00.000Z' },
    { mediaId: 550, mediaType: 'movie', rating: 4, ratedAt: '2024-02-25T00:00:00.000Z' },
  ],
  createdAt: '2024-01-15T00:00:00.000Z',
  updatedAt: now,
};

const profileKids: Profile = {
  id: 'profile_kids',
  accountId: 'account_001',
  name: 'Kids',
  avatarEmoji: '🐣',
  isKidsProfile: true,
  pin: undefined,
  preferences: {
    language: 'hi',
    subtitleLanguage: 'hi',
    audioLanguage: 'hi',
    autoPlayNextEpisode: true,
    autoPlayPreviews: false,
    maturityRating: 'U',
    dataUsage: 'low',
    downloadQuality: 'standard',
    // Animation, Family, Comedy
    preferredGenreIds: [16, 10751, 35],
    notifications: {
      newContent: false,
      recommendations: false,
      accountActivity: false,
    },
  },
  watchHistory: [],
  myList: [],
  ratings: [],
  createdAt: '2024-01-15T00:00:00.000Z',
  updatedAt: now,
};

const profileGuest: Profile = {
  id: 'profile_guest',
  accountId: 'account_001',
  name: 'Guest',
  avatarEmoji: '👤',
  isKidsProfile: false,
  pin: '1234',
  preferences: {
    language: 'hi',
    subtitleLanguage: 'hi',
    audioLanguage: 'hi',
    autoPlayNextEpisode: false,
    autoPlayPreviews: false,
    maturityRating: 'U/A 16+',
    dataUsage: 'low',
    downloadQuality: 'standard',
    notifications: {
      newContent: false,
      recommendations: false,
      accountActivity: false,
    },
  },
  watchHistory: [],
  myList: [],
  ratings: [],
  createdAt: '2024-01-15T00:00:00.000Z',
  updatedAt: now,
};

export const MOCK_PROFILES: Profile[] = [profileVeeraa, profileKids, profileGuest];

MOCK_ACCOUNT.profiles = MOCK_PROFILES;

export function getMockProfileById(id: string): Profile | undefined {
  return MOCK_PROFILES.find((p) => p.id === id);
}
