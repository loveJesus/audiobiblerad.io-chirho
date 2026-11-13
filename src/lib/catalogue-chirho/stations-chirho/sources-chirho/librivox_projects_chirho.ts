// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Which LibriVox recordings the index is built from. Kept apart from the stations so that the
// script that writes the index does not have to read the index it is about to write.
// Part of spec-chirho/workflows-chirho/catalogue_workflow_chirho.md.

import type { BookIdChirho } from '../../books-chirho/books_chirho';

/** One LibriVox recording of one book, and the station it belongs to. */
export interface LibrivoxProjectChirho {
	readonly station_id_chirho: string;
	/** The recording's number in LibriVox's catalogue. */
	readonly librivox_id_chirho: number;
	readonly book_id_chirho: BookIdChirho;
}

/** The recordings the index is built from. Each was checked to have one section per chapter. */
export const LIBRIVOX_PROJECTS_CHIRHO: readonly LibrivoxProjectChirho[] = [
	{ station_id_chirho: 'librivox-rv1909-es', librivox_id_chirho: 1795, book_id_chirho: 'JHN' },
	{ station_id_chirho: 'librivox-lb1912-de', librivox_id_chirho: 2952, book_id_chirho: 'MAT' },
	{ station_id_chirho: 'librivox-almeida-pt', librivox_id_chirho: 10668, book_id_chirho: 'RUT' },
	{ station_id_chirho: 'librivox-almeida-pt', librivox_id_chirho: 17520, book_id_chirho: 'ECC' },
	{ station_id_chirho: 'librivox-hebrew-he', librivox_id_chirho: 519, book_id_chirho: 'GEN' }
];
