# DhobiFlix

DhobiFlix is a dark, cinematic streaming UI built with Next.js. It uses TMDB for movie and TV metadata, includes profile-aware rails, search, details pages, a mock playback experience, downloads, and system/telemetry views.

## Features

- Netflix-inspired home experience with hero banner and horizontal movie rails
- Movie and TV detail routing with correct media-type aware links
- Watch routes for movies and TV episodes
- Search page with filtering and typeahead-style results
- Profile selection and authentication through NextAuth
- Google OAuth support when credentials are configured
- Mock credentials/profile flow for local development
- Safe image fallbacks for posters and backdrops
- Downloads and playback telemetry mock services
- Dark responsive UI using Tailwind CSS and lucide-react icons

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS
- NextAuth
- Framer Motion
- lucide-react
- TMDB API

## Getting Started

Install dependencies:

```bash
npm install
```

Create `.env.local` in the project root with the variables below.

```env
TMDB_API_KEY=your_tmdb_v3_api_key
NEXTAUTH_SECRET=replace_with_a_random_secret
NEXTAUTH_URL=http://localhost:3000

# Optional: Google sign-in
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Optional public/runtime settings
NEXT_PUBLIC_TMDB_IMAGE_BASE=https://image.tmdb.org/t/p
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENV=development

# Optional service settings
TELEMETRY_ENABLED=true
TELEMETRY_ENDPOINT=/api/telemetry
TELEMETRY_FLUSH_INTERVAL_MS=10000
DOWNLOAD_STORAGE_PATH=/tmp/dhobiflix-downloads
DOWNLOAD_ENCRYPTION_KEY=
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Authentication

DhobiFlix uses NextAuth with two providers:

- Google OAuth, enabled when `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
- Credentials provider, useful for local mock profile login

The credentials flow accepts a mock profile selection, or falls back to the default local profile when an email/password is submitted.

## Main Routes

- `/` - Home
- `/movies` - Movies
- `/tv` - TV shows
- `/movie/[id]` - Movie details
- `/tv/[id]` - TV details
- `/watch/[id]?type=movie` - Movie playback
- `/watch/[id]?type=tv&season=1&episode=1` - TV playback
- `/search` - Search and discovery
- `/my-list` - Saved list
- `/downloads` - Downloads
- `/profiles` - Profile selection
- `/login` - Sign in
- `/settings` - Settings
- `/system` - System telemetry and service dashboard

## Project Structure

```text
src/app              App Router pages, layouts, and API routes
src/components       UI components grouped by feature
src/constants        Routes, genres, and app constants
src/data             Mock profiles, downloads, and edge data
src/lib              TMDB, image, config, and utility helpers
src/services         Search, playback, personalization, downloads, telemetry
src/types            Shared TypeScript domain types
```

## Scripts

```bash
npm run dev       # Start local development server
npm run build     # Create production build
npm run start     # Start production server
npm run lint      # Run ESLint
npx tsc --noEmit  # Type-check without emitting files
```

## Development Notes

- `TMDB_API_KEY` is required for live TMDB data.
- TMDB image URLs are built from `NEXT_PUBLIC_TMDB_IMAGE_BASE`, with a default of `https://image.tmdb.org/t/p`.
- Movie cards route by media type: movies go to `/movie/[id]`, TV shows go to `/tv/[id]`.
- Watch links preserve media type in the query string.
- Above-the-fold hero images are prioritized; rail images stay lazy-loaded.
- Keep API route contracts and service boundaries stable when making UI changes.

## Production Build

Before pushing changes, run:

```bash
npx tsc --noEmit
npm run build
```

The build may need network access because the app loads remote fonts and TMDB-backed data.
