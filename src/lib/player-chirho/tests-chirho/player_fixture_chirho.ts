// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { vi } from 'vitest';
import type { StationChirho } from '$lib/catalogue-chirho/catalogue_chirho';
import { RadioPlayerChirho } from '../radio_player_chirho';
import { PREFERENCES_KEY_CHIRHO } from '../player_preferences_chirho';

class FakeAudioChirho extends EventTarget {
	src = '';
	currentSrc = '';
	preload = 'none';
	currentTime = 0;
	duration = NaN;
	readyState = 0;
	paused = true;
	ended = false;
	error: { code: number } | null = null;
	play = vi.fn((): Promise<void> => {
		this.paused = false;
		return Promise.resolve();
	});
	pause = vi.fn((): void => {
		this.paused = true;
	});
	load = vi.fn((): void => {
		this.currentSrc = this.src;
		this.currentTime = 0;
		this.duration = NaN;
		this.readyState = 0;
		this.error = null;
		this.ended = false;
	});
	removeAttribute(nameChirho: string): void {
		if (nameChirho === 'src') this.src = '';
	}
	metadataChirho(durationChirho = 100): void {
		this.duration = durationChirho;
		this.readyState = 4;
		this.dispatchEvent(new Event('loadedmetadata'));
	}
	playingChirho(): void {
		this.paused = false;
		this.dispatchEvent(new Event('playing'));
	}
	positionChirho(secondsChirho: number): void {
		this.currentTime = secondsChirho;
		this.dispatchEvent(new Event('timeupdate'));
	}
	finishChirho(): void {
		this.ended = true;
		this.paused = true;
		this.dispatchEvent(new Event('pause'));
		this.dispatchEvent(new Event('ended'));
	}
	failedChirho(codeChirho = 4): void {
		this.error = { code: codeChirho };
		this.dispatchEvent(new Event('error'));
	}
}

const playersChirho: RadioPlayerChirho[] = [];
export function setupChirho(
	rawChirho: string | null = null,
	brokenStorageChirho = false,
	timedChirho = false,
	stationsChirho?: readonly StationChirho[]
) {
	const audioChirho = new FakeAudioChirho();
	const soundsChirho = {
		startChirho: vi.fn(),
		stopChirho: vi.fn(),
		setEnabledChirho: vi.fn(),
		disposeChirho: vi.fn()
	};
	const savedChirho = new Map<string, string>(
		rawChirho ? [[PREFERENCES_KEY_CHIRHO, rawChirho]] : []
	);
	const storageChirho = {
		getItem(keyChirho: string) {
			if (brokenStorageChirho) throw new Error('Storage denied');
			return savedChirho.get(keyChirho) ?? null;
		},
		setItem(keyChirho: string, valueChirho: string) {
			if (brokenStorageChirho) throw new Error('Storage denied');
			savedChirho.set(keyChirho, valueChirho);
		}
	};
	let nowChirho = 0;
	const fetchChirho = vi.fn<typeof fetch>(
		async () =>
			new Response(timedChirho ? JSON.stringify({ verses: [10, 20, 40, 80] }) : '{}', {
				status: timedChirho ? 200 : 404
			})
	);
	const playerChirho = new RadioPlayerChirho({
		audio_chirho: audioChirho as unknown as HTMLAudioElement,
		sounds_chirho: soundsChirho,
		storage_chirho: storageChirho,
		on_change_chirho: vi.fn(),
		now_chirho: () => nowChirho,
		fetch_chirho: fetchChirho,
		stations_chirho: stationsChirho
	});
	playersChirho.push(playerChirho);
	return {
		player_chirho: playerChirho,
		audio_chirho: audioChirho,
		sounds_chirho: soundsChirho,
		saved_chirho: savedChirho,
		fetch_chirho: fetchChirho,
		clock_chirho(valueChirho: number) {
			nowChirho = valueChirho;
		}
	};
}

export function disposePlayersChirho(): void {
	for (const playerChirho of playersChirho.splice(0)) playerChirho.disposeChirho();
	vi.useRealTimers();
}
