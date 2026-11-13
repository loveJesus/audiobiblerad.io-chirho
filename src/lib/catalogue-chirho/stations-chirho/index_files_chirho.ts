// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Index files: for sources whose file names follow no rule, the address of each chapter is
// written down by a script that reads the source's own catalogue. This reads one back.
// Part of spec-chirho/workflows-chirho/catalogue_workflow_chirho.md.

import { BOOKS_CHIRHO } from '../books-chirho/books_chirho';
import type { IndexLocatorChirho } from '../contract_chirho';

/** One source's index file, as its builder script writes it. */
export interface IndexFileChirho {
	readonly source_id_chirho: string;
	/** By station id, then by book: one address per chapter, chapter 1 first. */
	readonly stations_chirho: Readonly<Record<string, unknown>>;
}

function readAddressChirho(valueChirho: unknown): string | null {
	if (typeof valueChirho !== 'string' || !URL.canParse(valueChirho)) return null;
	return new URL(valueChirho).protocol === 'https:' ? valueChirho : null;
}

/**
 * Read one station's addresses from an index file. Anything that is not a secure address in a
 * real chapter of a real book is dropped, so a damaged file can only ever make a station
 * smaller. A station with no entry has no addresses.
 */
export function readIndexFilesChirho(
	fileChirho: IndexFileChirho,
	stationIdChirho: string
): IndexLocatorChirho['files_chirho'] {
	const entryChirho = fileChirho.stations_chirho[stationIdChirho];
	if (typeof entryChirho !== 'object' || entryChirho === null) return {};
	const rawChirho = entryChirho as Record<string, unknown>;

	const filesChirho: Partial<Record<string, (string | null)[]>> = {};
	for (const bookChirho of BOOKS_CHIRHO) {
		const rawAddressesChirho = rawChirho[bookChirho.id_chirho];
		if (!Array.isArray(rawAddressesChirho)) continue;
		const addressesChirho = rawAddressesChirho
			.slice(0, bookChirho.chapters_chirho)
			.map((addressChirho) => readAddressChirho(addressChirho));
		if (addressesChirho.some((addressChirho) => addressChirho !== null)) {
			filesChirho[bookChirho.id_chirho] = addressesChirho;
		}
	}
	return filesChirho;
}
