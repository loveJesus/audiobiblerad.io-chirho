// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// The 66 books in canon order, with the chapter count of each. Every station is addressed by
// these ids and chapter numbers, on every platform.
//
// The ids are the USFM book codes. The counts were checked on 2026-11-13 against the book list
// the Free Use Bible API publishes for the Berean Standard Bible: 66 books, 1,189 chapters.
// Part of spec-chirho/workflows-chirho/catalogue_workflow_chirho.md.

const BOOK_ROWS_CHIRHO = [
	['GEN', 'Genesis', 50],
	['EXO', 'Exodus', 40],
	['LEV', 'Leviticus', 27],
	['NUM', 'Numbers', 36],
	['DEU', 'Deuteronomy', 34],
	['JOS', 'Joshua', 24],
	['JDG', 'Judges', 21],
	['RUT', 'Ruth', 4],
	['1SA', '1 Samuel', 31],
	['2SA', '2 Samuel', 24],
	['1KI', '1 Kings', 22],
	['2KI', '2 Kings', 25],
	['1CH', '1 Chronicles', 29],
	['2CH', '2 Chronicles', 36],
	['EZR', 'Ezra', 10],
	['NEH', 'Nehemiah', 13],
	['EST', 'Esther', 10],
	['JOB', 'Job', 42],
	['PSA', 'Psalms', 150],
	['PRO', 'Proverbs', 31],
	['ECC', 'Ecclesiastes', 12],
	['SNG', 'Song of Solomon', 8],
	['ISA', 'Isaiah', 66],
	['JER', 'Jeremiah', 52],
	['LAM', 'Lamentations', 5],
	['EZK', 'Ezekiel', 48],
	['DAN', 'Daniel', 12],
	['HOS', 'Hosea', 14],
	['JOL', 'Joel', 3],
	['AMO', 'Amos', 9],
	['OBA', 'Obadiah', 1],
	['JON', 'Jonah', 4],
	['MIC', 'Micah', 7],
	['NAM', 'Nahum', 3],
	['HAB', 'Habakkuk', 3],
	['ZEP', 'Zephaniah', 3],
	['HAG', 'Haggai', 2],
	['ZEC', 'Zechariah', 14],
	['MAL', 'Malachi', 4],
	['MAT', 'Matthew', 28],
	['MRK', 'Mark', 16],
	['LUK', 'Luke', 24],
	['JHN', 'John', 21],
	['ACT', 'Acts', 28],
	['ROM', 'Romans', 16],
	['1CO', '1 Corinthians', 16],
	['2CO', '2 Corinthians', 13],
	['GAL', 'Galatians', 6],
	['EPH', 'Ephesians', 6],
	['PHP', 'Philippians', 4],
	['COL', 'Colossians', 4],
	['1TH', '1 Thessalonians', 5],
	['2TH', '2 Thessalonians', 3],
	['1TI', '1 Timothy', 6],
	['2TI', '2 Timothy', 4],
	['TIT', 'Titus', 3],
	['PHM', 'Philemon', 1],
	['HEB', 'Hebrews', 13],
	['JAS', 'James', 5],
	['1PE', '1 Peter', 5],
	['2PE', '2 Peter', 3],
	['1JN', '1 John', 5],
	['2JN', '2 John', 1],
	['3JN', '3 John', 1],
	['JUD', 'Jude', 1],
	['REV', 'Revelation', 22]
] as const;

/** A USFM book code, upper case: 'GEN' … 'REV'. */
export type BookIdChirho = (typeof BOOK_ROWS_CHIRHO)[number][0];

export interface BookChirho {
	/** USFM book code, upper case. */
	readonly id_chirho: BookIdChirho;
	/** Place in the canon, 1 for Genesis to 66 for Revelation. */
	readonly order_chirho: number;
	/** The book's name in English. */
	readonly name_chirho: string;
	/** How many chapters the book has. */
	readonly chapters_chirho: number;
}

// Read-only by type, not frozen: a frozen object cannot be held in Svelte's reactive state.
export const BOOKS_CHIRHO: readonly BookChirho[] = BOOK_ROWS_CHIRHO.map(
	([idChirho, nameChirho, chaptersChirho], indexChirho) => ({
		id_chirho: idChirho,
		order_chirho: indexChirho + 1,
		name_chirho: nameChirho,
		chapters_chirho: chaptersChirho
	})
);

const BOOKS_BY_ID_CHIRHO: ReadonlyMap<string, BookChirho> = new Map(
	BOOKS_CHIRHO.map((bookChirho) => [bookChirho.id_chirho, bookChirho])
);

/** The book for an id, or nothing. Safe to call with a remembered or otherwise untrusted value. */
export function findBookChirho(bookIdChirho: unknown): BookChirho | undefined {
	return typeof bookIdChirho === 'string' ? BOOKS_BY_ID_CHIRHO.get(bookIdChirho) : undefined;
}

export function isBookIdChirho(valueChirho: unknown): valueChirho is BookIdChirho {
	return findBookChirho(valueChirho) !== undefined;
}
