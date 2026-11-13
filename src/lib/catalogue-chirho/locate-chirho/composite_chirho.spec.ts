// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { describe, expect, it } from 'vitest';
import type { StationChirho } from '../contract_chirho';
import { readStationChirho } from '../languages-chirho/station_reader_chirho';
import {
	chapterAtOrAfterChirho,
	nextChapterChirho,
	nextOfferedChapterChirho,
	offeredChapterAtOrAfterChirho,
	offeredChapterCountChirho,
	offersChapterChirho,
	resolveChapterChirho,
	resolveChapterPlaybackChirho,
	stationHasChapterChirho
} from './locate_chirho';
import { makeStationFixtureChirho } from './station_fixture_chirho';

const FOLDER_CHIRHO = 'https://audio.dbs.org/HEBREW_DAVR_OT_N/';
const PART_ONE_CHIRHO = `${FOLDER_CHIRHO}29_Joel_02.mp3`;
const PART_TWO_CHIRHO = `${FOLDER_CHIRHO}29_Joel_03.mp3`;

/**
 * A recording that counts Joel in four, as it would be written once its split Joel 2 is
 * measured: Joel 1 and 3 from one file each (3 by override, from its fourth file), Joel 2
 * from its second and third files.
 */
function representativeChirho(changesChirho: Record<string, unknown> = {}): unknown {
	const stationChirho = makeStationFixtureChirho(
		{
			JOL: [
				[1, 1],
				[3, 3]
			]
		},
		{
			id_chirho: 'davar-hebrew-davr-ot-n',
			locator_chirho: {
				kind_chirho: 'pattern',
				template_chirho: `${FOLDER_CHIRHO}{book_order_pad2_chirho}_{book_code_chirho}_{chapter_pad_book_chirho}.mp3`,
				book_codes_chirho: 'davar_chirho',
				overrides_chirho: { JOL: { '3': `${FOLDER_CHIRHO}29_Joel_04.mp3` } }
			}
		}
	);
	return JSON.parse(
		JSON.stringify({
			...stationChirho,
			composite_chapters_chirho: {
				JOL: {
					'2': {
						parts_chirho: [
							{ url_chirho: PART_ONE_CHIRHO, duration_seconds_chirho: 180.5 },
							{ url_chirho: PART_TWO_CHIRHO, duration_seconds_chirho: 60.25 }
						],
						measured_on_chirho: '2026-11-14'
					}
				}
			},
			...changesChirho
		})
	);
}

function compositeWithChirho(entryChirho: unknown, bookChirho = 'JOL', chapterChirho = '2') {
	return representativeChirho({
		composite_chapters_chirho: { [bookChirho]: { [chapterChirho]: entryChirho } }
	});
}

function partsChirho(...pairsChirho: [string, number][]) {
	return {
		parts_chirho: pairsChirho.map(([urlChirho, secondsChirho]) => ({
			url_chirho: urlChirho,
			duration_seconds_chirho: secondsChirho
		})),
		measured_on_chirho: '2026-11-14'
	};
}

