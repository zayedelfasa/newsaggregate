import type { PageServerLoad } from './$types';
import { fetchBriefing } from '$lib/server/briefing';
import { fetchGempa } from '$lib/server/gempa';
import { fetchHarga } from '$lib/server/harga';
import { fetchKalender } from '$lib/server/kalender';
import { fetchBola } from '$lib/server/bola';
import { invalidateCache } from '$lib/server/cache';
import { fetchPopularMovies } from '$lib/server/hiburan';

export const load: PageServerLoad = async ({ url }) => {
	if (url.searchParams.get('force') === '1') {
		for (const key of ['briefing:v1', 'gempa:terkini', 'harga:harian', 'bola:scoreboard', 'kalender']) invalidateCache(key);
	}
	// 1 gagal tidak jatuhkan halaman — widget gagal disembunyikan (no dummy)
	const [briefingR, gempaR, hargaR, kalenderR, bolaR, moviesR] = await Promise.allSettled([
		fetchBriefing(),
		fetchGempa(),
		fetchHarga(),
		fetchKalender(),
		fetchBola(),
		fetchPopularMovies()
	]);

	return {
		briefing: briefingR.status === 'fulfilled' ? briefingR.value : null,
		gempa: gempaR.status === 'fulfilled' ? gempaR.value : null,
		harga: hargaR.status === 'fulfilled' ? hargaR.value : null,
		kalender: kalenderR.status === 'fulfilled' ? kalenderR.value : null,
		bola: bolaR.status === 'fulfilled' ? bolaR.value : null,
		movies: moviesR.status === 'fulfilled' ? moviesR.value.slice(0, 3) : [],
		fetchedAt: new Date().toISOString()
	};
};
