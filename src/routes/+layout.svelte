<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

<script lang="ts">
	import './layout.css';
	import faviconChirho from '$lib/assets/favicon.svg';

	let { children: childrenChirho } = $props();
</script>

<svelte:head><link rel="icon" href={faviconChirho} /></svelte:head>
{@render childrenChirho()}
