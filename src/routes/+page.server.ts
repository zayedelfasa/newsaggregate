import { SOURCES } from '$lib/config/sources';
import { isCategoryId } from '$lib/categories';
import type { SourceResult } from '$lib/types';
import type { PageServerLoad } from './$types';
import { fetchBriefing } from '$lib/server/briefing';

export const load: PageServerLoad = async ({ url }) => {
	const raw = url.searchParams.get('kategori');
	const kategori = isCategoryId(raw) ? raw : null;
	const fetchedAt = new Date().toISOString();

	const targetSources =
		kategori != null ? SOURCES.filter((s) => s.supportedCategories?.includes(kategori)) : SOURCES;
	const unsupported = kategori != null ? SOURCES.length - targetSources.length : 0;

	const [settled, briefingR] = await Promise.all([
		Promise.allSettled(
			targetSources.map(async (s) => ({
			sourceId: s.id,
			name: s.name,
			ok: true as const,
			articles:
				kategori != null && s.fetchCategory
					? await s.fetchCategory(kategori, 3)
					: await s.fetchTop(3)
			}))
		),
		fetchBriefing().catch(() => null)
	]);

	const results: SourceResult[] = settled.map((r, i) => {
		const s = targetSources[i];
		if (r.status === 'fulfilled' && r.value.articles.length > 0) return r.value;
		return {
			sourceId: s.id,
			name: s.name,
			ok: false,
			articles: [],
			error:
				r.status === 'rejected'
					? String((r.reason as Error)?.message ?? r.reason)
					: 'Tidak ada artikel'
		};
	});

	return { results, fetchedAt, kategori, unsupported, briefing: briefingR };
};
