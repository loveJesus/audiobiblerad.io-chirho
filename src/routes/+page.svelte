<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve as resolvePathChirho } from '$app/paths';
	import {
		BOOKS_CHIRHO,
		STATIONS_CHIRHO,
		resolveChapterPlaybackChirho,
		offeredChapterCountChirho,
		findStationChirho,
		type StationChirho
	} from '$lib/catalogue-chirho/catalogue_chirho';
	import {
		SITE_DOMAIN_CHIRHO,
		SITE_MAKER_CHIRHO,
		SITE_NAME_CHIRHO,
		SITE_SUMMARY_CHIRHO
	} from '$lib/site-chirho/site_config_chirho';
	import { RadioPlayerChirho, type RadioStateChirho } from '$lib/player-chirho/radio_player_chirho';
	import {
		defaultPreferencesChirho,
		readPreferencesChirho,
		type PlayerPreferencesChirho,
		type PreferenceStorageChirho
	} from '$lib/player-chirho/player_preferences_chirho';
	import LanguagePickerChirho from '$lib/language-chirho/LanguagePickerChirho.svelte';
	import {
		LanguageLibraryChirho,
		stationsInLanguageChirho
	} from '$lib/language-chirho/language_library_chirho';
	import { createRadioSoundsChirho } from '$lib/sounds-chirho/radio_sounds_chirho';

	let playerChirho = $state<RadioPlayerChirho | undefined>(undefined);
	let stateChirho = $state<RadioStateChirho>({
		...defaultPreferencesChirho(),
		phase_chirho: 'ready',
		duration_chirho: 0,
		verse_chirho: null,
		message_chirho: '',
		storage_available_chirho: true,
		first_sound_ms_chirho: null,
		switch_ms_chirho: null,
		position_mode_chirho: 'start'
	});
	let libraryChirho = $state<LanguageLibraryChirho | undefined>();
	let dialStationsChirho = $state<readonly StationChirho[]>(STATIONS_CHIRHO);
	let dialLanguageChirho = $state<string | undefined>();
	let languageLoadingChirho = $state('');
	let languageMessageChirho = $state('');
	let restoringChirho = $state(false);
	let restoreFailedChirho = $state(false);
	let chooseLanguageChirho = $state<(codeChirho: string) => void>(() => undefined);
	let chooseBuiltinsChirho = $state<() => void>(() => undefined);
	let retryRestoreChirho = $state<() => void>(() => undefined);
	let chooseStationChirho = $state<(idChirho: string) => void>(() => undefined);
	let stationPickerOpenChirho = $state(false);
	let browseButtonChirho = $state<HTMLButtonElement>();
	let seekPreviewChirho = $state<number | null>(null);
	const stationChirho = $derived(
		dialStationsChirho.find(
			(entryChirho) => entryChirho.id_chirho === stateChirho.station_id_chirho
		) ??
			playerChirho?.stationChirho ??
			STATIONS_CHIRHO[0]
	);
	const stationIndexChirho = $derived(
		Math.max(
			0,
			dialStationsChirho.findIndex(
				(entryChirho) => entryChirho.id_chirho === stationChirho.id_chirho
			)
		)
	);
	const bookChirho = $derived(
		BOOKS_CHIRHO.find((bookChirho) => bookChirho.id_chirho === stateChirho.book_id_chirho) ??
			BOOKS_CHIRHO[0]
	);
	const isActiveChirho = $derived(
		stateChirho.phase_chirho === 'playing' || stateChirho.phase_chirho === 'loading'
	);
	const availableBooksChirho = $derived(
		BOOKS_CHIRHO.filter((bookChirho) =>
			Array.from(
				{ length: bookChirho.chapters_chirho },
				(_unusedChirho, indexChirho) => indexChirho + 1
			).some((chapterChirho) =>
				resolveChapterPlaybackChirho(stationChirho, bookChirho.id_chirho, chapterChirho)
			)
		)
	);
	const availableChaptersChirho = $derived(
		Array.from(
			{ length: bookChirho.chapters_chirho },
			(_unusedChirho, indexChirho) => indexChirho + 1
		).filter((chapterChirho) =>
			resolveChapterPlaybackChirho(stationChirho, bookChirho.id_chirho, chapterChirho)
		)
	);
	const languageCountChirho = $derived(
		new Set(dialStationsChirho.map((entryChirho) => entryChirho.language_code_chirho)).size
	);
	const statusChirho = $derived(
		stateChirho.phase_chirho === 'playing'
			? 'ON AIR'
			: stateChirho.phase_chirho === 'loading'
				? 'TUNING IN'
				: stateChirho.phase_chirho === 'paused'
					? 'PAUSED'
					: stateChirho.phase_chirho === 'error'
						? 'SIGNAL LOST'
						: 'READY WHEN YOU ARE'
	);

	function timeLabelChirho(secondsChirho: number): string {
		const safeChirho = Number.isFinite(secondsChirho) ? Math.max(0, Math.floor(secondsChirho)) : 0;
		return `${Math.floor(safeChirho / 60)}:${String(safeChirho % 60).padStart(2, '0')}`;
	}
	function turnDialChirho(directionChirho: number): void {
		chooseStationChirho(
			dialStationsChirho[
				(stationIndexChirho + directionChirho + dialStationsChirho.length) %
					dialStationsChirho.length
			].id_chirho
		);
	}
	function chooseBookChirho(bookIdChirho: string): void {
		const selectedBookChirho = BOOKS_CHIRHO.find(
			(bookChirho) => bookChirho.id_chirho === bookIdChirho
		);
		const firstChapterChirho =
			selectedBookChirho &&
			Array.from(
				{ length: selectedBookChirho.chapters_chirho },
				(_unusedChirho, indexChirho) => indexChirho + 1
			).find((chapterChirho) =>
				resolveChapterPlaybackChirho(stationChirho, bookIdChirho, chapterChirho)
			);
		if (firstChapterChirho) playerChirho?.selectChapterChirho(bookIdChirho, firstChapterChirho);
	}

	onMount(() => {
		let metadataKeyChirho = '';
		let storageChirho: PreferenceStorageChirho | null = null;
		try {
			storageChirho = window.localStorage;
		} catch {
			/* Listening works without device storage. */
		}
		libraryChirho = new LanguageLibraryChirho();
		let selectionRequestChirho = 0;
		let mountedChirho = true;
		const rememberedChirho = readPreferencesChirho(storageChirho).preferences_chirho;
		const initializeChirho = (
			preferencesChirho: PlayerPreferencesChirho,
			stationsChirho: readonly StationChirho[]
		): void => {
			dialStationsChirho = stationsChirho;
			playerChirho = new RadioPlayerChirho({
				stations_chirho: stationsChirho,
				preferences_chirho: preferencesChirho,
				audio_chirho: new Audio(),
				sounds_chirho: createRadioSoundsChirho(),
				storage_chirho: storageChirho,
				on_change_chirho(nextStateChirho) {
					if (
						nextStateChirho.station_id_chirho !== stateChirho.station_id_chirho ||
						nextStateChirho.book_id_chirho !== stateChirho.book_id_chirho ||
						nextStateChirho.chapter_chirho !== stateChirho.chapter_chirho
					)
						seekPreviewChirho = null;
					stateChirho = nextStateChirho;
					if ('mediaSession' in navigator && 'MediaMetadata' in window) {
						const currentStationChirho =
							stationsChirho.find(
								(entryChirho) => entryChirho.id_chirho === nextStateChirho.station_id_chirho
							) ??
							playerChirho?.stationChirho ??
							STATIONS_CHIRHO[0];
						const currentBookChirho = BOOKS_CHIRHO.find(
							(bookChirho) => bookChirho.id_chirho === nextStateChirho.book_id_chirho
						);
						const nextMetadataKeyChirho = `${nextStateChirho.station_id_chirho}/${nextStateChirho.book_id_chirho}/${nextStateChirho.chapter_chirho}`;
						if (nextMetadataKeyChirho !== metadataKeyChirho) {
							metadataKeyChirho = nextMetadataKeyChirho;
							navigator.mediaSession.metadata = new MediaMetadata({
								title: `${currentBookChirho?.name_chirho} ${nextStateChirho.chapter_chirho}`,
								artist: `${currentStationChirho.language_name_chirho} · ${currentStationChirho.version_chirho}`,
								album: SITE_NAME_CHIRHO
							});
						}
						navigator.mediaSession.playbackState =
							nextStateChirho.phase_chirho === 'playing' ? 'playing' : 'paused';
					}
				}
			});
		};
		const restoreChirho = async (): Promise<void> => {
			const requestChirho = ++selectionRequestChirho;
			restoringChirho = true;
			restoreFailedChirho = false;
			languageLoadingChirho = '';
			languageMessageChirho = '';
			try {
				const codeChirho = rememberedChirho.language_code_chirho!;
				const stationsChirho = await libraryChirho!.loadStationsChirho(codeChirho);
				if (!mountedChirho || requestChirho !== selectionRequestChirho) return;
				if (
					!stationsChirho.some(
						(entryChirho) => entryChirho.id_chirho === rememberedChirho.station_id_chirho
					)
				)
					throw new Error('Remembered station unavailable');
				dialLanguageChirho = codeChirho;
				initializeChirho({ ...rememberedChirho, dial_language_chirho: codeChirho }, stationsChirho);
			} catch {
				if (mountedChirho && requestChirho === selectionRequestChirho) restoreFailedChirho = true;
			} finally {
				if (mountedChirho && requestChirho === selectionRequestChirho) restoringChirho = false;
			}
		};
		chooseLanguageChirho = (codeChirho): void => {
			const requestChirho = ++selectionRequestChirho;
			languageLoadingChirho = codeChirho;
			languageMessageChirho = '';
			void libraryChirho!
				.loadStationsChirho(codeChirho)
				.then((stationsChirho) => {
					if (!mountedChirho || requestChirho !== selectionRequestChirho) return;
					dialStationsChirho = stationsChirho;
					dialLanguageChirho = codeChirho;
					if (!playerChirho)
						initializeChirho(
							{
								...rememberedChirho,
								station_id_chirho: stationsChirho[0].id_chirho,
								language_code_chirho: codeChirho,
								dial_language_chirho: codeChirho
							},
							stationsChirho
						);
					playerChirho!.setStationsChirho(stationsChirho, codeChirho);
					if (
						!stationsChirho.some(
							(entryChirho) =>
								entryChirho.id_chirho === playerChirho!.snapshotChirho.station_id_chirho
						)
					)
						playerChirho!.selectStationChirho(stationsChirho[0].id_chirho);
					restoreFailedChirho = false;
					restoringChirho = false;
				})
				.catch(() => {
					if (mountedChirho && requestChirho === selectionRequestChirho) {
						languageMessageChirho =
							'These stations could not load. Select the language to retry. Your place is kept.';
						if (!playerChirho) {
							restoringChirho = false;
							restoreFailedChirho = true;
						}
					}
				})
				.finally(() => {
					if (mountedChirho && requestChirho === selectionRequestChirho) languageLoadingChirho = '';
				});
		};
		chooseBuiltinsChirho = (): void => {
			selectionRequestChirho += 1;
			libraryChirho!.cancelSelectionChirho();
			restoringChirho = false;
			restoreFailedChirho = false;
			languageLoadingChirho = '';
			languageMessageChirho = '';
			dialStationsChirho = STATIONS_CHIRHO;
			dialLanguageChirho = undefined;
			if (!playerChirho)
				initializeChirho(
					{
						...rememberedChirho,
						station_id_chirho: STATIONS_CHIRHO[0].id_chirho,
						language_code_chirho: STATIONS_CHIRHO[0].language_code_chirho,
						dial_language_chirho: undefined
					},
					STATIONS_CHIRHO
				);
			playerChirho!.setStationsChirho(STATIONS_CHIRHO);
			if (!findStationChirho(playerChirho!.snapshotChirho.station_id_chirho))
				playerChirho!.selectStationChirho(STATIONS_CHIRHO[0].id_chirho);
		};
		retryRestoreChirho = () => {
			void restoreChirho();
		};
		chooseStationChirho = (idChirho): void => {
			selectionRequestChirho += 1;
			libraryChirho!.cancelSelectionChirho();
			languageLoadingChirho = '';
			languageMessageChirho = '';
			if (!playerChirho) chooseBuiltinsChirho();
			playerChirho?.selectStationChirho(idChirho);
		};
		if (findStationChirho(rememberedChirho.station_id_chirho)) {
			dialLanguageChirho = rememberedChirho.dial_language_chirho;
			initializeChirho(
				rememberedChirho,
				dialLanguageChirho ? stationsInLanguageChirho(dialLanguageChirho, []) : STATIONS_CHIRHO
			);
			if (dialLanguageChirho) chooseLanguageChirho(dialLanguageChirho);
		} else {
			void restoreChirho();
		}
		const saveChirho = (): void => playerChirho?.saveChirho();
		window.addEventListener('pagehide', saveChirho);
		if ('mediaSession' in navigator) {
			for (const [actionChirho, handlerChirho] of [
				['play', () => playerChirho?.playChirho()],
				['pause', () => playerChirho?.pauseChirho()],
				['nexttrack', () => playerChirho?.nextChirho()],
				['previoustrack', () => playerChirho?.previousChirho()]
			] as const) {
				try {
					navigator.mediaSession.setActionHandler(actionChirho, handlerChirho);
				} catch {
					/* Optional browser API. */
				}
			}
		}
		return () => {
			mountedChirho = false;
			selectionRequestChirho += 1;
			libraryChirho?.disposeChirho();
			window.removeEventListener('pagehide', saveChirho);
			playerChirho?.disposeChirho();
			if ('mediaSession' in navigator)
				for (const actionChirho of ['play', 'pause', 'nexttrack', 'previoustrack'] as const) {
					try {
						navigator.mediaSession.setActionHandler(actionChirho, null);
					} catch {
						/* Optional browser API. */
					}
				}
		};
	});
