// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// The language files the radio serves, read from disk exactly as a listener's browser would
// receive them, and the loaders that read them.

import { readFile, readdir } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { STATIONS_CHIRHO, resolveChapterChirho, type StationChirho } from '../catalogue_chirho';
import { BOOKS_CHIRHO } from '../books-chirho/books_chirho';
import { CATALOGUE_CONTRACT_VERSION_CHIRHO } from '../contract_chirho';
import { makeStationFixtureChirho } from '../locate-chirho/station_fixture_chirho';
import {
	DAVAR_SOURCE_NAME_CHIRHO,
	DAVAR_TERMS_ADDRESS_CHIRHO,
	DAVAR_TERMS_CHIRHO
} from '../stations-chirho/sources-chirho/davar_stations_chirho';
import {
	LANGUAGE_LIST_PATH_CHIRHO,
	fetchingReaderChirho,
	languageFilePathChirho,
	loadLanguageListChirho,
	loadLanguageStationsChirho,
	type CatalogueReaderChirho
} from './language_loader_chirho';
import { renderLanguageRegisterChirho } from './language_register_chirho';

const STATIC_CHIRHO = new URL('../../../../static/', import.meta.url);
const REGISTER_CHIRHO = new URL(
	'../../../../spec-chirho/sources-chirho/davar_station_register_chirho.md',
	import.meta.url
);
const EVIDENCE_CHIRHO = new URL(
	'../../../../spec-chirho/evidence-chirho/catalogue-chirho/davar_snapshot_chirho.json',
	import.meta.url
);
const fromDiskChirho: CatalogueReaderChirho = async (pathChirho) =>
	JSON.parse(await readFile(new URL(pathChirho, STATIC_CHIRHO), 'utf8')) as unknown;

const languagesChirho = await loadLanguageListChirho(fromDiskChirho);
const loadedChirho = new Map<string, readonly StationChirho[]>();
for (const languageChirho of languagesChirho) {
	loadedChirho.set(
		languageChirho.code_chirho,
		await loadLanguageStationsChirho(languageChirho.code_chirho, fromDiskChirho)
	);
}
const allStationsChirho = [...loadedChirho.values()].flat();

