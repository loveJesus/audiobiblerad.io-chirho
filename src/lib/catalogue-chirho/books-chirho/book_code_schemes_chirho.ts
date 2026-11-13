// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Some sources name the books with their own codes. Each scheme lists all 66 codes in canon
// order, as data, so that no player needs a rule such as "capitalise it, except Titus".
// Part of spec-chirho/workflows-chirho/catalogue_workflow_chirho.md.

import { BOOKS_CHIRHO } from './books_chirho';

/**
 * The codes in the file names under https://openbible.com/audio/. Read from that host's own
 * folder listings on 2026-11-13; every chapter folder read that day used the same 66 codes.
 * Note `Tts` for Titus and the capital after a leading digit (`1Sa`).
 */
const OPENBIBLE_BOOK_CODES_CHIRHO = [
	...['Gen', 'Exo', 'Lev', 'Num', 'Deu', 'Jos', 'Jdg', 'Rut', '1Sa', '2Sa', '1Ki', '2Ki', '1Ch'],
	...['2Ch', 'Ezr', 'Neh', 'Est', 'Job', 'Psa', 'Pro', 'Ecc', 'Sng', 'Isa', 'Jer', 'Lam', 'Ezk'],
	...['Dan', 'Hos', 'Jol', 'Amo', 'Oba', 'Jon', 'Mic', 'Nam', 'Hab', 'Zep', 'Hag', 'Zec', 'Mal'],
	...['Mat', 'Mrk', 'Luk', 'Jhn', 'Act', 'Rom', '1Co', '2Co', 'Gal', 'Eph', 'Php', 'Col', '1Th'],
	...['2Th', '1Ti', '2Ti', 'Tts', 'Phm', 'Heb', 'Jas', '1Pe', '2Pe', '1Jn', '2Jn', '3Jn', 'Jud'],
	'Rev'
] as const;

/**
 * The numbered codes in eBible.org's audio file names: its own book number, an underscore, and
 * the USFM code. Genesis is 002 and Malachi 040; the numbers between belong to books outside
 * the 66; Matthew is 070 and Revelation 096. Read from https://ebible.org/eng-webbe/mp3/ on
 * 2026-11-13.
 */
const EBIBLE_NUMBERED_BOOK_CODES_CHIRHO: readonly string[] = BOOKS_CHIRHO.map((bookChirho) => {
	const numberChirho =
		bookChirho.order_chirho <= 39 ? bookChirho.order_chirho + 1 : bookChirho.order_chirho + 30;
	return `${String(numberChirho).padStart(3, '0')}_${bookChirho.id_chirho}`;
});

/**
 * The English book names in Davar Audio Bibles' file names, as `40_Matthew_01.mp3`. Read from
 * the file lists of all 431 of its recordings on 2026-11-13. Note `Canticles`, and no space
 * after a leading digit.
 */
const DAVAR_BOOK_NAMES_CHIRHO = [
	...['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth'],
	...['1Samuel', '2Samuel', '1Kings', '2Kings', '1Chronicles', '2Chronicles', 'Ezra', 'Nehemiah'],
	...['Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Canticles', 'Isaiah', 'Jeremiah'],
	...['Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah'],
	...['Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi', 'Matthew', 'Mark'],
	...['Luke', 'John', 'Acts', 'Romans', '1Corinthians', '2Corinthians', 'Galatians', 'Ephesians'],
	...['Philippians', 'Colossians', '1Thessalonians', '2Thessalonians', '1Timothy', '2Timothy'],
	...['Titus', 'Philemon', 'Hebrews', 'James', '1Peter', '2Peter', '1John', '2John', '3John'],
	...['Jude', 'Revelation']
] as const;

export const BOOK_CODE_SCHEMES_CHIRHO: Readonly<Record<string, readonly string[]>> = {
	openbible_chirho: OPENBIBLE_BOOK_CODES_CHIRHO,
	ebible_numbered_chirho: EBIBLE_NUMBERED_BOOK_CODES_CHIRHO,
	davar_chirho: DAVAR_BOOK_NAMES_CHIRHO
};
