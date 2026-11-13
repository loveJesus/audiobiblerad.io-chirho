// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Index files: for sources whose file names follow no rule, the address of each chapter is
// written down by a script that reads the source's own catalogue. This reads one back.
// There is one file per station, so that no file can outgrow a whole Bible's worth of lines.
// Part of spec-chirho/workflows-chirho/catalogue_workflow_chirho.md.

import { BOOKS_CHIRHO } from '../books-chirho/books_chirho';
import type { IndexLocatorChirho } from '../contract_chirho';

/** One station's index file, as its builder script writes it. */
export interface IndexFileChirho {
	readonly station_id_chirho: string;
	/** By book: one address per chapter, chapter 1 first. Read with `readIndexFilesChirho`. */
	readonly files_chirho: Readonly<Record<string, unknown>>;
}

function readAddressChirho(valueChirho: unknown): string | null {
	if (typeof valueChirho !== 'string' || !URL.canParse(valueChirho)) return null;
	return new URL(valueChirho).protocol === 'https:' ? valueChirho : null;
}

/**
 * Read a station's addresses from its index file. Anything that is not a secure address in a
 * real chapter of a real book is dropped, so a damaged file can only ever make a station
 * smaller. A file written for another station gives no addresses at all.
 */
export function readIndexFilesChirho(
	fileChirho: IndexFileChirho,
	stationIdChirho: string
): IndexLocatorChirho['files_chirho'] {
	const rawChirho: unknown = fileChirho.files_chirho;
	if (fileChirho.station_id_chirho !== stationIdChirho) return {};
	if (typeof rawChirho !== 'object' || rawChirho === null) return {};
	const byBookChirho = rawChirho as Record<string, unknown>;

	const filesChirho: Partial<Record<string, (string | null)[]>> = {};
	for (const bookChirho of BOOKS_CHIRHO) {
		const rawAddressesChirho = byBookChirho[bookChirho.id_chirho];
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
