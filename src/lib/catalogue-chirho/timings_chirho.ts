// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Verse timings: turning a source's own timings file into one plain list, so that two stations
// can be held on the same verse when the dial turns.
// Part of spec-chirho/workflows-chirho/catalogue_workflow_chirho.md.

import type { StationChirho } from './contract_chirho';

function isRecordChirho(valueChirho: unknown): valueChirho is Record<string, unknown> {
	return typeof valueChirho === 'object' && valueChirho !== null && !Array.isArray(valueChirho);
}

function isStartTimeChirho(valueChirho: unknown): valueChirho is number {
	return typeof valueChirho === 'number' && Number.isFinite(valueChirho) && valueChirho >= 0;
}

/**
 * Read a timings file that was fetched from a chapter's `timings_url_chirho`.
 *
 * Returns each verse's start in seconds, verse 1 first, so `resultChirho[0]` is where verse 1
 * begins. A chapter usually opens with a spoken heading, so verse 1 rarely starts at zero.
 *
 * Returns nothing when the station has no timings or the file is not in the expected form:
 * missing, empty, holding anything that is not a time, or running backwards. The caller then
 * carries the position over by fraction instead.
 */
export function parseVerseTimingsChirho(
	stationChirho: StationChirho,
	jsonChirho: unknown
): readonly number[] | null {
	if (stationChirho.timings_chirho?.format_chirho !== 'verse-starts-list-chirho') return null;
	if (!isRecordChirho(jsonChirho)) return null;

	const versesChirho = jsonChirho.verses;
	if (!Array.isArray(versesChirho) || versesChirho.length === 0) return null;

	const startsChirho: number[] = [];
	for (const startChirho of versesChirho) {
		if (!isStartTimeChirho(startChirho)) return null;
		const previousChirho = startsChirho.at(-1);
		if (previousChirho !== undefined && startChirho < previousChirho) return null;
		startsChirho.push(startChirho);
	}
	return startsChirho;
}
