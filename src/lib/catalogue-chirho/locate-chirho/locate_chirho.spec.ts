// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { describe, expect, it } from 'vitest';
import { findBookChirho } from '../books-chirho/books_chirho';
import {
	chapterAtOrAfterChirho,
	expandTemplateChirho,
	nextChapterChirho,
	resolveChapterChirho,
	stationHasChapterChirho
} from './locate_chirho';
import { makeStationFixtureChirho } from './station_fixture_chirho';

const TITUS_CHIRHO = findBookChirho('TIT')!;
const JOHN_CHIRHO = findBookChirho('JHN')!;

describe('filling an address template', () => {
	it('fills every placeholder the contract names', () => {
		const templateChirho =
			'{book_upper_chirho}|{book_lower_chirho}|{book_code_chirho}|{book_order_pad2_chirho}|{chapter_chirho}|{chapter_pad2_chirho}|{chapter_pad3_chirho}';
		expect(expandTemplateChirho(templateChirho, TITUS_CHIRHO, 3, 'openbible_chirho')).toBe(
			'TIT|tit|Tts|56|3|03|003'
		);
		expect(
			expandTemplateChirho('{book_order_pad2_chirho}/{chapter_pad2_chirho}', JOHN_CHIRHO, 21)
		).toBe('43/21');
	});

	it('pads to the width of the book for sources that name files that way', () => {
		const psalmsChirho = findBookChirho('PSA')!;
		const obadiahChirho = findBookChirho('OBA')!;
		const templateChirho = '{book_code_chirho}_{chapter_pad_book_chirho}';
		expect(expandTemplateChirho(templateChirho, JOHN_CHIRHO, 3, 'ebible_numbered_chirho')).toBe(
			'073_JHN_03'
		);
		expect(expandTemplateChirho(templateChirho, psalmsChirho, 23, 'ebible_numbered_chirho')).toBe(
			'020_PSA_023'
		);
		// A one-chapter book still gets two digits.
		expect(expandTemplateChirho(templateChirho, obadiahChirho, 1, 'ebible_numbered_chirho')).toBe(
			'032_OBA_01'
		);
	});

	it('does not pad a chapter number that is already long enough', () => {
		const psalmsChirho = findBookChirho('PSA')!;
		expect(expandTemplateChirho('{chapter_pad2_chirho}', psalmsChirho, 119)).toBe('119');
		expect(expandTemplateChirho('{chapter_pad3_chirho}', psalmsChirho, 119)).toBe('119');
	});

	it('gives nothing, rather than a half-built address, when it cannot fill a placeholder', () => {
		expect(expandTemplateChirho('https://x.example/{verse_chirho}', JOHN_CHIRHO, 3)).toBeNull();
		// The source's own book code was asked for, but no scheme or an unknown one was named.
		expect(expandTemplateChirho('https://x.example/{book_code_chirho}', JOHN_CHIRHO, 3)).toBeNull();
		expect(
			expandTemplateChirho('https://x.example/{book_code_chirho}', JOHN_CHIRHO, 3, 'nobody_chirho')
		).toBeNull();
	});
});

