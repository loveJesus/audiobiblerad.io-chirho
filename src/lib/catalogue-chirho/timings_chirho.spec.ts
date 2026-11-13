// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { describe, expect, it } from 'vitest';
import { makeStationFixtureChirho } from './station_fixture_chirho';
import { parseVerseTimingsChirho } from './timings_chirho';

const timedChirho = makeStationFixtureChirho(
	{ JHN: [[1, 21]] },
	{
		timings_chirho: {
			template_chirho: 'https://timings.example/{book_upper_chirho}/{chapter_chirho}.json',
			format_chirho: 'verse-starts-list-chirho'
		}
	}
);

describe('reading verse timings', () => {
	it('reads the start of each verse from a file in the shape the source serves', () => {
		// The shape of the Free Use Bible API's timings file, trimmed to three verses.
		const fileChirho = {
			translationId: 'BSB',
			bookId: 'JHN',
			chapterNumber: 3,
			reader: 'hays',
			audioLink: 'https://audio.example/JHN/3.mp3',
			verses: [4.031, 9.773, 22.857]
		};
		expect(parseVerseTimingsChirho(timedChirho, fileChirho)).toEqual([4.031, 9.773, 22.857]);
	});

	it('accepts a verse that starts at zero and two verses that share a start', () => {
		expect(parseVerseTimingsChirho(timedChirho, { verses: [0, 5, 5, 9] })).toEqual([0, 5, 5, 9]);
	});

	it('gives nothing for a station that has no timings', () => {
		const untimedChirho = makeStationFixtureChirho({ JHN: [[1, 21]] });
		expect(parseVerseTimingsChirho(untimedChirho, { verses: [1, 2, 3] })).toBeNull();
	});

	it('gives nothing for a file that is not in the expected form', () => {
		const strangersChirho: unknown[] = [
			null,
			undefined,
			'verses',
			42,
			[1, 2, 3],
			{},
			{ verses: [] },
			{ verses: 'soon' },
			{ verses: [1, '2', 3] },
			{ verses: [1, null, 3] },
			{ verses: [1, Number.NaN, 3] },
			{ verses: [1, Number.POSITIVE_INFINITY] },
			{ verses: [-1, 2] },
			// Running backwards would send a listener to the wrong verse.
			{ verses: [1, 5, 3] }
		];
		for (const strangerChirho of strangersChirho) {
			expect(parseVerseTimingsChirho(timedChirho, strangerChirho)).toBeNull();
		}
	});
});
