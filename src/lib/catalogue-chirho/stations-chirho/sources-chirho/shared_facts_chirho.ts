// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Facts that more than one station repeats: languages and licences. Each licence here is
// recorded, with the words that grant it, in
// spec-chirho/sources-chirho/26-11-13-public-audio-sources-chirho.md.

import type { StationDraftChirho } from '../station_builder_chirho';

type LanguageFactsChirho = Pick<
	StationDraftChirho,
	'language_code_chirho' | 'language_name_chirho' | 'language_english_chirho'
>;

type LicenceFactsChirho = Pick<
	StationDraftChirho,
	| 'licence_id_chirho'
	| 'licence_name_chirho'
	| 'licence_url_chirho'
	| 'licence_evidence_url_chirho'
	| 'licence_read_on_chirho'
>;

function languageChirho(
	codeChirho: string,
	nameChirho: string,
	englishChirho: string
): LanguageFactsChirho {
	return {
		language_code_chirho: codeChirho,
		language_name_chirho: nameChirho,
		language_english_chirho: englishChirho
	};
}

export const ENGLISH_CHIRHO = languageChirho('en', 'English', 'English');

/**
 * The Berean Standard Bible recordings narrated by Bob Souer, Barry Hays and Jordan Gilbert.
 * The publisher's audio page says they "have been dedicated to the public domain (CC0 1.0)".
 */
export const BEREAN_NARRATION_CC0_CHIRHO: LicenceFactsChirho = {
	licence_id_chirho: 'CC0-1.0',
	licence_name_chirho: 'CC0 1.0 Universal, a public domain dedication',
	licence_url_chirho: 'https://creativecommons.org/publicdomain/zero/1.0/',
	licence_evidence_url_chirho: 'https://bereanbible.com/audio/',
	licence_read_on_chirho: '2026-11-13'
};

export const BEREAN_VERSION_CHIRHO = {
	version_chirho: 'Berean Standard Bible',
	version_code_chirho: 'BSB'
} as const;

/** The credit line for a Berean recording by a named narrator. */
export function bereanCreditChirho(narratorChirho: string): string {
	return `Berean Standard Bible, narrated by ${narratorChirho}. Dedicated to the public domain (CC0 1.0).`;
}
