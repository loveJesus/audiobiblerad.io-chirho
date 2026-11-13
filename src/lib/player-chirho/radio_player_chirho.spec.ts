// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	STATIONS_CHIRHO,
	nextChapterChirho,
	resolveChapterChirho
} from '$lib/catalogue-chirho/catalogue_chirho';
import { RadioPlayerChirho } from './radio_player_chirho';
import { capturePositionChirho, mapPositionChirho } from './playback_position_chirho';
import { readBoundedTimingsChirho } from './verse_timings_chirho';
import { PREFERENCES_KEY_CHIRHO, readPreferencesChirho } from './player_preferences_chirho';

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
	failedChirho(codeChirho = 4): void {
		this.error = { code: codeChirho };
		this.dispatchEvent(new Event('error'));
	}
}

const playersChirho: RadioPlayerChirho[] = [];
function setupChirho(
	rawChirho: string | null = null,
	brokenStorageChirho = false,
	timedChirho = false
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
		fetch_chirho: fetchChirho
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

afterEach(() => {
	for (const playerChirho of playersChirho.splice(0)) playerChirho.disposeChirho();
	vi.useRealTimers();
});

describe('Scripture playback', () => {
	it.each([false, true])(
		'preserves the followed passage across a partial-station detour (started: %s)',
		(startedChirho) => {
			const fixtureChirho = setupChirho();
			fixtureChirho.player_chirho.selectChapterChirho('JHN', 3);
			if (startedChirho) {
				fixtureChirho.player_chirho.playChirho();
				fixtureChirho.audio_chirho.metadataChirho(100);
				fixtureChirho.audio_chirho.playingChirho();
				fixtureChirho.audio_chirho.positionChirho(40);
			}
			const partialChirho = STATIONS_CHIRHO.find(
				(stationChirho) => !resolveChapterChirho(stationChirho, 'JHN', 3)
			)!;
			fixtureChirho.player_chirho.selectStationChirho(partialChirho.id_chirho);
			if (startedChirho) {
				fixtureChirho.audio_chirho.metadataChirho(200);
				fixtureChirho.audio_chirho.playingChirho();
				fixtureChirho.audio_chirho.positionChirho(90);
				fixtureChirho.player_chirho.seekChirho(50);
			}
			fixtureChirho.player_chirho.selectStationChirho(STATIONS_CHIRHO[0].id_chirho);
			expect(fixtureChirho.player_chirho.snapshotChirho).toMatchObject({
				book_id_chirho: 'JHN',
				chapter_chirho: 3
			});
			if (startedChirho) {
				fixtureChirho.audio_chirho.metadataChirho(100);
				expect(fixtureChirho.audio_chirho.currentTime).toBe(40);
			}
		}
	);

	it('remembers the followed place across reopening while a partial station is selected', () => {
		const fixtureChirho = setupChirho();
		fixtureChirho.player_chirho.selectChapterChirho('JHN', 3);
		fixtureChirho.player_chirho.playChirho();
		fixtureChirho.audio_chirho.metadataChirho(100);
		fixtureChirho.audio_chirho.playingChirho();
		fixtureChirho.audio_chirho.positionChirho(40);
		const partialChirho = STATIONS_CHIRHO.find(
			(stationChirho) => !resolveChapterChirho(stationChirho, 'JHN', 3)
		)!;
		fixtureChirho.player_chirho.selectStationChirho(partialChirho.id_chirho);
		fixtureChirho.audio_chirho.metadataChirho(200);
		fixtureChirho.audio_chirho.playingChirho();
		fixtureChirho.audio_chirho.positionChirho(90);
		fixtureChirho.player_chirho.seekChirho(50);
		fixtureChirho.player_chirho.saveChirho();
		const reopenedChirho = setupChirho(fixtureChirho.saved_chirho.get(PREFERENCES_KEY_CHIRHO)!);
		reopenedChirho.player_chirho.selectStationChirho(STATIONS_CHIRHO[0].id_chirho);
		reopenedChirho.player_chirho.playChirho();
		reopenedChirho.audio_chirho.metadataChirho(100);
		expect(reopenedChirho.player_chirho.snapshotChirho).toMatchObject({
			book_id_chirho: 'JHN',
			chapter_chirho: 3
		});
		expect(reopenedChirho.audio_chirho.currentTime).toBe(40);
	});

	it('commits a recovered chapter only after it actually starts playing', () => {
		const fixtureChirho = setupChirho();
		fixtureChirho.player_chirho.selectChapterChirho('JHN', 3);
		fixtureChirho.player_chirho.playChirho();
		fixtureChirho.audio_chirho.metadataChirho();
		fixtureChirho.audio_chirho.playingChirho();
		fixtureChirho.audio_chirho.positionChirho(40);
		fixtureChirho.audio_chirho.failedChirho();
		expect(JSON.parse(fixtureChirho.saved_chirho.get(PREFERENCES_KEY_CHIRHO)!)).toMatchObject({
			chapter_chirho: 3,
			seconds_chirho: 40
		});
		fixtureChirho.audio_chirho.metadataChirho();
		fixtureChirho.audio_chirho.playingChirho();
		expect(JSON.parse(fixtureChirho.saved_chirho.get(PREFERENCES_KEY_CHIRHO)!)).toMatchObject({
			chapter_chirho: 4,
			followed_place_chirho: { chapter_chirho: 4 }
		});
	});

	it('does not replace a saved place when all load-time recovery attempts fail', () => {
		const fixtureChirho = setupChirho();
		fixtureChirho.player_chirho.selectChapterChirho('JHN', 3);
		fixtureChirho.player_chirho.playChirho();
		fixtureChirho.audio_chirho.metadataChirho(100);
		fixtureChirho.audio_chirho.playingChirho();
		fixtureChirho.audio_chirho.positionChirho(45);
		for (let retryChirho = 0; retryChirho < 2; retryChirho += 1) {
			if (retryChirho) fixtureChirho.player_chirho.playChirho();
			for (let failureChirho = 0; failureChirho < 4; failureChirho += 1)
				fixtureChirho.audio_chirho.failedChirho(4);
			expect(fixtureChirho.player_chirho.snapshotChirho).toMatchObject({
				phase_chirho: 'error',
				book_id_chirho: 'JHN',
				chapter_chirho: 3,
				seconds_chirho: 45
			});
			expect(JSON.parse(fixtureChirho.saved_chirho.get(PREFERENCES_KEY_CHIRHO)!)).toMatchObject({
				book_id_chirho: 'JHN',
				chapter_chirho: 3,
				seconds_chirho: 45
			});
		}
	});

	it('does not resume playback when a failed load arrives after the listener paused', () => {
		const fixtureChirho = setupChirho();
		fixtureChirho.player_chirho.playChirho();
		fixtureChirho.player_chirho.pauseChirho();
		fixtureChirho.audio_chirho.failedChirho();
		expect(fixtureChirho.audio_chirho.play).toHaveBeenCalledTimes(1);
		expect(fixtureChirho.player_chirho.snapshotChirho.phase_chirho).toBe('paused');
	});

	it('maps a saved position when the station is changed before the first tap', () => {
		const fixtureChirho = setupChirho(
			JSON.stringify({
				station_id_chirho: STATIONS_CHIRHO[0].id_chirho,
				book_id_chirho: 'JHN',
				chapter_chirho: 1,
				seconds_chirho: 380,
				sounds_enabled_chirho: false,
				followed_place_chirho: {
					station_id_chirho: STATIONS_CHIRHO[0].id_chirho,
					book_id_chirho: 'JHN',
					chapter_chirho: 1,
					seconds_chirho: 380,
					duration_chirho: 410,
					verse_chirho: null,
					verse_fraction_chirho: 0
				}
			})
		);
		fixtureChirho.player_chirho.selectStationChirho(STATIONS_CHIRHO[1].id_chirho);
		fixtureChirho.player_chirho.playChirho();
		fixtureChirho.audio_chirho.metadataChirho(364);
		expect(fixtureChirho.audio_chirho.currentTime).toBeCloseTo((380 / 410) * 364);
	});

	it('starts in the tap call, stops tuning noise at playing, and measures Scripture rather than effects', () => {
		const fixtureChirho = setupChirho();
		fixtureChirho.player_chirho.playChirho();
		expect(fixtureChirho.audio_chirho.play).toHaveBeenCalledTimes(1);
		expect(fixtureChirho.player_chirho.snapshotChirho.phase_chirho).toBe('loading');
		expect(fixtureChirho.sounds_chirho.startChirho).toHaveBeenCalledTimes(1);
		fixtureChirho.audio_chirho.metadataChirho();
		fixtureChirho.clock_chirho(137);
		const stopsBeforePlayingChirho = fixtureChirho.sounds_chirho.stopChirho.mock.calls.length;
		fixtureChirho.audio_chirho.playingChirho();
		expect(fixtureChirho.player_chirho.snapshotChirho.first_sound_ms_chirho).toBe(137);
		expect(fixtureChirho.player_chirho.snapshotChirho.phase_chirho).toBe('playing');
		expect(fixtureChirho.sounds_chirho.stopChirho).toHaveBeenCalledTimes(
			stopsBeforePlayingChirho + 1
		);
	});

	it('keeps the chapter and fraction on a station without loaded verse timings', () => {
		const fixtureChirho = setupChirho();
		fixtureChirho.player_chirho.playChirho();
		fixtureChirho.audio_chirho.metadataChirho(100);
		fixtureChirho.audio_chirho.playingChirho();
		fixtureChirho.audio_chirho.positionChirho(40);
		fixtureChirho.player_chirho.selectStationChirho(STATIONS_CHIRHO[1].id_chirho);
		fixtureChirho.audio_chirho.metadataChirho(200);
		expect(fixtureChirho.audio_chirho.currentTime).toBe(80);
		expect(fixtureChirho.player_chirho.snapshotChirho).toMatchObject({
			book_id_chirho: 'JHN',
			chapter_chirho: 1,
			position_mode_chirho: 'fraction'
		});
	});

	it('uses prefetched timings for the same verse when tuning', async () => {
		const fixtureChirho = setupChirho(null, false, true);
		await vi.waitFor(() => expect(fixtureChirho.fetch_chirho).toHaveBeenCalled());
		await new Promise<void>((resolveChirho) => setTimeout(resolveChirho, 0));
		fixtureChirho.player_chirho.playChirho();
		fixtureChirho.audio_chirho.metadataChirho(100);
		fixtureChirho.audio_chirho.playingChirho();
		fixtureChirho.audio_chirho.positionChirho(30);
		const otherChirho = STATIONS_CHIRHO.find(
			(stationChirho) =>
				stationChirho.has_timings_chirho &&
				stationChirho.id_chirho !== fixtureChirho.player_chirho.stationChirho.id_chirho
		)!;
		fixtureChirho.player_chirho.selectStationChirho(otherChirho.id_chirho);
		fixtureChirho.audio_chirho.metadataChirho(200);
		expect(fixtureChirho.player_chirho.snapshotChirho.position_mode_chirho).toBe('verse');
		expect(fixtureChirho.audio_chirho.currentTime).toBeCloseTo(29.95);
	});

	it('keeps the original position through several rapid turns before metadata arrives', () => {
		const fixtureChirho = setupChirho();
		fixtureChirho.player_chirho.playChirho();
		fixtureChirho.audio_chirho.metadataChirho(100);
		fixtureChirho.audio_chirho.playingChirho();
		fixtureChirho.audio_chirho.positionChirho(40);
		fixtureChirho.player_chirho.selectStationChirho(STATIONS_CHIRHO[1].id_chirho);
		fixtureChirho.player_chirho.selectStationChirho(STATIONS_CHIRHO[2].id_chirho);
		fixtureChirho.audio_chirho.metadataChirho(200);
		expect(fixtureChirho.audio_chirho.currentTime).toBe(80);
	});

	it('ignores an obsolete play rejection after a rapid station change', async () => {
		const fixtureChirho = setupChirho();
		let rejectChirho: (reasonChirho: Error) => void = () => {
			throw new Error('Missing deferred play');
		};
		fixtureChirho.audio_chirho.play.mockImplementationOnce(
			() =>
				new Promise<void>((_unusedChirho, rejectPromiseChirho) => {
					rejectChirho = rejectPromiseChirho;
				})
		);
		fixtureChirho.player_chirho.playChirho();
		fixtureChirho.player_chirho.selectStationChirho(STATIONS_CHIRHO[1].id_chirho);
		fixtureChirho.audio_chirho.metadataChirho();
		fixtureChirho.audio_chirho.playingChirho();
		rejectChirho(new Error('Old stream cancelled'));
		await Promise.resolve();
		expect(fixtureChirho.player_chirho.snapshotChirho.phase_chirho).toBe('playing');
		expect(fixtureChirho.player_chirho.snapshotChirho.station_id_chirho).toBe(
			STATIONS_CHIRHO[1].id_chirho
		);
	});

	it('ignores a cancelled play promise after an immediate pause and resume on the same track', async () => {
		const fixtureChirho = setupChirho();
		let rejectChirho: (reasonChirho: Error) => void = () => {
			throw new Error('Missing deferred play');
		};
		fixtureChirho.audio_chirho.play.mockImplementationOnce(
			() =>
				new Promise<void>((_unusedChirho, rejectPromiseChirho) => {
					rejectChirho = rejectPromiseChirho;
				})
		);
		fixtureChirho.player_chirho.playChirho();
		fixtureChirho.player_chirho.pauseChirho();
		fixtureChirho.player_chirho.playChirho();
		fixtureChirho.audio_chirho.metadataChirho();
		fixtureChirho.audio_chirho.playingChirho();
		rejectChirho(new Error('The paused play attempt was cancelled'));
		await Promise.resolve();
		expect(fixtureChirho.player_chirho.snapshotChirho.phase_chirho).toBe('playing');
		expect(fixtureChirho.audio_chirho.paused).toBe(false);
	});

	it('advances at the end of a chapter through the station coverage', () => {
		const fixtureChirho = setupChirho();
		fixtureChirho.player_chirho.playChirho();
		const expectedChirho = nextChapterChirho(fixtureChirho.player_chirho.stationChirho, 'JHN', 1);
		fixtureChirho.audio_chirho.metadataChirho();
		fixtureChirho.audio_chirho.playingChirho();
		fixtureChirho.audio_chirho.ended = true;
		fixtureChirho.audio_chirho.pause();
		fixtureChirho.audio_chirho.dispatchEvent(new Event('pause'));
		fixtureChirho.audio_chirho.dispatchEvent(new Event('ended'));
		expect(fixtureChirho.player_chirho.snapshotChirho).toMatchObject(expectedChirho!);
		expect(fixtureChirho.audio_chirho.play).toHaveBeenCalledTimes(2);
	});

	it('tries a missing media chapter and stops after three recoveries instead of scanning forever', () => {
		const fixtureChirho = setupChirho();
		fixtureChirho.player_chirho.playChirho();
		for (let failureChirho = 0; failureChirho < 4; failureChirho += 1)
			fixtureChirho.audio_chirho.failedChirho();
		expect(fixtureChirho.audio_chirho.play).toHaveBeenCalledTimes(4);
		expect(fixtureChirho.player_chirho.snapshotChirho.phase_chirho).toBe('error');
		expect(fixtureChirho.audio_chirho.paused).toBe(true);
		fixtureChirho.player_chirho.playChirho();
		expect(fixtureChirho.player_chirho.snapshotChirho.phase_chirho).toBe('loading');
	});

	it('moves to a verified passage when tuning into a station without the current book', () => {
		const partialStationChirho = STATIONS_CHIRHO.find(
			(stationChirho) => !resolveChapterChirho(stationChirho, 'GEN', 1)
		)!;
		expect(partialStationChirho).toBeDefined();
		for (const startedChirho of [false, true]) {
			const fixtureChirho = setupChirho();
			fixtureChirho.player_chirho.selectChapterChirho('GEN', 1);
			if (startedChirho) {
				fixtureChirho.player_chirho.playChirho();
				fixtureChirho.audio_chirho.metadataChirho();
				fixtureChirho.audio_chirho.playingChirho();
			}
			fixtureChirho.player_chirho.selectStationChirho(partialStationChirho.id_chirho);
			const stateChirho = fixtureChirho.player_chirho.snapshotChirho;
			expect(stateChirho.book_id_chirho).not.toBe('GEN');
			expect(
				resolveChapterChirho(
					partialStationChirho,
					stateChirho.book_id_chirho,
					stateChirho.chapter_chirho
				)
			).not.toBeNull();
		}
	});

	it('reflects a browser or media-control pause and stops the effects', () => {
		const fixtureChirho = setupChirho();
		fixtureChirho.player_chirho.playChirho();
		fixtureChirho.audio_chirho.metadataChirho();
		fixtureChirho.audio_chirho.playingChirho();
		fixtureChirho.audio_chirho.pause();
		fixtureChirho.audio_chirho.dispatchEvent(new Event('pause'));
		expect(fixtureChirho.player_chirho.snapshotChirho.phase_chirho).toBe('paused');
		expect(fixtureChirho.sounds_chirho.stopChirho).toHaveBeenCalled();
		fixtureChirho.audio_chirho.playingChirho();
		expect(fixtureChirho.player_chirho.snapshotChirho.phase_chirho).toBe('playing');
	});

	it('stops a stalled source on a bounded timeout', () => {
		vi.useFakeTimers();
		const fixtureChirho = setupChirho();
		fixtureChirho.player_chirho.playChirho();
		vi.advanceTimersByTime(15000);
		expect(fixtureChirho.player_chirho.snapshotChirho.phase_chirho).toBe('error');
		expect(fixtureChirho.audio_chirho.play).toHaveBeenCalledTimes(1);
		expect(fixtureChirho.audio_chirho.paused).toBe(true);
	});

	it('preserves an intentional pause while tuning and handles denied local storage', () => {
		const fixtureChirho = setupChirho(null, true);
		fixtureChirho.player_chirho.playChirho();
		fixtureChirho.player_chirho.pauseChirho();
		fixtureChirho.player_chirho.selectStationChirho(STATIONS_CHIRHO[1].id_chirho);
		expect(fixtureChirho.audio_chirho.play).toHaveBeenCalledTimes(1);
		expect(fixtureChirho.player_chirho.snapshotChirho).toMatchObject({
			phase_chirho: 'paused',
			storage_available_chirho: false
		});
		fixtureChirho.player_chirho.playChirho();
		expect(fixtureChirho.audio_chirho.play).toHaveBeenCalledTimes(2);
	});

	it('remembers place and the sound switch on this device without autoplay on reopening', () => {
		const fixtureChirho = setupChirho();
		fixtureChirho.player_chirho.playChirho();
		fixtureChirho.audio_chirho.metadataChirho();
		fixtureChirho.audio_chirho.positionChirho(43);
		fixtureChirho.player_chirho.setSoundsChirho(false);
		fixtureChirho.player_chirho.pauseChirho();
		const reopenedChirho = setupChirho(fixtureChirho.saved_chirho.get(PREFERENCES_KEY_CHIRHO)!);
		expect(reopenedChirho.player_chirho.snapshotChirho).toMatchObject({
			phase_chirho: 'ready',
			seconds_chirho: 43,
			sounds_enabled_chirho: false
		});
		expect(reopenedChirho.audio_chirho.play).not.toHaveBeenCalled();
		reopenedChirho.player_chirho.playChirho();
		reopenedChirho.audio_chirho.metadataChirho();
		expect(reopenedChirho.audio_chirho.currentTime).toBe(43);
	});

	it('aborts optional timing requests on disposal and never fetches Scripture bytes', () => {
		const fixtureChirho = setupChirho();
		fixtureChirho.player_chirho.disposeChirho();
		expect(fixtureChirho.fetch_chirho.mock.calls.length).toBeLessThanOrEqual(3);
		for (const [urlChirho, optionsChirho] of fixtureChirho.fetch_chirho.mock.calls) {
			expect(String(urlChirho)).toMatch(/audioTimings\.json$/);
			expect(optionsChirho?.signal?.aborted).toBe(true);
		}
	});
});

describe('position and preference trust boundaries', () => {
	it('cancels an oversized timing response before consuming its remaining stream', async () => {
		const cancelChirho = vi.fn();
		const responseChirho = new Response(
			new ReadableStream<Uint8Array>({
				start(controllerChirho) {
					controllerChirho.enqueue(new Uint8Array(64001));
				},
				cancel: cancelChirho
			})
		);
		await expect(readBoundedTimingsChirho(responseChirho)).rejects.toThrow('Timings too large');
		expect(cancelChirho).toHaveBeenCalledTimes(1);
	});

	it('maps the same verse, falls back to fraction, and clamps an invalid duration to the start', () => {
		const positionChirho = capturePositionChirho(35, 100, [10, 20, 40]);
		expect(positionChirho.verse_chirho).toBe(2);
		expect(mapPositionChirho(positionChirho, 200, [5, 25, 65])).toMatchObject({
			mode_chirho: 'verse',
			seconds_chirho: 54.925
		});
		expect(mapPositionChirho(positionChirho, 200, null)).toEqual({
			mode_chirho: 'fraction',
			seconds_chirho: 70
		});
		expect(mapPositionChirho(capturePositionChirho(NaN, NaN, null), NaN, null)).toEqual({
			mode_chirho: 'start',
			seconds_chirho: 0
		});
	});

	it.each([
		'null',
		'[]',
		'malformed json',
		'{"station_id_chirho":"unknown","book_id_chirho":"bad","chapter_chirho":-7,"seconds_chirho":1e100}',
		' '.repeat(2100)
	])('rejects unsafe saved values without breaking playback (%s)', (rawChirho) => {
		const storageChirho = { getItem: () => rawChirho, setItem: vi.fn() };
		const preferencesChirho = readPreferencesChirho(storageChirho).preferences_chirho;
		expect(preferencesChirho.station_id_chirho).toBe(STATIONS_CHIRHO[0].id_chirho);
		expect(preferencesChirho.chapter_chirho).toBe(1);
		expect(preferencesChirho.seconds_chirho).toBe(0);
	});
});
