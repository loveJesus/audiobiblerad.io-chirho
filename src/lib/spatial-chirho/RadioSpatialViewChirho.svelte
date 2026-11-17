<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

<script lang="ts">
	import { onMount, untrack, type Snippet } from 'svelte';
	import type { RadioThemeIdChirho } from '$lib/themes-chirho/themes_chirho';
	import type { RadioSceneChirho } from './scene_chirho';
	import './spatial_chirho.css';

	let {
		children,
		theme_id_chirho: themeIdChirho,
		on_change_chirho: onChangeChirho
	}: {
		children: Snippet;
		theme_id_chirho: RadioThemeIdChirho;
		on_change_chirho(stateChirho: {
			active_chirho: boolean;
			wanted_chirho: boolean;
			busy_chirho: boolean;
			message_chirho: string;
		}): void;
	} = $props();
	let hostChirho = $state<HTMLDivElement>();
	let faceChirho = $state<HTMLDivElement>();
	let activeChirho = $state(false);
	let busyChirho = $state(false);
	let messageChirho = $state('');
	let assessmentChirho = $state('simple');
	let sceneChirho: RadioSceneChirho | undefined;
	let requestChirho = 0;
	let disposedChirho = false;
	let pointerDownChirho = false;
	let sceneReadyChirho = false;
	let timeoutChirho: ReturnType<typeof setTimeout> | undefined;

	function stopChirho(): void {
		++requestChirho;
		clearTimeout(timeoutChirho);
		sceneChirho?.disposeChirho();
		sceneChirho = undefined;
		activeChirho = false;
		busyChirho = false;
		sceneReadyChirho = false;
	}
	function activateReadyChirho(): void {
		if (!sceneReadyChirho || !sceneChirho || disposedChirho || pointerDownChirho) return;
		activeChirho = true;
		busyChirho = false;
		sceneChirho.activateChirho(true);
	}
	function failChirho(): void {
		stopChirho();
		assessmentChirho = 'unavailable';
		messageChirho = '3D is unavailable here. The radio is in simple view.';
	}
	// Explicit activation only: see workflows-chirho/experience-chirho/spatial_radio_workflow_chirho.md.
	async function beginChirho(): Promise<void> {
		if (!hostChirho || !faceChirho || disposedChirho) return;
		stopChirho();
		const tokenChirho = ++requestChirho;
		busyChirho = true;
		assessmentChirho = 'loading';
		messageChirho = '';
		timeoutChirho = setTimeout(() => {
			if (tokenChirho === requestChirho) failChirho();
		}, 10000);
		try {
			const moduleChirho = await import('./scene_chirho');
			if (disposedChirho || tokenChirho !== requestChirho) return;
			sceneChirho = moduleChirho.createRadioSceneChirho({
				host_chirho: hostChirho,
				face_chirho: faceChirho,
				theme_chirho: themeIdChirho,
				on_failure_chirho: () => {
					if (tokenChirho === requestChirho) failChirho();
				},
				on_ready_chirho: () => {
					if (disposedChirho || tokenChirho !== requestChirho) return;
					clearTimeout(timeoutChirho);
					sceneReadyChirho = true;
					assessmentChirho = 'manual';
					activateReadyChirho();
				}
			});
			clearTimeout(timeoutChirho);
			timeoutChirho = setTimeout(() => {
				if (tokenChirho === requestChirho) failChirho();
			}, 5000);
		} catch {
			if (tokenChirho === requestChirho) failChirho();
		}
	}
	export function toggleChirho(): void {
		messageChirho = '';
		if (activeChirho || busyChirho) {
			stopChirho();
			assessmentChirho = 'simple';
		} else void beginChirho();
	}
	onMount(() => {
		const downChirho = (): void => {
			pointerDownChirho = true;
		};
		const upChirho = (): void => {
			pointerDownChirho = false;
			activateReadyChirho();
		};
		hostChirho?.addEventListener('pointerdown', downChirho, true);
		window.addEventListener('pointerup', upChirho);
		window.addEventListener('pointercancel', upChirho);
		return () => {
			disposedChirho = true;
			hostChirho?.removeEventListener('pointerdown', downChirho, true);
			window.removeEventListener('pointerup', upChirho);
			window.removeEventListener('pointercancel', upChirho);
			stopChirho();
		};
	});
	$effect(() => {
		const nextChirho = {
			active_chirho: activeChirho,
			wanted_chirho: activeChirho || busyChirho,
			busy_chirho: busyChirho,
			message_chirho: messageChirho
		};
		untrack(() => onChangeChirho(nextChirho));
	});
	$effect(() => {
		const nextChirho = themeIdChirho;
		sceneChirho?.themeChirho(nextChirho);
	});
</script>

<div
	class="spatial-view-chirho"
	data-spatial-active-chirho={activeChirho}
	data-spatial-loading-chirho={busyChirho}
	data-view-assessment-chirho={assessmentChirho}
>
	<div class="spatial-stage-chirho" bind:this={hostChirho}>
		<div class="spatial-face-chirho" bind:this={faceChirho}>{@render children()}</div>
	</div>
	{#if activeChirho}<div class="camera-controls-chirho">
			<span>Drag to look around · returns gently</span>
			<button onclick={() => sceneChirho?.frontChirho()}>Front view</button>
			<button onclick={() => sceneChirho?.sceneViewChirho()}>Scene view</button>
			<button aria-label="Move camera closer" onclick={() => sceneChirho?.zoomChirho(1)}>+</button>
			<button aria-label="Move camera farther" onclick={() => sceneChirho?.zoomChirho(-1)}>−</button
			>
			<button onclick={toggleChirho}>Simple view</button>
		</div>{/if}
</div>
