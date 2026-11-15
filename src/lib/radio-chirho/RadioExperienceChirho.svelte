<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

<script lang="ts">
	import { onMount } from 'svelte';
	import { BOOKS_CHIRHO, STATIONS_CHIRHO } from '$lib/catalogue-chirho/catalogue_chirho';
	import type { PreferenceStorageChirho } from '$lib/player-chirho/player_preferences_chirho';
	import { createRadioSoundsChirho } from '$lib/sounds-chirho/radio_sounds_chirho';
	import ThemeSceneChirho from '$lib/themes-chirho/ThemeSceneChirho.svelte';
	import { RADIO_THEMES_CHIRHO, type RadioThemeIdChirho } from '$lib/themes-chirho/themes_chirho';
	import RadioReceiverChirho from './RadioReceiverChirho.svelte';
	import RadioAboutChirho from './RadioAboutChirho.svelte';
	import { RadioSessionChirho, initialRadioViewChirho } from './radio_session_chirho';
	import type { AutoplayPolicyChirho, RadioSessionViewChirho } from './radio_types_chirho';
	const THEME_KEY_CHIRHO = 'audio-bible-radio-theme-chirho';
	let sessionChirho = $state<RadioSessionChirho>();
	let viewChirho = $state(initialRadioViewChirho());
	let themeIdChirho = $state<RadioThemeIdChirho>('minimal');
	let aboutOpenChirho = $state(false);
	let storageChirho: PreferenceStorageChirho | null = null;
	function chooseThemeChirho(valueChirho: RadioThemeIdChirho): void {
		if (!RADIO_THEMES_CHIRHO.some((entryChirho) => entryChirho.id_chirho === valueChirho)) return;
		themeIdChirho = valueChirho;
		try {
			storageChirho?.setItem(THEME_KEY_CHIRHO, valueChirho);
		} catch {
			/* Optional device memory. */
		}
	}
	onMount(() => {
		try {
			storageChirho = window.localStorage;
			const rememberedChirho = storageChirho.getItem(THEME_KEY_CHIRHO);
			if (RADIO_THEMES_CHIRHO.some((entryChirho) => entryChirho.id_chirho === rememberedChirho))
				themeIdChirho = rememberedChirho as RadioThemeIdChirho;
		} catch {
			/* Listening works without storage. */
		}
		const audioChirho = new Audio();
		let metadataKeyChirho = '';
		const updateMediaChirho = (nextChirho: RadioSessionViewChirho): void => {
			viewChirho = nextChirho;
			if (!('mediaSession' in navigator) || !('MediaMetadata' in window)) return;
			const stateChirho = nextChirho.state_chirho;
			const stationChirho =
				nextChirho.stations_chirho.find(
					(entryChirho) => entryChirho.id_chirho === stateChirho.station_id_chirho
				) ??
				sessionChirho?.stationChirho ??
				STATIONS_CHIRHO[0];
			const bookChirho = BOOKS_CHIRHO.find(
				(entryChirho) => entryChirho.id_chirho === stateChirho.book_id_chirho
			);
			const keyChirho = `${stateChirho.station_id_chirho}/${stateChirho.book_id_chirho}/${stateChirho.chapter_chirho}`;
			if (keyChirho !== metadataKeyChirho) {
				metadataKeyChirho = keyChirho;
				navigator.mediaSession.metadata = new MediaMetadata({
					title: `${bookChirho?.name_chirho ?? ''} ${stateChirho.chapter_chirho}`,
					artist: stationChirho.voice_chirho || stationChirho.source_name_chirho,
					album: `${stationChirho.version_chirho} · ${stationChirho.language_english_chirho}`
				});
			}
			navigator.mediaSession.playbackState =
				stateChirho.phase_chirho === 'playing' ? 'playing' : 'paused';
		};
		sessionChirho = new RadioSessionChirho({
			storage_chirho: storageChirho,
			audio_chirho: audioChirho,
			sounds_chirho: createRadioSoundsChirho(),
			browser_languages_chirho: navigator.languages.length
				? navigator.languages
				: [navigator.language],
			autoplay_policy_chirho: () => {
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
		const actionsChirho: readonly [MediaSessionAction, () => void][] = [
			['play', () => mountedSessionChirho.onChirho()],
			['pause', () => mountedSessionChirho.offChirho()],
			['stop', () => mountedSessionChirho.offChirho()],
			['nexttrack', () => mountedSessionChirho.nextChirho()],
			['previoustrack', () => mountedSessionChirho.previousChirho()]
		];
		if ('mediaSession' in navigator)
			for (const [actionChirho, handlerChirho] of actionsChirho) {
				try {
					navigator.mediaSession.setActionHandler(actionChirho, handlerChirho);
				} catch {
					/* Optional browser API. */
				}
			}
		return () => {
			window.removeEventListener('pagehide', saveChirho);
			mountedSessionChirho.disposeChirho();
			if ('mediaSession' in navigator)
				for (const [actionChirho] of actionsChirho) {
					try {
						navigator.mediaSession.setActionHandler(actionChirho, null);
					} catch {
						/* Optional browser API. */
					}
				}
		};
	});
</script>

<div class="radio-world-chirho" data-radio-theme-chirho={themeIdChirho}>
	<ThemeSceneChirho theme_id_chirho={themeIdChirho} />
	<main>
		<RadioReceiverChirho
			view_chirho={viewChirho}
			session_chirho={sessionChirho}
			theme_id_chirho={themeIdChirho}
			on_theme_chirho={chooseThemeChirho}
			on_about_chirho={() => (aboutOpenChirho = true)}
		/>
	</main>
	<RadioAboutChirho
		open_chirho={aboutOpenChirho}
		view_chirho={viewChirho}
		on_close_chirho={() => (aboutOpenChirho = false)}
	/>
</div>

<style>
	.radio-world-chirho {
		min-height: 100svh;
		isolation: isolate;
		position: relative;
		color: var(--radio-page-ink-chirho, #292e2b);
		display: grid;
		align-items: center;
		padding: clamp(18px, 4vh, 56px) clamp(12px, 4vw, 48px);
	}
	main {
		width: 100%;
		margin: auto;
	}
	@media (max-width: 480px) {
		.radio-world-chirho {
			padding: 14px 12px;
		}
	}
</style>
