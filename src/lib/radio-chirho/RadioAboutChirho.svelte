<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

<script lang="ts">
	import { resolve as resolvePathChirho } from '$app/paths';
	import { STATIONS_CHIRHO } from '$lib/catalogue-chirho/catalogue_chirho';
	import type { RadioSessionViewChirho } from './radio_types_chirho';
	let {
		open_chirho: openChirho,
		view_chirho: viewChirho,
		on_close_chirho: onCloseChirho
	}: {
		open_chirho: boolean;
		view_chirho: RadioSessionViewChirho;
		on_close_chirho(): void;
	} = $props();
	let dialogChirho = $state<HTMLDialogElement>();
	const stationChirho = $derived(
		viewChirho.stations_chirho.find(
			(entryChirho) => entryChirho.id_chirho === viewChirho.state_chirho.station_id_chirho
		) ?? STATIONS_CHIRHO[0]
	);
	$effect(() => {
		if (openChirho && dialogChirho && !dialogChirho.open) dialogChirho.showModal();
		else if (!openChirho && dialogChirho?.open) dialogChirho.close();
	});
</script>

<dialog bind:this={dialogChirho} aria-labelledby="about-title-chirho" onclose={onCloseChirho}>
	<div class="about-top-chirho">
		<span>№ 316 / THE WORD, WITH YOU</span><button
			aria-label="Close about"
			onclick={() => dialogChirho?.close()}>×</button
		>
	</div>
	<h2 id="about-title-chirho">Audio Bible Radio</h2>
	<p class="about-intro-chirho">Turn it on. Let the Word fill the room.</p>
	<p>
		A free ministry of <a href="https://loveJesus.software" target="_blank" rel="noreferrer"
			>Love Jesus Software</a
		>. Scripture streams directly from the ministries and volunteers who make these recordings
		available.
	</p>
	<h3>Make yourself at home</h3>
	<p>
		Turn the book and chapter knobs, or choose their labels. The FM dial moves through languages and
		recordings; the language, version and voice labels take you straight there. Switch radio models
		to change the view.
	</p>
	<p>
		Your place and choices stay on this device when storage is available. Off stops the sound and
		keeps your place. If your browser needs a tap, press On.
	</p>
	<h3>This recording</h3>
	<p>
		{stationChirho.version_chirho} · {stationChirho.language_english_chirho}<br
		/>{stationChirho.voice_chirho || 'Reader not named'} · {stationChirho.voice_kind_chirho ===
		'unknown'
			? 'Voice type unconfirmed'
			: stationChirho.voice_kind_chirho === 'human'
				? 'Human narration'
				: 'Synthetic voice'}
	</p>
	<p>{stationChirho.credit_chirho}</p>
	<p>
		<a href={stationChirho.source_url_chirho} target="_blank" rel="external noreferrer"
			>Recording source ↗</a
		>
		·
		<a href={stationChirho.licence_url_chirho} target="_blank" rel="external noreferrer"
			>{stationChirho.licence_name_chirho} ↗</a
		>
	</p>
	{#if viewChirho.state_chirho.first_sound_ms_chirho !== null}
		<details>
			<summary>Playback timing</summary>
			<p>
				Playback start: {viewChirho.state_chirho.first_sound_ms_chirho} ms{#if viewChirho.state_chirho.switch_ms_chirho !== null}
					· Latest station change: {viewChirho.state_chirho.switch_ms_chirho} ms{/if}. Measured to
				the browser’s playing event; network and device vary.
			</p>
		</details>
	{/if}
	<div class="about-links-chirho">
		<a href={resolvePathChirho('/credits-chirho')}>Recording credits</a><a
			href="https://github.com/loveJesus/audiobiblerad.io-chirho"
			target="_blank"
			rel="noreferrer">Source & licences ↗</a
		>
	</div>
	<p class="about-domain-chirho">audiobiblerad.io</p>
</dialog>

<style>
	dialog {
		width: min(540px, calc(100% - 32px));
		max-height: calc(100svh - 40px);
		padding: 28px;
		border: 1px solid color-mix(in srgb, var(--radio-page-ink-chirho, #292e2b) 25%, transparent);
		border-radius: 16px;
		color: var(--radio-page-ink-chirho, #292e2b);
		background: var(--radio-page-chirho, #eeece3);
		box-shadow: 0 25px 100px #0008;
		font-size: 14px;
		line-height: 1.7;
	}
	dialog::backdrop {
		background: #0009;
		backdrop-filter: blur(6px);
	}
	.about-top-chirho {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		font: 9px/1.4 monospace;
		letter-spacing: 0.12em;
	}
	button {
		width: 44px;
		height: 44px;
		border: 1px solid currentColor;
		border-radius: 50%;
		background: transparent;
		color: inherit;
		font-size: 24px;
		flex-shrink: 0;
	}
	h2 {
		font:
			32px/1.2 Georgia,
			serif;
		margin: 20px 0 8px;
	}
	h3 {
		font-weight: 700;
		font-size: 13px;
		margin: 24px 0 5px;
	}
	p {
		margin: 8px 0 14px;
	}
	.about-intro-chirho {
		font-size: 17px;
		margin-bottom: 24px;
	}
	a {
		color: inherit;
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	details {
		border-top: 1px solid currentColor;
		padding-top: 12px;
		margin: 20px 0;
		font-size: 12px;
	}
	summary {
		cursor: pointer;
	}
	.about-links-chirho {
		display: flex;
		gap: 20px;
		flex-wrap: wrap;
		margin-top: 24px;
		font-size: 12px;
	}
	.about-domain-chirho {
		font: 11px/1.5 monospace;
		margin: 22px 0 0;
	}
</style>
