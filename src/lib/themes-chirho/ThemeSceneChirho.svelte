<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

<script lang="ts">
	import { onMount } from 'svelte';
	import { asset as assetPathChirho } from '$app/paths';
	import { runRainChirho } from './rain_chirho';
	import { RADIO_THEMES_CHIRHO, type RadioThemeIdChirho } from './themes_chirho';

	// The place a radio sits in: its setting picture and its weather, behind the whole page.
	// It is decoration only. It takes no taps and is hidden from assistive technology, and it
	// waits for the page to settle before asking for anything, so it never competes with the
	// first sound.
	const SETTLE_MS_CHIRHO = 250;

	let { theme_id_chirho: themeIdChirho }: { theme_id_chirho: RadioThemeIdChirho } = $props();

	const themeChirho = $derived(
		RADIO_THEMES_CHIRHO.find((entryChirho) => entryChirho.id_chirho === themeIdChirho) ??
			RADIO_THEMES_CHIRHO[0]
	);
	let settledChirho = $state(false);
	let canvasChirho = $state<HTMLCanvasElement>();
	let pictureChirho = $state<HTMLImageElement>();

	onMount(() => {
		const timerChirho = window.setTimeout(() => (settledChirho = true), SETTLE_MS_CHIRHO);
		return () => window.clearTimeout(timerChirho);
	});

	$effect(() => {
		// Reading the skin here restarts the rain, and with it the rain's colour, on a skin change.
		if (!canvasChirho || themeChirho.weather_chirho !== 'rain') return;
		return runRainChirho(
			canvasChirho,
			themeChirho.water_chirho && pictureChirho
				? { box_chirho: themeChirho.water_chirho, picture_chirho: pictureChirho }
				: null
		);
	});
</script>

<div class="theme-scene-chirho" data-radio-theme-chirho={themeChirho.id_chirho} aria-hidden="true">
	{#if settledChirho && themeChirho.background_image_chirho}
		<img
			class="theme-setting-chirho"
			bind:this={pictureChirho}
			src={assetPathChirho(themeChirho.background_image_chirho)}
			alt=""
			decoding="async"
			fetchpriority="low"
		/>
	{/if}
	{#if settledChirho && themeChirho.weather_chirho === 'rain'}
		<canvas class="theme-weather-chirho" bind:this={canvasChirho}></canvas>
	{/if}
</div>

<style>
	.theme-scene-chirho {
		position: fixed;
		inset: 0;
		z-index: -1;
		overflow: hidden;
		pointer-events: none;
		background-color: var(--radio-page-chirho);
	}
	.theme-setting-chirho,
	.theme-weather-chirho {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}
	.theme-setting-chirho {
		object-fit: cover;
		animation: theme-setting-arrives-chirho 0.9s ease-out both;
	}
	/* Quietens the picture so the radio and the words around it stay the brightest things. */
	.theme-scene-chirho::after {
		content: '';
		position: absolute;
		inset: 0;
		background-color: color-mix(in srgb, var(--radio-page-chirho) 38%, transparent);
	}
	.theme-weather-chirho {
		z-index: 1;
	}
	@keyframes theme-setting-arrives-chirho {
		from {
			opacity: 0;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.theme-setting-chirho {
			animation: none;
		}
	}
</style>
