<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve as resolvePathChirho } from '$app/paths';
	import { RADIO_THEMES_CHIRHO, type RadioThemeIdChirho } from '$lib/themes-chirho/themes_chirho';
	import {
		LanguageLibraryChirho,
		mergeLanguagesChirho
	} from '$lib/language-chirho/language_library_chirho';
	import {
		widgetMarkupChirho,
		widgetUrlChirho,
		WIDGET_HEIGHT_CHIRHO
	} from '$lib/widget-chirho/widget_options_chirho';
	import {
		AGENT_GUIDE_URL_CHIRHO,
		AGENT_INSTRUCTIONS_CHIRHO
	} from '$lib/widget-chirho/widget_instructions_chirho';
	let themeChirho = $state<RadioThemeIdChirho>('minimal');
	let languageChirho = $state('');
	let autoplayChirho = $state(false);
	let languagesChirho = $state(mergeLanguagesChirho([]));
	let copyMessageChirho = $state('');
	let readyChirho = $state(false);
	let languageMessageChirho = $state('');
	let codeChirho = $state<HTMLTextAreaElement>();
	const optionsChirho = $derived({
		theme_chirho: themeChirho,
		language_chirho: languageChirho || undefined,
		autoplay_chirho: autoplayChirho
	});
	const urlChirho = $derived(widgetUrlChirho(optionsChirho));
	const markupChirho = $derived(widgetMarkupChirho(optionsChirho));
	const previewUrlChirho = $derived.by(() => {
		const previewChirho = new URL(urlChirho);
		previewChirho.searchParams.set('preview_chirho', '1');
		return previewChirho.pathname + previewChirho.search;
	});
	onMount(() => {
		readyChirho = true;
		const libraryChirho = new LanguageLibraryChirho();
		void libraryChirho
			.loadListChirho()
			.then((entriesChirho) => {
				languagesChirho = entriesChirho;
			})
			.catch(() => {
				languageMessageChirho =
					'More languages could not load. The bundled choices are still available.';
			});
		return () => libraryChirho.disposeChirho();
	});
	async function copyChirho(valueChirho: string): Promise<void> {
		try {
			await navigator.clipboard.writeText(valueChirho);
			copyMessageChirho = 'Copied.';
		} catch {
			codeChirho?.focus();
			codeChirho?.select();
			copyMessageChirho = 'Select and copy the iframe code below.';
		}
	}
</script>

<svelte:head
	><title>Embed Audio Bible Radio</title><meta
		name="description"
		content="Add a free Audio Bible Radio widget to your website. Copy an iframe or give the integration guide to your AI agent."
	/><meta name="referrer" content="no-referrer" /></svelte:head
