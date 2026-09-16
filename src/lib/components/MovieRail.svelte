<script lang="ts">
	import type { MovieItem } from '$lib/hiburan';
	import MovieCard from './MovieCard.svelte';
	let { title, movies, href = '/hiburan' }: { title: string; movies: MovieItem[]; href?: string } = $props();
</script>

{#if movies.length}
	<section>
		<div class="mb-1.5 flex items-center justify-between">
			<h2 class="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-neutral-400">{title}</h2>
			<a href={href} class="text-[10px] font-bold text-red-500 dark:text-red-400">Lihat semua</a>
		</div>
		<div class="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
			{#each movies.slice(0, 10) as movie (movie.id)}<MovieCard {movie} />{/each}
		</div>
	</section>
{/if}
