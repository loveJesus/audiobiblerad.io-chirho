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
		{ url_chirho: '/sounds-chirho/licensed-chirho/interface-chirho/knob_turn_chirho.wav' }
	]
};

function radioSoundsChirho(
	fetchChirho: typeof fetch | null = null,
	randomChirho = () => 0.5,
	enabledChirho: boolean | null = true
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
	// The player tells the sounds its remembered switch as soon as it is made; null has not yet.
	if (enabledChirho !== null) soundsChirho.setEnabledChirho(enabledChirho);
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

	it('silences a sounding tuning cue and click together, keeping the switch on for what follows', () => {
		const { soundsChirho, tuningChirho, controlsChirho, waitChirho } = radioSoundsChirho();
		soundsChirho.startChirho();
		soundsChirho.clickChirho?.();
		// Unlike stopChirho, a silence also stops the click already sounding.
		soundsChirho.silenceChirho?.();
		expect([tuningChirho.paused, controlsChirho.paused]).toEqual([true, true]);
		waitChirho(100);
		soundsChirho.knobChirho?.();
		expect(controlsChirho.paused).toBe(false);
		controlsChirho.finishChirho();
		soundsChirho.clickChirho?.();
		soundsChirho.startChirho();
		expect(controlsChirho.plays_chirho.map((playChirho) => playChirho.src_chirho)).toEqual([
			OPEN_CLICK_CHIRHO,
			OPEN_KNOB_CHIRHO,
			OPEN_CLICK_CHIRHO
		]);
		expect([tuningChirho.paused, tuningChirho.plays_chirho.length]).toEqual([false, 2]);
	});

	it('silences without asking for the profile or turning switched-off sounds back on', async () => {
		const fetchChirho = answeringChirho(LICENSED_CHIRHO);
		const { soundsChirho, tuningChirho, controlsChirho } = radioSoundsChirho(
			fetchChirho,
			undefined,
			null
		);
		soundsChirho.silenceChirho?.();
		await settleChirho();
		expect(fetchChirho).not.toHaveBeenCalled();
		// Switched off, as in an embedded widget: after a silence they stay off.
		soundsChirho.setEnabledChirho(false);
		soundsChirho.silenceChirho?.();
		soundsChirho.startChirho();
		soundsChirho.clickChirho?.();
		soundsChirho.knobChirho?.();
		await settleChirho();
		expect(fetchChirho).not.toHaveBeenCalled();
		expect([tuningChirho.plays_chirho, controlsChirho.plays_chirho]).toEqual([[], []]);
		soundsChirho.setEnabledChirho(true);
		await settleChirho();
		soundsChirho.clickChirho?.();
		expect(fetchChirho).toHaveBeenCalledTimes(1);
		expect(controlsChirho.src).toBe(LICENSED_CHIRHO.click_chirho[0].url_chirho);
	});

	it('lets nothing left from a silenced sound restart it or cut the click after it', async () => {
		const { soundsChirho, tuningChirho, controlsChirho, waitChirho } = radioSoundsChirho();
		tuningChirho.next_play_chirho = 'hold';
		controlsChirho.next_play_chirho = 'hold';
		soundsChirho.startChirho();
		soundsChirho.clickChirho?.();
		waitChirho(100);
		// The silence abandons both waiting plays; their refusals and ended events arrive late.
		soundsChirho.silenceChirho?.();
		await settleChirho();
		tuningChirho.deliverStaleEndedChirho();
		controlsChirho.deliverStaleEndedChirho();
		expect([tuningChirho.paused, controlsChirho.paused]).toEqual([true, true]);
		soundsChirho.clickChirho?.();
		controlsChirho.deliverStaleEndedChirho();
		// Past both old ceilings, still inside the new click's own.
		waitChirho(1950);
		expect([controlsChirho.paused, controlsChirho.src]).toEqual([false, OPEN_CLICK_CHIRHO]);
		expect([tuningChirho.paused, tuningChirho.plays_chirho.length]).toEqual([true, 1]);
		expect(controlsChirho.plays_chirho).toHaveLength(2);
	});

	it('silences everything for good when disposed', () => {
		const { soundsChirho, tuningChirho, controlsChirho } = radioSoundsChirho();
		soundsChirho.startChirho();
		soundsChirho.clickChirho?.();
		soundsChirho.disposeChirho();
		soundsChirho.silenceChirho?.();
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

	it('gives knob steps closer than 60 ms one shared tick, even once that tick has ended', () => {
		const { soundsChirho, controlsChirho, waitChirho } = radioSoundsChirho();
		soundsChirho.knobChirho?.();
		waitChirho(20);
		controlsChirho.finishChirho();
		waitChirho(10);
		soundsChirho.knobChirho?.();
		expect(controlsChirho.plays_chirho).toHaveLength(1);
		waitChirho(40);
		soundsChirho.knobChirho?.();
		expect(controlsChirho.plays_chirho).toEqual([
			{ src_chirho: OPEN_KNOB_CHIRHO, time_chirho: 0 },
			{ src_chirho: OPEN_KNOB_CHIRHO, time_chirho: 0 }
		]);
	});

	it('lets a tick under way finish before a knob step sounds again, however slow it is to start', () => {
		const { soundsChirho, controlsChirho, waitChirho } = radioSoundsChirho();
		soundsChirho.knobChirho?.();
		// Steps while the first tick is still under way, as while a slow engine's clock has not
		// started: none of them may restart it.
		for (const gapChirho of [70, 70, 300, 1000]) {
			waitChirho(gapChirho);
			soundsChirho.knobChirho?.();
		}
		expect(controlsChirho.plays_chirho).toHaveLength(1);
		expect([controlsChirho.paused, controlsChirho.src]).toEqual([false, OPEN_KNOB_CHIRHO]);
		controlsChirho.finishChirho();
		soundsChirho.knobChirho?.();
		expect(controlsChirho.plays_chirho).toHaveLength(2);
		expect(controlsChirho.paused).toBe(false);
	});

	it('drops knob steps while a stalled tick waits, and loads it afresh once its ceiling lets it go', () => {
		const { soundsChirho, controlsChirho, waitChirho } = radioSoundsChirho();
		controlsChirho.next_play_chirho = 'hold';
		soundsChirho.knobChirho?.();
		waitChirho(1999);
		soundsChirho.knobChirho?.();
		expect(controlsChirho.plays_chirho).toHaveLength(1);
		waitChirho(1);
		expect([controlsChirho.paused, controlsChirho.src]).toEqual([true, '']);
		soundsChirho.knobChirho?.();
		expect(controlsChirho.plays_chirho.map((playChirho) => playChirho.src_chirho)).toEqual([
			OPEN_KNOB_CHIRHO,
			OPEN_KNOB_CHIRHO
		]);
		expect([controlsChirho.paused, controlsChirho.src]).toEqual([false, OPEN_KNOB_CHIRHO]);
	});

	it.each(['together', 'ended_first'] as const)(
		'starts the next tick as soon as the last one reaches its end, before its ended event (%s)',
		(orderChirho) => {
			const { soundsChirho, controlsChirho, waitChirho } = radioSoundsChirho();
			soundsChirho.knobChirho?.();
			waitChirho(150);
			controlsChirho.reachEndChirho(orderChirho);
			soundsChirho.knobChirho?.();
			expect(controlsChirho.plays_chirho).toHaveLength(2);
			expect(controlsChirho.paused).toBe(false);
		}
	);

	it.each(['refuse', 'broken'] as const)(
		'lets the next knob step play after the browser turns a tick down (%s)',
		async (outcomeChirho) => {
			const { soundsChirho, controlsChirho, waitChirho } = radioSoundsChirho();
			controlsChirho.next_play_chirho = outcomeChirho;
			soundsChirho.knobChirho?.();
			await settleChirho();
			waitChirho(70);
			soundsChirho.knobChirho?.();
			expect(controlsChirho.plays_chirho).toHaveLength(2);
			expect([controlsChirho.paused, controlsChirho.error]).toEqual([false, null]);
		}
	);

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

	it.each(['together', 'ended_first', 'interrupted by the browser'] as const)(
		'lets a knob step sound once a click has stopped, before any ended event arrives (%s)',
		(stopChirho) => {
			const { soundsChirho, controlsChirho, waitChirho } = radioSoundsChirho();
			soundsChirho.clickChirho?.();
			waitChirho(300);
			if (stopChirho === 'interrupted by the browser') controlsChirho.pause();
			else controlsChirho.reachEndChirho(stopChirho);
			soundsChirho.knobChirho?.();
			expect(controlsChirho.paused).toBe(false);
			expect(controlsChirho.plays_chirho.map((playChirho) => playChirho.src_chirho)).toEqual([
				OPEN_CLICK_CHIRHO,
				OPEN_KNOB_CHIRHO
			]);
		}
	);

	it.each(['together', 'ended_first'] as const)(
		'still keeps a click restarted in that gap from being cut, despite the late ended event (%s)',
		(orderChirho) => {
			const { soundsChirho, controlsChirho, waitChirho } = radioSoundsChirho();
			soundsChirho.clickChirho?.();
			waitChirho(300);
			controlsChirho.reachEndChirho(orderChirho);
			soundsChirho.clickChirho?.();
			controlsChirho.deliverStaleEndedChirho();
			waitChirho(60);
			soundsChirho.knobChirho?.();
			expect(controlsChirho.paused).toBe(false);
			expect(controlsChirho.plays_chirho.map((playChirho) => playChirho.src_chirho)).toEqual([
				OPEN_CLICK_CHIRHO,
				OPEN_CLICK_CHIRHO
			]);
		}
	);

	it('gives up on a stalled tuning cue 1.5 s and a stalled click 2 s after the request', () => {
		const { soundsChirho, tuningChirho, controlsChirho, waitChirho } = radioSoundsChirho();
		tuningChirho.next_play_chirho = 'hold';
		controlsChirho.next_play_chirho = 'hold';
		soundsChirho.startChirho();
		soundsChirho.clickChirho?.();
		waitChirho(1499);
		expect([tuningChirho.paused, tuningChirho.src]).toEqual([
			false,
			tuningChirho.plays_chirho[0].src_chirho
		]);
		waitChirho(1);
		expect([tuningChirho.paused, tuningChirho.src]).toEqual([true, '']);
		waitChirho(499);
		expect([controlsChirho.paused, controlsChirho.src]).toEqual([false, OPEN_CLICK_CHIRHO]);
		waitChirho(1);
		expect([controlsChirho.paused, controlsChirho.src]).toEqual([true, '']);
	});

	it("switches to the site's profile once it arrives, asking only once", async () => {
		const fetchChirho = answeringChirho(LICENSED_CHIRHO);
		const { soundsChirho, tuningChirho, controlsChirho } = radioSoundsChirho(fetchChirho);
		await settleChirho();
		soundsChirho.startChirho();
		soundsChirho.knobChirho?.();
		expect(tuningChirho.src).toBe(LICENSED_CHIRHO.tuning_chirho[0].url_chirho);
		expect(controlsChirho.src).toBe(LICENSED_CHIRHO.knob_chirho[0].url_chirho);
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
