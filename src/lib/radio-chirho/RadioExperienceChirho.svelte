<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

<script lang="ts">
	import { onMount } from 'svelte';
	import { createMediaSessionChirho } from '$lib/media-chirho/media_session_chirho';
	import type { PreferenceStorageChirho } from '$lib/player-chirho/player_preferences_chirho';
	import { createRadioSoundsChirho } from '$lib/sounds-chirho/radio_sounds_chirho';
	import ThemeSceneChirho from '$lib/themes-chirho/ThemeSceneChirho.svelte';
	import { RADIO_THEMES_CHIRHO, type RadioThemeIdChirho } from '$lib/themes-chirho/themes_chirho';
	import RadioReceiverChirho from './RadioReceiverChirho.svelte';
	import RadioAboutChirho from './RadioAboutChirho.svelte';
	import RadioSpatialViewChirho from '$lib/spatial-chirho/RadioSpatialViewChirho.svelte';
	import { RadioSessionChirho, initialRadioViewChirho } from './radio_session_chirho';
	import type { AutoplayPolicyChirho, RadioSessionViewChirho } from './radio_types_chirho';
	import {
		widgetStorageChirho,
		createPreviewStorageChirho,
		type WidgetOptionsChirho
	} from '$lib/widget-chirho/widget_options_chirho';
	let {
		widget_chirho: widgetChirho = false,
		widget_options_chirho: widgetOptionsChirho
	}: { widget_chirho?: boolean; widget_options_chirho?: WidgetOptionsChirho } = $props();
	const THEME_KEY_CHIRHO = 'audio-bible-radio-theme-chirho';
	let sessionChirho = $state<RadioSessionChirho>();
	let viewChirho = $state(initialRadioViewChirho());
	let themeIdChirho = $state<RadioThemeIdChirho>('minimal');
	let aboutOpenChirho = $state(false);
	let aboutOpenerChirho = $state<HTMLElement | null>(null);
	let spatialChirho = $state<RadioSpatialViewChirho>();
	let spatialStateChirho = $state({
		active_chirho: false,
		wanted_chirho: false,
		busy_chirho: false,
		message_chirho: '',
		scene_kind_chirho: 'room' as 'room' | 'original'
	});
	let storageChirho: PreferenceStorageChirho | null = null;
	function chooseThemeChirho(valueChirho: RadioThemeIdChirho): void {
		if (!RADIO_THEMES_CHIRHO.some((entryChirho) => entryChirho.id_chirho === valueChirho)) return;
		sessionChirho?.feedbackChirho('click');
		themeIdChirho = valueChirho;
		try {
			storageChirho?.setItem(THEME_KEY_CHIRHO, valueChirho);
		} catch {
			/* Optional device memory. */
		}
	}
	onMount(() => {
		try {
			storageChirho =
				widgetChirho && widgetOptionsChirho?.preview_chirho
					? createPreviewStorageChirho()
					: widgetChirho
						? widgetStorageChirho(window.localStorage)
						: window.localStorage;
			const rememberedChirho = storageChirho?.getItem(THEME_KEY_CHIRHO);
			if (RADIO_THEMES_CHIRHO.some((entryChirho) => entryChirho.id_chirho === rememberedChirho))
				themeIdChirho = rememberedChirho as RadioThemeIdChirho;
		} catch {
			/* Listening works without storage. */
		}
		if (widgetOptionsChirho?.theme_chirho) themeIdChirho = widgetOptionsChirho.theme_chirho;
		const audioChirho = new Audio();
		const mediaChirho = createMediaSessionChirho({
			onChirho: () => sessionChirho?.onChirho(false),
			offChirho: () => sessionChirho?.offChirho(false),
			nextChirho: () => sessionChirho?.nextChirho(false),
			previousChirho: () => sessionChirho?.previousChirho(false),
			seekChirho: (secondsChirho) => sessionChirho?.seekChirho(secondsChirho)
		});
		const updateMediaChirho = (nextChirho: RadioSessionViewChirho): void => {
			viewChirho = nextChirho;
			mediaChirho.updateChirho(nextChirho);
		};
		sessionChirho = new RadioSessionChirho({
			storage_chirho: storageChirho,
			audio_chirho: audioChirho,
			sounds_chirho: createRadioSoundsChirho(),
			browser_languages_chirho: navigator.languages.length
				? navigator.languages
				: [navigator.language],
			initial_language_chirho: widgetOptionsChirho?.language_chirho,
			default_sounds_chirho: widgetChirho ? false : undefined,
			autoplay_policy_chirho: () => {
				if (widgetChirho && !widgetOptionsChirho?.autoplay_chirho) return 'disallowed';
				const navigatorChirho = navigator as Navigator & {
					getAutoplayPolicy?: (elementChirho: HTMLMediaElement) => AutoplayPolicyChirho;
				};
				try {
					return navigatorChirho.getAutoplayPolicy?.(audioChirho) ?? 'unknown';
				} catch {
					return 'unknown';
				}
			},
			on_change_chirho: updateMediaChirho
		});
		const mountedSessionChirho = sessionChirho;
		void mountedSessionChirho.startChirho();
		const saveChirho = (): void => mountedSessionChirho.saveChirho();
		window.addEventListener('pagehide', saveChirho);
		return () => {
			window.removeEventListener('pagehide', saveChirho);
			mountedSessionChirho.disposeChirho();
			// Unloading media can change WebKit's platform state; clear our platform state last.
			mediaChirho.disposeChirho();
		};
	});
