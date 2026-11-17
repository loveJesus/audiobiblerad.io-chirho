<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

<script lang="ts">
	import { resolve as resolvePathChirho } from '$app/paths';
	import { STATIONS_CHIRHO } from '$lib/catalogue-chirho/catalogue_chirho';
	import { SITE_NAME_CHIRHO } from '$lib/site-chirho/site_config_chirho';
</script>

<svelte:head
	><title>Recording credits · {SITE_NAME_CHIRHO}</title><meta
		name="referrer"
		content="no-referrer"
	/></svelte:head
>
<div class="page-chirho">
	<main class="credits-page-chirho">
		<a href={resolvePathChirho('/')}>← Back to the radio</a>
		<h1>Recording credits</h1>
		<p>
			With thanks to the readers, translators and ministries who make these recordings freely
			available. Audio streams from each source’s own host.
		</p>
		{#each STATIONS_CHIRHO as stationChirho (stationChirho.id_chirho)}
			<section>
				<h2>
					<span lang={stationChirho.language_code_chirho}>{stationChirho.language_name_chirho}</span
					>
					· {stationChirho.version_chirho}
				</h2>
				<p>
					{stationChirho.voice_chirho || 'Reader not named'} · {stationChirho.voice_kind_chirho ===
					'human'
						? 'Human narration'
						: stationChirho.voice_kind_chirho === 'synthetic'
							? 'Synthetic voice'
							: 'Voice type unconfirmed'}
				</p>
				<p>{stationChirho.credit_chirho}</p>
				<p>
					<a href={stationChirho.source_url_chirho} rel="external noreferrer"
						>{stationChirho.source_name_chirho}</a
					>
					·
					<a href={stationChirho.licence_url_chirho} rel="external noreferrer"
						>{stationChirho.licence_name_chirho}</a
					>
				</p>
				<p>
					{stationChirho.chapter_count_chirho} verified chapters. Availability varies by recording.
				</p>
			</section>
		{/each}
		<section>
			<h2>More languages</h2>
			<p>
				Choose a language and recording on the radio to read its full credit and terms. The selected
				recording's text and audio notices appear below the player.
			</p>
		</section>
		<section>
			<h2>Radio sounds</h2>
			<p>
				The public source includes original synthesized effects under CC0. Release builds may use
				separately licensed tuning and control effects. Turn them off with the Radio sounds switch.
			</p>
		</section>
	</main>
</div>

<style>
	.credits-page-chirho {
		padding: 40px 0 60px;
		font-size: 14px;
		line-height: 1.7;
	}
	h1 {
		margin-top: 25px;
		font-size: 37px;
	}
	h2 {
		font-size: 18px;
		font-weight: 650;
		margin: 0 0 10px;
	}
	p {
		margin: 8px 0;
	}
	section {
		padding: 24px 0;
		border-bottom: 1px solid #bdc3b4;
	}
	a {
		color: #466036;
		text-underline-offset: 3px;
	}
</style>
