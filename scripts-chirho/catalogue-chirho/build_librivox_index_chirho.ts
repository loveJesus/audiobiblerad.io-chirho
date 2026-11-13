// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Writes the LibriVox index: the address of every chapter of every recording named in
// LIBRIVOX_PROJECTS_CHIRHO, read from LibriVox's own catalogue. One request per recording.
//
//   bun scripts-chirho/catalogue-chirho/build_librivox_index_chirho.ts
//
// Writes:
//   src/lib/catalogue-chirho/stations-chirho/index-chirho/librivox-chirho/<station>_index_chirho.json
//   spec-chirho/evidence-chirho/catalogue-chirho/librivox_index_chirho.json
//
// A recording is indexed only when its sections are its chapters, one for one; the rule is in
// librivox_sections_chirho.ts. If any recording fails it, or cannot be read, nothing is
// written. Run the availability check for `librivox` afterwards: an address is not yet a file.
// Part of spec-chirho/workflows-chirho/catalogue_workflow_chirho.md.

import type { BookIdChirho } from '../../src/lib/catalogue-chirho/books-chirho/books_chirho';
import {
	LIBRIVOX_PROJECTS_CHIRHO,
	type LibrivoxProjectChirho
} from '../../src/lib/catalogue-chirho/stations-chirho/sources-chirho/librivox_projects_chirho';
import {
	readLibrivoxSectionsChirho,
	type LibrivoxChaptersChirho
} from '../../src/lib/catalogue-chirho/stations-chirho/sources-chirho/librivox_sections_chirho';
import { catalogueFileChirho, failChirho, todayChirho, writeJsonChirho } from './files_chirho';
import { requestChirho, sleepChirho } from './probe_chirho';

const SOURCE_ID_CHIRHO = 'librivox';
const PAUSE_BETWEEN_RECORDINGS_MS_CHIRHO = 800;

interface IndexedRecordingChirho {
	readonly chapters_chirho: LibrivoxChaptersChirho;
	readonly evidence_chirho: Record<string, unknown>;
}

function isRecordChirho(valueChirho: unknown): valueChirho is Record<string, unknown> {
	return typeof valueChirho === 'object' && valueChirho !== null && !Array.isArray(valueChirho);
}

/** Read one recording. Returns a reason, as text, when it cannot be indexed. */
async function indexRecordingChirho(
	projectChirho: LibrivoxProjectChirho
): Promise<IndexedRecordingChirho | string> {
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
	const chaptersChirho = readLibrivoxSectionsChirho(projectChirho, sectionsChirho);
	if (typeof chaptersChirho === 'string') return chaptersChirho;

	const readersChirho = new Set<unknown>();
	for (const sectionChirho of sectionsChirho) {
		const namedChirho = isRecordChirho(sectionChirho) ? sectionChirho.readers : null;
		for (const readerChirho of Array.isArray(namedChirho) ? namedChirho : []) {
			if (isRecordChirho(readerChirho)) readersChirho.add(readerChirho.reader_id);
		}
	}
	return {
		chapters_chirho: chaptersChirho,
		evidence_chirho: {
			station_id_chirho: projectChirho.station_id_chirho,
			books_chirho: projectChirho.book_ids_chirho.join(' '),
			librivox_id_chirho: projectChirho.librivox_id_chirho,
			title_chirho: recordingChirho.title,
			language_chirho: recordingChirho.language,
			page_chirho: recordingChirho.url_librivox,
			text_source_chirho: recordingChirho.url_text_source,
			text_year_chirho: recordingChirho.copyright_year,
			chapters_chirho: sectionsChirho.length,
			readers_chirho: readersChirho.size
		}
	};
}

const indexChirho: Record<string, LibrivoxChaptersChirho> = {};
const evidenceChirho: unknown[] = [];
const refusedChirho: string[] = [];
for (const projectChirho of LIBRIVOX_PROJECTS_CHIRHO) {
	const labelChirho = `${projectChirho.station_id_chirho} ${projectChirho.book_ids_chirho.join('+')} (LibriVox ${projectChirho.librivox_id_chirho})`;
	const indexedChirho = await indexRecordingChirho(projectChirho);
	if (typeof indexedChirho === 'string') {
		refusedChirho.push(`${labelChirho}: ${indexedChirho}`);
		console.log(`  refused ${labelChirho}: ${indexedChirho}`);
	} else {
		const stationChirho = (indexChirho[projectChirho.station_id_chirho] ??= {});
		for (const [bookIdChirho, addressesChirho] of Object.entries(indexedChirho.chapters_chirho)) {
			if (stationChirho[bookIdChirho as BookIdChirho]) {
				refusedChirho.push(`${labelChirho}: ${bookIdChirho} is already indexed for this station`);
			}
			stationChirho[bookIdChirho as BookIdChirho] = addressesChirho;
		}
		evidenceChirho.push(indexedChirho.evidence_chirho);
		console.log(`  indexed ${labelChirho}`);
	}
	await sleepChirho(PAUSE_BETWEEN_RECORDINGS_MS_CHIRHO);
}

if (refusedChirho.length > 0) {
	failChirho(`Nothing was written. Could not index:\n${refusedChirho.join('\n')}`);
}

// One file per station, so that no file can outgrow a whole Bible's worth of lines.
for (const [stationIdChirho, filesChirho] of Object.entries(indexChirho)) {
	await writeJsonChirho(
		catalogueFileChirho(
			'index',
			`librivox-chirho/${stationIdChirho.replaceAll('-', '_')}_index_chirho.json`
		),
		{ station_id_chirho: stationIdChirho, files_chirho: filesChirho }
	);
}
await writeJsonChirho(catalogueFileChirho('evidence', 'librivox_index_chirho.json'), {
	source_id_chirho: SOURCE_ID_CHIRHO,
	built_on_chirho: todayChirho(),
	rule_chirho: 'one section per chapter, numbered in order, each titled with its chapter number',
	recordings_chirho: evidenceChirho
});
console.log(
	`done: ${evidenceChirho.length} recordings for ${Object.keys(indexChirho).length} stations`
);
