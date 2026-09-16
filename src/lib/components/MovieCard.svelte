<script lang="ts">
	import type { MovieItem } from '$lib/hiburan';
	let { movie }: { movie: MovieItem } = $props();
</script>

<a href={`/hiburan/movie/${movie.id}`} class="group block w-[128px] shrink-0">
	<div class="aspect-[2/3] overflow-hidden rounded-xl bg-gray-100 dark:bg-neutral-800">
		{#if movie.poster}
			<img src={movie.poster} alt={movie.title} loading="lazy" class="h-full w-full object-cover transition group-hover:scale-105" />
		{:else}
			<div class="flex h-full items-center justify-center p-3 text-center text-[11px] text-gray-400 dark:text-neutral-500">Poster tidak tersedia</div>
		{/if}
	</div>
	<p class="mt-1.5 line-clamp-2 text-xs font-bold text-gray-800 dark:text-neutral-100">{movie.title}</p>
	<div class="mt-0.5 flex gap-1 text-[10px] text-gray-500 dark:text-neutral-400">
		{#if movie.rating != null}<span>★ {movie.rating.toFixed(1)}</span>{/if}
		{#if movie.year}<span>• {movie.year}</span>{/if}
	</div>
</a>