>
<div class="widget-setup-chirho">
	<header>
		<a href={resolvePathChirho('/')}>← Audio Bible Radio</a><span>SHARE THE WORD</span>
	</header>
	<main>
		<p class="eyebrow-chirho">A RADIO FOR YOUR WEBSITE</p>
		<h1>Let the Word<br />fill your corner.</h1>
		<p class="intro-chirho">
			Choose a radio, copy one line of HTML, and give your visitors a place to listen.
		</p>
		<section class="agent-card-chirho" aria-labelledby="agent-title-chirho">
			<div>
				<h2 id="agent-title-chirho">Working with an AI agent?</h2>
				<p>
					Give it this public guide. It includes the exact embed code, options, permissions, source
					terms and checks.
				</p>
			</div>
			<a class="agent-link-chirho" href={resolvePathChirho('/llms.txt')}
				>{AGENT_GUIDE_URL_CHIRHO} ↗</a
			>
			<button
				class="secondary-chirho"
				disabled={!readyChirho}
				onclick={() => void copyChirho(AGENT_GUIDE_URL_CHIRHO)}>Copy agent guide URL</button
			>
		</section>
		<div class="builder-chirho">
			<section class="configuration-chirho" aria-labelledby="configure-title-chirho">
				<h2 id="configure-title-chirho">Make it yours</h2>
				<label
					>Radio model<select
						disabled={!readyChirho}
						value={themeChirho}
						onchange={(eventChirho) => {
							themeChirho = eventChirho.currentTarget.value as RadioThemeIdChirho;
							copyMessageChirho = '';
						}}
						>{#each RADIO_THEMES_CHIRHO as entryChirho (entryChirho.id_chirho)}<option
								value={entryChirho.id_chirho}>{entryChirho.name_chirho}</option
							>{/each}</select
					></label
				>
				<label
					>Starting language<select
						aria-label="Starting language"
						aria-describedby="widget-language-help-chirho"
						disabled={!readyChirho}
						value={languageChirho}
						onchange={(eventChirho) => {
							languageChirho = eventChirho.currentTarget.value;
							copyMessageChirho = '';
						}}
						><option value="">Visitor's browser language</option
						>{#each languagesChirho as entryChirho (entryChirho.code_chirho)}<option
								value={entryChirho.code_chirho}
								>{entryChirho.name_chirho}{entryChirho.name_chirho !== entryChirho.english_chirho
									? ` · ${entryChirho.english_chirho}`
									: ''}</option
							>{/each}</select
					><small id="widget-language-help-chirho"
						>Visitors can still choose another language, version or narration.</small
					></label
				>
				{#if languageMessageChirho}<p role="status">{languageMessageChirho}</p>{/if}
				<label class="checkbox-chirho"
					><input type="checkbox" disabled={!readyChirho} bind:checked={autoplayChirho} /><span
						>Request automatic playback<small>Some browsers still require a tap on On.</small></span
					></label
				>
				<label>Widget URL<input aria-label="Widget URL" readonly value={urlChirho} /></label>
				<button
					class="primary-chirho"
					disabled={!readyChirho}
					onclick={() => void copyChirho(markupChirho)}>Copy iframe code</button
				>
				<label
					>HTML to paste<textarea
						bind:this={codeChirho}
						aria-label="Iframe code"
						readonly
						value={markupChirho}
						rows="13"
						spellcheck="false"></textarea></label
				>
				<p class="copy-message-chirho" role="status">{copyMessageChirho}</p>
			</section>
			<section class="preview-chirho" aria-labelledby="preview-title-chirho">
				<div class="preview-title-chirho">
					<h2 id="preview-title-chirho">Your radio</h2>
					<a href={urlChirho} target="_blank" rel="external noreferrer">Open on its own ↗</a>
				</div>
				{#key previewUrlChirho}<iframe
						title="Audio Bible Radio widget preview"
						src={previewUrlChirho}
						width="100%"
						height={WIDGET_HEIGHT_CHIRHO}
						allow="autoplay"
						loading="lazy"
						referrerpolicy="no-referrer"
					></iframe>{/key}
			</section>
		</div>
		<section class="setup-notes-chirho">
			<h2>Put it on your page</h2>
			<ol>
				<li>
					Paste the iframe into an HTML/embed component. In WordPress, use a Custom HTML block.
				</li>
				<li>
					Give it at least 320 pixels of width. Keep scrolling available, or add height when a
					recording has a longer copyright notice.
				</li>
				<li>
					Publish your page, press On and check that audio plays. Keep the recording credits and
					source links unobscured.
				</li>
			</ol>
			<h3>Outside websites are welcome</h3>
			<p>
				The widget allows outside framing. No account, key or domain-unlock request is needed. If
				your own site has a Content Security Policy, its <code>frame-src</code> must allow
				<code>https://audiobiblerad.io</code>. The agent guide explains this without replacing the
				rest of your policy.
			</p>
			<h3>Free listening, with each source's terms</h3>
			<p>
				Keep access to the audio free. Recording licences are separate from the player software.
				Davar recordings are for non-commercial use only. Keep the player's copyright notices
				visible, and do not download, copy or re-host the recordings. Review each source's licence
				before using the widget in a commercial context.
			</p>
			<details>
				<summary>Full integration instructions for an AI agent</summary>
				<pre>{AGENT_INSTRUCTIONS_CHIRHO}</pre>
			</details>
		</section>
	</main>
</div>

<style>
	.widget-setup-chirho {
		max-width: 1080px;
		margin: auto;
		padding: 0 clamp(20px, 5vw, 60px) 50px;
	}
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 20px;
		padding: 24px 0;
		border-bottom: 1px solid #bac1b4;
		font-size: 11px;
	}
	header span,
	.eyebrow-chirho {
		font-size: 10px;
		letter-spacing: 0.16em;
		font-weight: 700;
	}
	a {
		color: #364c2d;
		text-underline-offset: 4px;
	}
	h1 {
		font:
			clamp(38px, 6vw, 66px)/1.05 Georgia,
			serif;
		letter-spacing: -0.04em;
		margin: 12px 0 22px;
	}
	h2 {
		font-size: 20px;
		font-weight: 700;
		margin: 0 0 10px;
	}
	h3 {
		font-size: 16px;
		font-weight: 700;
		margin: 28px 0 8px;
	}
	p {
		font-size: 14px;
		line-height: 1.7;
		margin: 0 0 16px;
	}
	.eyebrow-chirho {
		margin: 40px 0 15px;
	}
	.intro-chirho {
		font-size: 17px;
		max-width: 510px;
		margin-bottom: 32px;
	}
	.agent-card-chirho {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		gap: 10px 22px;
		background: #dce2d2;
		border: 1px solid #b9c5a8;
		border-radius: 12px;
		padding: 22px;
		margin-bottom: 36px;
	}
	.agent-card-chirho > div {
		grid-column: 1/-1;
	}
	.agent-card-chirho h2 {
		font-size: 17px;
	}
	.agent-card-chirho p {
		margin: 0;
	}
	.agent-link-chirho {
		font: 12px/1.6 monospace;
		overflow-wrap: anywhere;
	}
	.builder-chirho {
		display: grid;
		grid-template-columns: minmax(230px, 1fr) minmax(320px, 1.25fr);
		gap: 32px;
		align-items: start;
	}
	label {
		display: block;
		font-size: 12px;
		font-weight: 650;
		margin: 18px 0;
	}
	select,
	input[readonly],
	textarea {
		display: block;
		width: 100%;
		margin-top: 8px;
		border: 1px solid #9ea88f;
		border-radius: 6px;
		background-color: #fafaf3;
		color: #29332a;
		padding: 10px 12px;
		font:
			13px/1.5 system-ui,
			sans-serif;
	}
	select {
		padding-right: 28px;
	}
	textarea {
		font: 11px/1.6 monospace;
		resize: vertical;
	}
	small {
		display: block;
		font-size: 11px;
		font-weight: 400;
		line-height: 1.5;
		margin-top: 6px;
		color: #56634d;
	}
	.checkbox-chirho {
		display: flex;
		gap: 10px;
		align-items: flex-start;
		line-height: 1.5;
	}
	.checkbox-chirho input {
		margin-top: 3px;
		accent-color: #3a512d;
	}
	button {
		padding: 10px 14px;
		border: 1px solid #344e2b;
		border-radius: 6px;
		font-size: 12px;
	}
	.primary-chirho {
		color: #fff;
		background: #344e2b;
		width: 100%;
	}
	.secondary-chirho {
		color: #344e2b;
		background: transparent;
	}
	.copy-message-chirho {
		min-height: 24px;
		font-size: 12px;
	}
	.preview-title-chirho {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		align-items: center;
		margin-bottom: 12px;
	}
	.preview-title-chirho a {
		font-size: 10px;
	}
	.preview-title-chirho h2 {
		margin: 0;
	}
	iframe {
		border: 0;
		border-radius: 16px;
		background: #eeece3;
	}
	.setup-notes-chirho {
		margin-top: 30px;
		border-top: 1px solid #bac1b4;
		padding-top: 30px;
	}
	ol {
		padding-left: 20px;
		margin: 16px 0;
		font-size: 14px;
		line-height: 1.8;
	}
	code {
		font-size: 12px;
		background: #dce2d2;
		padding: 2px 4px;
		border-radius: 3px;
		overflow-wrap: anywhere;
	}
	details {
		margin-top: 28px;
		border: 1px solid #bac1b4;
		border-radius: 8px;
		padding: 18px;
	}
	summary {
		cursor: pointer;
		font-size: 13px;
		font-weight: 650;
	}
	pre {
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		font: 12px/1.7 monospace;
		margin: 20px 0 0;
	}
	@media (max-width: 760px) {
		.builder-chirho {
			grid-template-columns: minmax(0, 1fr);
		}
		.agent-card-chirho {
			grid-template-columns: minmax(0, 1fr);
		}
		.agent-card-chirho > div {
			grid-column: auto;
		}
		.secondary-chirho {
			justify-self: start;
		}
	}
</style>
