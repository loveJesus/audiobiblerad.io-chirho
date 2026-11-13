// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { describe, expect, it } from 'vitest';
import { BOOKS_CHIRHO, STATIONS_CHIRHO } from '$lib/catalogue-chirho/catalogue_chirho';
import {
	PREFERENCES_KEY_CHIRHO,
	defaultPreferencesChirho,
	readPreferencesChirho,
	type FollowedPlaceChirho,
	type PlayerPreferencesChirho,
	type PreferenceStorageChirho
} from './player_preferences_chirho';

// Whichever stations the catalogue holds: these tests name none of them.
const [firstStationChirho, secondStationChirho] = STATIONS_CHIRHO;
const johnChirho = BOOKS_CHIRHO.find((bookChirho) => bookChirho.id_chirho === 'JHN')!;

const SAVED_BEFORE_CHIRHO: PlayerPreferencesChirho = {
	station_id_chirho: secondStationChirho.id_chirho,
	book_id_chirho: 'PSA',
	chapter_chirho: 23,
	seconds_chirho: 41.5,
	sounds_enabled_chirho: false
};

const FOLLOWED_CHIRHO: FollowedPlaceChirho = {
	station_id_chirho: firstStationChirho.id_chirho,
	book_id_chirho: 'JHN',
	chapter_chirho: 3,
	seconds_chirho: 250.25,
	duration_chirho: 410,
	verse_chirho: 16,
	verse_fraction_chirho: 0.4
};

function storageHoldingChirho(savedChirho: unknown): PreferenceStorageChirho {
	const rawChirho = typeof savedChirho === 'string' ? savedChirho : JSON.stringify(savedChirho);
	return {
		getItem: (keyChirho) => (keyChirho === PREFERENCES_KEY_CHIRHO ? rawChirho : null),
		setItem: () => undefined
	};
}

function readChirho(savedChirho: unknown): PlayerPreferencesChirho {
	return readPreferencesChirho(storageHoldingChirho(savedChirho)).preferences_chirho;
}

describe('reading saved preferences', () => {
	it('keeps bounded dynamic station hints without trusting a saved station object or address', () => {
		const dynamicChirho = {
			...SAVED_BEFORE_CHIRHO,
			station_id_chirho: 'davar-test-station',
			language_code_chirho: 'hi',
			dial_language_chirho: 'hi',
			followed_place_chirho: {
				...FOLLOWED_CHIRHO,
				station_id_chirho: 'davar-other-station',
				language_code_chirho: 'sw'
			}
		};
		expect(
			readChirho({
				...dynamicChirho,
				url_chirho: 'https://untrusted.example/audio.mp3',
				station_chirho: {}
			})
		).toEqual(dynamicChirho);
		for (const languageChirho of [
			'../hi',
			'//evil.test',
			'hi?file=1',
			'h'.repeat(40),
			'HI',
			'',
			null
		]) {
			expect(
				readChirho({ ...dynamicChirho, language_code_chirho: languageChirho }).station_id_chirho
			).toBe(firstStationChirho.id_chirho);
		}
		expect(
			readChirho({ ...dynamicChirho, station_id_chirho: 'x'.repeat(161) }).station_id_chirho
		).toBe(firstStationChirho.id_chirho);
		expect(readChirho({ ...dynamicChirho, dial_language_chirho: 'ru' })).not.toHaveProperty(
			'dial_language_chirho'
		);
		expect(readChirho({ ...SAVED_BEFORE_CHIRHO, dial_language_chirho: 'zz' })).not.toHaveProperty(
			'dial_language_chirho'
		);
	});
	it('starts from the defaults when nothing can be read, and says whether storage works', () => {
		expect(readPreferencesChirho(null)).toEqual({
			preferences_chirho: defaultPreferencesChirho(),
			available_chirho: false
		});
		const deniedChirho: PreferenceStorageChirho = {
			getItem: () => {
				throw new Error('denied');
			},
			setItem: () => undefined
		};
		expect(readPreferencesChirho(deniedChirho)).toEqual({
			preferences_chirho: defaultPreferencesChirho(),
			available_chirho: false
		});
		const emptyChirho: PreferenceStorageChirho = { getItem: () => null, setItem: () => undefined };
		expect(readPreferencesChirho(emptyChirho)).toEqual({
			preferences_chirho: defaultPreferencesChirho(),
			available_chirho: true
		});
	});

	it('reads preferences saved before the followed place existed, exactly as before', () => {
		const readBackChirho = readChirho(SAVED_BEFORE_CHIRHO);
		expect(readBackChirho).toEqual(SAVED_BEFORE_CHIRHO);
		expect(readBackChirho).not.toHaveProperty('followed_place_chirho');
	});

	it('falls back to the defaults for what is not JSON, not an object, or too long', () => {
		for (const brokenChirho of ['{not json', '"a string"', '7', 'null']) {
			expect(readChirho(brokenChirho)).toEqual(defaultPreferencesChirho());
		}
		// The cap holds even when every field inside is valid.
		const paddedChirho = JSON.stringify({
			...SAVED_BEFORE_CHIRHO,
			padding_chirho: 'x'.repeat(2048)
		});
		expect(readChirho(paddedChirho)).toEqual(defaultPreferencesChirho());
	});
});

