import type { PageServerLoad } from './$types';
import { fetchMovieGenres, fetchMoviesByGenre, fetchNowPlayingMovies, fetchPopularMovies, fetchTrendingMovies, fetchUpcomingMovies, searchMovies } from '$lib/server/hiburan';

export const load: PageServerLoad = async ({ url }) => {
	const query = url.searchParams.get('q')?.trim() ?? '';
	const page = Math.max(1, Number(url.searchParams.get('page') ?? '1') || 1);
	const section = url.searchParams.get('section') ?? '';
	const genreId = Number(url.searchParams.get('genre') ?? '');
	const [day, week, popular, nowPlaying, upcoming, genres, search, genreMovies] = await Promise.allSettled([
		fetchTrendingMovies('day'), fetchTrendingMovies('week'), fetchPopularMovies(), fetchNowPlayingMovies(), fetchUpcomingMovies(), fetchMovieGenres(),
		query ? searchMovies(query, page) : Promise.resolve(null), Number.isInteger(genreId) && genreId > 0 ? fetchMoviesByGenre(genreId) : Promise.resolve(null)
	]);
	const configured = [day, week, popular, nowPlaying, upcoming, genres].some((r) => r.status === 'fulfilled' && Array.isArray(r.value) && r.value.length > 0);
	const rejected = [day, week, popular, nowPlaying, upcoming, genres, search, genreMovies].find((r) => r.status === 'rejected');
	return {
		query, page, section, genreId: Number.isInteger(genreId) && genreId > 0 ? genreId : null,
		trendingDay: day.status === 'fulfilled' ? day.value : [], trendingWeek: week.status === 'fulfilled' ? week.value : [],
		popular: popular.status === 'fulfilled' ? popular.value : [], nowPlaying: nowPlaying.status === 'fulfilled' ? nowPlaying.value : [],
		upcoming: upcoming.status === 'fulfilled' ? upcoming.value : [], genres: genres.status === 'fulfilled' ? genres.value : [],
		search: search.status === 'fulfilled' ? search.value : null, genreMovies: genreMovies.status === 'fulfilled' ? genreMovies.value : null,
		configured, message: !configured && rejected ? String(rejected.reason).includes('credential') ? 'Data hiburan belum dikonfigurasi.' : 'Data hiburan sedang tidak tersedia.' : null
	};
};