describe('a chapter split across files, read at run time', () => {
	it('is read with the station, and the station is otherwise what it was', () => {
		const stationChirho = readStationChirho(representativeChirho());
		expect(stationChirho).not.toBeNull();
		expect(stationChirho!.chapter_count_chirho).toBe(2);
		expect(stationChirho!.composite_chapters_chirho?.JOL?.['2']?.parts_chirho).toHaveLength(2);
	});

	it('rejects the whole station when a part breaks a rule', () => {
		const brokenChirho: [string, unknown][] = [
			['one part', partsChirho([PART_ONE_CHIRHO, 100])],
			[
				'five parts',
				partsChirho(
					...[1, 2, 3, 4, 5].map((nChirho): [string, number] => [
						`${FOLDER_CHIRHO}p${nChirho}.mp3`,
						100
					])
				)
			],
			['a zero length', partsChirho([PART_ONE_CHIRHO, 0], [PART_TWO_CHIRHO, 100])],
			['a length under a second', partsChirho([PART_ONE_CHIRHO, 0.5], [PART_TWO_CHIRHO, 100])],
			['a part over an hour', partsChirho([PART_ONE_CHIRHO, 3601], [PART_TWO_CHIRHO, 100])],
			[
				'over two hours in all',
				partsChirho([PART_ONE_CHIRHO, 3600], [PART_TWO_CHIRHO, 3600], [`${FOLDER_CHIRHO}x.mp3`, 1])
			],
			[
				'a length that is not a number',
				partsChirho([PART_ONE_CHIRHO, NaN], [PART_TWO_CHIRHO, 100])
			],
			['the same file twice', partsChirho([PART_ONE_CHIRHO, 100], [PART_ONE_CHIRHO, 100])],
			[
				"a covered chapter's file",
				partsChirho([PART_ONE_CHIRHO, 100], [`${FOLDER_CHIRHO}29_Joel_04.mp3`, 100])
			],
			[
				'another folder on the same host',
				partsChirho(
					[PART_ONE_CHIRHO, 100],
					['https://audio.dbs.org/OTHER_DAVR_OT_N/29_Joel_03.mp3', 100]
				)
			],
			[
				'a folder inside the recording',
				partsChirho([PART_ONE_CHIRHO, 100], [`${FOLDER_CHIRHO}deeper/29_Joel_03.mp3`, 100])
			],
			[
				'a folder whose name starts the same',
				partsChirho([PART_ONE_CHIRHO, 100], ['https://audio.dbs.org/HEBREW_DAVR_OT_N_X/a.mp3', 100])
			],
			[
				'another host',
				partsChirho([PART_ONE_CHIRHO, 100], ['https://evil.example/29_Joel_03.mp3', 100])
			],
			[
				'plain http',
				partsChirho([PART_ONE_CHIRHO, 100], [PART_TWO_CHIRHO.replace('https', 'http'), 100])
			],
			['a query', partsChirho([PART_ONE_CHIRHO, 100], [`${PART_TWO_CHIRHO}?a=1`, 100])],
			['a fragment', partsChirho([PART_ONE_CHIRHO, 100], [`${PART_TWO_CHIRHO}#t=5`, 100])],
			[
				'an address not in canonical form',
				partsChirho([PART_ONE_CHIRHO, 100], [`${FOLDER_CHIRHO}29 Joel 03.mp3`, 100])
			],
			[
				'no measuring day',
				{
					...partsChirho([PART_ONE_CHIRHO, 100], [PART_TWO_CHIRHO, 100]),
					measured_on_chirho: 'soon'
				}
			],
			['parts that are not a list', { parts_chirho: 'two', measured_on_chirho: '2026-11-14' }]
		];
		for (const [whyChirho, entryChirho] of brokenChirho) {
			expect(readStationChirho(compositeWithChirho(entryChirho)), whyChirho).toBeNull();
		}
	});

	it('rejects a chapter that is covered, overridden, or not a chapter of the book', () => {
		const goodChirho = partsChirho([PART_ONE_CHIRHO, 100], [PART_TWO_CHIRHO, 100]);
		expect(readStationChirho(compositeWithChirho(goodChirho, 'JOL', '1')), 'covered').toBeNull();
		expect(readStationChirho(compositeWithChirho(goodChirho, 'JOL', '3')), 'overridden').toBeNull();
		expect(readStationChirho(compositeWithChirho(goodChirho, 'JOL', '4')), 'no Joel 4').toBeNull();
		expect(
			readStationChirho(compositeWithChirho(goodChirho, 'JOL', '02')),
			'leading zero'
		).toBeNull();
		expect(readStationChirho(compositeWithChirho(goodChirho, 'jol', '2')), 'lower case').toBeNull();
		expect(readStationChirho(compositeWithChirho(goodChirho, 'XYZ', '2')), 'no book').toBeNull();
	});

	it('rejects split chapters on a station whose folder depends on the chapter', () => {
		const valueChirho = representativeChirho({
			locator_chirho: {
				kind_chirho: 'pattern',
				template_chirho: 'https://audio.dbs.org/{book_upper_chirho}/{chapter_chirho}.mp3'
			},
			coverage_chirho: { JOL: [[1, 1]] }
		});
		expect(readStationChirho(valueChirho)).toBeNull();
	});
});

