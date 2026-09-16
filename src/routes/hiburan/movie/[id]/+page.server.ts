import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { fetchMovieDetail } from '$lib/server/hiburan';

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	if (!Number.isInteger(id) || id <= 0) throw error(404, 'Film tidak ditemukan');
	try { return { movie: await fetchMovieDetail(id) }; }
	catch { throw error(404, 'Film tidak ditemukan atau data TMDB tidak tersedia'); }
};
