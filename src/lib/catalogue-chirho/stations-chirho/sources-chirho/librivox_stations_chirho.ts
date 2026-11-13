// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Stations from LibriVox (https://librivox.org/), whose volunteers read public domain texts
// aloud and give the recordings to the public domain. Its files sit on the Internet Archive
// under names that follow no rule, so each chapter's address is listed in an index that
// `scripts-chirho/catalogue-chirho/build_librivox_index_chirho.ts` writes from LibriVox's own
// catalogue.
//
// LibriVox publishes one book at a time, and a recording's sections are not always chapters.
// A book is here only when its sections are its chapters, one for one. So these stations are
// small: a Gospel, a book or two. They are here because they are the only public domain
// recordings found so far in their languages.

import type { StationDraftChirho } from '../station_builder_chirho';
import librivoxIndexChirho from '../index-chirho/librivox_index_chirho.json' with { type: 'json' };
import { readIndexFilesChirho } from '../index_files_chirho';

export const LIBRIVOX_SOURCE_ID_CHIRHO = 'librivox';

interface LibrivoxEditionChirho {
	readonly id_chirho: string;
	readonly language_code_chirho: string;
	readonly language_name_chirho: string;
	readonly language_english_chirho: string;
	readonly version_chirho: string;
	readonly version_code_chirho: string;
}

const LIBRIVOX_EDITIONS_CHIRHO: readonly LibrivoxEditionChirho[] = [
	{
		id_chirho: 'librivox-rv1909-es',
		language_code_chirho: 'es',
		language_name_chirho: 'Español',
		language_english_chirho: 'Spanish',
		version_chirho: 'Reina-Valera 1909',
		version_code_chirho: 'RV1909'
	},
	{
		id_chirho: 'librivox-lb1912-de',
		language_code_chirho: 'de',
		language_name_chirho: 'Deutsch',
		language_english_chirho: 'German',
		version_chirho: 'Lutherbibel 1912',
		version_code_chirho: 'LB1912'
	},
	{
		id_chirho: 'librivox-almeida-pt',
		language_code_chirho: 'pt',
		language_name_chirho: 'Português',
		language_english_chirho: 'Portuguese',
		version_chirho: 'Almeida',
		version_code_chirho: 'ALMEIDA'
	},
	{
		id_chirho: 'librivox-hebrew-he',
		language_code_chirho: 'he',
		language_name_chirho: 'עברית',
		language_english_chirho: 'Hebrew',
		version_chirho: 'Hebrew Bible',
		version_code_chirho: 'HEB'
	}
];

function librivoxStationChirho(editionChirho: LibrivoxEditionChirho): StationDraftChirho {
	return {
		...editionChirho,
		source_id_chirho: LIBRIVOX_SOURCE_ID_CHIRHO,
		// LibriVox's aim, in its own words: books "narrated by real people".
		voice_chirho: 'LibriVox volunteers',
		voice_kind_chirho: 'human',
		source_name_chirho: 'LibriVox',
		source_url_chirho: 'https://librivox.org/',
		// "all our recordings are public domain (definitely in the USA, and maybe in your country
		// as well)".
		licence_id_chirho: 'public-domain',
		licence_name_chirho: 'Public domain, by LibriVox’s dedication',
		licence_url_chirho: 'https://librivox.org/pages/public-domain/',
		licence_evidence_url_chirho: 'https://librivox.org/pages/public-domain/',
		licence_read_on_chirho: '2026-11-13',
		credit_chirho: `${editionChirho.version_chirho}, read by LibriVox volunteers. A public domain recording from LibriVox.`,
		locator_chirho: {
			kind_chirho: 'index',
			files_chirho: readIndexFilesChirho(librivoxIndexChirho, editionChirho.id_chirho)
		}
	};
}

export const LIBRIVOX_STATION_DRAFTS_CHIRHO: readonly StationDraftChirho[] =
	LIBRIVOX_EDITIONS_CHIRHO.map(librivoxStationChirho);
