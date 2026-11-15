// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createSoundChannelChirho } from './sound_channel_chirho';
import { FakeAudioChirho, settleChirho } from './tests-chirho/fake_audio_chirho';

const CLIP_A_CHIRHO = { url_chirho: '/sounds-chirho/a_chirho.wav' };
const CLIP_B_CHIRHO = { url_chirho: '/sounds-chirho/b_chirho.wav' };
const TICK_CHIRHO = { url_chirho: '/sounds-chirho/knob_chirho.wav', start_seconds_chirho: 0.9 };

function channelChirho(keepLoadedChirho: boolean) {
	const elementChirho = new FakeAudioChirho();
	const soundChirho = createSoundChannelChirho(elementChirho, {
		ceiling_ms_chirho: 1000,
		keep_loaded_chirho: keepLoadedChirho
	});
	return { elementChirho, soundChirho };
}

beforeEach(() => {
	vi.useFakeTimers();
});
afterEach(() => {
	vi.useRealTimers();
});

describe('sound channel', () => {
	it('plays a clip once, never looping, at full element volume because quietness is in the samples', () => {
		const { elementChirho, soundChirho } = channelChirho(false);
		expect(elementChirho.loop).toBe(false);
		expect(elementChirho.volume).toBe(1);
		soundChirho.playChirho(CLIP_A_CHIRHO);
		expect(elementChirho.plays_chirho).toEqual([
			{ src_chirho: CLIP_A_CHIRHO.url_chirho, time_chirho: 0 }
		]);
		expect(soundChirho.current_chirho).toBe(CLIP_A_CHIRHO);
	});

	it('lets go of a recording when it ends, and of a stalled one at its ceiling', () => {
		const { elementChirho, soundChirho } = channelChirho(false);
		soundChirho.playChirho(CLIP_A_CHIRHO);
		elementChirho.finishChirho();
		expect(soundChirho.current_chirho).toBeNull();
		expect(elementChirho.src).toBe('');

		soundChirho.playChirho(CLIP_B_CHIRHO);
		vi.advanceTimersByTime(999);
		expect(soundChirho.current_chirho).toBe(CLIP_B_CHIRHO);
		vi.advanceTimersByTime(1);
		expect(soundChirho.current_chirho).toBeNull();
		expect(elementChirho.paused).toBe(true);
		expect(elementChirho.src).toBe('');
		expect(vi.getTimerCount()).toBe(0);
	});

	it('keeps a finished clip loaded when its ceiling comes before the ended event, and ignores that event', () => {
		const { elementChirho, soundChirho } = channelChirho(true);
		soundChirho.playChirho(TICK_CHIRHO);
		vi.advanceTimersByTime(900);
		elementChirho.reachEndChirho('ended_first');
		vi.advanceTimersByTime(100);
		expect(soundChirho.current_chirho).toBeNull();
		expect(elementChirho.src).toBe('/sounds-chirho/knob_chirho.wav#t=0.9');

		soundChirho.playChirho(TICK_CHIRHO);
		expect(elementChirho.plays_chirho[1]).toEqual({
			src_chirho: '/sounds-chirho/knob_chirho.wav#t=0.9',
			time_chirho: 0.9
		});
		elementChirho.deliverStaleEndedChirho();
		expect(soundChirho.current_chirho).toBe(TICK_CHIRHO);
	});

	it('lets go of a clip at its ceiling when it has not ended, loaded or not, and of a finished tuning cue', () => {
		for (const keepLoadedChirho of [true, false]) {
			const { elementChirho, soundChirho } = channelChirho(keepLoadedChirho);
			elementChirho.next_play_chirho = 'hold';
			soundChirho.playChirho(CLIP_A_CHIRHO);
			vi.advanceTimersByTime(1000);
			expect([soundChirho.current_chirho, elementChirho.paused, elementChirho.src]).toEqual([
				null,
				true,
				''
			]);
		}
		const { elementChirho, soundChirho } = channelChirho(false);
		soundChirho.playChirho(CLIP_A_CHIRHO);
		elementChirho.reachEndChirho('ended_first');
		vi.advanceTimersByTime(1000);
		expect(elementChirho.src).toBe('');
	});

	it("never lets an older sound's ceiling cut the sound that replaced it", () => {
		const { elementChirho, soundChirho } = channelChirho(false);
		soundChirho.playChirho(CLIP_A_CHIRHO);
		vi.advanceTimersByTime(600);
		soundChirho.playChirho(CLIP_B_CHIRHO);
		vi.advanceTimersByTime(400);
		expect(soundChirho.current_chirho).toBe(CLIP_B_CHIRHO);
		expect(elementChirho.paused).toBe(false);
		vi.advanceTimersByTime(600);
		expect(soundChirho.current_chirho).toBeNull();
	});

	it('restarts a loaded clip in place, and ignores an ended event queued before the restart', () => {
		const { elementChirho, soundChirho } = channelChirho(true);
		soundChirho.playChirho(TICK_CHIRHO);
		expect(elementChirho.src).toBe('/sounds-chirho/knob_chirho.wav#t=0.9');
		elementChirho.finishChirho();
		expect(soundChirho.current_chirho).toBeNull();
		expect(elementChirho.src).toBe('/sounds-chirho/knob_chirho.wav#t=0.9');

		soundChirho.playChirho(TICK_CHIRHO);
		expect(elementChirho.plays_chirho[1]).toEqual({
			src_chirho: '/sounds-chirho/knob_chirho.wav#t=0.9',
			time_chirho: 0.9
		});
		elementChirho.deliverStaleEndedChirho();
		expect(soundChirho.current_chirho).toBe(TICK_CHIRHO);
	});

	it('frees the channel when the browser refuses a sound, but not for a refusal that arrives late', async () => {
		const { elementChirho, soundChirho } = channelChirho(true);
		elementChirho.next_play_chirho = 'refuse';
		soundChirho.playChirho(CLIP_A_CHIRHO);
		await settleChirho();
		expect(soundChirho.current_chirho).toBeNull();

		elementChirho.next_play_chirho = 'hold';
		soundChirho.playChirho(CLIP_A_CHIRHO);
		soundChirho.playChirho(CLIP_B_CHIRHO);
		await settleChirho();
		expect(soundChirho.current_chirho).toBe(CLIP_B_CHIRHO);
		expect(elementChirho.src).toBe(CLIP_B_CHIRHO.url_chirho);
	});

	it('stops at once, abandoning quietly a play the browser has not yet allowed', async () => {
		const { elementChirho, soundChirho } = channelChirho(true);
		elementChirho.next_play_chirho = 'hold';
		soundChirho.playChirho(CLIP_A_CHIRHO);
		soundChirho.stopChirho();
		await settleChirho();
		expect(soundChirho.current_chirho).toBeNull();
		expect(elementChirho.paused).toBe(true);
		expect(elementChirho.src).toBe('');
		expect(vi.getTimerCount()).toBe(0);
	});

	it('loads a clip afresh after a media error, but keeps it loaded after a policy refusal', async () => {
		const brokenChirho = channelChirho(true);
		brokenChirho.elementChirho.next_play_chirho = 'broken';
		brokenChirho.soundChirho.playChirho(TICK_CHIRHO);
		await settleChirho();
		expect(brokenChirho.soundChirho.current_chirho).toBeNull();
		// The next request assigns the source again, so it starts from the fragment, not in place.
		brokenChirho.soundChirho.playChirho(TICK_CHIRHO);
		expect(brokenChirho.elementChirho.plays_chirho[1]).toEqual({
			src_chirho: '/sounds-chirho/knob_chirho.wav#t=0.9',
			time_chirho: 0
		});
		await settleChirho();
		expect(brokenChirho.soundChirho.current_chirho).toBe(TICK_CHIRHO);

		const refusedChirho = channelChirho(true);
		refusedChirho.elementChirho.next_play_chirho = 'refuse';
		refusedChirho.soundChirho.playChirho(TICK_CHIRHO);
		await settleChirho();
		refusedChirho.soundChirho.playChirho(TICK_CHIRHO);
		expect(refusedChirho.elementChirho.plays_chirho[1]).toEqual({
			src_chirho: '/sounds-chirho/knob_chirho.wav#t=0.9',
			time_chirho: 0.9
		});
	});

	it('never lets a late refusal from a broken older clip unsettle or unload the clip after it', async () => {
		const { elementChirho, soundChirho } = channelChirho(true);
		elementChirho.next_play_chirho = 'broken';
		soundChirho.playChirho(CLIP_A_CHIRHO);
		soundChirho.playChirho(TICK_CHIRHO);
		await settleChirho();
		expect(soundChirho.current_chirho).toBe(TICK_CHIRHO);
		elementChirho.finishChirho();
		soundChirho.playChirho(TICK_CHIRHO);
		expect(elementChirho.plays_chirho.at(-1)).toEqual({
			src_chirho: '/sounds-chirho/knob_chirho.wav#t=0.9',
			time_chirho: 0.9
		});
	});

	it('does nothing after disposal and leaves no listener behind', () => {
		const { elementChirho, soundChirho } = channelChirho(false);
		soundChirho.disposeChirho();
		soundChirho.playChirho(CLIP_A_CHIRHO);
		expect(elementChirho.plays_chirho).toEqual([]);
		expect(elementChirho.listener_count_chirho).toBe(0);
	});
});
