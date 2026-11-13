// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// What must hold for every station that ships, whichever stations those are. These tests walk
// the real catalogue; they do not name its stations, so adding one needs no change here.

import { describe, expect, it } from 'vitest';
import {
	BOOKS_CHIRHO,
	CATALOGUE_CHIRHO,
	CATALOGUE_CONTRACT_VERSION_CHIRHO,
	STATIONS_CHIRHO,
	findStationChirho,
	nextChapterChirho,
	resolveChapterChirho,
	type StationChirho
} from './catalogue_chirho';
import { countChaptersChirho } from './stations-chirho/coverage_chirho';
import { HELD_STATIONS_CHIRHO } from './stations-chirho/held_stations_chirho';
import {
	STATION_SOURCES_CHIRHO,
	allDraftsOfChirho
} from './stations-chirho/station_sources_chirho';

const DAY_PATTERN_CHIRHO = /^\d{4}-\d{2}-\d{2}$/;

function isSecureAddressChirho(valueChirho: string): boolean {
	return (
		URL.canParse(valueChirho) &&
		new URL(valueChirho).protocol === 'https:' &&
		!/[{}\s]/.test(valueChirho) &&
		// A browser reports the parsed form of an address as an audio element's `currentSrc`, and
		// the web player matches media events against the address it was given. An address that
		// parsing would change (a space, an upper-case host) would play and never be heard from.
		new URL(valueChirho).href === valueChirho
	);
}

function everyChapterOfChirho(stationChirho: StationChirho): [string, number][] {
	const placesChirho: [string, number][] = [];
	for (const bookChirho of BOOKS_CHIRHO) {
		for (const [firstChirho, lastChirho] of stationChirho.coverage_chirho[bookChirho.id_chirho] ??
			[]) {
			for (let chapterChirho = firstChirho; chapterChirho <= lastChirho; chapterChirho += 1) {
				placesChirho.push([bookChirho.id_chirho, chapterChirho]);
			}
		}
	}
	return placesChirho;
}

