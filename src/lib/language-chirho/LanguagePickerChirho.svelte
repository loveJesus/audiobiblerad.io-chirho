<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

<script lang="ts">
	import { onMount } from 'svelte';
	import type { LanguageEntryChirho, StationChirho } from '$lib/catalogue-chirho/catalogue_chirho';
	import { LanguageLibraryChirho, mergeLanguagesChirho } from './language_library_chirho';

	let {
		library_chirho: libraryChirho,
		stations_chirho: stationsChirho,
		station_id_chirho: stationIdChirho,
		language_code_chirho: languageCodeChirho,
		loading_chirho: loadingChirho,
		message_chirho: messageChirho,
		on_language_chirho: onLanguageChirho,
		on_station_chirho: onStationChirho,
		on_builtins_chirho: onBuiltinsChirho,
		on_close_chirho: onCloseChirho
	}: {
		library_chirho: LanguageLibraryChirho;
		stations_chirho: readonly StationChirho[];
		station_id_chirho: string;
		language_code_chirho?: string;
		loading_chirho: string;
		message_chirho: string;
		on_language_chirho(codeChirho: string): void;
		on_station_chirho(idChirho: string): void;
		on_builtins_chirho(): void;
		on_close_chirho(): void;
	} = $props();
	let languagesChirho = $state<readonly LanguageEntryChirho[]>(mergeLanguagesChirho([]));
	let searchChirho = $state('');
	let indexLoadingChirho = $state(false);
	let indexFailedChirho = $state(false);
	let mountedChirho = false;
	let searchInputChirho = $state<HTMLInputElement>();
	const selectedLanguageChirho = $derived(
		languagesChirho.find((entryChirho) => entryChirho.code_chirho === languageCodeChirho)
	);
	const resultsChirho = $derived(
		languagesChirho.filter((entryChirho) =>
			`${entryChirho.name_chirho} ${entryChirho.english_chirho} ${entryChirho.code_chirho}`
				.toLocaleLowerCase()
				.includes(searchChirho.trim().toLocaleLowerCase())
		)
	);
	const listedStationsChirho = $derived(
		languageCodeChirho
			? stationsChirho
			: stationsChirho.filter((stationChirho) =>
					`${stationChirho.language_name_chirho} ${stationChirho.language_english_chirho} ${stationChirho.version_chirho} ${stationChirho.voice_chirho}`
						.toLocaleLowerCase()
						.includes(searchChirho.trim().toLocaleLowerCase())
				)
	);

	async function loadIndexChirho(): Promise<void> {
		indexLoadingChirho = true;
		indexFailedChirho = false;
		try {
			const entriesChirho = await libraryChirho.loadListChirho();
			if (mountedChirho) languagesChirho = entriesChirho;
		} catch {
			if (mountedChirho) indexFailedChirho = true;
		} finally {
			if (mountedChirho) indexLoadingChirho = false;
		}
	}
	onMount(() => {
		mountedChirho = true;
		searchInputChirho?.focus();
		void loadIndexChirho();
		return () => {
			mountedChirho = false;
		};
	});
</script>

<section class="station-picker-chirho" id="stations-chirho" aria-label="All stations">
	<div class="picker-heading-chirho">
		<h2>Find your language</h2>
		<button class="text-button-chirho" onclick={onCloseChirho}>Back to radio ↑</button>
	</div>
	<p class="picker-note-chirho">
		{languagesChirho.length} languages. Search by name in English or your language.
	</p>
	<label class="search-label-chirho" for="language-search-chirho"
		>Search languages, versions or voices</label
	>
	<input
		id="language-search-chirho"
		class="station-search-chirho"
		type="search"
		placeholder="हिन्दी, Hindi, Swahili…"
		bind:value={searchChirho}
		bind:this={searchInputChirho}
	/>
	{#if indexLoadingChirho}<p class="picker-note-chirho" role="status">
			Finding more languages…
		</p>{/if}
	{#if indexFailedChirho}<div class="picker-note-chirho" role="status">
			More languages could not load. <button
				class="text-button-chirho"
				onclick={() => void loadIndexChirho()}>Retry languages</button
			>
		</div>{/if}
	<div class="language-list-chirho" role="group" aria-label="Languages">
		{#each resultsChirho as entryChirho (entryChirho.code_chirho)}
			<button
				class="language-option-chirho"
				class:selected-chirho={languageCodeChirho === entryChirho.code_chirho}
				aria-pressed={languageCodeChirho === entryChirho.code_chirho}
				onclick={() => onLanguageChirho(entryChirho.code_chirho)}
			>
				<span
					><span
						lang={entryChirho.name_chirho === entryChirho.english_chirho
							? 'en'
							: entryChirho.code_chirho}>{entryChirho.name_chirho}</span
					><small lang="en"
						>{entryChirho.name_chirho === entryChirho.english_chirho
							? entryChirho.code_chirho
							: entryChirho.english_chirho}</small
					></span
				>
				<span class="language-count-chirho"
					>{loadingChirho === entryChirho.code_chirho
						? 'Loading…'
						: `${entryChirho.station_count_chirho} ${entryChirho.station_count_chirho === 1 ? 'station' : 'stations'}`}<small
						>{entryChirho.has_whole_bible_chirho
							? 'Whole Bible available'
							: 'Selected books'}</small
					></span
				>
			</button>
		{:else}<p class="empty-chirho">No matching language. Try its English name.</p>{/each}
	</div>
	<div class="picker-heading-chirho stations-heading-chirho">
		<h3>
			{languageCodeChirho
				? `${selectedLanguageChirho?.english_chirho ?? 'Selected'} stations`
				: 'Built-in stations'}
		</h3>
		{#if languageCodeChirho}<button class="text-button-chirho" onclick={onBuiltinsChirho}
				>All built-in stations</button
			>{/if}
	</div>
	{#if loadingChirho || messageChirho}<p class="picker-note-chirho" role="status">
			{messageChirho || 'Loading stations. Your current recording keeps playing.'}
		</p>{/if}
	<div class="station-list-chirho" role="group" aria-label="Recordings">
		{#each listedStationsChirho as listedStationChirho (listedStationChirho.id_chirho)}
			<button
				class="station-option-chirho"
				class:selected-chirho={listedStationChirho.id_chirho === stationIdChirho}
				aria-pressed={listedStationChirho.id_chirho === stationIdChirho}
				onclick={() => onStationChirho(listedStationChirho.id_chirho)}
			>
				<span
					><span
						lang={listedStationChirho.language_name_chirho ===
						listedStationChirho.language_english_chirho
							? 'en'
							: listedStationChirho.language_code_chirho}
						>{listedStationChirho.language_name_chirho}</span
					><small lang="en"
						>{#if listedStationChirho.language_name_chirho !== listedStationChirho.language_english_chirho}{listedStationChirho.language_english_chirho}
							·
						{/if}{listedStationChirho.version_chirho}</small
					></span
				>
				<span
					>{listedStationChirho.version_code_chirho}<small
						>{listedStationChirho.voice_chirho || listedStationChirho.source_name_chirho}</small
					></span
				>
			</button>
		{:else}<p class="empty-chirho">No matching stations. Try another language or version.</p>{/each}
	</div>
</section>
