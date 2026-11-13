// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Reading and writing the JSON files the catalogue scripts keep in the repository. Every file
// is written through the project's formatter, so a script's output passes the lint gate as it
// lands. Part of spec-chirho/workflows-chirho/catalogue_workflow_chirho.md.

import { readFile, writeFile } from 'node:fs/promises';
import * as prettierChirho from 'prettier';

/** The repository root, as a file URL ending in a slash. */
export const ROOT_CHIRHO = new URL('../../', import.meta.url);

/** Where a source's files live, by kind. */
export function catalogueFileChirho(
	kindChirho: 'coverage' | 'index' | 'evidence',
	nameChirho: string
): URL {
	const folderChirho = {
		coverage: 'src/lib/catalogue-chirho/stations-chirho/coverage-chirho/',
		index: 'src/lib/catalogue-chirho/stations-chirho/index-chirho/',
		evidence: 'spec-chirho/evidence-chirho/catalogue-chirho/'
	}[kindChirho];
	return new URL(`${folderChirho}${nameChirho}`, ROOT_CHIRHO);
}

/** A file's JSON, or an empty object when the file does not exist yet. */
export async function readJsonChirho(urlChirho: URL): Promise<Record<string, unknown>> {
	try {
		return JSON.parse(await readFile(urlChirho, 'utf8')) as Record<string, unknown>;
	} catch (errorChirho) {
		if ((errorChirho as { code?: string }).code === 'ENOENT') return {};
		throw errorChirho;
	}
}

export async function writeJsonChirho(urlChirho: URL, valueChirho: unknown): Promise<void> {
	const pathChirho = urlChirho.pathname;
	const optionsChirho = await prettierChirho.resolveConfig(pathChirho);
	const textChirho = await prettierChirho.format(JSON.stringify(valueChirho), {
		...optionsChirho,
		filepath: pathChirho
	});
	await writeFile(urlChirho, textChirho, 'utf8');
}

/**
 * Replace some stations' entries in a per-source file, keeping every other entry.
 * The file's shape is `{ source_id_chirho, stations_chirho: { [station id]: entry } }`.
 */
export async function mergeStationEntriesChirho(
	urlChirho: URL,
	sourceIdChirho: string,
	entriesChirho: Record<string, unknown>
): Promise<void> {
	const previousChirho = await readJsonChirho(urlChirho);
	await writeJsonChirho(urlChirho, {
		source_id_chirho: sourceIdChirho,
		stations_chirho: {
			...(previousChirho.stations_chirho as Record<string, unknown> | undefined),
			...entriesChirho
		}
	});
}

export function todayChirho(): string {
	return new Date().toISOString().slice(0, 10);
}

export function failChirho(messageChirho: string): never {
	console.error(messageChirho);
	process.exit(1);
}
