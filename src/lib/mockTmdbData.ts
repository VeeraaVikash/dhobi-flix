import type { Movie, TVShow, Credits, VideosResult, TVEpisode } from '../types/movie';

export const MOCK_MOVIES: Movie[] = [
  {
    id: 238,
    overview: 'Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family. When organized crime family patriarch, Vito Corleone survives an attempt on his life, his youngest son, Michael, steps in to take care of the would-be killers.',
    poster_path: '/3bhkrj58Vtu7enYsLMuts73ZeRZ.jpg',
    backdrop_path: '/tmU7Ghwbk2GCufmWzkjTI65wA5y.jpg',
    genre_ids: [18, 80],
    vote_average: 8.7,
    vote_count: 19800,
    popularity: 135.5,
    original_language: 'en',
    adult: false,
    media_type: 'movie',
    title: 'The Godfather',
    original_title: 'The Godfather',
    release_date: '1972-03-14',
    runtime: 175,
    budget: 6000000,
    revenue: 245064100,
    status: 'Released',
    tagline: "An offer you can't refuse.",
    genres: [{ id: 18, name: 'Drama' }, { id: 80, name: 'Crime' }]
  },
  {
    id: 155,
    overview: 'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.',
    poster_path: '/qJ2t4EDMRbbJG4Gs3gV63ccggTM.jpg',
    backdrop_path: '/nMKdUUmo2vRSbfmPyPAJA4j4KjZ.jpg',
    genre_ids: [18, 80, 28, 53],
    vote_average: 8.5,
    vote_count: 31200,
    popularity: 98.4,
    original_language: 'en',
    adult: false,
    media_type: 'movie',
    title: 'The Dark Knight',
    original_title: 'The Dark Knight',
    release_date: '2008-07-16',
    runtime: 152,
    budget: 185000000,
    revenue: 1004558400,
    status: 'Released',
    tagline: 'Why So Serious?',
    genres: [{ id: 18, name: 'Drama' }, { id: 80, name: 'Crime' }, { id: 28, name: 'Action' }]
  },
  {
    id: 27205,
    overview: 'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets, is offered a chance to regain his old life as payment for a task considered to be impossible: inception.',
    poster_path: '/o0lw1wHn2nEgwcN2FCe2oQ3mA7v.jpg',
    backdrop_path: '/8Zg0n554gX8tq5nSg77bXvS04F4.jpg',
    genre_ids: [28, 878, 12],
    vote_average: 8.4,
    vote_count: 34500,
    popularity: 87.2,
    original_language: 'en',
    adult: false,
    media_type: 'movie',
    title: 'Inception',
    original_title: 'Inception',
    release_date: '2010-07-14',
    runtime: 148,
    budget: 160000000,
    revenue: 825532700,
    status: 'Released',
    tagline: 'Your mind is the scene of the crime.',
    genres: [{ id: 28, name: 'Action' }, { id: 878, name: 'Science Fiction' }]
  },
  {
    id: 157336,
    overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',
    poster_path: '/gEU2Qk0wOhHQeK2vlrnHj40dZ27.jpg',
    backdrop_path: '/rAi4t5t1z5N487NusRj2x7n94rj.jpg',
    genre_ids: [12, 18, 878],
    vote_average: 8.4,
    vote_count: 32800,
    popularity: 142.1,
    original_language: 'en',
    adult: false,
    media_type: 'movie',
    title: 'Interstellar',
    original_title: 'Interstellar',
    release_date: '2014-11-05',
    runtime: 169,
    budget: 165000000,
    revenue: 675120000,
    status: 'Released',
    tagline: 'Mankind was born on Earth. It was never meant to die here.',
    genres: [{ id: 12, name: 'Adventure' }, { id: 18, name: 'Drama' }, { id: 878, name: 'Science Fiction' }]
  }
];

export const MOCK_TV: TVShow[] = [
  {
    id: 1396,
    overview: 'Walter White, a New Mexico chemistry teacher, learns he has stage III cancer and has only a few years to live. He decides he has nothing to lose. He lives with his teenage son, who has cerebral palsy, and his wife, in Albuquerque.',
    poster_path: '/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
    backdrop_path: '/9faMR1ilmaUB7d2c3v4z88a1083.jpg',
    genre_ids: [18, 80],
    vote_average: 8.9,
    vote_count: 12500,
    popularity: 250.3,
    original_language: 'en',
    adult: false,
    media_type: 'tv',
    name: 'Breaking Bad',
    original_name: 'Breaking Bad',
    first_air_date: '2008-01-20',
    episode_run_time: [49],
    number_of_seasons: 5,
    number_of_episodes: 62,
    status: 'Ended',
    tagline: 'Change the Equation.',
    genres: [{ id: 18, name: 'Drama' }, { id: 80, name: 'Crime' }]
  },
  {
    id: 1399,
    overview: 'Seven noble families fight for control of the mythical land of Westeros. Friction between the houses leads to full-scale war. All while a very ancient evil awakens in the farthest north.',
    poster_path: '/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
    backdrop_path: '/nTvM0Tyh0252vAI0z0hkGCV4m63.jpg',
    genre_ids: [10765, 18, 10759],
    vote_average: 8.4,
    vote_count: 22000,
    popularity: 310.5,
    original_language: 'en',
    adult: false,
    media_type: 'tv',
    name: 'Game of Thrones',
    original_name: 'Game of Thrones',
    first_air_date: '2011-04-17',
    episode_run_time: [60],
    number_of_seasons: 8,
    number_of_episodes: 73,
    status: 'Ended',
    tagline: 'Winter Is Coming',
    genres: [{ id: 18, name: 'Drama' }, { id: 10765, name: 'Sci-Fi & Fantasy' }]
  }
];

export const MOCK_CREDITS: Record<number, Credits> = {
  238: {
    id: 238,
    cast: [
      { id: 3084, name: 'Marlon Brando', character: 'Don Vito Corleone', profile_path: '/e654T6zslL1UWhvsnJ0v496uW6r.jpg', order: 0, known_for_department: 'Acting' },
      { id: 1158, name: 'Al Pacino', character: 'Michael Corleone', profile_path: '/f5j5aP8mO4pE3qA7R01b1Q2q8rB.jpg', order: 1, known_for_department: 'Acting' }
    ],
    crew: [
      { id: 1776, name: 'Francis Ford Coppola', job: 'Director', department: 'Directing', known_for_department: 'Directing', profile_path: null }
    ]
  }
};

export const MOCK_VIDEOS: Record<number, VideosResult> = {
  238: {
    id: 238,
    results: [
      { id: 'v001', key: 'UaVTIH8aFM8', name: 'Official Trailer', site: 'YouTube', type: 'Trailer', size: 1080, official: true, published_at: '1972-03-14T00:00:00.000Z' }
    ]
  }
};

export const MOCK_EPISODE: TVEpisode = {
  id: 62085,
  name: 'Pilot',
  overview: 'Walter White, a chemistry teacher, is diagnosed with stage III cancer...',
  season_number: 1,
  episode_number: 1,
  air_date: '2008-01-20',
  still_path: '/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
  vote_average: 8.5,
  vote_count: 500,
  runtime: 58,
  crew: [],
  guest_stars: []
};
