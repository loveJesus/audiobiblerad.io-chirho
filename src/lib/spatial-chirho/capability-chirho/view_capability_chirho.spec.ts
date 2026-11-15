// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	judgeRenderSamplesChirho,
	mayTryAutomatic3DChirho,
	readViewHintsChirho,
	type ViewHintsChirho
} from './view_capability_chirho';
import {
	VIEW_PREFERENCE_KEY_CHIRHO,
	readViewPreferenceChirho,
	rememberViewPreferenceChirho
} from './view_preferences_chirho';

const PLAIN_CHIRHO: ViewHintsChirho = {
	reduced_motion_chirho: false,
	save_data_chirho: false,
	small_display_chirho: false
};

function storageChirho(initialChirho: Record<string, string> = {}) {
	const valuesChirho = new Map(Object.entries(initialChirho));
	return {
		valuesChirho,
		getItem: (keyChirho: string) => valuesChirho.get(keyChirho) ?? null,
		setItem: (keyChirho: string, valueChirho: string) =>
			void valuesChirho.set(keyChirho, valueChirho)
	};
}

const refusingChirho = {
	getItem: (): string | null => {
		throw new Error('denied');
	},
	setItem: (): void => {
		throw new Error('quota');
	}
};

describe('the remembered view', () => {
	it('reads back what was remembered, and only the choice itself is stored', () => {
		const storedChirho = storageChirho();
		expect(rememberViewPreferenceChirho(storedChirho, 'three')).toBe(true);
		expect(readViewPreferenceChirho(storedChirho)).toBe('three');
		expect([...storedChirho.valuesChirho]).toEqual([[VIEW_PREFERENCE_KEY_CHIRHO, 'three']]);
	});

	it('reads auto when nothing, something else, or nothing readable is there', () => {
		expect(readViewPreferenceChirho(null)).toBe('auto');
		expect(readViewPreferenceChirho(storageChirho())).toBe('auto');
		expect(readViewPreferenceChirho(storageChirho({ [VIEW_PREFERENCE_KEY_CHIRHO]: '3d' }))).toBe(
			'auto'
		);
		expect(readViewPreferenceChirho(refusingChirho)).toBe('auto');
	});

	it('never throws on a write, and says when the choice could not be kept', () => {
		expect(rememberViewPreferenceChirho(null, 'simple')).toBe(false);
		expect(rememberViewPreferenceChirho(refusingChirho, 'simple')).toBe(false);
		const storedChirho = storageChirho();
		expect(rememberViewPreferenceChirho(storedChirho, 'bogus' as never)).toBe(false);
		expect(storedChirho.valuesChirho.size).toBe(0);
	});
});

describe('whether auto may try 3D', () => {
	it('tries when nothing rules it out, including when memory and cores are unknown', () => {
		expect(mayTryAutomatic3DChirho(PLAIN_CHIRHO)).toBe(true);
		expect(mayTryAutomatic3DChirho({ ...PLAIN_CHIRHO, memory_gb_chirho: 4, cores_chirho: 4 })).toBe(
			true
		);
	});

	it('stays simple for reduced motion, data saving, a watch-sized screen, or known small devices', () => {
		for (const hintsChirho of [
			{ ...PLAIN_CHIRHO, reduced_motion_chirho: true },
			{ ...PLAIN_CHIRHO, save_data_chirho: true },
			{ ...PLAIN_CHIRHO, small_display_chirho: true },
			{ ...PLAIN_CHIRHO, memory_gb_chirho: 2 },
			{ ...PLAIN_CHIRHO, cores_chirho: 2 }
		]) {
			expect(mayTryAutomatic3DChirho(hintsChirho), JSON.stringify(hintsChirho)).toBe(false);
		}
	});
});

describe('reading the hints', () => {
	afterEach(() => vi.unstubAllGlobals());

	it('knows nothing outside a browser', () => {
		vi.stubGlobal('navigator', undefined);
		vi.stubGlobal('screen', undefined);
		vi.stubGlobal('matchMedia', undefined);
		expect(readViewHintsChirho()).toEqual(PLAIN_CHIRHO);
	});

	it('reads what a browser offers', () => {
		vi.stubGlobal('navigator', {
			deviceMemory: 8,
			hardwareConcurrency: 10,
			connection: { saveData: true }
		});
		vi.stubGlobal('screen', { width: 184, height: 224 });
		vi.stubGlobal('matchMedia', (queryChirho: string) => ({
			matches: queryChirho.includes('reduce')
		}));
		expect(readViewHintsChirho()).toEqual({
			reduced_motion_chirho: true,
			save_data_chirho: true,
			small_display_chirho: true,
			memory_gb_chirho: 8,
			cores_chirho: 10
		});
	});

	it('treats broken or nonsense values as unknown, not as a small device', () => {
		vi.stubGlobal('navigator', { deviceMemory: 'lots', hardwareConcurrency: 0 });
		vi.stubGlobal('screen', { width: 0, height: Number.NaN });
		vi.stubGlobal('matchMedia', () => {
			throw new Error('not here');
		});
		const hintsChirho = readViewHintsChirho();
		expect(hintsChirho).toEqual(PLAIN_CHIRHO);
		expect(mayTryAutomatic3DChirho(hintsChirho)).toBe(true);
	});
});

describe('judging the real scene', () => {
	const steadyChirho = (countChirho: number, msChirho: number) =>
		Array.from({ length: countChirho }, () => msChirho);

	it('calls a steady 60 or 30 frames a second smooth', () => {
		expect(judgeRenderSamplesChirho(steadyChirho(40, 16.7)).smooth_chirho).toBe(true);
		expect(judgeRenderSamplesChirho(steadyChirho(40, 33)).smooth_chirho).toBe(true);
	});

	it('needs enough frames before it judges', () => {
		const resultChirho = judgeRenderSamplesChirho(steadyChirho(23, 16.7));
		expect(resultChirho.smooth_chirho).toBe(false);
		expect(resultChirho.median_ms_chirho).toBeCloseTo(16.7);
		expect(judgeRenderSamplesChirho([])).toEqual({
			smooth_chirho: false,
			median_ms_chirho: null,
			slow_fraction_chirho: 0
		});
	});

	it('is not smooth when slow in the middle, or when a fifth of frames stutter', () => {
		expect(judgeRenderSamplesChirho(steadyChirho(40, 40)).smooth_chirho).toBe(false);
		const stutteringChirho = [...steadyChirho(32, 16.7), ...steadyChirho(8, 60)];
		const resultChirho = judgeRenderSamplesChirho(stutteringChirho);
		expect(resultChirho.slow_fraction_chirho).toBeCloseTo(0.2);
		expect(resultChirho.smooth_chirho).toBe(false);
		const fewStuttersChirho = [...steadyChirho(33, 16.7), ...steadyChirho(7, 60)];
		expect(judgeRenderSamplesChirho(fewStuttersChirho).smooth_chirho).toBe(true);
	});

	it('ignores impossible intervals and weighs only the latest 60, past the setup frames', () => {
		const noisyChirho = [Number.NaN, Infinity, -5, 0, ...steadyChirho(30, 16.7)];
		expect(judgeRenderSamplesChirho(noisyChirho).smooth_chirho).toBe(true);
		const settlingChirho = [...steadyChirho(30, 200), ...steadyChirho(60, 16.7)];
		expect(judgeRenderSamplesChirho(settlingChirho)).toMatchObject({
			smooth_chirho: true,
			slow_fraction_chirho: 0
		});
	});
});
