// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRadioSoundsChirho } from './radio_sounds_chirho';
import { OPEN_SOUND_PROFILE_CHIRHO, SOUND_PROFILE_SCHEMA_CHIRHO } from './sound_profile_chirho';
import { FakeAudioChirho, settleChirho } from './tests-chirho/fake_audio_chirho';
import { SOUND_PEAK_LIMIT_CHIRHO, decodePcmWavChirho, peakOfChirho } from './wav_chirho';

const OPEN_CLICK_CHIRHO = OPEN_SOUND_PROFILE_CHIRHO.click_chirho[0].url_chirho;
const OPEN_KNOB_CHIRHO = OPEN_SOUND_PROFILE_CHIRHO.knob_chirho[0].url_chirho;
const LICENSED_CHIRHO = {
	schema_chirho: SOUND_PROFILE_SCHEMA_CHIRHO,
	source_chirho: 'licensed',
	tuning_chirho: [
		{ url_chirho: '/sounds-chirho/licensed-chirho/tuning-chirho/radio_01_chirho.wav' }
	],
	click_chirho: [
		{ url_chirho: '/sounds-chirho/licensed-chirho/interface-chirho/button_click_chirho.wav' }
	],
	knob_chirho: [
		{
			url_chirho: '/sounds-chirho/licensed-chirho/interface-chirho/knob_turn_chirho.wav',
			start_seconds_chirho: 0.9
		}
	]
};

function radioSoundsChirho(
	fetchChirho: typeof fetch | null = null,
	randomChirho = () => 0.5,
	enabledChirho = true
) {
	const elementsChirho: FakeAudioChirho[] = [];
	let clockChirho = 0;
	const soundsChirho = createRadioSoundsChirho({
		create_element_chirho: () => {
			const elementChirho = new FakeAudioChirho();
			elementsChirho.push(elementChirho);
			return elementChirho;
		},
		fetch_chirho: fetchChirho,
		now_chirho: () => clockChirho,
		random_chirho: randomChirho
	});
	// The player tells the sounds its remembered switch as soon as it is made.
	soundsChirho.setEnabledChirho(enabledChirho);
	const [tuningChirho, controlsChirho] = elementsChirho;
	const waitChirho = (msChirho: number): void => {
		clockChirho += msChirho;
		vi.advanceTimersByTime(msChirho);
	};
	return { soundsChirho, tuningChirho, controlsChirho, elementsChirho, waitChirho };
}

function answeringChirho(bodyChirho: unknown, statusChirho = 200) {
	return vi.fn(
		async () => new Response(JSON.stringify(bodyChirho), { status: statusChirho })
	) as unknown as typeof fetch;
}

beforeEach(() => {
	vi.useFakeTimers();
});
afterEach(() => {
	vi.useRealTimers();
});

