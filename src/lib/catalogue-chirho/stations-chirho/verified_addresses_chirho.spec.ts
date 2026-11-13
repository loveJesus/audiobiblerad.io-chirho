// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Addresses that were opened at their source and answered with audio, on the day shown.
// The catalogue must build exactly these, character for character: one wrong letter in a
// template is a silent radio.

import { describe, expect, it } from 'vitest';
import { findStationChirho, resolveChapterChirho } from '../catalogue_chirho';

interface VerifiedAddressChirho {
	readonly station_chirho: string;
	readonly book_chirho: string;
	readonly chapter_chirho: number;
	readonly url_chirho: string;
	readonly timings_url_chirho?: string;
}

// Opened on 2026-11-13.
const VERIFIED_ADDRESSES_CHIRHO: readonly VerifiedAddressChirho[] = [
	{
		station_chirho: 'helloao-bsb-hays',
		book_chirho: 'JHN',
		chapter_chirho: 3,
		url_chirho: 'https://audio.bible.helloao.org/api/BSB/JHN/3/audio/hays.mp3',
		timings_url_chirho: 'https://bible.helloao.org/api/BSB/JHN/3.hays.audioTimings.json'
	},
	{
		station_chirho: 'helloao-bsb-souer',
		book_chirho: 'PSA',
		chapter_chirho: 119,
		url_chirho: 'https://audio.bible.helloao.org/api/BSB/PSA/119/audio/souer.mp3',
		timings_url_chirho: 'https://bible.helloao.org/api/BSB/PSA/119.souer.audioTimings.json'
	},
	{
		station_chirho: 'openbible-bsb-gilbert',
		book_chirho: 'GEN',
		chapter_chirho: 1,
		url_chirho: 'https://openbible.com/audio/gilbert/BSB_01_Gen_001_G.mp3'
	},
	{
		// A leading digit keeps the capital after it.
		station_chirho: 'openbible-bsb-gilbert',
		book_chirho: '1SA',
		chapter_chirho: 2,
		url_chirho: 'https://openbible.com/audio/gilbert/BSB_09_1Sa_002_G.mp3'
	},
	{
		// This host writes Titus as Tts.
		station_chirho: 'openbible-bsb-gilbert',
		book_chirho: 'TIT',
		chapter_chirho: 3,
		url_chirho: 'https://openbible.com/audio/gilbert/BSB_56_Tts_003_G.mp3'
	},
	{
		station_chirho: 'openbible-bsb-gilbert',
		book_chirho: 'REV',
		chapter_chirho: 22,
		url_chirho: 'https://openbible.com/audio/gilbert/BSB_66_Rev_022_G.mp3'
	}
];

describe('addresses verified at their source', () => {
	it.each(VERIFIED_ADDRESSES_CHIRHO)(
		'builds $station_chirho $book_chirho $chapter_chirho exactly as it was opened',
		(verifiedChirho) => {
			const stationChirho = findStationChirho(verifiedChirho.station_chirho);
			expect(stationChirho).toBeDefined();
			expect(
				resolveChapterChirho(
					stationChirho!,
					verifiedChirho.book_chirho,
					verifiedChirho.chapter_chirho
				)
			).toEqual(
				verifiedChirho.timings_url_chirho === undefined
					? { url_chirho: verifiedChirho.url_chirho }
					: {
							url_chirho: verifiedChirho.url_chirho,
							timings_url_chirho: verifiedChirho.timings_url_chirho
						}
			);
		}
	);
});
