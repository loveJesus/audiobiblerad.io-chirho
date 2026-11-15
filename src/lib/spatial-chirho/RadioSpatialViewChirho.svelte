<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

<script lang="ts">
	import { onMount, untrack, type Snippet } from 'svelte';
	import type { RadioThemeIdChirho } from '$lib/themes-chirho/themes_chirho';
	import type { PreferenceStorageChirho } from '$lib/player-chirho/player_preferences_chirho';
	import { widgetStorageChirho } from '$lib/widget-chirho/widget_options_chirho';
	import {
		readViewPreferenceChirho,
		rememberViewPreferenceChirho,
		type ViewPreferenceChirho
	} from './capability-chirho/view_preferences_chirho';
	import {
		readViewHintsChirho,
		mayTryAutomatic3DChirho,
		judgeRenderSamplesChirho
	} from './capability-chirho/view_capability_chirho';
	import type { RadioSceneChirho } from './scene_chirho';
	import './spatial_chirho.css';
	let {
		children,
		theme_id_chirho: themeIdChirho,
		widget_chirho: widgetChirho = false,
		preview_chirho: previewChirho = false,
		audio_ready_chirho: audioReadyChirho = false,
		on_change_chirho: onChangeChirho
	}: {
		children: Snippet;
		theme_id_chirho: RadioThemeIdChirho;
		widget_chirho?: boolean;
		preview_chirho?: boolean;
		audio_ready_chirho?: boolean;
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
	let assessmentChirho = $state('waiting');
	let preferenceChirho = $state<ViewPreferenceChirho>('auto');
	let sceneChirho: RadioSceneChirho | undefined;
	let storageChirho: PreferenceStorageChirho | null = null;
	let requestChirho = 0;
	let disposedChirho = false;
	let pointerDownChirho = false;
	let sceneReadyChirho = false;
	let manualRequestChirho = false;
	let mountedChirho = $state(false);
	let triedAutomaticChirho = false;
	let automaticTimerChirho: ReturnType<typeof setTimeout> | undefined;
	let timeoutChirho: ReturnType<typeof setTimeout> | undefined;
	let introductionChirho: ReturnType<typeof setTimeout> | undefined;
	function visibleChirho(): boolean {
		const boundsChirho = hostChirho?.getBoundingClientRect();
		return (
			!!boundsChirho &&
			!document.hidden &&
			boundsChirho.bottom > 0 &&
			boundsChirho.top < innerHeight
		);
	}
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
		if (!sceneReadyChirho || !sceneChirho || disposedChirho) return;
		const focusedChirho = document.activeElement;
		if (
			pointerDownChirho ||
			(!manualRequestChirho &&
				focusedChirho instanceof Element &&
				faceChirho?.contains(focusedChirho) &&
				focusedChirho.matches('input[type="range"],select,[role="slider"]'))
		)
			return;
		activeChirho = true;
		busyChirho = false;
		sceneChirho.activateChirho(true);
	}
	function failChirho(manualChirho: boolean, reasonChirho = 'unavailable'): void {
		stopChirho();
		assessmentChirho = reasonChirho;
		messageChirho = manualChirho ? '3D is unavailable here. The radio is in simple view.' : '';
	}
	async function beginChirho(manualChirho: boolean): Promise<void> {
		if (!hostChirho || !faceChirho || disposedChirho) return;
		stopChirho();
		const tokenChirho = ++requestChirho;
		if (!manualChirho) triedAutomaticChirho = true;
		busyChirho = true;
		assessmentChirho = 'loading';
		manualRequestChirho = manualChirho;
		messageChirho = '';
		timeoutChirho = setTimeout(() => {
			if (tokenChirho === requestChirho) failChirho(manualChirho);
		}, 10000);
		try {
			const moduleChirho = await import('./scene_chirho');
			if (disposedChirho || tokenChirho !== requestChirho) return;
			sceneChirho = moduleChirho.createRadioSceneChirho({
				host_chirho: hostChirho,
				face_chirho: faceChirho,
				theme_chirho: themeIdChirho,
				manual_chirho: manualChirho,
				on_failure_chirho: () => {
					if (tokenChirho === requestChirho) failChirho(manualChirho);
				},
				on_ready_chirho: (samplesChirho) => {
					if (disposedChirho || tokenChirho !== requestChirho) return;
					clearTimeout(timeoutChirho);
					if (!manualChirho && !judgeRenderSamplesChirho(samplesChirho).smooth_chirho) {
						failChirho(false, 'slow');
						return;
					}
					sceneReadyChirho = true;
					assessmentChirho = manualChirho ? 'manual' : 'smooth';
					activateReadyChirho();
				}
			});
			clearTimeout(timeoutChirho);
			timeoutChirho = setTimeout(() => {
				if (tokenChirho === requestChirho)
					failChirho(
						manualChirho,
						!visibleChirho() ? 'interrupted' : manualChirho ? 'unavailable' : 'slow'
					);
			}, 5000);
		} catch {
			if (tokenChirho === requestChirho) failChirho(manualChirho);
		}
	}
	export function toggleChirho(): void {
		clearTimeout(introductionChirho);
		clearTimeout(automaticTimerChirho);
		const nextChirho = activeChirho || busyChirho ? 'simple' : 'three';
		preferenceChirho = nextChirho;
		rememberViewPreferenceChirho(storageChirho, nextChirho);
		messageChirho = '';
		if (nextChirho === 'simple') {
			stopChirho();
			assessmentChirho = 'simple';
		} else void beginChirho(true);
	}
	function scheduleAutomaticChirho(): void {
		clearTimeout(automaticTimerChirho);
		if (
			!mountedChirho ||
			preferenceChirho !== 'auto' ||
			!audioReadyChirho ||
			triedAutomaticChirho ||
			busyChirho ||
			activeChirho
		)
			return;
		if (
			!mayTryAutomatic3DChirho(readViewHintsChirho()) ||
			(widgetChirho && ((hostChirho?.clientWidth ?? 0) < 500 || window.innerHeight < 820))
		) {
			assessmentChirho = 'skipped';
			return;
		}
		automaticTimerChirho = setTimeout(() => {
			const focusChirho = document.activeElement;
			if (
				pointerDownChirho ||
				(focusChirho instanceof Element &&
					faceChirho?.contains(focusChirho) &&
					focusChirho.matches('input[type="range"],select,[role="slider"]'))
			)
				return;
			if (
				visibleChirho() &&
				audioReadyChirho &&
				!triedAutomaticChirho &&
				preferenceChirho === 'auto' &&
				mayTryAutomatic3DChirho(readViewHintsChirho())
			)
				void beginChirho(false);
		}, 1800);
	}
	onMount(() => {
		try {
			if (!previewChirho) {
				storageChirho = window.localStorage;
				if (widgetChirho) storageChirho = widgetStorageChirho(storageChirho);
			}
		} catch {
			/* Optional preferences. */
		}
		preferenceChirho = readViewPreferenceChirho(storageChirho);
		mountedChirho = true;
		if (preferenceChirho === 'simple') assessmentChirho = 'simple';
		introductionChirho = setTimeout(() => {
			if (preferenceChirho === 'three') void beginChirho(true);
			else scheduleAutomaticChirho();
		}, 900);
		const motionChirho = window.matchMedia('(prefers-reduced-motion: reduce)');
		const motionChangedChirho = (): void => {
			if (preferenceChirho === 'auto' && motionChirho.matches) {
				clearTimeout(automaticTimerChirho);
				stopChirho();
				assessmentChirho = 'skipped';
			}
		};
		motionChirho.addEventListener('change', motionChangedChirho);
		const downChirho = (): void => {
			pointerDownChirho = true;
			clearTimeout(automaticTimerChirho);
		};
		const upChirho = (): void => {
			pointerDownChirho = false;
			activateReadyChirho();
			scheduleAutomaticChirho();
		};
		const blurChirho = (): void => {
			queueMicrotask(activateReadyChirho);
			scheduleAutomaticChirho();
		};
		hostChirho?.addEventListener('pointerdown', downChirho, true);
		window.addEventListener('pointerup', upChirho);
		window.addEventListener('pointercancel', upChirho);
		faceChirho?.addEventListener('focusout', blurChirho);
		return () => {
			disposedChirho = true;
			mountedChirho = false;
			clearTimeout(automaticTimerChirho);
			clearTimeout(introductionChirho);
			motionChirho.removeEventListener('change', motionChangedChirho);
			hostChirho?.removeEventListener('pointerdown', downChirho, true);
			window.removeEventListener('pointerup', upChirho);
			window.removeEventListener('pointercancel', upChirho);
			faceChirho?.removeEventListener('focusout', blurChirho);
			stopChirho();
		};
	});
	$effect(() => {
		const readyChirho = audioReadyChirho;
		if (mountedChirho && readyChirho) untrack(scheduleAutomaticChirho);
	});
	$effect(() => {
		const nextChirho = {
			active_chirho: activeChirho,
			wanted_chirho: activeChirho || (busyChirho && preferenceChirho === 'three'),
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
	bind:this={hostChirho}
>
	<div class="spatial-face-chirho" bind:this={faceChirho}>{@render children()}</div>
	{#if activeChirho}<div class="camera-controls-chirho">
			<span>Drag sideways to look around</span>
			<button onclick={() => sceneChirho?.frontChirho()}>Front view</button>
			<button onclick={toggleChirho}>Simple view</button>
		</div>{/if}
</div>
