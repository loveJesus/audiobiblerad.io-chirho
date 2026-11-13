// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Writes the LibriVox index: the address of every chapter of every recording named in
// LIBRIVOX_PROJECTS_CHIRHO, read from LibriVox's own catalogue. One request per recording.
//
//   bun scripts-chirho/catalogue-chirho/build_librivox_index_chirho.ts
//
// Writes:
//   src/lib/catalogue-chirho/stations-chirho/index-chirho/librivox_index_chirho.json
//   spec-chirho/evidence-chirho/catalogue-chirho/librivox_index_chirho.json
//
// A recording is indexed only when its sections are the book's chapters, one for one: as many
// sections as the book has chapters, numbered from 1, each titled with its own number, each
// with a secure address. If any recording fails that, or cannot be read, nothing is written.
// Run the availability check for `librivox` afterwards: an address is not yet a file.
// Part of spec-chirho/workflows-chirho/catalogue_workflow_chirho.md.

import { findBookChirho } from '../../src/lib/catalogue-chirho/books-chirho/books_chirho';
import {
	LIBRIVOX_PROJECTS_CHIRHO,
	type LibrivoxProjectChirho
} from '../../src/lib/catalogue-chirho/stations-chirho/sources-chirho/librivox_projects_chirho';
import { catalogueFileChirho, failChirho, todayChirho, writeJsonChirho } from './files_chirho';
import { requestChirho, sleepChirho } from './probe_chirho';

const SOURCE_ID_CHIRHO = 'librivox';
const PAUSE_BETWEEN_RECORDINGS_MS_CHIRHO = 1_000;

interface IndexedRecordingChirho {
	readonly addresses_chirho: string[];
	readonly evidence_chirho: Record<string, unknown>;
}

function isRecordChirho(valueChirho: unknown): valueChirho is Record<string, unknown> {
	return typeof valueChirho === 'object' && valueChirho !== null && !Array.isArray(valueChirho);
}

/** The last whole number written in a title: 3 for "Capítulo 03". */
function numberInTitleChirho(titleChirho: unknown): number | null {
	const foundChirho = typeof titleChirho === 'string' ? titleChirho.match(/\d+/g) : null;
	return foundChirho ? Number(foundChirho.at(-1)) : null;
}

/**
 * The catalogue gives addresses at `www.archive.org`, which only redirects to `archive.org`.
 * Starting at the second saves every listener one round trip before the first sound.
 */