describe('the language files on disk', () => {
	it('hold every station the list promises, and no file the list does not name', async () => {
		expect(languagesChirho.length).toBeGreaterThan(300);
		for (const languageChirho of languagesChirho) {
			const stationsChirho = loadedChirho.get(languageChirho.code_chirho)!;
			expect(stationsChirho.length, languageChirho.code_chirho).toBe(
				languageChirho.station_count_chirho
			);
			// No station was dropped by the reader: the file holds exactly what was read from it.
			const rawChirho = (await fromDiskChirho(
				languageFilePathChirho(languageChirho.code_chirho)!
			)) as {
				stations_chirho: unknown[];
			};
			expect(rawChirho.stations_chirho, languageChirho.code_chirho).toEqual(stationsChirho);
			expect(
				stationsChirho.some((stationChirho) => stationChirho.chapter_count_chirho === 1189),
				languageChirho.code_chirho
			).toBe(languageChirho.has_whole_bible_chirho);
		}
		const onDiskChirho = (
			await readdir(new URL('catalogue-chirho/languages-chirho/', STATIC_CHIRHO), {
				recursive: true
			})
		)
			.filter((nameChirho) => nameChirho.endsWith('.json'))
			.map((nameChirho) => `catalogue-chirho/languages-chirho/${nameChirho}`)
			.sort();
		expect(onDiskChirho).toEqual(
			languagesChirho
				.map((languageChirho) => languageFilePathChirho(languageChirho.code_chirho))
				.sort()
		);
	});

	it('give every station an id of its own, apart from the built-in ones too', () => {
		const idsChirho = [...STATIONS_CHIRHO, ...allStationsChirho].map(
			(stationChirho) => stationChirho.id_chirho
		);
		expect(new Set(idsChirho).size).toBe(idsChirho.length);
	});

	it('state the terms, a notice to show and an unclaimed voice for every station', () => {
		for (const stationChirho of allStationsChirho) {
			expect(stationChirho.credit_chirho.trim(), stationChirho.id_chirho).not.toBe('');
			expect(stationChirho.licence_evidence_url_chirho).toBe(DAVAR_TERMS_ADDRESS_CHIRHO);
			expect(stationChirho.voice_kind_chirho, stationChirho.id_chirho).toBe('unknown');
		}
	});

	it('send every chapter to the source’s own host, and nowhere else', () => {
		let chaptersChirho = 0;
		for (const stationChirho of allStationsChirho) {
			for (const bookChirho of BOOKS_CHIRHO) {
				for (const [firstChirho, lastChirho] of stationChirho.coverage_chirho[
					bookChirho.id_chirho
				] ?? []) {
					for (let chapterChirho = firstChirho; chapterChirho <= lastChirho; chapterChirho += 1) {
						const addressChirho = resolveChapterChirho(
							stationChirho,
							bookChirho.id_chirho,
							chapterChirho
						)!.url_chirho;
						if (
							!addressChirho.startsWith('https://audio.dbs.org/') ||
							new URL(addressChirho).href !== addressChirho
						) {
							throw new Error(
								`${stationChirho.id_chirho} ${bookChirho.id_chirho} ${chapterChirho}: ${addressChirho}`
							);
						}
						chaptersChirho += 1;
					}
				}
			}
		}
		expect(chaptersChirho).toBe(
			allStationsChirho.reduce(
				(sumChirho, stationChirho) => sumChirho + stationChirho.chapter_count_chirho,
				0
			)
		);
	});

	it('play the fourth file as Joel 3 on exactly the recordings taken to count Joel in four', async () => {
		const evidenceChirho = JSON.parse(await readFile(EVIDENCE_CHIRHO, 'utf8')) as {
			joel_and_malachi_numbering_chirho: {
				taken_as_hebrew_chirho: { recording_chirho: string }[];
				lists_a_joel_4_but_left_as_it_is_chirho: string[];
			};
		};
		const numberingChirho = evidenceChirho.joel_and_malachi_numbering_chirho;
		const hebrewChirho = new Set(
			numberingChirho.taken_as_hebrew_chirho.map((entryChirho) => entryChirho.recording_chirho)
		);
		expect(hebrewChirho.size).toBe(59);
		expect(numberingChirho.lists_a_joel_4_but_left_as_it_is_chirho).toHaveLength(2);
		const fileChirho = (
			stationChirho: StationChirho,
			bookChirho: 'JOL' | 'MAL',
			chapterChirho: number
		) =>
			resolveChapterChirho(stationChirho, bookChirho, chapterChirho)?.url_chirho.split('/').pop();
		let seenChirho = 0;
		for (const stationChirho of allStationsChirho) {
			const recordingChirho = decodeURIComponent(
				new URL(
					stationChirho.locator_chirho.kind_chirho === 'pattern'
						? stationChirho.locator_chirho.template_chirho.split('{')[0]
						: ''
				).pathname.split('/')[1]
			);
			const joelThreeChirho = fileChirho(stationChirho, 'JOL', 3);
			if (hebrewChirho.has(recordingChirho)) {
				seenChirho += 1;
				expect(joelThreeChirho, stationChirho.id_chirho).toMatch(/^29_Joel_0*4\.mp3$/);
				expect(fileChirho(stationChirho, 'JOL', 2), stationChirho.id_chirho).toBeUndefined();
				expect(fileChirho(stationChirho, 'JOL', 1), stationChirho.id_chirho).toMatch(
					/^29_Joel_0*1\.mp3$/
				);
				expect(fileChirho(stationChirho, 'MAL', 3), stationChirho.id_chirho).toMatch(
					/^39_Malachi_0*3\.mp3$/
				);
				expect(fileChirho(stationChirho, 'MAL', 4), stationChirho.id_chirho).toBeUndefined();
			} else if (joelThreeChirho !== undefined) {
				// Every other station plays, as Joel 3, a file its maker numbered 3.
				expect(joelThreeChirho, stationChirho.id_chirho).toMatch(/_0*3\s*\.mp3$/);
				expect(fileChirho(stationChirho, 'JOL', 2), stationChirho.id_chirho).toMatch(
					/_0*2\s*\.mp3$/
				);
			}
		}
		expect(seenChirho).toBe(59);
	});

	it('are on record: the register lists exactly the stations served, each with its notices', async () => {
		// If this fails, run the build script named at the top of the register's source and read
		// what changed before committing it.
		expect(await readFile(REGISTER_CHIRHO, 'utf8')).toBe(
			renderLanguageRegisterChirho(
				DAVAR_SOURCE_NAME_CHIRHO,
				DAVAR_TERMS_CHIRHO,
				DAVAR_TERMS_ADDRESS_CHIRHO,
				allStationsChirho
			)
		);
	});
});

