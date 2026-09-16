import { env } from '$env/dynamic/private';
import { cached, peekCache, TTL } from './cache';
import { fetchWithTimeout } from './http';
import type { MovieCast, MovieDetail, MovieGenre, MovieItem, MovieVideo } from '$lib/hiburan';

const BASE = 'https://api.themoviedb.org/3';
const IMAGE = 'https://image.tmdb.org/t/p/';
type RawMovie = Record<string, unknown>;

function credential(): { kind: 'key' | 'token'; value: string } | null {
	const key = env.TMDB_API_KEY?.trim();
	const token = env.TMDB_API_TOKEN?.trim();
	return key ? { kind: 'key', value: key } : token ? { kind: 'token', value: token } : null;
}

function url(path: string, params: Record<string, string> = {}) {
	const auth = credential();
	const qs = new URLSearchParams(params);
	if (auth?.kind === 'key') qs.set('api_key', auth.value);
	return `${BASE}${path}?${qs}`;
}

function year(date: unknown): number | null {
	const value = typeof date === 'string' ? Number(date.slice(0, 4)) : NaN;
	return Number.isFinite(value) && value > 1800 ? value : null;
}

function imagePath(path: unknown, size: 'w342' | 'w500' | 'w1280'): string | null {
	return typeof path === 'string' && path ? `${IMAGE}${size}${path}` : null;
}

function normalizeMovie(raw: RawMovie): MovieItem {
	const id = Number(raw.id);
	const date = typeof raw.release_date === 'string' ? raw.release_date : null;
	const title = typeof raw.title === 'string' ? raw.title : 'Tanpa judul';
	const genres = Array.isArray(raw.genres)
		? raw.genres.flatMap((g) => typeof g === 'object' && g && typeof (g as RawMovie).name === 'string' ? [(g as RawMovie).name as string] : [])
		: Array.isArray(raw.genre_ids) ? raw.genre_ids.map((g) => `Genre ${g}`).slice(0, 3) : [];
	return {
		id, title, poster: imagePath(raw.poster_path, 'w342'), backdrop: imagePath(raw.backdrop_path, 'w1280'),
		rating: typeof raw.vote_average === 'number' ? raw.vote_average : null,
		voteCount: typeof raw.vote_count === 'number' ? raw.vote_count : null,
		year: year(date), releaseDate: date, genres,
		overview: typeof raw.overview === 'string' && raw.overview ? raw.overview : null,
		status: typeof raw.status === 'string' ? raw.status : null,
		runtime: typeof raw.runtime === 'number' ? raw.runtime : null,
		originalLanguage: typeof raw.original_language === 'string' ? raw.original_language : null,
		productionCountries: Array.isArray(raw.production_countries) ? raw.production_countries.flatMap((c) => typeof c === 'object' && c && typeof (c as RawMovie).name === 'string' ? [(c as RawMovie).name as string] : []) : [],
		tagline: typeof raw.tagline === 'string' && raw.tagline ? raw.tagline : null,
		sourceUrl: `https://www.themoviedb.org/movie/${id}`
	};
}

function normalizeList(raw: RawMovie): MovieItem[] {
	return Array.isArray(raw.results) ? raw.results.filter((item): item is RawMovie => !!item && typeof item === 'object').map(normalizeMovie) : [];
}

async function request<T extends RawMovie>(path: string, params: Record<string, string> = {}): Promise<T> {
	if (!credential()) throw new Error('TMDB credential missing');
	const auth = credential();
	const res = await fetchWithTimeout(url(path, params), auth?.kind === 'token' ? { headers: { Authorization: `Bearer ${auth.value}` } } : {}, 7000);
	if (!res.ok) throw new Error(`TMDB ${res.status}`);
	return (await res.json()) as T;
}

async function stale<T>(key: string, fn: () => Promise<T>, ttl: number): Promise<T> {
	try { return await cached(key, fn, ttl); }
	catch (error) {
		const hit = peekCache<T>(key);
		if (hit) return hit;
		throw error;
	}
}

function listFn(path: string, key: string, params: Record<string, string> = {}) {
	return stale(key, async () => normalizeList(await request(path, params)), TTL.hiburan);
}

export const fetchTrendingMovies = (period: 'day' | 'week') => listFn(`/trending/movie/${period}`, `hiburan:trending:${period}`);
export const fetchPopularMovies = () => listFn('/movie/popular', 'hiburan:popular', { language: 'id-ID', region: 'ID' });
export const fetchNowPlayingMovies = () => listFn('/movie/now_playing', 'hiburan:now-playing', { language: 'id-ID', region: 'ID' });
export const fetchUpcomingMovies = () => listFn('/movie/upcoming', 'hiburan:upcoming', { language: 'id-ID', region: 'ID' });
export const searchMovies = (query: string, page = 1) => listFn('/search/movie', `hiburan:search:${query.toLowerCase()}:page:${page}`, { query, page: String(page), language: 'id-ID', region: 'ID', include_adult: 'false' });
export const fetchMoviesByGenre = (id: number) => listFn('/discover/movie', `hiburan:genre:${id}`, { with_genres: String(id), language: 'id-ID', region: 'ID', sort_by: 'popularity.desc' });

export async function fetchMovieGenres(): Promise<MovieGenre[]> {
	return stale('hiburan:genres', async () => {
		const raw = await request('/genre/movie/list', { language: 'id-ID' });
		return Array.isArray(raw.genres) ? raw.genres.filter((g): g is RawMovie => !!g && typeof g === 'object').map((g) => ({ id: Number(g.id), name: String(g.name) })) : [];
	}, TTL.hiburanGenres);
}

export async function fetchMovieDetail(id: number): Promise<MovieDetail> {
	return stale(`hiburan:detail:${id}`, async () => {
		const raw = await request(`/movie/${id}`, { language: 'id-ID', append_to_response: 'credits,videos,similar' });
		const credits = raw.credits as RawMovie | undefined;
		const videos = raw.videos as RawMovie | undefined;
		const cast: MovieCast[] = Array.isArray(credits?.cast) ? credits.cast.slice(0, 10).map((c) => ({ id: Number((c as RawMovie).id), name: String((c as RawMovie).name ?? ''), character: typeof (c as RawMovie).character === 'string' ? (c as RawMovie).character as string : null, profile: imagePath((c as RawMovie).profile_path, 'w342') })) : [];
		const movieVideos: MovieVideo[] = Array.isArray(videos?.results) ? videos.results.filter((v): v is RawMovie => !!v && typeof v === 'object').filter((v) => v.site === 'YouTube' && typeof v.key === 'string').map((v) => ({ key: v.key as string, name: String(v.name ?? 'Trailer'), site: 'YouTube', type: String(v.type ?? ''), official: v.official === true })) : [];
		return { ...normalizeMovie(raw), cast, videos: movieVideos, similar: normalizeList((raw.similar as RawMovie) ?? {}) };
	}, TTL.hiburanDetail);
}
