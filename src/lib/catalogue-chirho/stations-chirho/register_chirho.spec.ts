// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { STATIONS_CHIRHO } from '../catalogue_chirho';
import { makeStationFixtureChirho } from '../locate-chirho/station_fixture_chirho';
import { HELD_STATIONS_CHIRHO } from './held_stations_chirho';
import { renderStationRegisterChirho } from './register_chirho';

const REGISTER_URL_CHIRHO = new URL(
	'../../../../spec-chirho/sources-chirho/station_register_chirho.md',
	import.meta.url
);

describe('the station register', () => {
	it('is on record for exactly the stations that ship and the ones held back', async () => {
		// A station ships only when its licence and credit are on record. If this fails, run
		// `bun scripts-chirho/catalogue-chirho/write_station_register_chirho.ts` and read what
		// changed before committing it.
		const onRecordChirho = await readFile(REGISTER_URL_CHIRHO, 'utf8');
		expect(onRecordChirho).toBe(renderStationRegisterChirho(STATIONS_CHIRHO, HELD_STATIONS_CHIRHO));
	});

	it('states the licence, where it was read, and the credit for every station', () => {
		const pageChirho = renderStationRegisterChirho(STATIONS_CHIRHO, HELD_STATIONS_CHIRHO);
		for (const stationChirho of STATIONS_CHIRHO) {
			expect(pageChirho).toContain(`### ${stationChirho.id_chirho}\n`);
			expect(pageChirho).toContain(stationChirho.licence_url_chirho);
			expect(pageChirho).toContain(
				`${stationChirho.licence_evidence_url_chirho} on ${stationChirho.licence_read_on_chirho}`
			);
			expect(pageChirho).toContain(`- Credit shown: ${stationChirho.credit_chirho}\n`);
		}
		expect(STATIONS_CHIRHO.length).toBeGreaterThan(0);
	});

	it('says so plainly when the maker names no reader or does not say what kind of voice it is', () => {
		const pageChirho = renderStationRegisterChirho([
			makeStationFixtureChirho(
				{ JHN: [[1, 21]] },
				{ voice_chirho: '', voice_kind_chirho: 'unknown' }
			)
		]);
		expect(pageChirho).toContain('- Voice: not named by the maker (kind not stated by the maker)');
		expect(pageChirho).toContain('- Chapters: 21 of 1,189, measured 2026-11-13');
	});

	it('groups stations under their language and counts both', () => {
		const pageChirho = renderStationRegisterChirho([
			makeStationFixtureChirho({ JHN: [[1, 21]] }, { id_chirho: 'one' }),
			makeStationFixtureChirho(
				{ JHN: [[1, 21]] },
				{ id_chirho: 'two', language_name_chirho: 'हिन्दी', language_english_chirho: 'Hindi' }
			),
			makeStationFixtureChirho({ JHN: [[1, 21]] }, { id_chirho: 'three' })
		]);
		expect(pageChirho).toContain('3 stations play, in 2 languages.\n');
		expect(pageChirho).not.toContain('Held back');
		expect(pageChirho.indexOf('## English')).toBeLessThan(pageChirho.indexOf('### one'));
		expect(pageChirho.indexOf('### three')).toBeLessThan(pageChirho.indexOf('## Hindi (हिन्दी)'));
		expect(pageChirho.indexOf('## Hindi (हिन्दी)')).toBeLessThan(pageChirho.indexOf('### two'));
	});

	it('lists a held station apart from the ones that play, with its reason and no credit line', () => {
		const pageChirho = renderStationRegisterChirho(
			[makeStationFixtureChirho({ JHN: [[1, 21]] }, { id_chirho: 'playing' })],
			[
				{
					station_chirho: makeStationFixtureChirho({ JHN: [[1, 21]] }, { id_chirho: 'waiting' }),
					reason_chirho: 'The owner has not decided.'
				}
			]
		);
		expect(pageChirho).toContain(
			'1 station plays, in 1 language. 1 more is held back, at the end.\n'
		);
		const heldAtChirho = pageChirho.indexOf('## Held back');
		expect(heldAtChirho).toBeGreaterThan(pageChirho.indexOf('### playing'));
		expect(pageChirho.indexOf('### waiting')).toBeGreaterThan(heldAtChirho);
		expect(pageChirho).toContain('- Held because: The owner has not decided.\n');
		expect(pageChirho.slice(heldAtChirho)).not.toContain('Credit shown');
	});
});
