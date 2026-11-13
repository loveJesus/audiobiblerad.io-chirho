// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// A station that arrives at run time is taken whole or not at all. These are the ways a
// damaged or hostile file could try to get a station played, and each must be refused.

import { describe, expect, it } from 'vitest';
import { resolveChapterChirho } from '../locate-chirho/locate_chirho';
import { makeStationFixtureChirho } from '../locate-chirho/station_fixture_chirho';
import { readStationChirho } from './station_reader_chirho';

const GOOD_CHIRHO = makeStationFixtureChirho({ JHN: [[1, 3]] });

function changedChirho(changesChirho: Record<string, unknown>): unknown {
	return { ...GOOD_CHIRHO, ...changesChirho };
}

describe('reading a station that arrived at run time', () => {
	it('takes a well-formed station as it is', () => {
		expect(readStationChirho(JSON.parse(JSON.stringify(GOOD_CHIRHO)))).toEqual(GOOD_CHIRHO);
	});

	it('counts the chapters itself and keeps only the fields the contract names', () => {
		const readChirho = readStationChirho(
			changedChirho({ chapter_count_chirho: 9999, extra_chirho: 'x' })
		);
		expect(readChirho?.chapter_count_chirho).toBe(3);
		expect(readChirho).not.toHaveProperty('extra_chirho');
	});

	it('refuses a station with no credit, no licence, or an unknown kind of voice', () => {
		for (const changesChirho of [
			{ credit_chirho: ' ' },
			{ credit_chirho: undefined },
			{ licence_name_chirho: '' },
			{ licence_id_chirho: 5 },
			{ voice_kind_chirho: 'robot' },
			{ id_chirho: 'Not An Id' },
			{ language_code_chirho: '../en' },
			{ licence_read_on_chirho: 'yesterday' }
		]) {
			expect(
				readStationChirho(changedChirho(changesChirho)),
				JSON.stringify(changesChirho)
			).toBeNull();
		}
	});

	it('refuses addresses that are not secure or not plain', () => {
		for (const addressChirho of [
			'http://source.example/',
			'javascript:alert(1)',
			'https://source.example/a b',
			'/licence',
			7
		]) {
			expect(
				readStationChirho(changedChirho({ licence_url_chirho: addressChirho })),
				String(addressChirho)
			).toBeNull();
		}
		const locatorChirho = (templateChirho: string) => ({
			locator_chirho: { kind_chirho: 'pattern', template_chirho: templateChirho }
		});
		expect(
			readStationChirho(changedChirho(locatorChirho('http://audio.example/{chapter_chirho}.mp3')))
		).toBeNull();
		expect(
			readStationChirho(changedChirho(locatorChirho('https://audio.example/{nonsense_chirho}.mp3')))
		).toBeNull();
		expect(
			readStationChirho(
				changedChirho(locatorChirho('https://audio.example/a b/{chapter_chirho}.mp3'))
			)
		).toBeNull();
	});

	it('refuses a locator it cannot fill, and one that claims verse timings', () => {
		expect(
			readStationChirho(
				changedChirho({ locator_chirho: { kind_chirho: 'index', files_chirho: {} } })
			)
		).toBeNull();
		expect(
			readStationChirho(
				changedChirho({
					locator_chirho: { ...GOOD_CHIRHO.locator_chirho, book_codes_chirho: 'constructor' }
				})
			)
		).toBeNull();
		expect(
			readStationChirho(
				changedChirho({ timings_chirho: { template_chirho: 'https://x.example/' } })
			)
		).toBeNull();
	});

	it('refuses a station with no real chapter, and drops chapters a book does not have', () => {
		expect(readStationChirho(changedChirho({ coverage_chirho: {} }))).toBeNull();
		expect(readStationChirho(changedChirho({ coverage_chirho: { XYZ: [[1, 2]] } }))).toBeNull();
		expect(
			readStationChirho(changedChirho({ coverage_chirho: { JHN: [[1, 2]], XYZ: [[1, 2]] } }))
				?.coverage_chirho
		).toEqual({
			JHN: [[1, 2]]
		});
	});

	it('honours a well-formed override and refuses the whole station for a bad one', () => {
		const withOverridesChirho = (overridesChirho: unknown) =>
			changedChirho({
				locator_chirho: { ...GOOD_CHIRHO.locator_chirho, overrides_chirho: overridesChirho }
			});
		const readChirho = readStationChirho(
			withOverridesChirho({ JHN: { '2': 'https://audio.example/odd%20name.mp3' } })
		);
		expect(resolveChapterChirho(readChirho!, 'JHN', 2)?.url_chirho).toBe(
			'https://audio.example/odd%20name.mp3'
		);
		expect(resolveChapterChirho(readChirho!, 'JHN', 1)?.url_chirho).toBe(
			'https://audio.example/JHN/1.mp3'
		);
		for (const overridesChirho of [
			{ JHN: { '2': 'http://audio.example/2.mp3' } },
			{ JHN: { '22': 'https://audio.example/22.mp3' } },
			{ JHN: { '02': 'https://audio.example/2.mp3' } },
			{ XYZ: { '1': 'https://audio.example/1.mp3' } },
			{ JHN: 'https://audio.example/1.mp3' },
			[]
		]) {
			expect(
				readStationChirho(withOverridesChirho(overridesChirho)),
				JSON.stringify(overridesChirho)
			).toBeNull();
		}
	});

	it('refuses what is not a station at all', () => {
		for (const valueChirho of [null, undefined, 'station', 7, [], [GOOD_CHIRHO]]) {
			expect(readStationChirho(valueChirho)).toBeNull();
		}
	});
});