function withoutExtraHopChirho(addressChirho: string): string {
	return addressChirho.replace(/^https:\/\/www\.archive\.org\//, 'https://archive.org/');
}

/** Read one recording. Returns a reason, as text, when it cannot be indexed. */
async function indexRecordingChirho(
	projectChirho: LibrivoxProjectChirho
): Promise<IndexedRecordingChirho | string> {
	const bookChirho = findBookChirho(projectChirho.book_id_chirho);
	if (!bookChirho) return 'the book is not one of the 66';

	const responseChirho = await requestChirho(
		`https://librivox.org/api/feed/audiobooks?id=${projectChirho.librivox_id_chirho}&format=json&extended=1`,
		'GET'
	);
	if (!responseChirho || responseChirho.status !== 200) {
		return `the catalogue answered ${responseChirho?.status ?? 'nothing'}`;
	}
	let bodyChirho: unknown;
	try {
		bodyChirho = await responseChirho.json();
	} catch {
		return 'the catalogue did not answer in JSON';
	}
	const recordingChirho =
		isRecordChirho(bodyChirho) && Array.isArray(bodyChirho.books) ? bodyChirho.books[0] : null;
	if (!isRecordChirho(recordingChirho) || !Array.isArray(recordingChirho.sections)) {
		return 'the catalogue has no such recording, or it has no sections';
	}
	const sectionsChirho: unknown[] = recordingChirho.sections;
	if (sectionsChirho.length !== bookChirho.chapters_chirho) {
		return `${sectionsChirho.length} sections for a book of ${bookChirho.chapters_chirho} chapters`;
	}

	const addressesChirho: string[] = [];
	const readersChirho = new Set<unknown>();
	for (const [indexChirho, sectionChirho] of sectionsChirho.entries()) {
		const chapterChirho = indexChirho + 1;
		if (!isRecordChirho(sectionChirho)) return `section ${chapterChirho} is not readable`;
		if (Number(sectionChirho.section_number) !== chapterChirho) {
			return `section ${chapterChirho} is numbered ${String(sectionChirho.section_number)}`;
		}
		if (numberInTitleChirho(sectionChirho.title) !== chapterChirho) {
			return `section ${chapterChirho} is titled "${String(sectionChirho.title)}"`;
		}
		const addressChirho = sectionChirho.listen_url;
		if (
			typeof addressChirho !== 'string' ||
			!URL.canParse(addressChirho) ||
			new URL(addressChirho).protocol !== 'https:'
		) {
			return `section ${chapterChirho} has no secure address`;
		}
		addressesChirho.push(withoutExtraHopChirho(addressChirho));
		for (const readerChirho of Array.isArray(sectionChirho.readers) ? sectionChirho.readers : []) {
			if (isRecordChirho(readerChirho)) readersChirho.add(readerChirho.reader_id);
		}
	}

	return {
		addresses_chirho: addressesChirho,
		evidence_chirho: {
			station_id_chirho: projectChirho.station_id_chirho,
			book_id_chirho: projectChirho.book_id_chirho,
			librivox_id_chirho: projectChirho.librivox_id_chirho,
			title_chirho: recordingChirho.title,
			language_chirho: recordingChirho.language,
			page_chirho: recordingChirho.url_librivox,
			text_source_chirho: recordingChirho.url_text_source,
			text_year_chirho: recordingChirho.copyright_year,
			sections_chirho: sectionsChirho.length,
			seconds_chirho: recordingChirho.totaltimesecs,
			readers_chirho: readersChirho.size,
			checked_chirho: 'one section per chapter, numbered and titled 1 to the last'
		}
	};
}

const indexChirho: Record<string, Record<string, string[]>> = {};
const evidenceChirho: unknown[] = [];
const refusedChirho: string[] = [];
for (const projectChirho of LIBRIVOX_PROJECTS_CHIRHO) {
	const labelChirho = `${projectChirho.station_id_chirho} ${projectChirho.book_id_chirho} (LibriVox ${projectChirho.librivox_id_chirho})`;
	const indexedChirho = await indexRecordingChirho(projectChirho);
	if (typeof indexedChirho === 'string') {
		refusedChirho.push(`${labelChirho}: ${indexedChirho}`);
		console.log(`  refused ${labelChirho}: ${indexedChirho}`);
	} else {
		(indexChirho[projectChirho.station_id_chirho] ??= {})[projectChirho.book_id_chirho] =
			indexedChirho.addresses_chirho;
		evidenceChirho.push(indexedChirho.evidence_chirho);
		console.log(`  indexed ${labelChirho}: ${indexedChirho.addresses_chirho.length} chapters`);
	}
	await sleepChirho(PAUSE_BETWEEN_RECORDINGS_MS_CHIRHO);
}

if (refusedChirho.length > 0) {
	failChirho(`Nothing was written. Could not index:\n${refusedChirho.join('\n')}`);
}

await writeJsonChirho(catalogueFileChirho('index', 'librivox_index_chirho.json'), {
	source_id_chirho: SOURCE_ID_CHIRHO,
	stations_chirho: indexChirho
});
await writeJsonChirho(catalogueFileChirho('evidence', 'librivox_index_chirho.json'), {
	source_id_chirho: SOURCE_ID_CHIRHO,
	built_on_chirho: todayChirho(),
	recordings_chirho: evidenceChirho
});
console.log('done');
