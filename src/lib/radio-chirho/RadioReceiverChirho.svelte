<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

<script lang="ts">
	import {
		BOOKS_CHIRHO,
		STATIONS_CHIRHO,
		offeredChapterCountChirho,
		resolveChapterPlaybackChirho
	} from '$lib/catalogue-chirho/catalogue_chirho';
	import RadioKnobChirho from '$lib/controls-chirho/RadioKnobChirho.svelte';
	import { LanguageDialChirho } from '$lib/language-chirho/language_dial_chirho';
	import { initialStationChirho } from '$lib/language-chirho/initial_station_chirho';
	import { RADIO_THEMES_CHIRHO, type RadioThemeIdChirho } from '$lib/themes-chirho/themes_chirho';
	import type { RadioSessionChirho } from './radio_session_chirho';
	import type { RadioSessionViewChirho } from './radio_types_chirho';
	let {
		view_chirho: viewChirho,
		session_chirho: sessionChirho,
		theme_id_chirho: themeIdChirho,
		on_theme_chirho: onThemeChirho,
		on_about_chirho: onAboutChirho
	}: {
		view_chirho: RadioSessionViewChirho;
		session_chirho?: RadioSessionChirho;
		theme_id_chirho: RadioThemeIdChirho;
		on_theme_chirho(valueChirho: RadioThemeIdChirho): void;
		on_about_chirho(): void;
	} = $props();
	let dialPreviewChirho = $state<number | null>(null);
	let seekPreviewChirho = $state<number | null>(null);
	const stateChirho = $derived(viewChirho.state_chirho);
	const stationChirho = $derived(
		viewChirho.stations_chirho.find(
			(stationChirho) => stationChirho.id_chirho === stateChirho.station_id_chirho
		) ??
			sessionChirho?.stationChirho ??
			STATIONS_CHIRHO[0]
	);
	const bookChirho = $derived(
		BOOKS_CHIRHO.find((bookChirho) => bookChirho.id_chirho === stateChirho.book_id_chirho) ??
			BOOKS_CHIRHO[0]
	);
	const activeChirho = $derived(['playing', 'loading'].includes(stateChirho.phase_chirho));
	const languagesChirho = $derived(viewChirho.languages_chirho);
	const dialChirho = $derived(new LanguageDialChirho(languagesChirho));
	const languageStationsChirho = $derived(
		viewChirho.stations_chirho.filter(
			(entryChirho) => entryChirho.language_code_chirho === stationChirho.language_code_chirho
		)
	);
	const dialIndexChirho = $derived(
		(dialChirho.offsetsChirho.get(stationChirho.language_code_chirho) ?? 0) +
			Math.max(
				0,
				languageStationsChirho.findIndex(
					(entryChirho) => entryChirho.id_chirho === stationChirho.id_chirho
				)
			)
	);
	const versionsChirho = $derived([
		...new Set(languageStationsChirho.map((entryChirho) => entryChirho.version_chirho))
	]);
	const narrationsChirho = $derived(
		languageStationsChirho.filter(
			(entryChirho) => entryChirho.version_chirho === stationChirho.version_chirho
		)
	);
	const booksChirho = $derived(
		BOOKS_CHIRHO.filter((entryChirho) =>
			Array.from(
				{ length: entryChirho.chapters_chirho },
				(_unusedChirho, indexChirho) => indexChirho + 1
			).some((chapterChirho) =>
				resolveChapterPlaybackChirho(stationChirho, entryChirho.id_chirho, chapterChirho)
			)
		).map((entryChirho) => ({
			value_chirho: entryChirho.order_chirho,
			label_chirho: entryChirho.name_chirho
		}))
	);
	const chaptersChirho = $derived(
		Array.from(
			{ length: bookChirho.chapters_chirho },
			(_unusedChirho, indexChirho) => indexChirho + 1
		)
			.filter((chapterChirho) =>
				resolveChapterPlaybackChirho(stationChirho, bookChirho.id_chirho, chapterChirho)
			)
			.map((chapterChirho) => ({
				value_chirho: chapterChirho,
				label_chirho: String(chapterChirho)
			}))
	);
	const statusChirho = $derived(
		viewChirho.restoring_chirho
			? 'FINDING SIGNAL'
			: stateChirho.phase_chirho === 'playing'
				? 'ON AIR'
				: stateChirho.phase_chirho === 'loading' || viewChirho.language_loading_chirho
					? 'TUNING IN'
					: stateChirho.phase_chirho === 'error'
						? 'SIGNAL LOST'
						: 'POWER OFF'
	);
	const modelChirho = $derived(
		RADIO_THEMES_CHIRHO.find((entryChirho) => entryChirho.id_chirho === themeIdChirho)!
	);
	const placeKeyChirho = $derived(
		`${stateChirho.station_id_chirho}/${stateChirho.book_id_chirho}/${stateChirho.chapter_chirho}`
	);
	function timeChirho(secondsChirho: number): string {
		const valueChirho = Number.isFinite(secondsChirho) ? Math.max(0, Math.floor(secondsChirho)) : 0;
		return `${Math.floor(valueChirho / 60)}:${String(valueChirho % 60).padStart(2, '0')}`;
	}
	function versionChirho(valueChirho: string): void {
		const selectedChirho = initialStationChirho(
			languageStationsChirho.filter((entryChirho) => entryChirho.version_chirho === valueChirho),
			stationChirho.language_code_chirho
		);
		if (selectedChirho) sessionChirho?.chooseStationChirho(selectedChirho.id_chirho);
	}
	function turnChirho(directionChirho: number): void {
		const indexChirho =
			(dialIndexChirho + directionChirho + dialChirho.totalChirho) % dialChirho.totalChirho;
		sessionChirho?.chooseDialChirho(indexChirho);
	}
	async function languageChirho(eventChirho: Event): Promise<void> {
		const selectChirho = eventChirho.currentTarget as HTMLSelectElement;
		await sessionChirho?.chooseLanguageChirho(selectChirho.value);
		selectChirho.value = stationChirho.language_code_chirho;
	}
	$effect(() => {
		void placeKeyChirho;
		seekPreviewChirho = null;
		dialPreviewChirho = null;
	});
