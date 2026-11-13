// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Stations beyond the built-in ones, loaded by language and only when asked for.
// There is one small list of languages and one small file per language. Nothing here is
// fetched until a listener goes looking, so the first sound costs what it always did.
// Once a language is loaded its stations are ordinary stations: every function that finds a
// chapter works on them, with no network. Part of
// spec-chirho/workflows-chirho/catalogue_workflow_chirho.md.

import { CATALOGUE_CONTRACT_VERSION_CHIRHO, type StationChirho } from '../contract_chirho';
import { readStationChirho } from './station_reader_chirho';

/** One language in the list: enough to show it and to know whether it is worth opening. */
export interface LanguageEntryChirho {
	/** BCP 47 language tag, lower case: `hi`, `aar`. */
	readonly code_chirho: string;
	/** The language's name in that language where it is known, otherwise in English. */
	readonly name_chirho: string;
	readonly english_chirho: string;
	readonly station_count_chirho: number;
	/** True when at least one of its stations has every chapter. */
	readonly has_whole_bible_chirho: boolean;
}

/** Reads one catalogue file by its path and gives back what it holds, parsed. */
export type CatalogueReaderChirho = (pathChirho: string) => Promise<unknown>;

/** Paths are relative to the site's root, with no leading slash. */
export const LANGUAGE_LIST_PATH_CHIRHO = 'catalogue-chirho/languages_chirho.json';

const LANGUAGE_CODE_PATTERN_CHIRHO = /^[a-z]{2,3}(-[a-z0-9]+)*$/;

function isRecordChirho(valueChirho: unknown): valueChirho is Record<string, unknown> {
	return typeof valueChirho === 'object' && valueChirho !== null && !Array.isArray(valueChirho);
}

/**
 * Where a language's file is, or nothing for a code that is not one. The path is built from
 * the code and never taken from data, so no file can send a reader anywhere else.
 */
export function languageFilePathChirho(codeChirho: unknown): string | null {
	if (typeof codeChirho !== 'string' || !LANGUAGE_CODE_PATTERN_CHIRHO.test(codeChirho)) return null;
	return `catalogue-chirho/languages-chirho/${codeChirho[0]}/${codeChirho}.json`;
}

/** A file written under a contract this code does not know is not read at all. */
function hasKnownContractChirho(valueChirho: unknown): valueChirho is Record<string, unknown> {
	return (
		isRecordChirho(valueChirho) &&
		valueChirho.contract_version_chirho === CATALOGUE_CONTRACT_VERSION_CHIRHO
	);
}

/** Read the language list. Entries that are not well formed are dropped. */
export function readLanguageListChirho(valueChirho: unknown): LanguageEntryChirho[] {
	if (!hasKnownContractChirho(valueChirho) || !Array.isArray(valueChirho.languages_chirho))
		return [];
	const entriesChirho: LanguageEntryChirho[] = [];
	const seenChirho = new Set<string>();
	for (const rawChirho of valueChirho.languages_chirho as unknown[]) {
		if (!isRecordChirho(rawChirho)) continue;
		const {
			code_chirho: codeChirho,
			name_chirho: nameChirho,
			english_chirho: englishChirho,
			station_count_chirho: countChirho,
			has_whole_bible_chirho: wholeChirho
		} = rawChirho;
		if (languageFilePathChirho(codeChirho) === null || seenChirho.has(codeChirho as string))
			continue;
		if (typeof nameChirho !== 'string' || nameChirho.trim() === '') continue;
		if (typeof englishChirho !== 'string' || englishChirho.trim() === '') continue;
		if (typeof countChirho !== 'number' || !Number.isInteger(countChirho) || countChirho < 1)
			continue;
		if (typeof wholeChirho !== 'boolean') continue;
		seenChirho.add(codeChirho as string);
		entriesChirho.push({
			code_chirho: codeChirho as string,
			name_chirho: nameChirho,
			english_chirho: englishChirho,
			station_count_chirho: countChirho,
			has_whole_bible_chirho: wholeChirho
		});
	}
	return entriesChirho;
}

/**
 * Read one language's file. Only well-formed stations in that very language are kept, each
 * id once, so a file cannot smuggle in a station under another language's name.
 */
export function readLanguageStationsChirho(
	codeChirho: string,
	valueChirho: unknown
): StationChirho[] {
	if (!hasKnownContractChirho(valueChirho) || !Array.isArray(valueChirho.stations_chirho))
		return [];
	const stationsChirho: StationChirho[] = [];
	const seenChirho = new Set<string>();
	for (const rawChirho of valueChirho.stations_chirho as unknown[]) {
		const stationChirho = readStationChirho(rawChirho);
		if (!stationChirho || stationChirho.language_code_chirho !== codeChirho) continue;
		if (seenChirho.has(stationChirho.id_chirho)) continue;
		seenChirho.add(stationChirho.id_chirho);
		stationsChirho.push(stationChirho);
	}
	return stationsChirho;
}

/** The languages that have stations beyond the built-in ones. Rejects when the list cannot be read. */
export async function loadLanguageListChirho(
	readerChirho: CatalogueReaderChirho
): Promise<readonly LanguageEntryChirho[]> {
	return readLanguageListChirho(await readerChirho(LANGUAGE_LIST_PATH_CHIRHO));
}

/**
 * The stations of one language, complete and ready to play. Gives none for a code that is not
 * a language code; rejects when the file cannot be read.
 */
export async function loadLanguageStationsChirho(
	codeChirho: string,
	readerChirho: CatalogueReaderChirho
): Promise<readonly StationChirho[]> {
	const pathChirho = languageFilePathChirho(codeChirho);
	if (pathChirho === null) return [];
	return readLanguageStationsChirho(codeChirho, await readerChirho(pathChirho));
}

/**
 * A reader for the browser and the worker: it fetches from this site.
 * `baseChirho` is the site's root and must end in a slash.
 */
export function fetchingReaderChirho(
	fetchChirho: typeof fetch = fetch,
	baseChirho = '/'
): CatalogueReaderChirho {
	return async (pathChirho) => {
		const responseChirho = await fetchChirho(`${baseChirho}${pathChirho}`, {
			credentials: 'omit'
		});
		if (!responseChirho.ok)
			throw new Error(`catalogue file ${pathChirho}: ${responseChirho.status}`);
		return (await responseChirho.json()) as unknown;
	};
}
