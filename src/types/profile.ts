// ─── Primitive Unions ────────────────────────────────────────────────────────

export type AvatarEmoji = string;

/** Indian CBFC / OTT content rating system. */
export type MaturityRating = 'U' | 'U/A 7+' | 'U/A 13+' | 'U/A 16+' | 'A';

export type Language =
  | 'en'
  | 'hi'
  | 'ta'
  | 'te'
  | 'ml'
  | 'kn'
  | 'bn'
  | 'mr'
  | 'gu'
  | 'pa'
  | 'ur'
  | 'fr'
  | 'es'
  | 'de'
  | 'ja'
  | 'ko'
  | 'zh'
  | 'pt'
  | 'ar'
  | 'ru';

export type AccountPlan = 'mobile' | 'basic' | 'standard' | 'premium';

export type UserRating = 1 | 2 | 3 | 4 | 5;

export type DataUsage = 'auto' | 'low' | 'medium' | 'high' | 'unlimited';

// ─── Preferences ─────────────────────────────────────────────────────────────

export interface ProfilePreferences {
  language: Language;
  subtitleLanguage: Language | 'off';
  audioLanguage: Language;
  autoPlayNextEpisode: boolean;
  autoPlayPreviews: boolean;
  maturityRating: MaturityRating;
  dataUsage: DataUsage;
  downloadQuality: 'standard' | 'high';
  /** TMDB genre IDs the user has explicitly indicated they like. Used for personalised ranking. */
  preferredGenreIds?: number[];
  notifications: {
    newContent: boolean;
    recommendations: boolean;
    accountActivity: boolean;
  };
}

// ─── Watch History ───────────────────────────────────────────────────────────

export interface WatchHistoryEntry {
  mediaId: number;
  mediaType: 'movie' | 'tv';
  episodeId?: number;
  seasonNumber?: number;
  episodeNumber?: number;
  progressSeconds: number;
  durationSeconds: number;
  completed: boolean;
  watchedAt: string; // ISO string
  lastUpdated: string; // ISO string
}

// ─── My List ─────────────────────────────────────────────────────────────────

export interface MyListEntry {
  mediaId: number;
  mediaType: 'movie' | 'tv';
  addedAt: string; // ISO string
}

// ─── Ratings ─────────────────────────────────────────────────────────────────

export interface Rating {
  mediaId: number;
  mediaType: 'movie' | 'tv';
  rating: UserRating;
  ratedAt: string; // ISO string
}

// ─── Profile & Account ───────────────────────────────────────────────────────

export interface Profile {
  id: string;
  accountId: string;
  name: string;
  avatarEmoji: AvatarEmoji;
  isKidsProfile: boolean;
  pin?: string; // hashed in production
  preferences: ProfilePreferences;
  watchHistory: WatchHistoryEntry[];
  myList: MyListEntry[];
  ratings: Rating[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface Account {
  id: string;
  email: string;
  plan: AccountPlan;
  country: string;
  profiles: Profile[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

// ─── Payloads ────────────────────────────────────────────────────────────────

export interface CreateProfilePayload {
  name: string;
  avatarEmoji: AvatarEmoji;
  isKidsProfile: boolean;
  pin?: string;
  preferences?: Partial<ProfilePreferences>;
}

export interface UpdateProfilePayload {
  name?: string;
  avatarEmoji?: AvatarEmoji;
  pin?: string;
  preferences?: Partial<ProfilePreferences>;
}

export interface AddToMyListPayload {
  mediaId: number;
  mediaType: 'movie' | 'tv';
}

export interface SubmitRatingPayload {
  mediaId: number;
  mediaType: 'movie' | 'tv';
  rating: UserRating;
}

export interface UpdateProgressPayload {
  mediaId: number;
  mediaType: 'movie' | 'tv';
  episodeId?: number;
  seasonNumber?: number;
  episodeNumber?: number;
  progressSeconds: number;
  durationSeconds: number;
}
