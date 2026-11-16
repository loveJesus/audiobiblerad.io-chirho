// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Writes what the web's own catalogue code says for every built-in station and chapter: the audio
// and timings addresses, the next chapter, where a station lands, and the previous chapter as the
// web radio walks it. The Swift parity test reads this file and compares its own answers row by
// row. Usage: bun scripts-chirho/native-chirho/ios-chirho/write_locator_parity_chirho.ts <output.json>
// The output is a throwaway expectation file; write it to a temporary directory, never the repo.
// Part of spec-chirho/workflows-chirho/experience-chirho/native_players_workflow_chirho.md.

import { isAbsolute as isAbsoluteChirho } from 'node:path';
import {
	BOOKS_CHIRHO,
	STATIONS_CHIRHO,
	chapterAtOrAfterChirho,
	nextChapterChirho,
	resolveChapterChirho,
	type ChapterRefChirho,
	type StationChirho
} from '../../../src/lib/catalogue-chirho/catalogue_chirho';

const outputChirho = process.argv[2];
if (!outputChirho || !isAbsoluteChirho(outputChirho) || !outputChirho.endsWith('.json'))
	throw new Error('Give an absolute path to a .json file in a temporary directory.');

const bookIndexChirho = new Map(
	BOOKS_CHIRHO.map((bookChirho, indexChirho) => [bookChirho.id_chirho, indexChirho])
);
const totalChirho = BOOKS_CHIRHO.reduce(
	(sumChirho, bookChirho) => sumChirho + bookChirho.chapters_chirho,
	0
);

/** The web radio's previous-chapter walk, src/lib/player-chirho/radio_player_chirho.ts, over single files. */
function previousChirho(
	stationChirho: StationChirho,
	bookIdChirho: string,
	chapterChirho: number
): ChapterRefChirho | null {
	let indexChirho = bookIndexChirho.get(bookIdChirho) ?? -1;
	if (indexChirho < 0) return null;
	let candidateChirho = chapterChirho;
	for (let attemptChirho = 0; attemptChirho < totalChirho; attemptChirho += 1) {
		candidateChirho -= 1;
		if (candidateChirho < 1) {
			indexChirho = (indexChirho + BOOKS_CHIRHO.length - 1) % BOOKS_CHIRHO.length;
			candidateChirho = BOOKS_CHIRHO[indexChirho].chapters_chirho;
		}
		const candidateBookChirho = BOOKS_CHIRHO[indexChirho].id_chirho;
		if (resolveChapterChirho(stationChirho, candidateBookChirho, candidateChirho))
			return { book_id_chirho: candidateBookChirho, chapter_chirho: candidateChirho };
	}
	return null;
}

function refCellsChirho(refChirho: ChapterRefChirho | null): [number, number] {
	return refChirho
		? [bookIndexChirho.get(refChirho.book_id_chirho) ?? -1, refChirho.chapter_chirho]
		: [-1, 0];
}

const rowsChirho: unknown[][] = [];
STATIONS_CHIRHO.forEach((stationChirho, stationIndexChirho) => {
	BOOKS_CHIRHO.forEach((bookChirho, bookIndexValueChirho) => {
		for (let chapterChirho = 1; chapterChirho <= bookChirho.chapters_chirho; chapterChirho += 1) {
			const audioChirho = resolveChapterChirho(stationChirho, bookChirho.id_chirho, chapterChirho);
			rowsChirho.push([
				stationIndexChirho,
				bookIndexValueChirho,
				chapterChirho,
				audioChirho?.url_chirho ?? null,
				audioChirho?.timings_url_chirho ?? null,
				...refCellsChirho(nextChapterChirho(stationChirho, bookChirho.id_chirho, chapterChirho)),
				...refCellsChirho(
					chapterAtOrAfterChirho(stationChirho, bookChirho.id_chirho, chapterChirho)
				),
				...refCellsChirho(previousChirho(stationChirho, bookChirho.id_chirho, chapterChirho))
			]);
		}
	});
});

await Bun.write(
	outputChirho,
	JSON.stringify({
		station_ids_chirho: STATIONS_CHIRHO.map((stationChirho) => stationChirho.id_chirho),
		book_ids_chirho: BOOKS_CHIRHO.map((bookChirho) => bookChirho.id_chirho),
		rows_chirho: rowsChirho
	})
);
console.log(`Locator parity: ${rowsChirho.length} rows for ${STATIONS_CHIRHO.length} stations.`);
