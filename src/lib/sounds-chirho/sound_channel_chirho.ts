// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// One audio element that plays one short clip at a time.
// See spec-chirho/workflows-chirho/radio_sounds_workflow_chirho.md.
//
// Every play carries a number. A timer or refused play that belongs to an older sound finds a
// newer number and does nothing, and an ended event is believed only while the element itself
// says it has ended. So nothing late can cut short, or keep alive, the sound that replaced it.
//
// The element is believed over its events in the other direction too. A browser pauses the
// element at the end of a recording and delivers the ended event in a later task, so a key
// press can arrive in between. A clip counts as sounding only while its element is playing it.

import type { SoundClipChirho } from './sound_profile_chirho';

/** The parts of an audio element a channel uses, so a test can stand in for one. */
export interface SoundElementChirho {
	src: string;
	currentTime: number;
	loop: boolean;
	volume: number;
	readonly paused: boolean;
	readonly ended: boolean;
	play(): Promise<void>;
	pause(): void;
	load(): void;
	removeAttribute(nameChirho: string): void;
	addEventListener(typeChirho: 'ended', listenerChirho: () => void): void;
	removeEventListener(typeChirho: 'ended', listenerChirho: () => void): void;
}

export interface SoundChannelOptionsChirho {
	/** The longest any one sound may last, loaded or not. */
	ceiling_ms_chirho: number;
	/** Keep the last clip loaded after it ends, so playing it again starts at once. */
	keep_loaded_chirho: boolean;
}

export interface SoundChannelChirho {
	/** The clip sounding now, or null once its element has paused, even before ended arrives. */
	readonly current_chirho: SoundClipChirho | null;
	/** Plays a clip once, from its start, replacing whatever this channel was playing. */
	playChirho(clipChirho: SoundClipChirho): void;
	/** Silences the channel and lets go of its recording. */
	stopChirho(): void;
	/** Silences the channel for good. */
	disposeChirho(): void;
}

export function createSoundChannelChirho(
	elementChirho: SoundElementChirho,
	optionsChirho: SoundChannelOptionsChirho
): SoundChannelChirho {
	elementChirho.loop = false;
	// Quiet gain is encoded in the PCM; per-element software volume is unavailable on iOS.
	elementChirho.volume = 1;
	let tokenChirho = 0;
	let timerChirho: ReturnType<typeof setTimeout> | undefined;
	let currentChirho: SoundClipChirho | null = null;
	let loadedUrlChirho = '';
	let disposedChirho = false;

	const settleChirho = (): void => {
		clearTimeout(timerChirho);
		timerChirho = undefined;
		currentChirho = null;
	};
	const releaseChirho = (): void => {
		tokenChirho += 1;
		settleChirho();
		elementChirho.pause();
		if (!loadedUrlChirho) return;
		elementChirho.removeAttribute('src');
		elementChirho.load();
		loadedUrlChirho = '';
	};
	const endedChirho = (): void => {
		// An ended event queued just before a restart arrives after it; the element knows better.
		if (!currentChirho || !elementChirho.ended) return;
		if (optionsChirho.keep_loaded_chirho) settleChirho();
		else releaseChirho();
	};
	elementChirho.addEventListener('ended', endedChirho);

	return {
		get current_chirho() {
			return elementChirho.paused ? null : currentChirho;
		},
		playChirho(clipChirho) {
			if (disposedChirho) return;
			tokenChirho += 1;
			const mineChirho = tokenChirho;
			clearTimeout(timerChirho);
			const startChirho = clipChirho.start_seconds_chirho ?? 0;
			if (optionsChirho.keep_loaded_chirho && loadedUrlChirho === clipChirho.url_chirho) {
				elementChirho.currentTime = startChirho;
			} else {
				// A media fragment starts the first play at the clip's own offset.
				elementChirho.src =
					startChirho > 0 ? `${clipChirho.url_chirho}#t=${startChirho}` : clipChirho.url_chirho;
				loadedUrlChirho = clipChirho.url_chirho;
			}
			currentChirho = clipChirho;
			timerChirho = setTimeout(() => {
				if (mineChirho === tokenChirho) releaseChirho();
			}, optionsChirho.ceiling_ms_chirho);
			elementChirho.play().catch(() => {
				// Optional effects must never block Scripture. A refused sound frees the channel.
				if (mineChirho === tokenChirho) settleChirho();
			});
		},
		stopChirho: releaseChirho,
		disposeChirho() {
			releaseChirho();
			disposedChirho = true;
			elementChirho.removeEventListener('ended', endedChirho);
		}
	};
}
