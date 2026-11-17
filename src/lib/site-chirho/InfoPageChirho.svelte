<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

<script lang="ts">
	import type { Snippet as SnippetChirho } from 'svelte';
	import { resolve as resolvePathChirho } from '$app/paths';
	import faviconChirho from '$lib/assets/favicon.svg';
	import { SITE_NAME_CHIRHO } from './site_config_chirho';

	let {
		title_chirho: titleChirho,
		description_chirho: descriptionChirho,
		children: childrenChirho
	}: { title_chirho: string; description_chirho: string; children: SnippetChirho } = $props();
</script>

<svelte:head>
	<title>{titleChirho} · {SITE_NAME_CHIRHO}</title>
	<meta name="description" content={descriptionChirho} />
	<meta name="referrer" content="no-referrer" />
</svelte:head>

<div class="information-page-chirho page-chirho">
	<header>
		<a class="brand-chirho" href={resolvePathChirho('/')}>
			<img src={faviconChirho} width="40" height="40" alt="" />
			<span>{SITE_NAME_CHIRHO}</span>
		</a>
		<nav aria-label="Site">
			<a href={resolvePathChirho('/')}>Radio</a>
			<a href={resolvePathChirho('/support-chirho')}>Help</a>
			<a href={resolvePathChirho('/privacy-chirho')}>Privacy</a>
		</nav>
	</header>
	<main>
		<p class="eyebrow-chirho">A Love Jesus Software ministry</p>
		<h1>{titleChirho}</h1>
		<div class="content-chirho">{@render childrenChirho()}</div>
	</main>
	<footer><a href={resolvePathChirho('/credits-chirho')}>Recording credits and licences</a></footer>
</div>

<style>
	.information-page-chirho {
		max-width: 1040px;
	}
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 24px;
		padding: 28px 0;
		border-bottom: 1px solid #c8c9ba;
	}
	.brand-chirho {
		display: flex;
		align-items: center;
		gap: 12px;
		color: #292e2b;
		font-weight: 750;
		text-decoration: none;
	}
	nav {
		display: flex;
		gap: 20px;
		font-size: 14px;
	}
	main {
		max-width: 720px;
		padding: clamp(36px, 7vw, 76px) 0 48px;
	}
	.eyebrow-chirho {
		color: #596249;
		font-size: 12px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		font-weight: 700;
	}
	h1 {
		margin: 14px 0 28px;
		font-size: clamp(36px, 6vw, 56px);
		letter-spacing: -0.04em;
		line-height: 1.1;
	}
	.content-chirho {
		font-size: 17px;
		line-height: 1.75;
	}
	.content-chirho :global(h2) {
		margin: 32px 0 8px;
		font-size: 23px;
		line-height: 1.3;
		letter-spacing: -0.02em;
	}
	.content-chirho :global(p),
	.content-chirho :global(ul) {
		margin: 12px 0;
	}
	.content-chirho :global(li) {
		margin: 8px 0;
	}
	.content-chirho :global(a),
	a {
		color: #425b32;
		text-underline-offset: 4px;
	}
	footer {
		padding: 24px 0 40px;
		border-top: 1px solid #c8c9ba;
		font-size: 14px;
	}
	@media (max-width: 540px) {
		header {
			align-items: flex-start;
			flex-direction: column;
			gap: 18px;
		}
		.content-chirho {
			font-size: 16px;
		}
	}
</style>