</script>

<section class="radio-chirho" aria-label="Bible radio player">
	<div class="radio-top-chirho">
		<div class="radio-brand-chirho">
			<h1>Audio Bible Radio</h1>
			<span class="radio-model-chirho">{modelChirho.name_chirho} · № 316</span>
		</div>
		<div class="radio-top-actions-chirho">
			<span class="on-air-chirho" class:active-chirho={stateChirho.phase_chirho === 'playing'}
				><i aria-hidden="true"></i>{statusChirho}</span
			><button class="about-button-chirho" aria-label="About and settings" onclick={onAboutChirho}
				>?</button
			>
		</div>
	</div>
	<div class="display-chirho">
		<div class="display-top-chirho">
			<span>FM / SCRIPTURE</span><span>STATION {String(dialIndexChirho + 1).padStart(3, '0')}</span>
		</div>
		<label class="station-language-label-chirho"
			><span class="sr-only">Language</span>
			<select
				class="label-select-chirho station-language-chirho"
				aria-label="Language"
				lang={stationChirho.language_name_chirho === stationChirho.language_english_chirho
					? 'en'
					: stationChirho.language_code_chirho}
				value={stationChirho.language_code_chirho}
				onfocus={() => void sessionChirho?.refreshLanguagesChirho()}
				onchange={languageChirho}
				disabled={!sessionChirho}
			>
				{#each languagesChirho as languageChirho (languageChirho.code_chirho)}<option
						value={languageChirho.code_chirho}
						lang={languageChirho.name_chirho === languageChirho.english_chirho
							? 'en'
							: languageChirho.code_chirho}>{languageChirho.name_chirho}</option
					>{/each}
			</select>
		</label>
		<label class="station-version-label-chirho"
			><span class="sr-only">Version</span><select
				class="label-select-chirho station-version-chirho"
				aria-label="Version"
				value={stationChirho.version_chirho}
				disabled={!viewChirho.ready_chirho}
				onchange={(eventChirho) => versionChirho(eventChirho.currentTarget.value)}
				>{#each versionsChirho as versionChirho (versionChirho)}<option value={versionChirho}
						>{versionChirho}</option
					>{/each}</select
			></label
		>
		<label class="voice-label-chirho"
			><span class="voice-caption-chirho">VOICE</span><select
				class="label-select-chirho voice-select-chirho"
				aria-label="Narration"
				value={stationChirho.id_chirho}
				disabled={!viewChirho.ready_chirho}
				onchange={(eventChirho) =>
					sessionChirho?.chooseStationChirho(eventChirho.currentTarget.value)}
				>{#each narrationsChirho as narrationChirho (narrationChirho.id_chirho)}<option
						value={narrationChirho.id_chirho}
						>{narrationChirho.voice_chirho || 'Reader not named'} · {narrationChirho.source_name_chirho}{narrationChirho.voice_chirho
							? ''
							: ` · ${narrationChirho.chapter_count_chirho} chapters`}</option
					>{/each}</select
			></label
		>
		<div class="passage-display-chirho">
			<span
				>{bookChirho.name_chirho}
				{stateChirho.chapter_chirho}{#if stateChirho.verse_chirho}<small
						>:{stateChirho.verse_chirho}</small
					>{/if}</span
			><span
				class="wave-chirho"
				class:animate-chirho={stateChirho.phase_chirho === 'playing'}
				aria-hidden="true"
				>{#each [1, 2, 3, 4, 5, 6, 7] as barChirho (barChirho)}<i
						style={`--bar-chirho:${barChirho}`}
					></i>{/each}</span
			>
		</div>
	</div>
	<div class="tuning-chirho">
		<div class="tuning-caption-chirho">
			<span>LANGUAGE / TRANSLATION</span><span>{dialChirho.totalChirho} STATIONS</span>
		</div>
		<div class="tuning-controls-chirho">
			<button
				class="dial-arrow-chirho"
				disabled={!viewChirho.ready_chirho}
				aria-label="Previous station"
				onclick={() => turnChirho(-1)}>←</button
			>
			<div class="dial-track-chirho">
				<div class="dial-ticks-chirho" aria-hidden="true"></div>
				<input
					class="dial-chirho"
					type="range"
					min="0"
					max={Math.max(0, dialChirho.totalChirho - 1)}
					step="1"
					disabled={!viewChirho.ready_chirho}
					value={dialPreviewChirho ?? dialIndexChirho}
					aria-label="Station dial"
					aria-valuetext={`${stationChirho.language_english_chirho}, ${stationChirho.version_chirho}, ${stationChirho.voice_chirho}`}
					oninput={(eventChirho) => (dialPreviewChirho = Number(eventChirho.currentTarget.value))}
					onchange={(eventChirho) => {
						sessionChirho?.chooseDialChirho(Number(eventChirho.currentTarget.value));
						dialPreviewChirho = null;
					}}
					onpointercancel={() => (dialPreviewChirho = null)}
				/>
			</div>
			<button
				class="dial-arrow-chirho"
				disabled={!viewChirho.ready_chirho}
				aria-label="Next station"
				onclick={() => turnChirho(1)}>→</button
			>
		</div>
	</div>
	<div class="selector-row-chirho">
		<RadioKnobChirho
			label_chirho="Book"
			value_chirho={bookChirho.order_chirho}
			min_chirho={1}
			max_chirho={66}
			options_chirho={booksChirho}
			disabled_chirho={!viewChirho.ready_chirho}
			arc_chirho={themeIdChirho === 'field' ? 300 : 270}
			on_change_chirho={(orderChirho) => {
				const selectedChirho = BOOKS_CHIRHO[orderChirho - 1];
				if (selectedChirho) sessionChirho?.chooseBookChirho(selectedChirho.id_chirho);
			}}
		/>
		<div class="power-well-chirho">
			{#if viewChirho.needs_gesture_chirho}<span class="press-here-chirho" aria-hidden="true"
					>PRESS HERE<span>↓</span></span
				>{/if}<button
				class="power-chirho"
				class:powered-chirho={activeChirho}
				disabled={!viewChirho.ready_chirho}
				aria-label="Radio power"
				aria-pressed={activeChirho}
				onclick={() => sessionChirho?.powerChirho()}
				><span class="power-symbol-chirho" aria-hidden="true">⏻</span><span
					>{activeChirho ? 'ON' : 'OFF'}</span
				></button
			>
		</div>
		<RadioKnobChirho
			label_chirho="Chapter"
			value_chirho={stateChirho.chapter_chirho}
			min_chirho={1}
			max_chirho={bookChirho.chapters_chirho}
			options_chirho={chaptersChirho}
			disabled_chirho={!viewChirho.ready_chirho}
			arc_chirho={themeIdChirho === 'digital' ? 240 : 270}
			on_change_chirho={(chapterChirho) => sessionChirho?.chooseChapterChirho(chapterChirho)}
		/>
	</div>
	<div class="seek-row-chirho">
		<button
			class="chapter-arrow-chirho"
			aria-label="Previous chapter"
			disabled={!viewChirho.ready_chirho}
			onclick={() => sessionChirho?.previousChirho()}>‹</button
		>
		<div class="seek-control-chirho">
			<div class="seek-labels-chirho">
				<span>{timeChirho(seekPreviewChirho ?? stateChirho.seconds_chirho)}</span><span
					>{timeChirho(stateChirho.duration_chirho)}</span
				>
			</div>
			<input
				class="seek-chirho"
				type="range"
				aria-label="Chapter position"
				min="0"
				max={Math.max(1, stateChirho.duration_chirho)}
				step="1"
				value={seekPreviewChirho ?? stateChirho.seconds_chirho}
				disabled={stateChirho.duration_chirho <= 0 ||
					stateChirho.phase_chirho === 'ready' ||
					stateChirho.phase_chirho === 'error'}
				oninput={(eventChirho) => (seekPreviewChirho = Number(eventChirho.currentTarget.value))}
				onchange={(eventChirho) => {
					sessionChirho?.seekChirho(Number(eventChirho.currentTarget.value));
					seekPreviewChirho = null;
				}}
				onblur={() => (seekPreviewChirho = null)}
				onpointercancel={() => (seekPreviewChirho = null)}
			/>
		</div>
		<button
			class="chapter-arrow-chirho"
			aria-label="Next chapter"
			disabled={!viewChirho.ready_chirho}
			onclick={() => sessionChirho?.nextChirho()}>›</button
		>
	</div>
	<div class="radio-bottom-chirho">
		<label class="model-label-chirho"
			><span>RADIO MODEL</span><select
				class="label-select-chirho"
				aria-label="Radio model"
				disabled={!sessionChirho}
				value={themeIdChirho}
				onchange={(eventChirho) =>
					onThemeChirho(eventChirho.currentTarget.value as RadioThemeIdChirho)}
				>{#each RADIO_THEMES_CHIRHO as themeChirho (themeChirho.id_chirho)}<option
						value={themeChirho.id_chirho}>{themeChirho.name_chirho}</option
					>{/each}</select
			></label
		><label class="sound-control-chirho"
			><input
				type="checkbox"
				aria-label="Radio sounds"
				disabled={!viewChirho.ready_chirho}
				checked={stateChirho.sounds_enabled_chirho}
				onchange={(eventChirho) =>
					sessionChirho?.setSoundsChirho(eventChirho.currentTarget.checked)}
			/><span class="switch-chirho" aria-hidden="true"></span><span>SOUND</span></label
		>
	</div>
	<div class="status-message-chirho" role="status" aria-live="polite">
		{viewChirho.language_message_chirho ||
			(viewChirho.restoring_chirho ? 'Restoring your station…' : stateChirho.message_chirho)}
	</div>
	{#if viewChirho.restore_failed_chirho}<div class="restore-note-chirho" role="status">
			<p>Your saved station could not load. Your place is kept.</p>
			<button onclick={() => void sessionChirho?.restoreChirho()}>Retry saved station</button
			><button onclick={() => sessionChirho?.chooseBuiltinsChirho()}>Use built-in stations</button>
		</div>{/if}
	<div class="speaker-grille-chirho" aria-hidden="true"></div>
	<div class="credit-chirho">
		<p>{stationChirho.credit_chirho}</p>
		<p>
			<a href={stationChirho.source_url_chirho} target="_blank" rel="external noreferrer"
				>{stationChirho.source_name_chirho} ↗</a
			><span> · </span><a
				href={stationChirho.licence_url_chirho}
				target="_blank"
				rel="external noreferrer">{stationChirho.licence_name_chirho} ↗</a
			>
		</p>
		<p class="coverage-chirho">
			{offeredChapterCountChirho(stationChirho)}
			{stationChirho.source_id_chirho === 'davar'
				? 'chapters listed by the publisher. Availability can vary.'
				: 'verified chapters.'}
		</p>
	</div>
	{#if !stateChirho.storage_available_chirho}<p class="storage-message-chirho" role="status">
			Listening works, but this browser cannot save your place.
		</p>{/if}
</section>

<style>
	.radio-chirho {
		--radio-focus-chirho: var(--radio-accent-chirho, #e7bd73);
		position: relative;
		width: min(680px, 100%);
		margin: auto;
		box-sizing: border-box;
		padding: 25px 30px 20px;
		border-width: 2px;
		border-style: solid;
		border-color: var(--radio-edge-chirho, #424b41);
		border-radius: 20px;
		background-color: var(--radio-panel-chirho, #272e29);
		color: var(--radio-ink-chirho, #e7e5d3);
		box-shadow:
			0 20px 45px #0003,
			inset 0 1px 0 #ffffff10;
	}
	.radio-top-chirho {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		margin-bottom: 22px;
	}
	h1 {
		margin: 0;
		font:
			750 13px/1.3 system-ui,
			sans-serif;
		text-transform: uppercase;
		letter-spacing: 0.14em;
	}
	.radio-model-chirho {
		display: block;
		font:
			9px/1.5 ui-monospace,
			monospace;
		letter-spacing: 0.12em;
		margin-top: 5px;
		opacity: 0.75;
	}
	.radio-top-actions-chirho {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.on-air-chirho {
		display: flex;
		align-items: center;
		gap: 5px;
		font-size: 8px;
		font-weight: 700;
		letter-spacing: 0.1em;
		white-space: nowrap;
	}
	.on-air-chirho i {
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: #89947c;
	}
	.on-air-chirho.active-chirho {
		color: var(--radio-accent-chirho, #e7bd73);
	}
	.on-air-chirho.active-chirho i {
		background: currentColor;
		box-shadow: 0 0 8px currentColor;
	}
	.about-button-chirho {
		width: 25px;
		height: 25px;
		border: 1px solid currentColor;
		border-radius: 50%;
		background-color: transparent;
		color: inherit;
		font: 700 12px system-ui;
		cursor: pointer;
		opacity: 0.8;
	}
	.display-chirho {
		padding: 18px 20px 16px;
		background-color: var(--radio-screen-chirho, #18251f);
		color: var(--radio-screen-ink-chirho, #e9ead6);
		border-width: 2px;
		border-style: solid;
		border-color: #142019;
		border-radius: 7px;
		box-shadow: inset 0 3px 12px #0005;
	}
	.display-top-chirho {
		display: flex;
		justify-content: space-between;
		font:
			8px ui-monospace,
			monospace;
		letter-spacing: 0.2em;
		opacity: 0.7;
		margin-bottom: 12px;
	}
	.station-language-label-chirho,
	.station-version-label-chirho {
		display: block;
		min-width: 0;
	}
	.label-select-chirho {
		border: 1px solid transparent;
		border-radius: 4px;
		min-width: 0;
		max-width: 100%;
		color: inherit;
		background-color: transparent;
		font: inherit;
		padding: 4px 24px 4px 0;
		cursor: pointer;
		text-overflow: ellipsis;
	}
	.label-select-chirho:hover,
	.label-select-chirho:focus-visible {
		border-color: currentColor;
	}
	.label-select-chirho option {
		background-color: var(--radio-screen-chirho, #18251f);
		color: var(--radio-screen-ink-chirho, #e9ead6);
	}
	.station-language-chirho {
		width: 100%;
		font:
			clamp(27px, 5vw, 44px)/1.2 Georgia,
			serif;
		letter-spacing: -0.025em;
	}
	:global([data-radio-theme-chirho='digital']) .station-language-chirho {
		font-family: 'Courier New', monospace;
		font-weight: 700;
		letter-spacing: -0.04em;
	}
	:global([data-radio-theme-chirho='cyberpunk']) .station-language-chirho {
		font-family: system-ui, sans-serif;
		font-weight: 650;
		letter-spacing: -0.04em;
	}
	.station-version-chirho {
		width: 100%;
		font-size: 12px;
	}
	.voice-label-chirho {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-top: 3px;
	}
	.voice-caption-chirho {
		font:
			8px ui-monospace,
			monospace;
		letter-spacing: 0.12em;
		opacity: 0.6;
	}
	.voice-select-chirho {
		width: 100%;
		font-size: 10px;
		opacity: 0.85;
	}
	.passage-display-chirho {
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-top: 1px solid color-mix(in srgb, currentColor 20%, transparent);
		padding-top: 12px;
		margin-top: 12px;
		font-size: 16px;
	}
	.passage-display-chirho small {
		font-size: 0.8em;
	}
	.wave-chirho {
		display: flex;
		align-items: center;
		height: 20px;
		gap: 3px;
		color: var(--radio-accent-chirho, #b8c49d);
	}
	.wave-chirho i {
		width: 2px;
		height: calc(3px + var(--bar-chirho) * 1.4px);
		background: currentColor;
		opacity: 0.7;
	}
	.wave-chirho.animate-chirho i {
		animation: wave-chirho 0.9s calc(var(--bar-chirho) * -0.1s) ease-in-out infinite alternate;
	}
	@keyframes wave-chirho {
		to {
			transform: scaleY(0.35);
		}
	}
	.tuning-chirho {
		margin-top: 22px;
	}
	.tuning-caption-chirho {
		display: flex;
		justify-content: space-between;
		gap: 10px;
		font-size: 8px;
		letter-spacing: 0.14em;
		font-weight: 700;
		opacity: 0.8;
	}
	.tuning-controls-chirho {
		display: flex;
		align-items: center;
		gap: 13px;
		margin-top: 11px;
	}
	.dial-arrow-chirho {
		flex: 0 0 33px;
		height: 33px;
		border: 1px solid color-mix(in srgb, currentColor 45%, transparent);
		border-radius: 50%;
		background-color: transparent;
		color: inherit;
		font-size: 19px;
		cursor: pointer;
	}
	.dial-track-chirho {
		position: relative;
		flex: 1;
		min-width: 0;
		height: 28px;
	}
	.dial-ticks-chirho {
		position: absolute;
		inset: 3px 0;
		background-image: repeating-linear-gradient(90deg, currentColor 0 1px, transparent 1px 11px);
		opacity: 0.4;
	}
	.dial-chirho {
		appearance: none;
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		margin: 0;
		background: transparent;
		cursor: ew-resize;
	}
	.dial-chirho::-webkit-slider-runnable-track {
		height: 100%;
		background: transparent;
	}
	.dial-chirho::-webkit-slider-thumb {
		appearance: none;
		width: 5px;
		height: 32px;
		margin-top: -2px;
		background: var(--radio-accent-chirho, #e7bd73);
		box-shadow: 0 0 0 5px #e7bd7319;
	}
	.dial-chirho::-moz-range-track {
		background: transparent;
	}
	.dial-chirho::-moz-range-thumb {
		border: 0;
		border-radius: 0;
		width: 5px;
		height: 32px;
		background: var(--radio-accent-chirho, #e7bd73);
	}
	.selector-row-chirho {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 120px minmax(0, 1fr);
		gap: 12px;
		align-items: center;
		margin: 24px 0 14px;
	}
	.power-well-chirho {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.power-chirho {
		width: 96px;
		height: 96px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 3px;
		border-width: 2px;
		border-style: solid;
		border-color: #626b58;
		border-radius: 50%;
		color: var(--radio-ink-chirho, #d7dfc8);
		background-color: #333c31;
		box-shadow:
			0 5px 8px #0005,
			inset 0 1px 2px #ffffff30;
		font-size: 11px;
		font-weight: 800;
		letter-spacing: 0.15em;
		cursor: pointer;
	}
	.power-chirho.powered-chirho {
		color: #242d25;
		background-color: var(--radio-accent-chirho, #e7bd73);
		border-color: #e7bd7399;
		box-shadow:
			0 4px 8px #0005,
			inset 0 1px 2px #fff5;
	}
	.power-symbol-chirho {
		font:
			34px/1 ui-monospace,
			monospace;
		letter-spacing: 0;
	}
	.press-here-chirho {
		position: absolute;
		bottom: calc(100% + 4px);
		font:
			800 9px ui-monospace,
			monospace;
		letter-spacing: 0.1em;
		text-align: center;
		white-space: nowrap;
		color: var(--radio-accent-chirho, #e7bd73);
		animation: press-here-chirho 1.3s ease-in-out infinite alternate;
		pointer-events: none;
	}
	.press-here-chirho span {
		display: block;
		font-size: 15px;
		line-height: 1.2;
	}
	@keyframes press-here-chirho {
		to {
			transform: translateY(-6px);
		}
	}
	.seek-row-chirho {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.chapter-arrow-chirho {
		border: 0;
		background-color: transparent;
		color: inherit;
		font-size: 28px;
		line-height: 1;
		padding: 4px 8px;
		cursor: pointer;
	}
	.seek-control-chirho {
		flex: 1;
		min-width: 0;
	}
	.seek-labels-chirho {
		display: flex;
		justify-content: space-between;
		font:
			9px ui-monospace,
			monospace;
		letter-spacing: 0.1em;
		opacity: 0.7;
	}
	.seek-chirho {
		width: 100%;
		height: 20px;
		accent-color: var(--radio-accent-chirho, #b9c69e);
		cursor: pointer;
		margin: 3px 0 0;
	}
	.radio-bottom-chirho {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 15px;
		border-top: 1px solid color-mix(in srgb, currentColor 18%, transparent);
		margin-top: 15px;
		padding-top: 12px;
	}
	.model-label-chirho {
		display: flex;
		gap: 8px;
		align-items: center;
		min-width: 0;
	}
	.model-label-chirho > span {
		font-size: 7px;
		letter-spacing: 0.12em;
		opacity: 0.65;
	}
	.model-label-chirho select {
		font-size: 10px;
		width: 135px;
	}
	.sound-control-chirho {
		position: relative;
		display: flex;
		align-items: center;
		gap: 7px;
		cursor: pointer;
		font-size: 8px;
		letter-spacing: 0.1em;
		flex-shrink: 0;
	}
	.sound-control-chirho input {
		position: absolute;
		opacity: 0;
		width: 100%;
		height: 100%;
		inset: 0;
		cursor: pointer;
	}
	.switch-chirho {
		display: block;
		width: 25px;
		height: 13px;
		border-radius: 9px;
		background-color: #77816b;
		position: relative;
	}
	.switch-chirho::after {
		content: '';
		position: absolute;
		left: 3px;
		top: 3px;
		width: 7px;
		height: 7px;
		background: #e5e8d8;
		border-radius: 50%;
		transition: transform 0.12s;
	}
	.sound-control-chirho:has(input:checked) .switch-chirho {
		background-color: #ae8c4c;
	}
	.sound-control-chirho:has(input:checked) .switch-chirho::after {
		transform: translateX(12px);
	}
	.sound-control-chirho:has(input:focus-visible) {
		outline: 2px solid currentColor;
		outline-offset: 5px;
	}
	.status-message-chirho {
		font-size: 11px;
		line-height: 1.5;
		text-align: center;
		margin-top: 10px;
	}
	.status-message-chirho:empty {
		display: none;
	}
	.restore-note-chirho {
		font-size: 12px;
		text-align: center;
	}
	.restore-note-chirho button {
		padding: 6px 8px;
		color: inherit;
		background-color: transparent;
		border: 1px solid #89947c;
		border-radius: 4px;
		margin: 3px;
		cursor: pointer;
	}
	.speaker-grille-chirho {
		height: 24px;
		margin-top: 17px;
		border-radius: 4px;
		background-image: repeating-linear-gradient(0deg, #1119 0 2px, transparent 2px 5px);
		opacity: 0.7;
	}
	.credit-chirho {
		font-size: 10px;
		line-height: 1.65;
		text-align: center;
		margin-top: 13px;
		opacity: 0.88;
	}
	.credit-chirho p {
		margin: 4px 0;
	}
	.credit-chirho a {
		color: inherit;
		text-decoration-color: #b5c29a88;
		text-underline-offset: 3px;
	}
	.coverage-chirho {
		font-size: 9px;
		opacity: 0.7;
	}
	.storage-message-chirho {
		font-size: 11px;
		text-align: center;
	}
	button:disabled {
		cursor: default;
		opacity: 0.55;
	}
	button:focus-visible,
	input:focus-visible {
		outline: 3px solid var(--radio-focus-chirho, #e7bd73);
		outline-offset: 4px;
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
	}
	@media (max-width: 480px) {
		.radio-chirho {
			padding: 20px 16px 14px;
			border-radius: 15px;
		}
		.radio-top-chirho {
			gap: 8px;
			margin-bottom: 16px;
		}
		h1 {
			font-size: 10px;
			letter-spacing: 0.09em;
		}
		.radio-model-chirho {
			font-size: 8px;
		}
		.on-air-chirho {
			font-size: 6px;
			gap: 4px;
		}
		.radio-top-actions-chirho {
			gap: 7px;
		}
		.display-chirho {
			padding: 14px 12px;
		}
		.display-top-chirho {
			font-size: 7px;
			letter-spacing: 0.12em;
		}
		.station-language-chirho {
			font-size: 32px;
		}
		:global([data-radio-theme-chirho='digital']) .station-language-chirho {
			font-family: 'Courier New', monospace;
			font-weight: 700;
			letter-spacing: -0.04em;
		}
		:global([data-radio-theme-chirho='cyberpunk']) .station-language-chirho {
			font-family: system-ui, sans-serif;
			font-weight: 650;
			letter-spacing: -0.04em;
		}
		.station-version-chirho {
			font-size: 11px;
		}
		.voice-select-chirho {
			font-size: 9px;
		}
		.selector-row-chirho {
			grid-template-columns: minmax(0, 1fr) 76px minmax(0, 1fr);
			gap: 4px;
			margin-top: 26px;
		}
		.power-chirho {
			width: 70px;
			height: 70px;
			font-size: 9px;
		}
		.power-symbol-chirho {
			font-size: 27px;
		}
		.tuning-caption-chirho {
			font-size: 7px;
			letter-spacing: 0.08em;
		}
		.tuning-controls-chirho {
			gap: 8px;
		}
		.dial-arrow-chirho {
			flex-basis: 29px;
			height: 29px;
		}
		.model-label-chirho > span {
			display: none;
		}
		.model-label-chirho select {
			width: 130px;
		}
		.credit-chirho {
			font-size: 10px;
		}
		.seek-row-chirho {
			gap: 4px;
		}
		.chapter-arrow-chirho {
			padding: 4px;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		*,
		*::before,
		*::after {
			animation: none !important;
			transition: none !important;
		}
	}
</style>
