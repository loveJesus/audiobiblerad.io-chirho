<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

<script lang="ts">
	import { onMount, tick, untrack, type Snippet } from 'svelte';
	import type { RadioThemeIdChirho } from '$lib/themes-chirho/themes_chirho';
	import type { RadioSessionChirho } from '$lib/radio-chirho/radio_session_chirho';
	import type { RadioSessionViewChirho } from '$lib/radio-chirho/radio_types_chirho';
	import type { RadioSceneChirho } from './scene_chirho';
	import type { ListeningRoomSceneChirho } from './listening-room-chirho/scene-chirho/room_scene_chirho';
	import './spatial_chirho.css';

	let {
		children,
		theme_id_chirho: themeIdChirho,
		on_change_chirho: onChangeChirho,
		session_chirho: sessionChirho,
		view_chirho: viewChirho,
		widget_chirho: widgetChirho = false
	}: {
		children: Snippet;
		theme_id_chirho: RadioThemeIdChirho;
		session_chirho?: RadioSessionChirho;
		view_chirho?: RadioSessionViewChirho;
		widget_chirho?: boolean;
		on_change_chirho(stateChirho: {
			active_chirho: boolean;
			wanted_chirho: boolean;
			busy_chirho: boolean;
			message_chirho: string;
			scene_kind_chirho: 'room' | 'original';
		}): void;
	} = $props();
	const VIEW_KEY_CHIRHO = 'audio-bible-radio-view-chirho';
	const SCENE_KEY_CHIRHO = 'audio-bible-radio-scene-chirho';
	let hostChirho = $state<HTMLDivElement>();
	let faceChirho = $state<HTMLDivElement>();
	let returnButtonChirho = $state<HTMLButtonElement>();
	let activeChirho = $state(false);
	let busyChirho = $state(false);
	let messageChirho = $state('');
	let assessmentChirho = $state('simple');
	let kindChirho = $state<'room' | 'original'>('room');
	let motionChirho = $state(true);
	let mountedChirho = $state(false);
	let preferenceChirho = $state('auto');
	let sceneChirho: RadioSceneChirho | undefined;
	let roomChirho = $state<ListeningRoomSceneChirho>();
	let controllerChirho: AbortController | undefined;
	let requestChirho = 0;
	let disposedChirho = false;
	let pointerDownChirho = false;
	let sceneReadyChirho = false;
	let pendingAutomaticChirho = false;
	let automaticTriedChirho = false;
	let automaticScheduledChirho = false;
	let automaticDeferredChirho = false;
	let timeoutChirho: ReturnType<typeof setTimeout> | undefined;
	let automaticTimerChirho: ReturnType<typeof setTimeout> | undefined;
	const selectedKindChirho = $derived(widgetChirho ? 'original' : kindChirho);

	function rememberChirho(keyChirho: string, valueChirho: string): void {
		if (widgetChirho) return;
		try {
			localStorage.setItem(keyChirho, valueChirho);
		} catch {
			/* Optional view preference. */
		}
	}
	function stopChirho(): void {
		++requestChirho;
		clearTimeout(timeoutChirho);
		controllerChirho?.abort();
		controllerChirho = undefined;
		sceneChirho?.disposeChirho();
		sceneChirho = undefined;
		roomChirho?.disposeChirho();
		roomChirho = undefined;
		activeChirho = false;
		busyChirho = false;
		sceneReadyChirho = false;
	}
	function activateReadyChirho(): void {
		if (!sceneReadyChirho || disposedChirho || pointerDownChirho || activeChirho || document.hidden)
			return;
		if (!sceneChirho && !roomChirho) return;
		const focusedFaceChirho = faceChirho?.contains(document.activeElement);
		if (pendingAutomaticChirho && focusedFaceChirho) return;
		roomChirho?.controls_chirho.updateChirho(viewChirho!);
		activeChirho = true;
		busyChirho = false;
		sceneChirho?.activateChirho(true);
		roomChirho?.activateChirho(true);
		if (
			roomChirho &&
			!pendingAutomaticChirho &&
			(focusedFaceChirho || document.activeElement === document.body)
		)
			void tick().then(() => {
				if (activeChirho && !disposedChirho) returnButtonChirho?.focus();
			});
	}
	function focusSimpleChirho(): void {
		void tick().then(() => {
			if (!activeChirho && !disposedChirho)
				faceChirho?.querySelector<HTMLInputElement>('[aria-label="3D radio view"]')?.focus();
		});
	}
	function failChirho(automaticChirho: boolean): void {
		const focusedRoomChirho =
			activeChirho && hostChirho?.parentElement?.contains(document.activeElement);
		stopChirho();
		assessmentChirho = 'unavailable';
		messageChirho = automaticChirho ? '' : '3D is unavailable here. Your 2D radio keeps playing.';
		if (focusedRoomChirho) focusSimpleChirho();
	}
	// Both renderers are views of the same session: see the spatial-radio workflow.
	async function beginChirho(automaticChirho = false): Promise<void> {
		if (!hostChirho || !faceChirho || disposedChirho || !viewChirho?.ready_chirho || !sessionChirho)
			return;
		stopChirho();
		pendingAutomaticChirho = automaticChirho;
		const tokenChirho = ++requestChirho;
		const abortChirho = new AbortController();
		controllerChirho = abortChirho;
		busyChirho = true;
		assessmentChirho = 'loading';
		messageChirho = '';
		timeoutChirho = setTimeout(() => {
			if (tokenChirho === requestChirho) failChirho(automaticChirho);
		}, 20000);
		const readyChirho = () => {
			if (disposedChirho || tokenChirho !== requestChirho) return;
			clearTimeout(timeoutChirho);
			sceneReadyChirho = true;
			assessmentChirho = automaticChirho ? 'automatic' : 'manual';
			activateReadyChirho();
		};
		const failureChirho = () => {
			if (tokenChirho === requestChirho) failChirho(automaticChirho);
		};
		try {
			if (selectedKindChirho === 'room') {
				const moduleChirho = await import('./listening-room-chirho/scene-chirho/room_scene_chirho');
				if (disposedChirho || tokenChirho !== requestChirho) return;
				const createdChirho = await moduleChirho.createListeningRoomChirho({
					host_chirho: hostChirho,
					session_chirho: sessionChirho,
					view_chirho: viewChirho,
					automatic_chirho: automaticChirho,
					motion_chirho: motionChirho,
					signal_chirho: abortChirho.signal,
					on_ready_chirho: readyChirho,
					on_failure_chirho: failureChirho,
					on_motion_chirho: (enabledChirho) => {
						motionChirho = enabledChirho;
					}
				});
				if (disposedChirho || tokenChirho !== requestChirho) {
					createdChirho.disposeChirho();
					return;
				}
				roomChirho = createdChirho;
				roomChirho.controls_chirho.updateChirho(viewChirho);
				// Fetch is bounded above. Hidden/off-screen render warm-up waits for visibility.
				clearTimeout(timeoutChirho);
			} else {
				const moduleChirho = await import('./scene_chirho');
				if (disposedChirho || tokenChirho !== requestChirho) return;
				sceneChirho = moduleChirho.createRadioSceneChirho({
					host_chirho: hostChirho,
					face_chirho: faceChirho,
					theme_chirho: themeIdChirho,
					on_failure_chirho: failureChirho,
					on_ready_chirho: readyChirho
				});
				clearTimeout(timeoutChirho);
				timeoutChirho = setTimeout(() => {
					if (tokenChirho === requestChirho) failChirho(automaticChirho);
				}, 5000);
			}
		} catch {
			if (tokenChirho === requestChirho) failChirho(automaticChirho);
		}
	}
	export function toggleChirho(): void {
		automaticTriedChirho = true;
		automaticDeferredChirho = false;
		clearTimeout(automaticTimerChirho);
		messageChirho = '';
		if (activeChirho || busyChirho) {
			preferenceChirho = 'two';
			rememberChirho(VIEW_KEY_CHIRHO, 'two');
			stopChirho();
			assessmentChirho = 'simple';
			focusSimpleChirho();
		} else {
			preferenceChirho = 'three';
			rememberChirho(VIEW_KEY_CHIRHO, 'three');
			void beginChirho();
		}
	}
	function clickToggleChirho(): void {
		sessionChirho?.feedbackChirho('click');
		toggleChirho();
	}
	function chooseKindChirho(eventChirho: Event): void {
		const nextChirho = (eventChirho.currentTarget as HTMLSelectElement).value;
		if (nextChirho !== 'room' && nextChirho !== 'original') return;
		kindChirho = nextChirho;
		rememberChirho(SCENE_KEY_CHIRHO, nextChirho);
		sessionChirho?.feedbackChirho('click');
		void beginChirho();
	}
	function capableChirho(): boolean {
		const hintsChirho = navigator as Navigator & {
			deviceMemory?: number;
			connection?: { saveData?: boolean; effectiveType?: string };
		};
		const shortChirho = Math.min(screen.width, screen.height);
		return (
			typeof WebGL2RenderingContext !== 'undefined' &&
			!matchMedia('(prefers-reduced-motion: reduce)').matches &&
			!hintsChirho.connection?.saveData &&
			!['slow-2g', '2g', '3g'].includes(hintsChirho.connection?.effectiveType ?? '') &&
			!(navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 2) &&
			!(hintsChirho.deviceMemory && hintsChirho.deviceMemory <= 2) &&
			!(shortChirho > 0 && shortChirho < 300)
		);
	}
	function tryAutomaticChirho(): void {
		if (
			disposedChirho ||
			automaticTriedChirho ||
			preferenceChirho === 'two' ||
			!viewChirho?.ready_chirho
		)
			return;
		if (document.hidden || pointerDownChirho || faceChirho?.contains(document.activeElement)) {
			automaticDeferredChirho = true;
			return;
		}
		automaticDeferredChirho = false;
		automaticTriedChirho = true;
		void beginChirho(true);
	}
	onMount(() => {
		if (!widgetChirho) {
			try {
				const storedChirho = localStorage.getItem(VIEW_KEY_CHIRHO);
				preferenceChirho =
					storedChirho === 'two' || storedChirho === 'three' ? storedChirho : 'auto';
				if (localStorage.getItem(SCENE_KEY_CHIRHO) === 'original') kindChirho = 'original';
			} catch {
				/* The radio does not depend on device memory. */
			}
		}
		motionChirho = !matchMedia('(prefers-reduced-motion: reduce)').matches;
		mountedChirho = true;
		const downChirho = () => {
			pointerDownChirho = true;
		};
		const upChirho = () => {
			pointerDownChirho = false;
			activateReadyChirho();
			if (automaticDeferredChirho) tryAutomaticChirho();
		};
		const availableChirho = () => {
			activateReadyChirho();
			if (automaticDeferredChirho) requestAnimationFrame(tryAutomaticChirho);
		};
		window.addEventListener('pointerdown', downChirho, true);
		hostChirho?.addEventListener('focusout', availableChirho);
		window.addEventListener('pointerup', upChirho);
		window.addEventListener('pointercancel', upChirho);
		window.addEventListener('blur', upChirho);
		document.addEventListener('visibilitychange', availableChirho);
		return () => {
			disposedChirho = true;
			clearTimeout(automaticTimerChirho);
			window.removeEventListener('pointerdown', downChirho, true);
			hostChirho?.removeEventListener('focusout', availableChirho);
			window.removeEventListener('pointerup', upChirho);
			window.removeEventListener('pointercancel', upChirho);
			window.removeEventListener('blur', upChirho);
			document.removeEventListener('visibilitychange', availableChirho);
			stopChirho();
		};
	});
	$effect(() => {
		const readyChirho = viewChirho?.ready_chirho && sessionChirho;
		if (
			mountedChirho &&
			!widgetChirho &&
			readyChirho &&
			preferenceChirho !== 'two' &&
			!automaticScheduledChirho &&
			!automaticTriedChirho
		) {
			untrack(() => {
				automaticScheduledChirho = true;
				if (capableChirho()) automaticTimerChirho = setTimeout(tryAutomaticChirho, 1800);
			});
		}
	});
	$effect(() => {
		const nextChirho = {
			active_chirho: activeChirho,
			wanted_chirho: activeChirho || busyChirho,
			busy_chirho: busyChirho,
			message_chirho: messageChirho,
			scene_kind_chirho: selectedKindChirho
		};
		untrack(() => onChangeChirho(nextChirho));
	});
	$effect(() => {
		sceneChirho?.themeChirho(themeIdChirho);
	});
	$effect(() => {
		if (roomChirho && viewChirho) roomChirho.controls_chirho.updateChirho(viewChirho);
	});
	$effect(() => {
		roomChirho?.motionChirho(motionChirho);
	});