describe('the shipped catalogue', () => {
	it('has stations to play', () => {
		expect(STATIONS_CHIRHO.length).toBeGreaterThan(0);
	});

	it('gives every station its own id, and finds each station by it', () => {
		const idsChirho = STATIONS_CHIRHO.map((stationChirho) => stationChirho.id_chirho);
		expect(new Set(idsChirho).size).toBe(idsChirho.length);
		for (const stationChirho of STATIONS_CHIRHO) {
			expect(stationChirho.id_chirho).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
			expect(findStationChirho(stationChirho.id_chirho)).toBe(stationChirho);
		}
		expect(findStationChirho('no-such-station')).toBeUndefined();
		expect(findStationChirho(null)).toBeUndefined();
	});

	it('ships no station without its licence, its credit and where the licence was read', () => {
		for (const stationChirho of STATIONS_CHIRHO) {
			const whoChirho = stationChirho.id_chirho;
			expect(stationChirho.licence_id_chirho, whoChirho).not.toBe('');
			expect(stationChirho.licence_name_chirho, whoChirho).not.toBe('');
			expect(stationChirho.credit_chirho.trim(), whoChirho).not.toBe('');
			expect(isSecureAddressChirho(stationChirho.licence_url_chirho), whoChirho).toBe(true);
			expect(isSecureAddressChirho(stationChirho.licence_evidence_url_chirho), whoChirho).toBe(
				true
			);
			expect(stationChirho.licence_read_on_chirho, whoChirho).toMatch(DAY_PATTERN_CHIRHO);
			expect(stationChirho.source_name_chirho, whoChirho).not.toBe('');
			expect(isSecureAddressChirho(stationChirho.source_url_chirho), whoChirho).toBe(true);
		}
	});

	it('says for every station what language and version it is and what kind of voice reads it', () => {
		for (const stationChirho of STATIONS_CHIRHO) {
			const whoChirho = stationChirho.id_chirho;
			expect(stationChirho.language_code_chirho, whoChirho).toMatch(/^[a-z]{2,3}(-[A-Za-z0-9]+)*$/);
			expect(stationChirho.language_name_chirho, whoChirho).not.toBe('');
			expect(stationChirho.language_english_chirho, whoChirho).not.toBe('');
			expect(stationChirho.version_chirho, whoChirho).not.toBe('');
			expect(stationChirho.version_code_chirho, whoChirho).not.toBe('');
			expect(['human', 'synthetic', 'unknown'], whoChirho).toContain(
				stationChirho.voice_kind_chirho
			);
		}
	});

	it('ships only stations whose chapters were measured, and counts them truthfully', () => {
		for (const stationChirho of STATIONS_CHIRHO) {
			const whoChirho = stationChirho.id_chirho;
			expect(stationChirho.coverage_checked_on_chirho, whoChirho).toMatch(DAY_PATTERN_CHIRHO);
			expect(stationChirho.chapter_count_chirho, whoChirho).toBeGreaterThan(0);
			expect(stationChirho.chapter_count_chirho, whoChirho).toBe(
				countChaptersChirho(stationChirho.coverage_chirho)
			);
			expect(everyChapterOfChirho(stationChirho), whoChirho).toHaveLength(
				stationChirho.chapter_count_chirho
			);
		}
	});

	it('resolves every measured chapter to a secure, complete address, held stations included', () => {
		const measuredChirho = [
			...STATIONS_CHIRHO,
			...HELD_STATIONS_CHIRHO.map((heldChirho) => heldChirho.station_chirho)
		];
		for (const stationChirho of measuredChirho) {
			const addressesChirho = new Set<string>();
			for (const [bookChirho, chapterChirho] of everyChapterOfChirho(stationChirho)) {
				const whereChirho = `${stationChirho.id_chirho} ${bookChirho} ${chapterChirho}`;
				const audioChirho = resolveChapterChirho(stationChirho, bookChirho, chapterChirho);
				expect(audioChirho, whereChirho).not.toBeNull();
				expect(isSecureAddressChirho(audioChirho!.url_chirho), whereChirho).toBe(true);
				addressesChirho.add(audioChirho!.url_chirho);
				expect(audioChirho!.timings_url_chirho !== undefined, whereChirho).toBe(
					stationChirho.has_timings_chirho
				);
				if (audioChirho!.timings_url_chirho !== undefined) {
					expect(isSecureAddressChirho(audioChirho!.timings_url_chirho), whereChirho).toBe(true);
				}
			}
			// Two chapters never share an address.
			expect(addressesChirho.size, stationChirho.id_chirho).toBe(
				stationChirho.chapter_count_chirho
			);
		}
	});

	it('plays on from any chapter of any station', () => {
		for (const stationChirho of STATIONS_CHIRHO) {
			for (const [bookChirho, chapterChirho] of everyChapterOfChirho(stationChirho)) {
				const nextChirho = nextChapterChirho(stationChirho, bookChirho, chapterChirho);
				expect(
					nextChirho,
					`${stationChirho.id_chirho} ${bookChirho} ${chapterChirho}`
				).not.toBeNull();
				expect(
					resolveChapterChirho(
						stationChirho,
						nextChirho!.book_id_chirho,
						nextChirho!.chapter_chirho
					)
				).not.toBeNull();
			}
		}
	});

	it('keeps each source and its coverage file together', () => {
		for (const sourceChirho of STATION_SOURCES_CHIRHO) {
			expect(sourceChirho.coverage_file_chirho.source_id_chirho).toBe(
				sourceChirho.source_id_chirho
			);
			const draftsChirho = allDraftsOfChirho(sourceChirho);
			for (const draftChirho of draftsChirho) {
				expect(draftChirho.source_id_chirho, draftChirho.id_chirho).toBe(
					sourceChirho.source_id_chirho
				);
			}
			// No coverage is on file for a station that is not defined.
			const draftIdsChirho = new Set(draftsChirho.map((draftChirho) => draftChirho.id_chirho));
			for (const stationIdChirho of Object.keys(
				sourceChirho.coverage_file_chirho.stations_chirho
			)) {
				expect(draftIdsChirho, sourceChirho.source_id_chirho).toContain(stationIdChirho);
			}
		}
	});

	it('gives no player a station that is held back, and says why each is held', () => {
		const playingIdsChirho = new Set(
			STATIONS_CHIRHO.map((stationChirho) => stationChirho.id_chirho)
		);
		const heldIdsChirho = HELD_STATIONS_CHIRHO.map(
			(heldChirho) => heldChirho.station_chirho.id_chirho
		);
		expect(new Set(heldIdsChirho).size).toBe(heldIdsChirho.length);
		for (const heldChirho of HELD_STATIONS_CHIRHO) {
			const idChirho = heldChirho.station_chirho.id_chirho;
			expect(playingIdsChirho, idChirho).not.toContain(idChirho);
			expect(findStationChirho(idChirho), idChirho).toBeUndefined();
			expect(heldChirho.reason_chirho.trim().length, idChirho).toBeGreaterThan(20);
			expect(JSON.stringify(CATALOGUE_CHIRHO), idChirho).not.toContain(`"${idChirho}"`);
		}
		expect(STATIONS_CHIRHO.length).toBeGreaterThan(0);
	});
});

describe('the catalogue as plain data', () => {
	it('survives being written out as JSON and read back', () => {
		expect(JSON.parse(JSON.stringify(CATALOGUE_CHIRHO))).toEqual(CATALOGUE_CHIRHO);
	});

	it('carries the contract version, the books, the stations and complete book code lists', () => {
		expect(CATALOGUE_CHIRHO.contract_version_chirho).toBe(CATALOGUE_CONTRACT_VERSION_CHIRHO);
		expect(CATALOGUE_CHIRHO.books_chirho).toBe(BOOKS_CHIRHO);
		expect(CATALOGUE_CHIRHO.stations_chirho).toBe(STATIONS_CHIRHO);
		for (const codesChirho of Object.values(CATALOGUE_CHIRHO.book_code_schemes_chirho)) {
			expect(codesChirho).toHaveLength(BOOKS_CHIRHO.length);
			expect(new Set(codesChirho).size).toBe(BOOKS_CHIRHO.length);
		}
	});

	it('names only book code lists that exist', () => {
		for (const stationChirho of STATIONS_CHIRHO) {
			const locatorChirho = stationChirho.locator_chirho;
			const schemeChirho =
				locatorChirho.kind_chirho === 'pattern' ? locatorChirho.book_codes_chirho : undefined;
			if (schemeChirho !== undefined) {
				expect(Object.keys(CATALOGUE_CHIRHO.book_code_schemes_chirho)).toContain(schemeChirho);
			}
		}
		expect(STATIONS_CHIRHO.length).toBeGreaterThan(0);
	});
});