describe('what a player is offered', () => {
	const stationChirho = readStationChirho(representativeChirho()) as StationChirho;

	it('leaves every existing helper exactly as it was', () => {
		expect(stationHasChapterChirho(stationChirho, 'JOL', 2)).toBe(false);
		expect(resolveChapterChirho(stationChirho, 'JOL', 2)).toBeNull();
		expect(chapterAtOrAfterChirho(stationChirho, 'JOL', 2)).toEqual({
			book_id_chirho: 'JOL',
			chapter_chirho: 3
		});
		expect(nextChapterChirho(stationChirho, 'JOL', 1)).toEqual({
			book_id_chirho: 'JOL',
			chapter_chirho: 3
		});
		expect(stationChirho.chapter_count_chirho).toBe(2);
	});

	it('offers the split chapter through the new helpers', () => {
		expect(offersChapterChirho(stationChirho, 'JOL', 2)).toBe(true);
		expect(offersChapterChirho(stationChirho, 'JOL', 4)).toBe(false);
		expect(offeredChapterAtOrAfterChirho(stationChirho, 'JOL', 2)).toEqual({
			book_id_chirho: 'JOL',
			chapter_chirho: 2
		});
		expect(nextOfferedChapterChirho(stationChirho, 'JOL', 1)).toEqual({
			book_id_chirho: 'JOL',
			chapter_chirho: 2
		});
		expect(nextOfferedChapterChirho(stationChirho, 'JOL', 2)).toEqual({
			book_id_chirho: 'JOL',
			chapter_chirho: 3
		});
		// From the end of the Bible round to the station's first chapter.
		expect(nextOfferedChapterChirho(stationChirho, 'REV', 22)).toEqual({
			book_id_chirho: 'JOL',
			chapter_chirho: 1
		});
		expect(offeredChapterCountChirho(stationChirho)).toBe(3);
	});

	it('says how to play each kind, with an unknown length as null', () => {
		expect(resolveChapterPlaybackChirho(stationChirho, 'JOL', 1)).toEqual({
			kind_chirho: 'single',
			url_chirho: `${FOLDER_CHIRHO}29_Joel_01.mp3`,
			total_seconds_chirho: null
		});
		expect(resolveChapterPlaybackChirho(stationChirho, 'JOL', 2)).toEqual({
			kind_chirho: 'composite',
			parts_chirho: [
				{ url_chirho: PART_ONE_CHIRHO, duration_seconds_chirho: 180.5 },
				{ url_chirho: PART_TWO_CHIRHO, duration_seconds_chirho: 60.25 }
			],
			total_seconds_chirho: 240.75
		});
		expect(resolveChapterPlaybackChirho(stationChirho, 'JOL', 4)).toBeNull();
		expect(resolveChapterPlaybackChirho(stationChirho, 'JOL', 2.5)).toBeNull();
	});

	it('keeps the timings address of a single file', () => {
		const timedChirho = makeStationFixtureChirho(
			{ JHN: [[3, 3]] },
			{
				timings_chirho: {
					template_chirho: 'https://timings.example/{book_upper_chirho}/{chapter_chirho}.json',
					format_chirho: 'verse-starts-list-chirho'
				}
			}
		);
		expect(resolveChapterPlaybackChirho(timedChirho, 'JHN', 3)).toEqual({
			kind_chirho: 'single',
			url_chirho: 'https://audio.example/JHN/3.mp3',
			timings_url_chirho: 'https://timings.example/JHN/3.json',
			total_seconds_chirho: null
		});
	});
});