describe('loading by language', () => {
	const stationChirho = makeStationFixtureChirho(
		{ JHN: [[1, 3]] },
		{ id_chirho: 'fixture-aa', language_code_chirho: 'aa' }
	);
	const filesChirho: Record<string, unknown> = {
		[LANGUAGE_LIST_PATH_CHIRHO]: {
			contract_version_chirho: CATALOGUE_CONTRACT_VERSION_CHIRHO,
			languages_chirho: [
				{
					code_chirho: 'aa',
					name_chirho: 'Afar',
					english_chirho: 'Afar',
					station_count_chirho: 1,
					has_whole_bible_chirho: false
				},
				{
					code_chirho: 'aa',
					name_chirho: 'Again',
					english_chirho: 'Again',
					station_count_chirho: 1,
					has_whole_bible_chirho: false
				},
				{
					code_chirho: '../x',
					name_chirho: 'Bad',
					english_chirho: 'Bad',
					station_count_chirho: 1,
					has_whole_bible_chirho: false
				},
				{
					code_chirho: 'bb',
					name_chirho: '',
					english_chirho: 'Nameless',
					station_count_chirho: 1,
					has_whole_bible_chirho: false
				},
				'nonsense'
			]
		},
		'catalogue-chirho/languages-chirho/a/aa.json': {
			contract_version_chirho: CATALOGUE_CONTRACT_VERSION_CHIRHO,
			stations_chirho: [
				stationChirho,
				stationChirho,
				{ ...stationChirho, id_chirho: 'fixture-other', language_code_chirho: 'en' },
				{ ...stationChirho, id_chirho: 'fixture-no-credit', credit_chirho: '' }
			]
		},
		'catalogue-chirho/languages-chirho/z/zz.json': {
			contract_version_chirho: 999,
			stations_chirho: [stationChirho]
		}
	};
	const askedChirho: string[] = [];
	const readerChirho: CatalogueReaderChirho = async (pathChirho) => {
		askedChirho.push(pathChirho);
		if (!(pathChirho in filesChirho)) throw new Error('missing');
		return filesChirho[pathChirho];
	};

	it('lists each well-formed language once', async () => {
		expect(
			(await loadLanguageListChirho(readerChirho)).map((entryChirho) => entryChirho.name_chirho)
		).toEqual(['Afar']);
	});

	it('gives only well-formed stations in the language asked for, each once', async () => {
		expect(await loadLanguageStationsChirho('aa', readerChirho)).toEqual([stationChirho]);
	});

	it('reads nothing from a file written under another contract', async () => {
		expect(await loadLanguageStationsChirho('zz', readerChirho)).toEqual([]);
	});

	it('never asks for a path made from something that is not a language code', async () => {
		askedChirho.length = 0;
		for (const codeChirho of ['../../secrets', 'aa/../bb', 'AA', '', 'a', 'https://x.example']) {
			expect(await loadLanguageStationsChirho(codeChirho, readerChirho)).toEqual([]);
		}
		expect(askedChirho).toEqual([]);
	});

	it('rejects when the file cannot be read, so the player can say so', async () => {
		await expect(loadLanguageStationsChirho('qq', readerChirho)).rejects.toThrow();
		const refusingChirho = fetchingReaderChirho(
			(async () => new Response('', { status: 404 })) as unknown as typeof fetch
		);
		await expect(loadLanguageListChirho(refusingChirho)).rejects.toThrow('404');
	});

	it('fetches from this site without credentials', async () => {
		const seenChirho: [string, RequestInit | undefined][] = [];
		const fetchChirho = (async (inputChirho: string, initChirho?: RequestInit) => {
			seenChirho.push([inputChirho, initChirho]);
			return Response.json(filesChirho[LANGUAGE_LIST_PATH_CHIRHO]);
		}) as unknown as typeof fetch;
		await loadLanguageListChirho(fetchingReaderChirho(fetchChirho));
		expect(seenChirho).toEqual([
			['/catalogue-chirho/languages_chirho.json', { credentials: 'omit' }]
		]);
	});
});
