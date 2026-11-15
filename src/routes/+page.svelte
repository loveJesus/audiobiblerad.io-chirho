<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

<script lang="ts">
	import RadioExperienceChirho from '$lib/radio-chirho/RadioExperienceChirho.svelte';
	import { SITE_NAME_CHIRHO, SITE_SUMMARY_CHIRHO } from '$lib/site-chirho/site_config_chirho';
</script>

<svelte:head>
	<title>{SITE_NAME_CHIRHO}</title>
	<meta name="description" content={SITE_SUMMARY_CHIRHO} />
	<meta name="referrer" content="no-referrer" />
	<meta name="theme-color" content="#eeece3" />
</svelte:head>

<RadioExperienceChirho />
