<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

<script lang="ts">
	import { page as pageChirho } from '$app/state';
	import RadioExperienceChirho from '$lib/radio-chirho/RadioExperienceChirho.svelte';
	import { readWidgetOptionsChirho } from '$lib/widget-chirho/widget_options_chirho';
	import '$lib/widget-chirho/widget_chirho.css';
	const optionsChirho = $derived(readWidgetOptionsChirho(pageChirho.url.searchParams));
</script>

<svelte:head
	><title>Audio Bible Radio · Widget</title><meta name="robots" content="noindex" /><meta
		name="referrer"
		content="no-referrer"
	/></svelte:head
>
{#key pageChirho.url.search}
	<RadioExperienceChirho widget_chirho={true} widget_options_chirho={optionsChirho} />
{/key}
