// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Which LibriVox recordings the index is built from. Kept apart from the stations so that the
// script that writes the index does not have to read the index it is about to write.
// Part of spec-chirho/workflows-chirho/catalogue_workflow_chirho.md.

import type { BookIdChirho } from '../../books-chirho/books_chirho';

/** One LibriVox recording, the station it belongs to, and the book or books it reads. */
export interface LibrivoxProjectChirho {
	readonly station_id_chirho: string;
	/** The recording's number in LibriVox's catalogue. */
	readonly librivox_id_chirho: number;
	/** The books the recording reads, in its own order. Its sections are their chapters in turn. */
	readonly book_ids_chirho: readonly BookIdChirho[];
	/** For a recording that stops early: how many chapters of its one book it reads, from the first. */
	readonly first_chapters_chirho?: number;
}

function projectsChirho(
	stationIdChirho: string,
	recordingsChirho: readonly (readonly [number, ...BookIdChirho[]])[]
): LibrivoxProjectChirho[] {
	return recordingsChirho.map(([librivoxIdChirho, ...bookIdsChirho]) => ({
		station_id_chirho: stationIdChirho,
		librivox_id_chirho: librivoxIdChirho,
		book_ids_chirho: bookIdsChirho
	}));
}

/**
 * The recordings the index is built from. Each was read in LibriVox's catalogue on 2026-11-13
 * and has one section per chapter. The script checks that again every time it runs.
 *
 * Where LibriVox has two recordings of a book in Spanish, the one that reads the older
 * Reina-Valera text is taken, so that the station is one version throughout.
 */
export const LIBRIVOX_PROJECTS_CHIRHO: readonly LibrivoxProjectChirho[] = [
	...projectsChirho('librivox-rva-es', [
		[12705, 'GEN'],
		[11251, 'EXO'],
		[13008, 'LEV'],
		[14590, 'NUM'],
		[16378, 'DEU'],
		[11063, 'JOS'],
		[11767, 'JDG'],
		[10884, 'RUT'],
		[13160, '1SA'],
		[13839, '2SA'],
		[14218, '1KI'],
		[14344, '2KI'],
		[16794, '1CH'],
		[16953, '2CH'],
		[14005, 'EZR'],
		[13084, 'NEH'],
		[10810, 'EST'],
		[16636, 'JOB'],
		[13303, 'PSA'],
		[9979, 'PRO'],
		[14035, 'ECC'],
		[13136, 'SNG'],
		[14964, 'JER'],
		[14051, 'LAM'],
		[14060, 'EZK'],
		[11002, 'DAN'],
		[10719, 'MAT'],
		[11517, 'LUK'],
		[12090, 'JHN'],
		[12595, 'ROM'],
		[11883, '1CO'],
		[11975, '2CO'],
		[11057, 'GAL'],
		[11426, 'EPH'],
		[11408, 'PHP'],
		[12463, '1TH', '2TH'],
		[10671, 'PHM'],
		[10672, 'HEB'],
		[12550, 'JAS'],
		[12043, '1JN', '2JN', '3JN'],
		[12236, 'JUD'],
		[10827, 'REV']
	]),
	...projectsChirho('librivox-lb1912-de', [[2952, 'MAT']]),
	...projectsChirho('librivox-almeida-pt', [
		[10668, 'RUT'],
		[17520, 'ECC']
	]),
	...projectsChirho('librivox-hebrew-he', [[519, 'GEN']]),
	...projectsChirho('librivox-cuv-zh', [
		[5140, 'MRK'],
		[5659, 'LUK'],
		[13410, 'JHN']
	]),
	...projectsChirho('librivox-sv-nl', [
		[11674, 'JHN'],
		[11937, 'REV']
	]),
	...projectsChirho('librivox-pe-el', [
		[2889, 'MAT'],
		[4115, 'COL']
	]),
	...projectsChirho('librivox-ste-grc', [[2242, 'JAS']]),
	...projectsChirho('librivox-csb-cu', [[2218, 'GEN']]),
	...projectsChirho('librivox-sacy-fr', [[10039, 'MRK']]),
	{
		station_id_chirho: 'librivox-matiu-mi',
		librivox_id_chirho: 8758,
		book_ids_chirho: ['MAT'],
		first_chapters_chirho: 9
	}
];
