<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import MarketTicker from '$lib/components/MarketTicker.svelte';
	import BottomNav from '$lib/components/BottomNav.svelte';
	import { clock } from '$lib/utils/clock.svelte';
	import { page } from '$app/state';

	let { children, data } = $props();

	const isCuaca = $derived(page.url.pathname.startsWith('/cuaca'));
	const isHarian = $derived(page.url.pathname.startsWith('/harian'));
	const isTentang = $derived(page.url.pathname.startsWith('/tentang') || page.url.pathname.startsWith('/about'));
	const isHiburan = $derived(page.url.pathname.startsWith('/hiburan'));

	$effect(() => {
		const t = setInterval(() => {
			clock.now = Date.now();
		}, 30_000);
		return () => clearInterval(t);
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Portal Berita — Terkini Indonesia</title>
	<meta name="description" content="Ringkasan berita terkini dari 11 media lokal Indonesia." />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<div class="flex min-h-screen justify-center bg-[#f3f4f6] dark:bg-neutral-950">
	<div class="flex min-h-screen w-full max-w-[420px] flex-col bg-white shadow-sm dark:bg-neutral-900">
		<Header />
		{#if data?.market && !isCuaca && !isHarian && !isTentang && !isHiburan}<MarketTicker data={data.market} />{/if}
		<main class="flex-1 pb-[calc(56px+env(safe-area-inset-bottom))]">{@render children()}</main>
		{#if !isCuaca && !isHarian && !isTentang}<Footer />{/if}
		<BottomNav />
	</div>
</div>
