<script lang="ts">
	import BriefingCard from '$lib/components/BriefingCard.svelte';
	import GempaCard from '$lib/components/GempaCard.svelte';
	import HargaCard from '$lib/components/HargaCard.svelte';
	import KalenderBolaCard from '$lib/components/KalenderBolaCard.svelte';
	import MovieCard from '$lib/components/MovieCard.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Harian — Portal Berita</title>
	<meta name="description" content="Ringkasan pagi, gempa terkini, harga harian, kalender, dan skor bola." />
</svelte:head>

<div class="space-y-3 px-4 py-4">
	<h1 class="text-lg font-bold text-gray-900 dark:text-neutral-100">Harian</h1>

	<KalenderBolaCard kalender={data.kalender} bola={null} showScore={false} />

	<GempaCard gempa={data.gempa} />

	<HargaCard harga={data.harga} />

	{#if data.movies?.length}
		<section class="rounded-xl border border-gray-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
			<div class="mb-2 flex items-center justify-between"><h2 class="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-neutral-400">🎬 Film Populer</h2><a href="/hiburan" class="text-[10px] font-bold text-red-500">Lihat semua</a></div>
			<div class="flex gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{#each data.movies as movie (movie.id)}<MovieCard {movie} />{/each}</div>
		</section>
	{/if}

	<KalenderBolaCard kalender={data.kalender} bola={data.bola} showCalendar={false} />

	{#if !data.briefing && !data.gempa && !data.harga && !data.kalender && !data.bola}
		<div class="rounded-xl border border-gray-100 bg-white px-4 py-6 text-center dark:border-neutral-800 dark:bg-neutral-900">
			<p class="text-sm text-gray-500 dark:text-neutral-400">Semua fitur harian sementara tidak tersedia.</p>
			<p class="mt-1 text-xs text-gray-400 dark:text-neutral-500">Silakan muat ulang beberapa saat lagi.</p>
		</div>
	{/if}
</div>