describe('resolving a chapter', () => {
	const stationChirho = makeStationFixtureChirho({ JHN: [[1, 21]], PSA: [[23, 23]] });

	it('gives the address of a chapter the station has', () => {
		expect(resolveChapterChirho(stationChirho, 'JHN', 3)).toEqual({
			url_chirho: 'https://audio.example/JHN/3.mp3'
		});
	});

	it('adds the timings address only for a station that has timings', () => {
		const timedChirho = makeStationFixtureChirho(
			{ JHN: [[1, 21]] },
			{
				timings_chirho: {
					template_chirho: 'https://timings.example/{book_upper_chirho}/{chapter_chirho}.json',
					format_chirho: 'verse-starts-list-chirho'
				}
			}
		);
		expect(resolveChapterChirho(timedChirho, 'JHN', 3)).toEqual({
			url_chirho: 'https://audio.example/JHN/3.mp3',
			timings_url_chirho: 'https://timings.example/JHN/3.json'
		});
		expect(resolveChapterChirho(stationChirho, 'JHN', 3)).not.toHaveProperty('timings_url_chirho');
	});

	it('gives nothing for a chapter that was not verified, however plausible', () => {
		expect(resolveChapterChirho(stationChirho, 'PSA', 22)).toBeNull();
		expect(resolveChapterChirho(stationChirho, 'PSA', 24)).toBeNull();
		expect(resolveChapterChirho(stationChirho, 'GEN', 1)).toBeNull();
		expect(resolveChapterChirho(stationChirho, 'JHN', 22)).toBeNull();
	});

	it('gives nothing for a place that does not exist, whatever is passed in', () => {
		const strangersChirho: [unknown, unknown][] = [
			['XXX', 1],
			['jhn', 3],
			['JHN', 0],
			['JHN', -1],
			['JHN', 1.5],
			['JHN', Number.NaN],
			['JHN', Number.POSITIVE_INFINITY],
			['JHN', '3'],
			[null, 3],
			['__proto__', 1]
		];
		for (const [bookChirho, chapterChirho] of strangersChirho) {
			expect(
				resolveChapterChirho(stationChirho, bookChirho as string, chapterChirho as number)
			).toBeNull();
			expect(
				stationHasChapterChirho(stationChirho, bookChirho as string, chapterChirho as number)
			).toBe(false);
		}
	});

	it('gives nothing when the station names a book code scheme that does not exist', () => {
		const brokenChirho = makeStationFixtureChirho(
			{ JHN: [[1, 21]] },
			{
				locator_chirho: {
					kind_chirho: 'pattern',
					template_chirho: 'https://audio.example/{book_code_chirho}.mp3',
					book_codes_chirho: 'nobody_chirho'
				}
			}
		);
		expect(resolveChapterChirho(brokenChirho, 'JHN', 3)).toBeNull();
	});

	it('reads the address from the list for a station whose files follow no rule', () => {
		const listedChirho = makeStationFixtureChirho(
			{ RUT: [[1, 2]], JUD: [[1, 1]] },
			{
				locator_chirho: {
					kind_chirho: 'index',
					files_chirho: {
						RUT: ['https://audio.example/ruth-one.mp3', 'https://audio.example/ruth_2.mp3', null],
						JUD: ['https://audio.example/jude.mp3'],
						// Listed, but never verified: it must not resolve.
						OBA: ['https://audio.example/obadiah.mp3']
					}
				}
			}
		);
		expect(resolveChapterChirho(listedChirho, 'RUT', 1)).toEqual({
			url_chirho: 'https://audio.example/ruth-one.mp3'
		});
		expect(resolveChapterChirho(listedChirho, 'RUT', 2)).toEqual({
			url_chirho: 'https://audio.example/ruth_2.mp3'
		});
		expect(resolveChapterChirho(listedChirho, 'JUD', 1)).toEqual({
			url_chirho: 'https://audio.example/jude.mp3'
		});
		expect(resolveChapterChirho(listedChirho, 'OBA', 1)).toBeNull();
		expect(resolveChapterChirho(listedChirho, 'RUT', 3)).toBeNull();
	});

	it('gives nothing for a verified chapter whose address is missing from the list', () => {
		const holedChirho = makeStationFixtureChirho(
			{ RUT: [[1, 4]] },
			{
				locator_chirho: {
					kind_chirho: 'index',
					files_chirho: { RUT: ['https://audio.example/ruth-one.mp3', null] }
				}
			}
		);
		expect(resolveChapterChirho(holedChirho, 'RUT', 2)).toBeNull();
		expect(resolveChapterChirho(holedChirho, 'RUT', 4)).toBeNull();
	});

	it('skips a locator kind it does not know instead of guessing', () => {
		const futureChirho = makeStationFixtureChirho(
			{ JHN: [[1, 21]] },
			{ locator_chirho: { kind_chirho: 'telepathy' } as never }
		);
		expect(resolveChapterChirho(futureChirho, 'JHN', 3)).toBeNull();
	});
});

