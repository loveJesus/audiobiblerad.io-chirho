// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Stations from LibriVox (https://librivox.org/), whose volunteers read public domain texts
// aloud and give the recordings to the public domain. Its files sit on the Internet Archive
// under names that follow no rule, so each chapter's address is listed in an index that
// `scripts-chirho/catalogue-chirho/build_librivox_index_chirho.ts` writes from LibriVox's own
// catalogue.
//
// LibriVox publishes one book at a time, and a recording's sections are not always chapters.
// A book is here only when its sections are its chapters, one for one. So most of these
// stations are small: a Gospel, a book or two. The Spanish one is most of a Bible, read by a
// single volunteer. Each is here because it is a public domain recording, read by a person,
// in a language that has no other station yet, or only a small one.

import type { StationDraftChirho } from '../station_builder_chirho';
import rvaEsIndexChirho from '../index-chirho/librivox-chirho/librivox_rva_es_index_chirho.json' with { type: 'json' };
import lb1912DeIndexChirho from '../index-chirho/librivox-chirho/librivox_lb1912_de_index_chirho.json' with { type: 'json' };
import almeidaPtIndexChirho from '../index-chirho/librivox-chirho/librivox_almeida_pt_index_chirho.json' with { type: 'json' };
import hebrewHeIndexChirho from '../index-chirho/librivox-chirho/librivox_hebrew_he_index_chirho.json' with { type: 'json' };
import cuvZhIndexChirho from '../index-chirho/librivox-chirho/librivox_cuv_zh_index_chirho.json' with { type: 'json' };
import svNlIndexChirho from '../index-chirho/librivox-chirho/librivox_sv_nl_index_chirho.json' with { type: 'json' };
import peElIndexChirho from '../index-chirho/librivox-chirho/librivox_pe_el_index_chirho.json' with { type: 'json' };
import steGrcIndexChirho from '../index-chirho/librivox-chirho/librivox_ste_grc_index_chirho.json' with { type: 'json' };
import csbCuIndexChirho from '../index-chirho/librivox-chirho/librivox_csb_cu_index_chirho.json' with { type: 'json' };
import sacyFrIndexChirho from '../index-chirho/librivox-chirho/librivox_sacy_fr_index_chirho.json' with { type: 'json' };
import matiuMiIndexChirho from '../index-chirho/librivox-chirho/librivox_matiu_mi_index_chirho.json' with { type: 'json' };
import { readIndexFilesChirho, type IndexFileChirho } from '../index_files_chirho';

export const LIBRIVOX_SOURCE_ID_CHIRHO = 'librivox';

interface LibrivoxEditionChirho {
	readonly id_chirho: string;
	readonly language_code_chirho: string;
	readonly language_name_chirho: string;
	readonly language_english_chirho: string;
	readonly version_chirho: string;
	readonly version_code_chirho: string;
	/** The station's own index file. */
	readonly index_file_chirho: IndexFileChirho;
}

function editionChirho(
	idChirho: string,
	languageChirho: readonly [code_chirho: string, name_chirho: string, english_chirho: string],
	versionChirho: readonly [name_chirho: string, code_chirho: string],
	indexFileChirho: IndexFileChirho
): LibrivoxEditionChirho {
	return {
		id_chirho: idChirho,
		language_code_chirho: languageChirho[0],
		language_name_chirho: languageChirho[1],
		language_english_chirho: languageChirho[2],
		version_chirho: versionChirho[0],
		version_code_chirho: versionChirho[1],
		index_file_chirho: indexFileChirho
	};
}

/**
 * Each version is named as LibriVox's catalogue names it, with the year of the text it gives:
 * the Reina-Valera Antigua (1602), Luther's Bible of 1912, the Chinese Union Version (1919),
 * the Statenvertaling, the Patriarchal Text of 1904, Stephanus's text of 1550, the Church
 * Slavonic Bible, Le Maistre de Sacy's translation, and a Māori text of 1903.
 */
const LIBRIVOX_EDITIONS_CHIRHO: readonly LibrivoxEditionChirho[] = [
	editionChirho(
		'librivox-rva-es',
		['es', 'Español', 'Spanish'],
		['Reina-Valera Antigua', 'RVA'],
		rvaEsIndexChirho
	),
	editionChirho(
		'librivox-lb1912-de',
		['de', 'Deutsch', 'German'],
		['Lutherbibel 1912', 'LB1912'],
		lb1912DeIndexChirho
	),
	editionChirho(
		'librivox-almeida-pt',
		['pt', 'Português', 'Portuguese'],
		['Almeida', 'ALMEIDA'],
		almeidaPtIndexChirho
	),
	editionChirho(
		'librivox-hebrew-he',
		['he', 'עברית', 'Hebrew'],
		['Hebrew Bible', 'HEB'],
		hebrewHeIndexChirho
	),
	editionChirho(
		'librivox-cuv-zh',
		['zh', '中文', 'Chinese'],
		['Chinese Union Version', 'CUV'],
		cuvZhIndexChirho
	),
	editionChirho(
		'librivox-sv-nl',
		['nl', 'Nederlands', 'Dutch'],
		['Statenvertaling', 'SV'],
		svNlIndexChirho
	),
	editionChirho(
		'librivox-pe-el',
		['el', 'Ελληνικά', 'Greek'],
		['Patriarchal Text of 1904', 'PE'],
		peElIndexChirho
	),
	editionChirho(
		'librivox-ste-grc',
		['grc', 'Ἑλληνική', 'Ancient Greek'],
		['Stephanus Textus Receptus 1550', 'STE'],
		steGrcIndexChirho
	),
	editionChirho(
		'librivox-csb-cu',
		['cu', 'Церковнославянский', 'Church Slavonic'],
		['Church Slavonic Bible', 'CSB'],
		csbCuIndexChirho
	),
	editionChirho(
		'librivox-sacy-fr',
		['fr', 'Français', 'French'],
		['Bible de Sacy', 'SACY'],
		sacyFrIndexChirho
	),
	editionChirho(
		'librivox-matiu-mi',
		['mi', 'Te Reo Māori', 'Maori'],
		['Māori translation, 1903 text', 'MI1903'],
		matiuMiIndexChirho
	)
];

function librivoxStationChirho({
	index_file_chirho: indexFileChirho,
	...editionChirho
}: LibrivoxEditionChirho): StationDraftChirho {
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
			files_chirho: readIndexFilesChirho(indexFileChirho, editionChirho.id_chirho)
		}
	};
}

export const LIBRIVOX_STATION_DRAFTS_CHIRHO: readonly StationDraftChirho[] =
	LIBRIVOX_EDITIONS_CHIRHO.map(librivoxStationChirho);
