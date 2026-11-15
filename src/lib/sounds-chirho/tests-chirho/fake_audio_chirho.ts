// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import type { SoundElementChirho } from '../sound_channel_chirho';

/**
 * A stand-in audio element that keeps the state a real one keeps: source, position, paused, ended
 * and error. Changing the source or pausing abandons a play the browser has not yet allowed, as a
 * real element does, and loading a source clears its error. The test decides when a sound ends
 * and whether the browser lets it play.
 */
export class FakeAudioChirho implements SoundElementChirho {
	currentTime = 0;
	loop = true;
	volume = 0.4;
	paused = true;
	ended = false;
	error: { code: number } | null = null;
	/**
	 * What the browser does with the next play(): allow it, refuse it by policy, find the recording
	 * broken, or keep it waiting.
	 */
	next_play_chirho: 'allow' | 'refuse' | 'broken' | 'hold' = 'allow';
	readonly plays_chirho: { src_chirho: string; time_chirho: number }[] = [];
	readonly #listenersChirho = new Set<() => void>();
	#srcChirho = '';
	#pendingChirho: ((errorChirho: Error) => void) | null = null;

	get src(): string {
		return this.#srcChirho;
	}
	set src(valueChirho: string) {
		this.#abandonChirho();
		this.#srcChirho = valueChirho;
		this.currentTime = 0;
		this.paused = true;
		this.ended = false;
		this.error = null;
	}
	play(): Promise<void> {
		this.plays_chirho.push({ src_chirho: this.#srcChirho, time_chirho: this.currentTime });
		const modeChirho = this.next_play_chirho;
		this.next_play_chirho = 'allow';
		const brokenChirho = () =>
			Promise.reject(new DOMException('The recording cannot be played', 'NotSupportedError'));
		// A source that has failed stays failed until it is loaded again.
		if (this.error) return brokenChirho();
		if (modeChirho === 'refuse')
			return Promise.reject(new DOMException('Playback needs a gesture', 'NotAllowedError'));
		this.paused = false;
		this.ended = false;
		if (modeChirho === 'broken') {
			// As in Chromium and WebKit: the element reports the error, stays unpaused and refuses.
			this.error = { code: 4 };
			return brokenChirho();
		}
		if (modeChirho === 'allow') return Promise.resolve();
		return new Promise<void>((_resolveChirho, rejectChirho) => {
			this.#pendingChirho = rejectChirho;
		});
	}
	pause(): void {
		this.paused = true;
		this.#abandonChirho();
	}
	load(): void {
		this.#abandonChirho();
		this.currentTime = 0;
		this.paused = true;
		this.ended = false;
		this.error = null;
	}
	removeAttribute(nameChirho: string): void {
		if (nameChirho === 'src') this.#srcChirho = '';
	}
	addEventListener(_typeChirho: 'ended', listenerChirho: () => void): void {
		this.#listenersChirho.add(listenerChirho);
	}
	removeEventListener(_typeChirho: 'ended', listenerChirho: () => void): void {
		this.#listenersChirho.delete(listenerChirho);
	}
	get listener_count_chirho(): number {
		return this.#listenersChirho.size;
	}
	/**
	 * The recording reaches its end, and the ended event is still on its way: a key press can
	 * arrive in between. In the runs measured, Chromium marked the element ended and paused
	 * together; WebKit marked it ended first and paused it with the event, tens of milliseconds on.
	 */
	reachEndChirho(orderChirho: 'together' | 'ended_first' = 'together'): void {
		this.ended = true;
		if (orderChirho === 'together') this.paused = true;
	}
	/** The recording reaches its end, and the element says so. */
	finishChirho(): void {
		this.reachEndChirho();
		this.#announceEndedChirho();
	}
	/** An ended event queued before a restart, delivered after it. */
	deliverStaleEndedChirho(): void {
		this.#announceEndedChirho();
	}
	#announceEndedChirho(): void {
		for (const listenerChirho of [...this.#listenersChirho]) listenerChirho();
	}
	#abandonChirho(): void {
		const rejectChirho = this.#pendingChirho;
		this.#pendingChirho = null;
		rejectChirho?.(new DOMException('The play() request was interrupted', 'AbortError'));
	}
}

/** Lets promise callbacks that are already due run. */
export async function settleChirho(): Promise<void> {
	for (let roundChirho = 0; roundChirho < 4; roundChirho += 1) await Promise.resolve();
}