describe('radio sounds', () => {
	it('keeps every open sound quiet in its samples, because phones may ignore software volume', () => {
		const { tuning_chirho, click_chirho, knob_chirho } = OPEN_SOUND_PROFILE_CHIRHO;
		for (const { url_chirho: urlChirho } of [...tuning_chirho, ...click_chirho, ...knob_chirho]) {
			const peakChirho = peakOfChirho(
				decodePcmWavChirho(readFileSync(new URL(`../../../static${urlChirho}`, import.meta.url)))
			);
			expect(peakChirho, urlChirho).toBeGreaterThan(0);
			expect(peakChirho, urlChirho).toBeLessThanOrEqual(SOUND_PEAK_LIMIT_CHIRHO);
		}
	});

	it('uses two elements: one for tuning, one shared by click and knob', () => {
		const { elementsChirho } = radioSoundsChirho();
		expect(elementsChirho).toHaveLength(2);
	});

	it('stops only the tuning cue, so a click already sounding, or the one after Off, is heard', () => {
		const { soundsChirho, tuningChirho, controlsChirho } = radioSoundsChirho();
		soundsChirho.startChirho();
		soundsChirho.clickChirho?.();
		// Scripture arriving, or Off, stops the tuning cue while the On click is still sounding.
		soundsChirho.stopChirho();
		expect(tuningChirho.paused).toBe(true);
		expect(tuningChirho.src).toBe('');
		expect(controlsChirho.paused).toBe(false);
		expect(controlsChirho.src).toBe(OPEN_CLICK_CHIRHO);
		controlsChirho.finishChirho();
		soundsChirho.clickChirho?.();
		expect(controlsChirho.paused).toBe(false);
		expect(controlsChirho.plays_chirho).toHaveLength(2);
	});

	it('silences both channels when sounds are turned off, and plays nothing until they are back on', () => {
		const { soundsChirho, tuningChirho, controlsChirho, waitChirho } = radioSoundsChirho();
		soundsChirho.startChirho();
		soundsChirho.clickChirho?.();
		soundsChirho.setEnabledChirho(false);
		expect([tuningChirho.paused, controlsChirho.paused]).toEqual([true, true]);
		waitChirho(100);
		soundsChirho.startChirho();
		soundsChirho.clickChirho?.();
		soundsChirho.knobChirho?.();
		expect(tuningChirho.plays_chirho).toHaveLength(1);
		expect(controlsChirho.plays_chirho).toHaveLength(1);
		soundsChirho.setEnabledChirho(true);
		soundsChirho.clickChirho?.();
		expect(controlsChirho.paused).toBe(false);
	});

	it('silences everything for good when disposed', () => {
		const { soundsChirho, tuningChirho, controlsChirho } = radioSoundsChirho();
		soundsChirho.startChirho();
		soundsChirho.clickChirho?.();
		soundsChirho.disposeChirho();
		soundsChirho.setEnabledChirho(true);
		soundsChirho.startChirho();
		soundsChirho.clickChirho?.();
		soundsChirho.knobChirho?.();
		expect([tuningChirho.paused, controlsChirho.paused]).toEqual([true, true]);
		expect([tuningChirho.plays_chirho.length, controlsChirho.plays_chirho.length]).toEqual([1, 1]);
		expect([tuningChirho.listener_count_chirho, controlsChirho.listener_count_chirho]).toEqual([
			0, 0
		]);
	});

	it('never plays the same tuning cue twice in a row, and uses all of them', () => {
		let seedChirho = 7;
		const randomChirho = (): number => {
			seedChirho = (seedChirho * 16807) % 2147483647;
			return (seedChirho - 1) / 2147483646;
		};
		const { soundsChirho, tuningChirho } = radioSoundsChirho(null, randomChirho);
		for (let turnChirho = 0; turnChirho < 200; turnChirho += 1) soundsChirho.startChirho();
		const heardChirho = tuningChirho.plays_chirho.map((playChirho) => playChirho.src_chirho);
		expect(
			heardChirho.some((srcChirho, indexChirho) => srcChirho === heardChirho[indexChirho - 1])
		).toBe(false);
		expect(new Set(heardChirho).size).toBe(OPEN_SOUND_PROFILE_CHIRHO.tuning_chirho.length);
	});

	it('gives knob steps closer than 60 ms one shared tick, restarting the loaded tick after that', () => {
		const { soundsChirho, controlsChirho, waitChirho } = radioSoundsChirho();
		soundsChirho.knobChirho?.();
		waitChirho(30);
		soundsChirho.knobChirho?.();
		expect(controlsChirho.plays_chirho).toHaveLength(1);
		waitChirho(40);
		soundsChirho.knobChirho?.();
		expect(controlsChirho.plays_chirho).toEqual([
			{ src_chirho: OPEN_KNOB_CHIRHO, time_chirho: 0 },
			{ src_chirho: OPEN_KNOB_CHIRHO, time_chirho: 0 }
		]);
	});

	it('never lets a knob tick cut a click, while a click always cuts a knob tick', () => {
		const { soundsChirho, controlsChirho, waitChirho } = radioSoundsChirho();
		soundsChirho.clickChirho?.();
		waitChirho(100);
		soundsChirho.knobChirho?.();
		expect(controlsChirho.plays_chirho).toHaveLength(1);
		controlsChirho.finishChirho();
		soundsChirho.knobChirho?.();
		soundsChirho.clickChirho?.();
		expect(controlsChirho.plays_chirho.map((playChirho) => playChirho.src_chirho)).toEqual([
			OPEN_CLICK_CHIRHO,
			OPEN_KNOB_CHIRHO,
			OPEN_CLICK_CHIRHO
		]);
	});

	it('lets a knob step sound once a click has ended, before the ended event arrives', () => {
		const { soundsChirho, controlsChirho, waitChirho } = radioSoundsChirho();
		soundsChirho.clickChirho?.();
		waitChirho(300);
		controlsChirho.reachEndChirho();
		soundsChirho.knobChirho?.();
		expect(controlsChirho.paused).toBe(false);
		expect(controlsChirho.plays_chirho.map((playChirho) => playChirho.src_chirho)).toEqual([
			OPEN_CLICK_CHIRHO,
			OPEN_KNOB_CHIRHO
		]);
	});

	it('still keeps a click restarted in that gap from being cut, despite the late ended event', () => {
		const { soundsChirho, controlsChirho, waitChirho } = radioSoundsChirho();
		soundsChirho.clickChirho?.();
		waitChirho(300);
		controlsChirho.reachEndChirho();
		soundsChirho.clickChirho?.();
		controlsChirho.deliverStaleEndedChirho();
		waitChirho(60);
		soundsChirho.knobChirho?.();
		expect(controlsChirho.paused).toBe(false);
		expect(controlsChirho.plays_chirho.map((playChirho) => playChirho.src_chirho)).toEqual([
			OPEN_CLICK_CHIRHO,
			OPEN_CLICK_CHIRHO
		]);
	});

	it("switches to the site's profile once it arrives, asking only once", async () => {
		const fetchChirho = answeringChirho(LICENSED_CHIRHO);
		const { soundsChirho, tuningChirho, controlsChirho } = radioSoundsChirho(fetchChirho);
		await settleChirho();
		soundsChirho.startChirho();
		soundsChirho.knobChirho?.();
		expect(tuningChirho.src).toBe(LICENSED_CHIRHO.tuning_chirho[0].url_chirho);
		expect(controlsChirho.src).toBe(`${LICENSED_CHIRHO.knob_chirho[0].url_chirho}#t=0.9`);
		soundsChirho.setEnabledChirho(true);
		soundsChirho.clickChirho?.();
		expect(fetchChirho).toHaveBeenCalledTimes(1);
	});

	it('asks for no profile while the sounds are off, as in an embedded widget', async () => {
		const fetchChirho = answeringChirho(LICENSED_CHIRHO);
		const { soundsChirho, controlsChirho } = radioSoundsChirho(fetchChirho, undefined, false);
		soundsChirho.clickChirho?.();
		await settleChirho();
		expect(fetchChirho).not.toHaveBeenCalled();
		expect(controlsChirho.plays_chirho).toEqual([]);
		soundsChirho.setEnabledChirho(true);
		await settleChirho();
		soundsChirho.clickChirho?.();
		expect(fetchChirho).toHaveBeenCalledTimes(1);
		expect(controlsChirho.src).toBe(LICENSED_CHIRHO.click_chirho[0].url_chirho);
	});

	it('keeps the open set when the profile is missing, broken or points anywhere else', async () => {
		for (const fetchChirho of [
			answeringChirho({}, 404),
			answeringChirho('not a profile'),
			answeringChirho({
				...LICENSED_CHIRHO,
				click_chirho: [{ url_chirho: 'https://example.com/click.wav' }]
			})
		]) {
			const { soundsChirho, controlsChirho } = radioSoundsChirho(fetchChirho);
			await settleChirho();
			soundsChirho.clickChirho?.();
			expect(controlsChirho.src).toBe(OPEN_CLICK_CHIRHO);
		}
	});

	it('keeps a click or knob silent when the profile names none', async () => {
		const { soundsChirho, controlsChirho } = radioSoundsChirho(
			answeringChirho({ ...LICENSED_CHIRHO, click_chirho: [], knob_chirho: [] })
		);
		await settleChirho();
		soundsChirho.clickChirho?.();
		soundsChirho.knobChirho?.();
		expect(controlsChirho.plays_chirho).toEqual([]);
	});
});
