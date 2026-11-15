// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { describe, expect, it } from 'vitest';
import { STATIONS_CHIRHO } from '$lib/catalogue-chirho/catalogue_chirho';
import { initialStationChirho, matchBrowserLanguageChirho } from './initial_station_chirho';

describe('first-visit language and recording', () => {
	it('uses browser preference order, exact tags first, then their supported parents', () => {
		expect(matchBrowserLanguageChirho(['xx-XX', 'es-MX', 'en'], ['en', 'es'])).toBe('es');
		expect(matchBrowserLanguageChirho(['zh-Hant-HK'], ['zh', 'zh-hant'])).toBe('zh-hant');
		expect(matchBrowserLanguageChirho(['en-US'], ['en-us', 'en'])).toBe('en-us');
		expect(matchBrowserLanguageChirho(['../bad', ''], ['en'])).toBeUndefined();
	});
	it('keeps all recordings available while preferring a documented male default in the chosen English version', () => {
		const stationsChirho = STATIONS_CHIRHO.filter(
			(stationChirho) => stationChirho.language_code_chirho === 'en'
		);
		const countChirho = stationsChirho.length;
		expect(initialStationChirho(stationsChirho, 'en', () => 0)?.id_chirho).toBe(
			'helloao-bsb-souer'
		);
		expect(stationsChirho.length).toBe(countChirho);
	});
	it('uses available recordings when no narrator preference is documented, without inventing a gender', () => {
		const stationsChirho = STATIONS_CHIRHO.filter(
			(stationChirho) => stationChirho.language_code_chirho === 'hi'
		);
		expect(initialStationChirho(stationsChirho, 'hi')).toBe(stationsChirho[0]);
		expect(initialStationChirho([], 'hi')).toBeUndefined();
	});
});