</script>

<div
	class="spatial-view-chirho"
	data-spatial-active-chirho={activeChirho}
	data-spatial-loading-chirho={busyChirho}
	data-view-assessment-chirho={assessmentChirho}
	data-scene-kind-chirho={selectedKindChirho}
>
	<div class="spatial-stage-chirho" bind:this={hostChirho}>
		<div
			class="spatial-face-chirho"
			bind:this={faceChirho}
			inert={activeChirho && selectedKindChirho === 'room'}
		>
			{@render children()}
		</div>
	</div>
	{#if activeChirho}
		<div class="camera-controls-chirho">
			{#if selectedKindChirho === 'room'}<h1 class="room-title-chirho">Audio Bible Radio</h1>{/if}
			<button
				bind:this={returnButtonChirho}
				class="view-switch-chirho"
				aria-label="Switch to 2D radio"
				onclick={clickToggleChirho}>PRESS HERE · 2D</button
			>
			{#if !widgetChirho}<label
					>3D scene <select value={kindChirho} onchange={chooseKindChirho}>
						<option value="room">1980s listening room</option><option value="original"
							>Original radio</option
						>
					</select></label
				>{/if}
			{#if selectedKindChirho === 'room'}
				<label><input type="checkbox" bind:checked={motionChirho} /> Animate rain and lava</label>
			{:else}
				<span>Drag to look around · returns gently</span>
				<button onclick={() => sceneChirho?.frontChirho()}>Front view</button>
				<button onclick={() => sceneChirho?.sceneViewChirho()}>Scene view</button>
				<button aria-label="Move camera closer" onclick={() => sceneChirho?.zoomChirho(1)}>+</button
				>
				<button aria-label="Move camera farther" onclick={() => sceneChirho?.zoomChirho(-1)}
					>−</button
				>
			{/if}
		</div>
	{/if}
</div>
