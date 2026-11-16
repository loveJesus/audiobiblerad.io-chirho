// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Records what the web resolver answers for every station and every one of the 1189 chapters:
// the audio address, the dial landing, the next chapter and the previous chapter. Each answer
// list is kept as a SHA-256, so the fixture stays small while the Android catalogue tests prove
// the Kotlin port answers exactly the same. Chapters split across files are not offered natively,
// so the previous-chapter walk, copied from RadioPlayerChirho.previousChirho, uses single files.
// See spec-chirho/workflows-chirho/experience-chirho/native_players_workflow_chirho.md.
//
//   bun scripts-chirho/native-chirho/android-chirho/export_parity_chirho.ts
//   bun scripts-chirho/native-chirho/android-chirho/export_parity_chirho.ts --check-chirho

import { createHash } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import {
	BOOKS_CHIRHO,
	CATALOGUE_CHIRHO,
	chapterAtOrAfterChirho,
	nextChapterChirho,
	resolveChapterChirho,
	type StationChirho
} from '../../../src/lib/catalogue-chirho/catalogue_chirho';

const OUTPUT_DIR_CHIRHO = new URL(
	'../../../apps-chirho/android-chirho/app-chirho/src/test/resources/',
	import.meta.url
);
const OUTPUT_CHIRHO = new URL('catalogue_parity_chirho.json', OUTPUT_DIR_CHIRHO);
const TOTAL_CHAPTERS_CHIRHO = 1189;

const shaChirho = (textChirho: string): string =>
	createHash('sha256').update(textChirho).digest('hex');

function previousChirho(
	stationChirho: StationChirho,
	bookIdChirho: string,
	chapterChirho: number
): string {
	let indexChirho = BOOKS_CHIRHO.findIndex((bookChirho) => bookChirho.id_chirho === bookIdChirho);
	let placeChirho = chapterChirho;
	for (let attemptChirho = 0; attemptChirho < TOTAL_CHAPTERS_CHIRHO; attemptChirho += 1) {
		placeChirho -= 1;
		if (placeChirho < 1) {
			indexChirho = (indexChirho + BOOKS_CHIRHO.length - 1) % BOOKS_CHIRHO.length;
			placeChirho = BOOKS_CHIRHO[indexChirho].chapters_chirho;
		}
		if (resolveChapterChirho(stationChirho, BOOKS_CHIRHO[indexChirho].id_chirho, placeChirho))
			return `${BOOKS_CHIRHO[indexChirho].id_chirho}.${placeChirho}`;
	}
	return '-';
}

const stationsChirho = CATALOGUE_CHIRHO.stations_chirho.map((stationChirho) => {
	let resolvedChirho = '';
	let landingChirho = '';
	let nextChirho = '';
	let previousListChirho = '';
	let countChirho = 0;
	for (const bookChirho of BOOKS_CHIRHO) {
		for (let chapterChirho = 1; chapterChirho <= bookChirho.chapters_chirho; chapterChirho += 1) {
			const placeChirho = `${bookChirho.id_chirho}.${chapterChirho}`;
			const audioChirho = resolveChapterChirho(stationChirho, bookChirho.id_chirho, chapterChirho);
			if (audioChirho) {
				resolvedChirho += `${placeChirho}=${audioChirho.url_chirho}\n`;
				countChirho += 1;
			}
			const landsChirho = chapterAtOrAfterChirho(
				stationChirho,
				bookChirho.id_chirho,
				chapterChirho
			);
			landingChirho += `${placeChirho}>${landsChirho ? `${landsChirho.book_id_chirho}.${landsChirho.chapter_chirho}` : '-'}\n`;
			const afterChirho = nextChapterChirho(stationChirho, bookChirho.id_chirho, chapterChirho);
			nextChirho += `${placeChirho}>${afterChirho ? `${afterChirho.book_id_chirho}.${afterChirho.chapter_chirho}` : '-'}\n`;
			previousListChirho += `${placeChirho}>${previousChirho(stationChirho, bookChirho.id_chirho, chapterChirho)}\n`;
		}
	}
	return {
		id_chirho: stationChirho.id_chirho,
		resolved_count_chirho: countChirho,
		resolved_sha256_chirho: shaChirho(resolvedChirho),
		landing_sha256_chirho: shaChirho(landingChirho),
		next_sha256_chirho: shaChirho(nextChirho),
		previous_sha256_chirho: shaChirho(previousListChirho)
	};
});

const expectedChirho = `${JSON.stringify(
	{
		catalogue_sha256_chirho: shaChirho(`${JSON.stringify(CATALOGUE_CHIRHO)}\n`),
		stations_chirho: stationsChirho
	},
	null,
	'\t'
)}\n`;
const fileChirho = Bun.file(OUTPUT_CHIRHO);
if (process.argv.includes('--check-chirho')) {
	if (!(await fileChirho.exists()) || (await fileChirho.text()) !== expectedChirho)
		throw new Error('Android catalogue parity fixture is stale; run its exporter.');
	console.log('Android catalogue parity fixture matches the web resolver.');
} else {
	mkdirSync(OUTPUT_DIR_CHIRHO, { recursive: true });
	await Bun.write(OUTPUT_CHIRHO, expectedChirho);
	console.log(`Android catalogue parity fixture: ${stationsChirho.length} stations.`);
}
