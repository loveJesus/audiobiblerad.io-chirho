// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// The catalogue: every station that is cleared to play, and how to find a chapter on it.
// This file is the whole public surface. Players import from here and nowhere deeper.
// Part of spec-chirho/workflows-chirho/catalogue_workflow_chirho.md.

import { BOOKS_CHIRHO } from './books-chirho/books_chirho';
import { BOOK_CODE_SCHEMES_CHIRHO } from './books-chirho/book_code_schemes_chirho';
import {
	CATALOGUE_CONTRACT_VERSION_CHIRHO,
	type CatalogueChirho,
	type StationChirho
} from './contract_chirho';
import { buildStationChirho } from './stations-chirho/station_builder_chirho';
import { STATION_SOURCES_CHIRHO } from './stations-chirho/station_sources_chirho';

export {
	BOOKS_CHIRHO,
	findBookChirho,
	isBookIdChirho,
	type BookChirho,
	type BookIdChirho
} from './books-chirho/books_chirho';
export {
	CATALOGUE_CONTRACT_VERSION_CHIRHO,
	type CatalogueChirho,
	type ChapterAudioChirho,
	type ChapterRangeChirho,
	type ChapterRefChirho,
	type CoverageChirho,
	type IndexLocatorChirho,
	type LocatorChirho,
	type PatternLocatorChirho,
	type StationChirho,
	type TimingsSourceChirho,
	type VoiceKindChirho
} from './contract_chirho';
export {
	chapterAtOrAfterChirho,
	nextChapterChirho,
	resolveChapterChirho,
	stationHasChapterChirho
} from './locate-chirho/locate_chirho';
export { parseVerseTimingsChirho } from './locate-chirho/timings_chirho';
export {
	LANGUAGE_LIST_PATH_CHIRHO,
	fetchingReaderChirho,
	languageFilePathChirho,
	loadLanguageListChirho,
	loadLanguageStationsChirho,
	type CatalogueReaderChirho,
	type LanguageEntryChirho
} from './languages-chirho/language_loader_chirho';

/**
 * Every station cleared to play, in a stable order grouped by language.
 *
 * A station is here only when its licence and credit are recorded and at least one chapter was
 * verified at its source. Read-only by type rather than frozen, so it can be held in reactive
 * state; nothing should write to it.
 */
export const STATIONS_CHIRHO: readonly StationChirho[] = STATION_SOURCES_CHIRHO.flatMap(
	(sourceChirho) =>
		sourceChirho.drafts_chirho.map((draftChirho) =>
			buildStationChirho(draftChirho, sourceChirho.coverage_file_chirho)
		)
).filter((stationChirho) => stationChirho.chapter_count_chirho > 0);

const STATIONS_BY_ID_CHIRHO: ReadonlyMap<string, StationChirho> = new Map(
	STATIONS_CHIRHO.map((stationChirho) => [stationChirho.id_chirho, stationChirho])
);

/** The station for an id, or nothing. Safe to call with a remembered or otherwise untrusted value. */
export function findStationChirho(stationIdChirho: unknown): StationChirho | undefined {
	return typeof stationIdChirho === 'string'
		? STATIONS_BY_ID_CHIRHO.get(stationIdChirho)
		: undefined;
}

/** The same catalogue as one JSON-safe object, for players that do not run this module. */
export const CATALOGUE_CHIRHO: CatalogueChirho = {
	contract_version_chirho: CATALOGUE_CONTRACT_VERSION_CHIRHO,
	books_chirho: BOOKS_CHIRHO,
	book_code_schemes_chirho: BOOK_CODE_SCHEMES_CHIRHO,
	stations_chirho: STATIONS_CHIRHO
};