describe('moving through a station', () => {
	// Gaps on purpose: Genesis 1 to 3 and 5; nothing until John 2 to 4; then Revelation 22.
	const gappyChirho = makeStationFixtureChirho({
		GEN: [
			[1, 3],
			[5, 5]
		],
		JHN: [[2, 4]],
		REV: [[22, 22]]
	});

	it('plays the next chapter and skips the missing ones', () => {
		expect(nextChapterChirho(gappyChirho, 'GEN', 1)).toEqual({
			book_id_chirho: 'GEN',
			chapter_chirho: 2
		});
		expect(nextChapterChirho(gappyChirho, 'GEN', 3)).toEqual({
			book_id_chirho: 'GEN',
			chapter_chirho: 5
		});
		expect(nextChapterChirho(gappyChirho, 'GEN', 5)).toEqual({
			book_id_chirho: 'JHN',
			chapter_chirho: 2
		});
		expect(nextChapterChirho(gappyChirho, 'JHN', 4)).toEqual({
			book_id_chirho: 'REV',
			chapter_chirho: 22
		});
	});

	it('wraps from the end of the Bible to the first chapter the station has', () => {
		expect(nextChapterChirho(gappyChirho, 'REV', 22)).toEqual({
			book_id_chirho: 'GEN',
			chapter_chirho: 1
		});
	});

	it('wraps round to an earlier chapter of the same book when nothing else is left', () => {
		const johnOnlyChirho = makeStationFixtureChirho({ JHN: [[1, 21]] });
		expect(nextChapterChirho(johnOnlyChirho, 'JHN', 21)).toEqual({
			book_id_chirho: 'JHN',
			chapter_chirho: 1
		});
		expect(chapterAtOrAfterChirho(johnOnlyChirho, 'REV', 1)).toEqual({
			book_id_chirho: 'JHN',
			chapter_chirho: 1
		});
	});

	it('keeps the chapter when the dial lands on a station that has it', () => {
		expect(chapterAtOrAfterChirho(gappyChirho, 'JHN', 3)).toEqual({
			book_id_chirho: 'JHN',
			chapter_chirho: 3
		});
	});

	it('moves on to the next chapter it has when the dial lands where it has none', () => {
		expect(chapterAtOrAfterChirho(gappyChirho, 'GEN', 4)).toEqual({
			book_id_chirho: 'GEN',
			chapter_chirho: 5
		});
		expect(chapterAtOrAfterChirho(gappyChirho, 'PSA', 23)).toEqual({
			book_id_chirho: 'JHN',
			chapter_chirho: 2
		});
		// Past the end of a book counts as the start of the next one.
		expect(chapterAtOrAfterChirho(gappyChirho, 'JHN', 99)).toEqual({
			book_id_chirho: 'REV',
			chapter_chirho: 22
		});
	});

	it('returns the same chapter again on a station with only one', () => {
		const singleChirho = makeStationFixtureChirho({ PSA: [[117, 117]] });
		expect(nextChapterChirho(singleChirho, 'PSA', 117)).toEqual({
			book_id_chirho: 'PSA',
			chapter_chirho: 117
		});
	});

	it('only ever lands on chapters the station can resolve', () => {
		let placeChirho = chapterAtOrAfterChirho(gappyChirho, 'GEN', 1);
		const visitedChirho: string[] = [];
		for (let stepChirho = 0; stepChirho < 8; stepChirho += 1) {
			expect(placeChirho).not.toBeNull();
			const { book_id_chirho: bookChirho, chapter_chirho: chapterChirho } = placeChirho!;
			expect(resolveChapterChirho(gappyChirho, bookChirho, chapterChirho)).not.toBeNull();
			visitedChirho.push(`${bookChirho} ${chapterChirho}`);
			placeChirho = nextChapterChirho(gappyChirho, bookChirho, chapterChirho);
		}
		expect(visitedChirho).toEqual([
			...['GEN 1', 'GEN 2', 'GEN 3', 'GEN 5', 'JHN 2', 'JHN 3', 'JHN 4', 'REV 22']
		]);
	});

	it('has nowhere to go on an empty station or from a place that does not exist', () => {
		const emptyChirho = makeStationFixtureChirho({});
		expect(chapterAtOrAfterChirho(emptyChirho, 'GEN', 1)).toBeNull();
		expect(nextChapterChirho(emptyChirho, 'GEN', 1)).toBeNull();
		expect(chapterAtOrAfterChirho(gappyChirho, 'XXX', 1)).toBeNull();
		expect(chapterAtOrAfterChirho(gappyChirho, 'GEN', 0)).toBeNull();
		expect(nextChapterChirho(gappyChirho, 'GEN', 1.5)).toBeNull();
		expect(nextChapterChirho(gappyChirho, 'GEN', Number.NaN)).toBeNull();
	});
});
