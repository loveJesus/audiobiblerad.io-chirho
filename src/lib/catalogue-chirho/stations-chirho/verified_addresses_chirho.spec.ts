// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Addresses that were opened at their source and answered with audio, on the day shown.
// The catalogue must build exactly these, character for character: one wrong letter in a
// template is a silent radio.

import { describe, expect, it } from 'vitest';
import { STATIONS_CHIRHO, resolveChapterChirho } from '../catalogue_chirho';
import { HELD_STATIONS_CHIRHO } from './held_stations_chirho';

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
	},
	{
		station_chirho: 'ebible-webbe',
		book_chirho: 'JHN',
		chapter_chirho: 3,
		url_chirho: 'https://ebible.org/eng-webbe/mp3/eng-webbe_073_JHN_03.mp3'
	},
	{
		// Psalms take three digits on this host; every other book takes two.
		station_chirho: 'ebible-webbe',
		book_chirho: 'PSA',
		chapter_chirho: 23,
		url_chirho: 'https://ebible.org/eng-webbe/mp3/eng-webbe_020_PSA_023.mp3'
	},
	{
		station_chirho: 'ebible-webbe',
		book_chirho: 'OBA',
		chapter_chirho: 1,
		url_chirho: 'https://ebible.org/eng-webbe/mp3/eng-webbe_032_OBA_01.mp3'
	},
	{
		// The `mp3/hi` in the middle is this host's high quality, not Hindi.
		station_chirho: 'biel-ulb-hi',
		book_chirho: 'JHN',
		chapter_chirho: 3,
		url_chirho:
			'https://audio-content.bibleineverylanguage.org/content/hi/ulb/jhn/3/CONTENTS/mp3/hi/chapter/hi_ulb_jhn_c3.mp3'
	},
	{
		// No padding on this host: Psalm 23 is c23, and c023 answers 404.
		station_chirho: 'biel-ulb-hi',
		book_chirho: 'PSA',
		chapter_chirho: 23,
		url_chirho:
			'https://audio-content.bibleineverylanguage.org/content/hi/ulb/psa/23/CONTENTS/mp3/hi/chapter/hi_ulb_psa_c23.mp3'
	},
	{
		station_chirho: 'biel-ulb-sw',
		book_chirho: 'JHN',
		chapter_chirho: 3,
		url_chirho:
			'https://audio-content.bibleineverylanguage.org/content/sw/ulb/jhn/3/CONTENTS/mp3/hi/chapter/sw_ulb_jhn_c3.mp3'
	}
];

describe('addresses verified at their source', () => {
	it.each(VERIFIED_ADDRESSES_CHIRHO)(
		'builds $station_chirho $book_chirho $chapter_chirho exactly as it was opened',
		(verifiedChirho) => {
			// An address is a fact about the source, whether or not the station is playing yet.
			const stationChirho = [
				...STATIONS_CHIRHO,
				...HELD_STATIONS_CHIRHO.map((heldChirho) => heldChirho.station_chirho)
			].find((candidateChirho) => candidateChirho.id_chirho === verifiedChirho.station_chirho);
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