</script>

<svelte:head>
	<title>{SITE_NAME_CHIRHO}</title>
	<meta name="description" content={SITE_SUMMARY_CHIRHO} />
	<meta name="referrer" content="no-referrer" />
	<meta name="theme-color" content="#eeece3" />
</svelte:head>

<div class="page-chirho">
	<header class="masthead-chirho">
		<a class="wordmark-chirho" href={resolvePathChirho('/')} aria-label={SITE_NAME_CHIRHO}
			><span class="mark-chirho" aria-hidden="true">a<span>br</span></span><span
				>AUDIO BIBLE<br />RADIO</span
			></a
		>
		<span class="masthead-note-chirho">THE WORD. WITH YOU.</span>
	</header>
	<main>
		<div class="intro-chirho">
			<p class="eyebrow-chirho">MANY LANGUAGES. ONE LIVING WORD.</p>
			<h1>{SITE_NAME_CHIRHO}</h1>
			<p>Turn it on. Let the Word fill the room.</p>
		</div>
		<section class="radio-chirho" aria-label="Bible radio player">
			<div class="radio-top-chirho">
				<span class="radio-label-chirho">SCRIPTURE RECEIVER <span>№ 316</span></span><span
					class="on-air-chirho"
					class:active-chirho={stateChirho.phase_chirho === 'playing'}
					><span aria-hidden="true"></span>{statusChirho}</span
				>
			</div>
			<div class="display-chirho">
				<div class="display-top-chirho">
					<span>STATION {String(stationIndexChirho + 1).padStart(2, '0')}</span><span
						>{stationChirho.version_code_chirho} / {stationChirho.language_code_chirho.toUpperCase()}</span
					>
				</div>
				<p
					class="station-language-chirho"
					lang={stationChirho.language_name_chirho === stationChirho.language_english_chirho
						? 'en'
						: stationChirho.language_code_chirho}
				>
					{stationChirho.language_name_chirho}
				</p>
				<p class="station-version-chirho">{stationChirho.version_chirho}</p>
				<p class="voice-chirho">
					{stationChirho.voice_chirho || 'Reader not named'}<span>
						· {stationChirho.voice_kind_chirho === 'human'
							? 'Human narration'
							: stationChirho.voice_kind_chirho === 'synthetic'
								? 'Synthetic voice'
								: 'Voice type unconfirmed'}</span
					>
				</p>
				<div class="passage-display-chirho">
					<span
						>{bookChirho.name_chirho}
						{stateChirho.chapter_chirho}{#if stateChirho.verse_chirho}<span class="verse-chirho"
								>:{stateChirho.verse_chirho}</span
							>{/if}</span
					><span
						class="wave-chirho"
						class:animate-chirho={stateChirho.phase_chirho === 'playing'}
						aria-hidden="true"
						>{#each [1, 2, 3, 4, 5, 6, 7, 8, 9] as barChirho (barChirho)}<i
								style={`--bar-chirho:${barChirho}`}
							></i>{/each}</span
					>
				</div>
			</div>
			<div class="tuning-chirho">
				<div class="tuning-caption-chirho">
					<span>TURN THE DIAL</span><span
						>{dialStationsChirho.length}
						{dialStationsChirho.length === 1 ? 'STATION' : 'STATIONS'} / {languageCountChirho}
						{languageCountChirho === 1 ? 'LANGUAGE' : 'LANGUAGES'}</span
					>
				</div>
				<div class="tuning-controls-chirho">
					<button
						class="dial-arrow-chirho"
						disabled={!playerChirho}
						aria-label="Previous station"
						onclick={() => turnDialChirho(-1)}>←</button
					>
					<div class="dial-track-chirho">
						<div class="dial-ticks-chirho" aria-hidden="true"></div>
						<input
							class="dial-chirho"
							disabled={!playerChirho}
							type="range"
							min="0"
							max={dialStationsChirho.length - 1}
							step="1"
							value={stationIndexChirho}
							aria-label="Station dial"
							aria-valuetext={`${stationChirho.language_english_chirho}, ${stationChirho.version_chirho}, ${stationChirho.voice_chirho}`}
							oninput={(eventChirho) =>
								chooseStationChirho(
									dialStationsChirho[Number(eventChirho.currentTarget.value)].id_chirho
								)}
						/>
					</div>
					<button
						class="dial-arrow-chirho"
						disabled={!playerChirho}
						aria-label="Next station"
						onclick={() => turnDialChirho(1)}>→</button
					>
				</div>
			</div>
			<div class="playback-chirho">
				<button
					class="chapter-arrow-chirho"
					disabled={!playerChirho}
					aria-label="Previous chapter"
					onclick={() => playerChirho?.previousChirho()}>‹</button
				><button
					class="play-chirho"
					disabled={!playerChirho}
					onclick={() => playerChirho?.toggleChirho()}
					aria-label={isActiveChirho ? 'Pause Scripture' : 'Play Scripture'}
					><span
						class="play-symbol-chirho"
						class:pause-symbol-chirho={isActiveChirho}
						aria-hidden="true"
					></span>{isActiveChirho
						? 'Pause'
						: stateChirho.phase_chirho === 'ready'
							? 'Turn it on'
							: stateChirho.phase_chirho === 'error'
								? 'Try again'
								: 'Listen'}</button
				><button
					class="chapter-arrow-chirho"
					disabled={!playerChirho}
					aria-label="Next chapter"
					onclick={() => playerChirho?.nextChirho()}>›</button
				>
			</div>
			<div class="seek-row-chirho">
				<span>{timeLabelChirho(seekPreviewChirho ?? stateChirho.seconds_chirho)}</span><input
					class="seek-chirho"
					type="range"
					min="0"
					max={Math.max(1, stateChirho.duration_chirho)}
					step="1"
					value={seekPreviewChirho ?? stateChirho.seconds_chirho}
					disabled={stateChirho.duration_chirho <= 0 ||
						stateChirho.phase_chirho === 'ready' ||
						stateChirho.phase_chirho === 'error'}
					aria-label="Chapter position"
					aria-valuetext={`${timeLabelChirho(seekPreviewChirho ?? stateChirho.seconds_chirho)} of ${timeLabelChirho(stateChirho.duration_chirho)}`}
					oninput={(eventChirho) => (seekPreviewChirho = Number(eventChirho.currentTarget.value))}
					onblur={() => (seekPreviewChirho = null)}
					onpointercancel={() => (seekPreviewChirho = null)}
					onchange={(eventChirho) => {
						playerChirho?.seekChirho(Number(eventChirho.currentTarget.value));
						seekPreviewChirho = null;
					}}
				/><span>{timeLabelChirho(stateChirho.duration_chirho)}</span>
			</div>
			<div class="radio-bottom-chirho">
				<button
					class="browse-button-chirho"
					bind:this={browseButtonChirho}
					disabled={!libraryChirho}
					aria-expanded={stationPickerOpenChirho}
					aria-controls="stations-chirho"
					onclick={() => (stationPickerOpenChirho = !stationPickerOpenChirho)}
					>Browse stations <span aria-hidden="true">{stationPickerOpenChirho ? '−' : '+'}</span
					></button
				><label class="sound-control-chirho"
					><input
						type="checkbox"
						disabled={!playerChirho}
						checked={stateChirho.sounds_enabled_chirho}
						onchange={(eventChirho) =>
							playerChirho?.setSoundsChirho(eventChirho.currentTarget.checked)}
					/><span class="switch-chirho" aria-hidden="true"></span>Radio sounds</label
				>
			</div>
		</section>
		<div class="status-message-chirho" role="status" aria-live="polite">
			{stateChirho.message_chirho ||
				(stateChirho.phase_chirho === 'ready'
					? 'One tap to hear Scripture. Your place stays on this device.'
					: stateChirho.phase_chirho === 'loading'
						? 'Finding your signal…'
						: '')}
		</div>
		{#if restoringChirho}<p class="restore-note-chirho" role="status">
				Restoring your station… <button class="text-button-chirho" onclick={chooseBuiltinsChirho}
					>Use built-in stations</button
				>
			</p>{/if}
		{#if restoreFailedChirho}<div class="restore-note-chirho" role="status">
				<p>Your saved station could not load. Your place is kept.</p>
				<button class="text-button-chirho" onclick={retryRestoreChirho}>Retry saved station</button>
				·
				<button class="text-button-chirho" onclick={chooseBuiltinsChirho}
					>Use built-in stations</button
				>
			</div>{/if}
		<section class="passage-controls-chirho" aria-label="Choose a passage">
			<label
				>BOOK<select
					aria-label="Book"
					disabled={!playerChirho}
					value={stateChirho.book_id_chirho}
					onchange={(eventChirho) => chooseBookChirho(eventChirho.currentTarget.value)}
					>{#each availableBooksChirho as availableBookChirho (availableBookChirho.id_chirho)}<option
							value={availableBookChirho.id_chirho}>{availableBookChirho.name_chirho}</option
						>{/each}</select
				></label
			><label
				>CHAPTER<select
					aria-label="Chapter"
					disabled={!playerChirho}
					value={stateChirho.chapter_chirho}
					onchange={(eventChirho) =>
						playerChirho?.selectChapterChirho(
							stateChirho.book_id_chirho,
							Number(eventChirho.currentTarget.value)
						)}
					>{#each availableChaptersChirho as chapterChirho (chapterChirho)}<option
							value={chapterChirho}>{chapterChirho}</option
						>{/each}</select
				></label
			>
			<div class="continues-chirho">
				<span aria-hidden="true">↻</span>Chapters keep playing.<br />Your place is remembered.
			</div>
		</section>
		{#if stationPickerOpenChirho && libraryChirho}
			<LanguagePickerChirho
				library_chirho={libraryChirho}
				stations_chirho={dialStationsChirho}
				station_id_chirho={stateChirho.station_id_chirho}
				language_code_chirho={dialLanguageChirho}
				loading_chirho={languageLoadingChirho}
				message_chirho={languageMessageChirho}
				on_language_chirho={chooseLanguageChirho}
				on_station_chirho={chooseStationChirho}
				on_builtins_chirho={chooseBuiltinsChirho}
				on_close_chirho={() => {
					stationPickerOpenChirho = false;
					browseButtonChirho?.focus();
				}}
			/>
		{/if}
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
					: 'verified chapters in this station.'}
			</p>
		</div>
		{#if !stateChirho.storage_available_chirho}<p class="storage-message-chirho" role="status">
				Listening works, but this browser cannot save your place.
			</p>{/if}
		{#if stateChirho.first_sound_ms_chirho !== null}<details class="timing-chirho">
				<summary>Playback timing</summary>
				<p>
					Playback start: {stateChirho.first_sound_ms_chirho} ms{#if stateChirho.switch_ms_chirho !== null}
						· Latest station change: {stateChirho.switch_ms_chirho} ms{/if}. Measured to the
					browser’s playing event; network and device vary.
				</p>
			</details>{/if}
	</main>
	<footer class="footer-chirho">
		<span
			>A free ministry of <a href="https://loveJesus.software" target="_blank" rel="noreferrer"
				>{SITE_MAKER_CHIRHO}</a
			>
			· <a href={resolvePathChirho('/credits-chirho')}>Recording credits</a></span
		><span>{SITE_DOMAIN_CHIRHO}</span>
	</footer>
</div>