describe('reading the followed place', () => {
	it('reads a valid followed place beside the preferences, each on its own terms', () => {
		expect(readChirho({ ...SAVED_BEFORE_CHIRHO, followed_place_chirho: FOLLOWED_CHIRHO })).toEqual({
			...SAVED_BEFORE_CHIRHO,
			followed_place_chirho: FOLLOWED_CHIRHO
		});
	});

	it('accepts the edges of every range', () => {
		const edgesChirho: Partial<FollowedPlaceChirho>[] = [
			{ chapter_chirho: 1 },
			{ chapter_chirho: johnChirho.chapters_chirho },
			{ seconds_chirho: 0 },
			{ seconds_chirho: 86_400 },
			{ duration_chirho: 0 },
			{ duration_chirho: 86_400 },
			{ verse_chirho: null },
			{ verse_chirho: 1 },
			{ verse_chirho: 1000 },
			{ verse_fraction_chirho: 0 },
			{ verse_fraction_chirho: 1 }
		];
		for (const edgeChirho of edgesChirho) {
			const placeChirho = { ...FOLLOWED_CHIRHO, ...edgeChirho };
			expect(
				readChirho({ ...SAVED_BEFORE_CHIRHO, followed_place_chirho: placeChirho })
					.followed_place_chirho,
				JSON.stringify(edgeChirho)
			).toEqual(placeChirho);
		}
	});

	it('drops a followed place with any field that is not valid, and keeps the preferences beside it', () => {
		const badFieldsChirho: Record<string, unknown>[] = [
			{ station_id_chirho: 'no-such-station' },
			{ station_id_chirho: '__proto__' },
			{ station_id_chirho: 7 },
			{ book_id_chirho: 'XXX' },
			{ book_id_chirho: 'jhn' },
			{ chapter_chirho: 0 },
			{ chapter_chirho: johnChirho.chapters_chirho + 1 },
			{ chapter_chirho: 2.5 },
			{ chapter_chirho: '3' },
			{ seconds_chirho: -1 },
			{ seconds_chirho: 86_401 },
			{ seconds_chirho: '250' },
			{ seconds_chirho: null },
			{ duration_chirho: -0.5 },
			{ duration_chirho: 86_401 },
			{ duration_chirho: 'long' },
			{ verse_chirho: 0 },
			{ verse_chirho: 1001 },
			{ verse_chirho: 16.5 },
			{ verse_chirho: '16' },
			{ verse_fraction_chirho: -0.01 },
			{ verse_fraction_chirho: 1.01 },
			{ verse_fraction_chirho: '0.4' },
			{ verse_fraction_chirho: null }
		];
		for (const badFieldChirho of badFieldsChirho) {
			const readBackChirho = readChirho({
				...SAVED_BEFORE_CHIRHO,
				followed_place_chirho: { ...FOLLOWED_CHIRHO, ...badFieldChirho }
			});
			expect(readBackChirho, JSON.stringify(badFieldChirho)).toEqual(SAVED_BEFORE_CHIRHO);
		}
	});

	it('drops a followed place with a field missing', () => {
		for (const fieldChirho of Object.keys(FOLLOWED_CHIRHO)) {
			const partialChirho: Record<string, unknown> = { ...FOLLOWED_CHIRHO };
			delete partialChirho[fieldChirho];
			expect(
				readChirho({ ...SAVED_BEFORE_CHIRHO, followed_place_chirho: partialChirho }),
				fieldChirho
			).toEqual(SAVED_BEFORE_CHIRHO);
		}
	});

	it('drops a followed place that is not an object, or holds numbers JSON cannot carry', () => {
		for (const strangerChirho of [null, 'JHN 3', 3, true, [], [FOLLOWED_CHIRHO]]) {
			expect(
				readChirho({ ...SAVED_BEFORE_CHIRHO, followed_place_chirho: strangerChirho }),
				JSON.stringify(strangerChirho)
			).toEqual(SAVED_BEFORE_CHIRHO);
		}
		// JSON writes NaN and Infinity as null, which is not a time.
		for (const unsayableChirho of [Number.NaN, Number.POSITIVE_INFINITY]) {
			expect(
				readChirho({
					...SAVED_BEFORE_CHIRHO,
					followed_place_chirho: { ...FOLLOWED_CHIRHO, seconds_chirho: unsayableChirho }
				})
			).toEqual(SAVED_BEFORE_CHIRHO);
		}
	});

	it('keeps only the fields it knows, so nothing else that was stored rides along', () => {
		// Written out as text, so that the stored object really has a key named __proto__.
		const savedChirho = JSON.stringify({
			...SAVED_BEFORE_CHIRHO,
			followed_place_chirho: { ...FOLLOWED_CHIRHO, extra_chirho: 'x' }
		}).replace('"extra_chirho":"x"', '"extra_chirho":"x","__proto__":{"sly_chirho":1}');
		expect(savedChirho).toContain('"__proto__"');

		const followedChirho = readChirho(savedChirho).followed_place_chirho;
		expect(followedChirho).toEqual(FOLLOWED_CHIRHO);
		expect(Object.keys(followedChirho!).sort()).toEqual(Object.keys(FOLLOWED_CHIRHO).sort());
		expect(Object.getPrototypeOf(followedChirho)).toBe(Object.prototype);
		expect(followedChirho).not.toHaveProperty('sly_chirho');
	});

	it('keeps a valid followed place when the preferences beside it are not valid', () => {
		const readBackChirho = readChirho({
			station_id_chirho: 'no-such-station',
			book_id_chirho: 'XXX',
			chapter_chirho: 99,
			seconds_chirho: -5,
			sounds_enabled_chirho: 'yes',
			followed_place_chirho: FOLLOWED_CHIRHO
		});
		expect(readBackChirho).toEqual({
			...defaultPreferencesChirho(),
			followed_place_chirho: FOLLOWED_CHIRHO
		});
	});
});
