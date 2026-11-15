// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { existsSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import {
	OPEN_SOUND_PROFILE_CHIRHO,
	SOUND_PROFILE_PATH_CHIRHO,
	SOUND_PROFILE_SCHEMA_CHIRHO,
	fetchSoundProfileChirho,
	parseSoundProfileChirho
} from './sound_profile_chirho';

const STATIC_URL_CHIRHO = new URL('../../../static', import.meta.url);

function profileWithChirho(changesChirho: Record<string, unknown>): Record<string, unknown> {
	return {
		schema_chirho: SOUND_PROFILE_SCHEMA_CHIRHO,
		source_chirho: 'licensed',
		tuning_chirho: [
			{ url_chirho: '/sounds-chirho/licensed-chirho/tuning-chirho/radio_01_chirho.wav' }
		],
		click_chirho: [],
		knob_chirho: [],
		...changesChirho
	};
}

function answeringChirho(bodyChirho: string, statusChirho = 200): typeof fetch {
	return vi.fn(
		async () => new Response(bodyChirho, { status: statusChirho })
	) as unknown as typeof fetch;
}

describe('sound profile', () => {
	it('accepts the open set, which names only files kept in the repository', () => {
		expect(parseSoundProfileChirho(OPEN_SOUND_PROFILE_CHIRHO)).toEqual(OPEN_SOUND_PROFILE_CHIRHO);
		const { tuning_chirho, click_chirho, knob_chirho } = OPEN_SOUND_PROFILE_CHIRHO;
		const missingChirho = [...tuning_chirho, ...click_chirho, ...knob_chirho]
			.map((clipChirho) => clipChirho.url_chirho)
			.filter((urlChirho) => !existsSync(new URL(`.${urlChirho}`, `${STATIC_URL_CHIRHO.href}/`)));
		expect(missingChirho).toEqual([]);
	});

	it('refuses any path that could leave this site or its sound folder', () => {
		for (const urlChirho of [
			'https://example.com/sounds-chirho/a_chirho.wav',
			'//example.com/sounds-chirho/a_chirho.wav',
			'/sounds-chirho/../private-chirho/a_chirho.wav',
			'/sounds-chirho//a_chirho.wav',
			'/sounds-chirho/a_chirho.wav?x=1',
			'/sounds-chirho/a_chirho.wav#t=1',
			'/sounds-chirho/A_CHIRHO.WAV',
			'/other-chirho/a_chirho.wav',
			'/sounds-chirho/a_chirho.mp3',
			'javascript:alert(1)'
		])
			expect(
				parseSoundProfileChirho(profileWithChirho({ tuning_chirho: [{ url_chirho: urlChirho }] })),
				urlChirho
			).toBeNull();
	});

	it('refuses a profile of the wrong shape, size or timing', () => {
		const clipChirho = { url_chirho: '/sounds-chirho/a_chirho.wav' };
		for (const changesChirho of [
			{ schema_chirho: 'radio-sounds-profile-v0-chirho' },
			{ source_chirho: 'somewhere' },
			{ tuning_chirho: [] },
			{ tuning_chirho: Array.from({ length: 17 }, () => clipChirho) },
			{ click_chirho: Array.from({ length: 5 }, () => clipChirho) },
			{ knob_chirho: [{ ...clipChirho, start_seconds_chirho: -1 }] },
			{ knob_chirho: [{ ...clipChirho, start_seconds_chirho: 11 }] },
			{ knob_chirho: [{ ...clipChirho, start_seconds_chirho: '0.9' }] },
			{ click_chirho: 'all of them' }
		])
			expect(
				parseSoundProfileChirho(profileWithChirho(changesChirho)),
				JSON.stringify(changesChirho)
			).toBeNull();
		for (const valueChirho of [null, 'profile', [], 3])
			expect(parseSoundProfileChirho(valueChirho)).toBeNull();
	});

	it('asks this site once, without trusting a cached copy unchecked', async () => {
		const fetchChirho = answeringChirho(JSON.stringify(profileWithChirho({})));
		const foundChirho = await fetchSoundProfileChirho(fetchChirho);
		expect(foundChirho?.source_chirho).toBe('licensed');
		expect(fetchChirho).toHaveBeenCalledTimes(1);
		expect(fetchChirho).toHaveBeenCalledWith(SOUND_PROFILE_PATH_CHIRHO, { cache: 'no-cache' });
	});

	it('answers null rather than throwing when the request fails in any way', async () => {
		const failingChirho = vi.fn(async () => {
			throw new TypeError('offline');
		}) as unknown as typeof fetch;
		expect(await fetchSoundProfileChirho(failingChirho)).toBeNull();
		expect(await fetchSoundProfileChirho(answeringChirho('{}', 404))).toBeNull();
		expect(await fetchSoundProfileChirho(answeringChirho('not json'))).toBeNull();
		expect(
			await fetchSoundProfileChirho(
				answeringChirho(JSON.stringify(profileWithChirho({ padding_chirho: 'x'.repeat(9000) })))
			)
		).toBeNull();
	});
});