</script>

<div
	class="radio-world-chirho"
	data-radio-theme-chirho={themeIdChirho}
	data-radio-widget-chirho={widgetChirho ? '' : undefined}
	data-radio-spatial-chirho={spatialStateChirho.active_chirho}
	data-radio-room-chirho={spatialStateChirho.active_chirho &&
		spatialStateChirho.scene_kind_chirho === 'room'}
>
	{#if !widgetChirho && !spatialStateChirho.active_chirho}<ThemeSceneChirho
			theme_id_chirho={themeIdChirho}
		/>{/if}
	<main>
		<RadioSpatialViewChirho
			bind:this={spatialChirho}
			session_chirho={sessionChirho}
			view_chirho={viewChirho}
			widget_chirho={widgetChirho}
			theme_id_chirho={themeIdChirho}
			on_change_chirho={(nextChirho) => (spatialStateChirho = nextChirho)}
		>
			<RadioReceiverChirho
				view_chirho={viewChirho}
				session_chirho={sessionChirho}
				theme_id_chirho={themeIdChirho}
				on_theme_chirho={chooseThemeChirho}
				on_about_chirho={(openerChirho) => {
					aboutOpenerChirho = openerChirho;
					sessionChirho?.feedbackChirho('click');
					aboutOpenChirho = true;
				}}
				spatial_chirho={spatialStateChirho.active_chirho}
				spatial_wanted_chirho={spatialStateChirho.wanted_chirho}
				spatial_busy_chirho={spatialStateChirho.busy_chirho}
				spatial_message_chirho={spatialStateChirho.message_chirho}
				on_spatial_chirho={() => {
					spatialChirho?.toggleChirho();
					sessionChirho?.feedbackChirho('click');
				}}
			/>
		</RadioSpatialViewChirho>
	</main>
	{#if widgetChirho}<a
			class="widget-home-chirho"
			href="https://audiobiblerad.io/"
			target="_blank"
			rel="noreferrer">Open Audio Bible Radio ↗</a
		>{/if}
	<RadioAboutChirho
		open_chirho={aboutOpenChirho}
		opener_chirho={aboutOpenerChirho}
		view_chirho={viewChirho}
		on_close_chirho={() => {
			aboutOpenChirho = false;
			sessionChirho?.feedbackChirho('click');
		}}
	/>
</div>

<style>
	.radio-world-chirho {
		min-height: 100svh;
		isolation: isolate;
		position: relative;
		color: var(--radio-page-ink-chirho, #292e2b);
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		align-items: center;
		padding: clamp(18px, 4vh, 56px) clamp(12px, 4vw, 48px);
	}
	.radio-world-chirho[data-radio-room-chirho='true'] {
		padding: 0;
		align-items: start;
		background: #101619;
	}
	main {
		width: 100%;
		min-width: 0;
		margin: auto;
	}
	.widget-home-chirho {
		color: var(--radio-page-ink-chirho, #292e2b);
		font:
			10px/1.5 system-ui,
			sans-serif;
		text-align: center;
		margin: 10px auto 0;
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	@media (max-width: 480px) {
		.radio-world-chirho {
			padding: 14px 12px;
		}
	}
</style>
