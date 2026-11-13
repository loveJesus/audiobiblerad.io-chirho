<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

<script lang="ts">
	import {
		SITE_MAKER_CHIRHO,
		SITE_NAME_CHIRHO,
		SITE_SUMMARY_CHIRHO
	} from '$lib/site-chirho/site_config_chirho';
</script>

<svelte:head>
	<title>{SITE_NAME_CHIRHO}</title>
	<meta name="description" content={SITE_SUMMARY_CHIRHO} />
</svelte:head>

<main class="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-4 p-6">
	<h1 class="text-4xl font-bold">{SITE_NAME_CHIRHO}</h1>
	<p class="text-lg">{SITE_SUMMARY_CHIRHO}</p>
	<p class="text-sm">A {SITE_MAKER_CHIRHO} project.</p>
</main>
