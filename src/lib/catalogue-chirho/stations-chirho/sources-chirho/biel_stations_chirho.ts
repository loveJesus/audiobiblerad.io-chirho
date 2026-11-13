// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Stations from Bible in Every Language, the audio site of Wycliffe Associates and partners
// (https://audio.bibleineverylanguage.org/). The site names no reader, so the voice is left
// empty and its kind unknown.
//
// The languages below are the ones whose MP3 books the site listed on 2026-11-13. Which
// chapters each really has is measured, not assumed: several lack whole books.
//
// Thirteen are the Unlocked Literal Bible (`ulb`). Two are a community's own translation,
// which the site files under `reg`; the publisher's manifest for each titles it "Bible", under
// the same licence. See the sources file.

import type { StationDraftChirho } from '../station_builder_chirho';

export const BIEL_SOURCE_ID_CHIRHO = 'biel';

interface BielEditionChirho {
	/** The language tag the site uses, which is also the BCP 47 tag. */
	readonly code_chirho: string;
	/** The language's own name, as the site lists it. */
	readonly name_chirho: string;
	/** The language's name in English, as the site lists it. */
	readonly english_chirho: string;
	/** The site's code for the version, as it appears in its addresses. */
	readonly version_slug_chirho: 'ulb' | 'reg';
	readonly version_chirho: string;
}

function unlockedLiteralChirho(
	codeChirho: string,
	nameChirho: string,
	englishChirho: string
): BielEditionChirho {
	return {
		code_chirho: codeChirho,
		name_chirho: nameChirho,
		english_chirho: englishChirho,
		version_slug_chirho: 'ulb',
		version_chirho: 'Unlocked Literal Bible'
	};
}

function communityBibleChirho(codeChirho: string, nameChirho: string): BielEditionChirho {
	return {
		code_chirho: codeChirho,
		name_chirho: nameChirho,
		english_chirho: nameChirho,
		version_slug_chirho: 'reg',
		version_chirho: `${nameChirho} Bible`
	};
}

const BIEL_EDITIONS_CHIRHO: readonly BielEditionChirho[] = [
	unlockedLiteralChirho('en', 'English', 'English'),
	unlockedLiteralChirho('gu', 'ગુજરાતી', 'Gujarati'),
	unlockedLiteralChirho('hi', 'हिन्दी', 'Hindi'),
	unlockedLiteralChirho('kn', 'ಕನ್ನಡ', 'Kannada'),
	unlockedLiteralChirho('ml', 'മലയാളം', 'Malayalam'),
	unlockedLiteralChirho('mr', 'मराठी', 'Marathi'),
	unlockedLiteralChirho('ne', 'नेपाली', 'Nepali'),
	unlockedLiteralChirho('or', 'ଓଡ଼ିଆ', 'Odia'),
	unlockedLiteralChirho('pa', 'ਪੰਜਾਬੀ', 'Punjabi'),
	unlockedLiteralChirho('sw', 'Kiswahili', 'Swahili'),
	unlockedLiteralChirho('ta', 'தமிழ்', 'Tamil'),
	unlockedLiteralChirho('te', 'తెలుగు', 'Telugu'),
	unlockedLiteralChirho('vi', 'Tiếng Việt', 'Vietnamese'),
	communityBibleChirho('ida-x-tiriki', 'Tiriki'),
	communityBibleChirho('lto', 'Olutsotso')
];

function bielStationChirho(editionChirho: BielEditionChirho): StationDraftChirho {
	const { code_chirho: codeChirho, version_slug_chirho: slugChirho } = editionChirho;
	const titleChirho =
		slugChirho === 'ulb'
			? `${editionChirho.version_chirho} in ${editionChirho.english_chirho}`
			: editionChirho.version_chirho;
	return {
		id_chirho: `biel-${slugChirho}-${codeChirho}`,
		source_id_chirho: BIEL_SOURCE_ID_CHIRHO,
		language_code_chirho: codeChirho,
		language_name_chirho: editionChirho.name_chirho,
		language_english_chirho: editionChirho.english_chirho,
		version_chirho: editionChirho.version_chirho,
		version_code_chirho: slugChirho.toUpperCase(),
		voice_chirho: '',
		voice_kind_chirho: 'unknown',
		source_name_chirho: 'Bible in Every Language',
		source_url_chirho: 'https://audio.bibleineverylanguage.org/',
		// The site's footer: "Unless otherwise mentioned, all work is licensed under a Creative
		// Commons Attribution-ShareAlike 4.0 International License."
		licence_id_chirho: 'CC-BY-SA-4.0',
		licence_name_chirho: 'Creative Commons Attribution-ShareAlike 4.0 International',
		licence_url_chirho: 'https://creativecommons.org/licenses/by-sa/4.0/',
		licence_evidence_url_chirho: 'https://bibleineverylanguage.org/',
		licence_read_on_chirho: '2026-11-13',
		credit_chirho: `${titleChirho}, from Bible in Every Language by Wycliffe Associates and partners. Licensed under CC BY-SA 4.0. Played unchanged.`,
		locator_chirho: {
			kind_chirho: 'pattern',
			// `mp3/hi` is the site's high quality, not Hindi.
			template_chirho: `https://audio-content.bibleineverylanguage.org/content/${codeChirho}/${slugChirho}/{book_lower_chirho}/{chapter_chirho}/CONTENTS/mp3/hi/chapter/${codeChirho}_${slugChirho}_{book_lower_chirho}_c{chapter_chirho}.mp3`
		}
	};
}

export const BIEL_STATION_DRAFTS_CHIRHO: readonly StationDraftChirho[] =
	BIEL_EDITIONS_CHIRHO.map(bielStationChirho);
