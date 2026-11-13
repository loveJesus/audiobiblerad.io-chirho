// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { describe, expect, it } from 'vitest';
import {
	chaptersToRangesChirho,
	countChaptersChirho,
	readStationCoverageChirho,
	type CoverageFileChirho
} from './coverage_chirho';
import { buildStationChirho, type StationDraftChirho } from './station_builder_chirho';

function fileWithChirho(entryChirho: unknown): CoverageFileChirho {
	return { source_id_chirho: 'fixture', stations_chirho: { 'fixture-station': entryChirho } };
}

describe('writing coverage', () => {
	it('folds chapter numbers into runs, whatever order they arrive in', () => {
		expect(chaptersToRangesChirho([3, 1, 2, 5, 9, 8, 2])).toEqual([
			[1, 3],
			[5, 5],
			[8, 9]
		]);
		expect(chaptersToRangesChirho([])).toEqual([]);
	});
});

describe('reading coverage', () => {
	it('reads back what the check wrote', () => {
		const readChirho = readStationCoverageChirho(
			fileWithChirho({
				checked_on_chirho: '2026-11-13',
				available_chirho: {
					GEN: [
						[1, 3],
						[5, 5]
					],
					JHN: [[1, 21]]
				}
			}),
			'fixture-station'
		);
		expect(readChirho.checked_on_chirho).toBe('2026-11-13');
		expect(readChirho.coverage_chirho).toEqual({
			GEN: [
				[1, 3],
				[5, 5]
			],
			JHN: [[1, 21]]
		});
		expect(countChaptersChirho(readChirho.coverage_chirho)).toBe(25);
	});

	it('gives a station with no entry no chapters at all', () => {
		for (const nobodyChirho of ['someone-else', '__proto__', 'constructor']) {
			const readChirho = readStationCoverageChirho(fileWithChirho({}), nobodyChirho);
			expect(readChirho.coverage_chirho).toEqual({});
			expect(countChaptersChirho(readChirho.coverage_chirho)).toBe(0);
		}
	});

	it('drops anything that is not a real run of chapters in a real book', () => {
		const readChirho = readStationCoverageChirho(
			fileWithChirho({
				checked_on_chirho: 20261113,
				available_chirho: {
					// John has 21 chapters: a run that leaves the book is dropped whole.
					JHN: [[1, 22]],
					PSA: [[0, 3], [5, 4], [1.5, 2], ['1', 2], [1], [1, 2, 3], 'all', [150, 150]],
					XXX: [[1, 1]],
					OBA: 'all'
				}
			}),
			'fixture-station'
		);
		expect(readChirho.checked_on_chirho).toBe('');
		expect(readChirho.coverage_chirho).toEqual({ PSA: [[150, 150]] });
	});

	it('survives a file that is not in the expected form', () => {
		for (const brokenChirho of [null, 'nothing', 7, [], { available_chirho: 'all' }]) {
			expect(
				readStationCoverageChirho(fileWithChirho(brokenChirho), 'fixture-station').coverage_chirho
			).toEqual({});
		}
	});
});

describe('building a station', () => {
	const draftChirho = {
		id_chirho: 'fixture-station',
		locator_chirho: { kind_chirho: 'pattern', template_chirho: 'https://audio.example/x.mp3' }
	} as StationDraftChirho;

	it('takes its chapters from the measured coverage and nowhere else', () => {
		const stationChirho = buildStationChirho(
			draftChirho,
			fileWithChirho({ checked_on_chirho: '2026-11-13', available_chirho: { JHN: [[1, 21]] } })
		);
		expect(stationChirho.chapter_count_chirho).toBe(21);
		expect(stationChirho.coverage_checked_on_chirho).toBe('2026-11-13');
		expect(stationChirho.has_timings_chirho).toBe(false);
	});

	it('has no chapters until the check has measured it', () => {
		const stationChirho = buildStationChirho(draftChirho, {
			source_id_chirho: 'fixture',
			stations_chirho: {}
		});
		expect(stationChirho.chapter_count_chirho).toBe(0);
		expect(stationChirho.coverage_chirho).toEqual({});
	});
});
