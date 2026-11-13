// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { describe, expect, it } from 'vitest';
import {
	resolveChapterChirho,
	resolveChapterPlaybackChirho
} from '../../locate-chirho/locate_chirho';
import { buildDavarStationChirho, parseDavarFileNameChirho } from './davar_stations_chirho';

const LANGUAGE_CHIRHO = { code_chirho: 'aa', name_chirho: 'Afar', english_chirho: 'Afar' };
const ENTRY_CHIRHO = {
	id: 'TEST_DAVR_NT_N',
	abbr: 'TEST',
	tt: 'Test New Testament',
	text_copyright: 'Text © A Society',
	audio_copyright: 'Audio ℗ 2023, A Maker'
};

function placeChirho(nameChirho: unknown): string | null {
	const readChirho = parseDavarFileNameChirho(nameChirho);
	return readChirho ? `${readChirho.book_chirho.id_chirho} ${readChirho.chapter_chirho}` : null;
}

describe('reading a file name from the library', () => {
	it('reads the forms its recordings use', () => {
		expect(placeChirho('40_Matthew_01.mp3')).toBe('MAT 1');
		expect(placeChirho('19_Psalms_119.mp3')).toBe('PSA 119');
		expect(placeChirho('40_Matthew_015 .mp3')).toBe('MAT 15');
		expect(placeChirho('09_1 Samuel_001.mp3')).toBe('1SA 1');
		expect(placeChirho('09_1Samuel_016..mp3')).toBe('1SA 16');
		expect(placeChirho('22_Song of Solomon_001.mp3')).toBe('SNG 1');
		expect(placeChirho('1CH_001.mp3')).toBe('1CH 1');
		expect(placeChirho('2 JN_001.mp3')).toBe('2JN 1');
		expect(placeChirho('ODA_001.mp3')).toBe('OBA 1');
	});

	it('does not read half a chapter, a chapter the book lacks, or a name that disagrees with itself', () => {
		expect(placeChirho('19_Psalms_009A.mp3')).toBeNull();
		expect(placeChirho('29_Joel_04.mp3')).toBeNull();
		expect(placeChirho('27_Daniel_13.mp3')).toBeNull();
		expect(placeChirho('40_Mark_01.mp3')).toBeNull();
		expect(placeChirho('67_Tobit_01.mp3')).toBeNull();
		expect(placeChirho('40_Matthew_00.mp3')).toBeNull();
		expect(placeChirho('40_Matthew_01.wav')).toBeNull();
		expect(placeChirho('XYZ_001.mp3')).toBeNull();
		expect(placeChirho(7)).toBeNull();
	});
});

describe('making a station from a recording', () => {
	it('claims exactly the chapters its list names, and gives each the listed file', () => {
		const namesChirho = [
			'40_Matthew_01.mp3',
			'40_Matthew_02 .mp3',
			'40_Matthew_04.mp3',
			'JUD_001.mp3',
			'notes.txt'
		];
		const { station_chirho: stationChirho, notes_chirho: notesChirho } = buildDavarStationChirho(
			ENTRY_CHIRHO,
			namesChirho,
			LANGUAGE_CHIRHO,
			'2026-11-13'
		);
		expect(stationChirho?.id_chirho).toBe('davar-test-davr-nt-n');
		expect(stationChirho?.coverage_chirho).toEqual({
			MAT: [
				[1, 2],
				[4, 4]
			],
			JUD: [[1, 1]]
		});
		expect(stationChirho?.chapter_count_chirho).toBe(4);
		expect(stationChirho?.voice_kind_chirho).toBe('unknown');
		expect(notesChirho.unmatched_chirho).toEqual(['notes.txt']);
		expect(notesChirho.overrides_chirho).toBe(2);
		const addressChirho = (bookChirho: 'MAT' | 'JUD', chapterChirho: number) =>
			resolveChapterChirho(stationChirho!, bookChirho, chapterChirho)?.url_chirho;
		expect(addressChirho('MAT', 1)).toBe('https://audio.dbs.org/TEST_DAVR_NT_N/40_Matthew_01.mp3');
		expect(addressChirho('MAT', 2)).toBe(
			'https://audio.dbs.org/TEST_DAVR_NT_N/40_Matthew_02%20.mp3'
		);
		expect(addressChirho('JUD', 1)).toBe('https://audio.dbs.org/TEST_DAVR_NT_N/JUD_001.mp3');
		expect(addressChirho('MAT', 3)).toBeUndefined();
	});

	it('shows both notices, the text one and the audio one', () => {
		const { station_chirho: stationChirho } = buildDavarStationChirho(
			ENTRY_CHIRHO,
			['40_Matthew_01.mp3'],
			LANGUAGE_CHIRHO,
			'2026-11-13'
		);
		expect(stationChirho?.credit_chirho).toBe('Text © A Society · Audio ℗ 2023, A Maker');
	});

	it('keeps the first file named for a chapter and counts the other', () => {
		const { station_chirho: stationChirho, notes_chirho: notesChirho } = buildDavarStationChirho(
			ENTRY_CHIRHO,
			['40_Matthew_01.mp3', '40_Matthew_001.mp3'],
			LANGUAGE_CHIRHO,
			'2026-11-13'
		);
		expect(notesChirho.duplicates_chirho).toBe(1);
		expect(resolveChapterChirho(stationChirho!, 'MAT', 1)?.url_chirho).toBe(
			'https://audio.dbs.org/TEST_DAVR_NT_N/40_Matthew_01.mp3'
		);
	});

	it('makes no station without a notice to show, a title, an id, or a chapter', () => {
		const refusedChirho = (entryChirho: unknown, namesChirho: unknown[] = ['40_Matthew_01.mp3']) =>
			buildDavarStationChirho(entryChirho, namesChirho, LANGUAGE_CHIRHO, '2026-11-13');
		const withoutChirho = (keyChirho: string) => ({ ...ENTRY_CHIRHO, [keyChirho]: ' ' });
		expect(
			refusedChirho({ ...withoutChirho('text_copyright'), audio_copyright: '' }).station_chirho
		).toBeNull();
		expect(refusedChirho(withoutChirho('tt')).station_chirho).toBeNull();
		expect(refusedChirho(withoutChirho('id')).station_chirho).toBeNull();
		expect(refusedChirho(null).station_chirho).toBeNull();
		const emptyChirho = refusedChirho(ENTRY_CHIRHO, ['cover.jpg']);
		expect(emptyChirho.station_chirho).toBeNull();
		expect(emptyChirho.notes_chirho.refused_chirho).toContain('no chapter');
	});
});

describe('a recording that counts Joel in four chapters', () => {
	const JOEL_CHIRHO = ['29_Joel_01.mp3', '29_Joel_02.mp3', '29_Joel_03.mp3', '29_Joel_04.mp3'];
	const MALACHI_CHIRHO = ['39_Malachi_01.mp3', '39_Malachi_02.mp3', '39_Malachi_03.mp3'];
	const APPROVED_CHIRHO = new Set([ENTRY_CHIRHO.id]);
	const builtChirho = (
		namesChirho: string[],
		approvedChirho: ReadonlySet<string> = APPROVED_CHIRHO
	) =>
		buildDavarStationChirho(
			ENTRY_CHIRHO,
			namesChirho,
			LANGUAGE_CHIRHO,
			'2026-11-13',
			approvedChirho
		);
	const fileChirho = (
		resultChirho: ReturnType<typeof builtChirho>,
		bookChirho: 'JOL' | 'MAL' | 'AMO',
		chapterChirho: number
	) =>
		resolveChapterChirho(resultChirho.station_chirho!, bookChirho, chapterChirho)
			?.url_chirho.split('/')
			.pop();

	it('plays its fourth file as Joel 3 and offers no Joel 2, when it also ends Malachi at three', () => {
		const hebrewChirho = builtChirho([...JOEL_CHIRHO, '30_Amos_01.mp3', ...MALACHI_CHIRHO]);
		expect(hebrewChirho.notes_chirho.numbering_chirho).toBe('hebrew_inferred');
		expect(fileChirho(hebrewChirho, 'JOL', 1)).toBe('29_Joel_01.mp3');
		expect(fileChirho(hebrewChirho, 'JOL', 2)).toBeUndefined();
		expect(fileChirho(hebrewChirho, 'JOL', 3)).toBe('29_Joel_04.mp3');
		expect(hebrewChirho.station_chirho?.coverage_chirho.JOL).toEqual([
			[1, 1],
			[3, 3]
		]);
		expect(hebrewChirho.notes_chirho.withheld_chirho).toEqual(['29_Joel_02.mp3', '29_Joel_03.mp3']);
		expect(hebrewChirho.notes_chirho.unmatched_chirho).toEqual([]);
		// Malachi 3 plays their third file; a fourth chapter is not claimed.
		expect(fileChirho(hebrewChirho, 'MAL', 3)).toBe('39_Malachi_03.mp3');
		expect(fileChirho(hebrewChirho, 'MAL', 4)).toBeUndefined();
		// Other books are untouched.
		expect(fileChirho(hebrewChirho, 'AMO', 1)).toBe('30_Amos_01.mp3');
		expect(hebrewChirho.station_chirho?.chapter_count_chirho).toBe(6);
	});

	it('is left as it is when it also lists a Malachi 4, or no Malachi 3', () => {
		for (const namesChirho of [
			[...JOEL_CHIRHO, ...MALACHI_CHIRHO, '39_Malachi_04.mp3'],
			[...JOEL_CHIRHO, '39_Malachi_01.mp3']
		]) {
			const unresolvedChirho = builtChirho(namesChirho);
			expect(unresolvedChirho.notes_chirho.numbering_chirho).toBe('unresolved');
			expect(fileChirho(unresolvedChirho, 'JOL', 2)).toBe('29_Joel_02.mp3');
			expect(fileChirho(unresolvedChirho, 'JOL', 3)).toBe('29_Joel_03.mp3');
			expect(unresolvedChirho.notes_chirho.unmatched_chirho).toEqual(['29_Joel_04.mp3']);
			expect(unresolvedChirho.notes_chirho.withheld_chirho).toEqual([]);
		}
	});

	it('is left as it is when it fits the pattern but is not approved by name', () => {
		const notApprovedChirho = builtChirho([...JOEL_CHIRHO, ...MALACHI_CHIRHO], new Set());
		expect(notApprovedChirho.notes_chirho.numbering_chirho).toBe('unresolved');
		expect(fileChirho(notApprovedChirho, 'JOL', 2)).toBe('29_Joel_02.mp3');
		expect(fileChirho(notApprovedChirho, 'JOL', 3)).toBe('29_Joel_03.mp3');
		expect(notApprovedChirho.notes_chirho.unmatched_chirho).toEqual(['29_Joel_04.mp3']);
	});

	it('remaps no recording by default unless it is on the approved list', () => {
		const defaultChirho = buildDavarStationChirho(
			ENTRY_CHIRHO,
			[...JOEL_CHIRHO, ...MALACHI_CHIRHO],
			LANGUAGE_CHIRHO,
			'2026-11-13'
		);
		expect(defaultChirho.notes_chirho.numbering_chirho).toBe('unresolved');
	});

	it('does not touch a recording that counts Joel in three', () => {
		const standardChirho = builtChirho([...JOEL_CHIRHO.slice(0, 3), ...MALACHI_CHIRHO]);
		expect(standardChirho.notes_chirho.numbering_chirho).toBe('standard');
		expect(fileChirho(standardChirho, 'JOL', 2)).toBe('29_Joel_02.mp3');
		expect(fileChirho(standardChirho, 'JOL', 3)).toBe('29_Joel_03.mp3');
	});
});

describe('offering a chapter split across files', () => {
	const JOEL_CHIRHO = ['29_Joel_01.mp3', '29_Joel_02.mp3', '29_Joel_03.mp3', '29_Joel_04.mp3'];
	const MALACHI_CHIRHO = ['39_Malachi_01.mp3', '39_Malachi_02.mp3', '39_Malachi_03.mp3'];
	const PSALM_CHIRHO = ['19_Psalms_008.mp3', '19_Psalms_009A.mp3', '19_Psalms_009B.mp3'];
	const APPROVED_CHIRHO = new Set([ENTRY_CHIRHO.id]);
	const lengthsChirho = (entriesChirho: [string, number][]) => ({
		measured_on_chirho: '2026-11-13',
		seconds_chirho: new Map(entriesChirho)
	});
	const builtChirho = (namesChirho: string[], lengths?: ReturnType<typeof lengthsChirho>) =>
		buildDavarStationChirho(
			ENTRY_CHIRHO,
			namesChirho,
			LANGUAGE_CHIRHO,
			'2026-11-13',
			APPROVED_CHIRHO,
			lengths
		);
	const ALL_MEASURED_CHIRHO = lengthsChirho([
		['29_Joel_02.mp3', 400],
		['29_Joel_03.mp3', 75],
		['19_Psalms_009A.mp3', 260],
		['19_Psalms_009B.mp3', 247]
	]);

	it('offers nothing new without measured lengths', () => {
		const resultChirho = builtChirho([...JOEL_CHIRHO, ...MALACHI_CHIRHO, ...PSALM_CHIRHO]);
		expect(resultChirho.station_chirho?.composite_chapters_chirho).toBeUndefined();
		expect(resultChirho.notes_chirho.composite_chirho).toEqual([]);
	});

	it('offers Joel 2 as the second file then the third, and a split psalm as A then B', () => {
		const resultChirho = builtChirho(
			[...JOEL_CHIRHO, ...MALACHI_CHIRHO, ...PSALM_CHIRHO],
			ALL_MEASURED_CHIRHO
		);
		const stationChirho = resultChirho.station_chirho!;
		expect(resultChirho.notes_chirho.composite_chirho).toEqual(['JOL 2', 'PSA 9']);
		expect(resultChirho.notes_chirho.composite_refused_chirho).toEqual([]);
		expect(resolveChapterPlaybackChirho(stationChirho, 'JOL', 2)).toEqual({
			kind_chirho: 'composite',
			parts_chirho: [
				{
					url_chirho: 'https://audio.dbs.org/TEST_DAVR_NT_N/29_Joel_02.mp3',
					duration_seconds_chirho: 400
				},
				{
					url_chirho: 'https://audio.dbs.org/TEST_DAVR_NT_N/29_Joel_03.mp3',
					duration_seconds_chirho: 75
				}
			],
			total_seconds_chirho: 475
		});
		expect(
			resolveChapterPlaybackChirho(stationChirho, 'PSA', 9)?.kind_chirho === 'composite' &&
				resolveChapterPlaybackChirho(stationChirho, 'PSA', 9)
		).toMatchObject({ total_seconds_chirho: 507 });
		// Nothing a player already knew has moved.
		expect(resolveChapterChirho(stationChirho, 'JOL', 2)).toBeNull();
		expect(resolveChapterChirho(stationChirho, 'PSA', 9)).toBeNull();
		expect(stationChirho.chapter_count_chirho).toBe(
			builtChirho([...JOEL_CHIRHO, ...MALACHI_CHIRHO, ...PSALM_CHIRHO]).station_chirho!
				.chapter_count_chirho
		);
	});

	it('leaves a split chapter out when a part was not measured', () => {
		const resultChirho = builtChirho(
			[...JOEL_CHIRHO, ...MALACHI_CHIRHO],
			lengthsChirho([['29_Joel_02.mp3', 400]])
		);
		expect(resultChirho.station_chirho?.composite_chapters_chirho).toBeUndefined();
		expect(resultChirho.notes_chirho.composite_refused_chirho).toEqual([
			'JOL 2: not every part was measured'
		]);
	});

	it('keeps the station but offers no split chapter when one breaks a rule', () => {
		const resultChirho = builtChirho(
			[...JOEL_CHIRHO, ...MALACHI_CHIRHO],
			lengthsChirho([
				['29_Joel_02.mp3', 400],
				['29_Joel_03.mp3', 0.2]
			])
		);
		expect(resultChirho.station_chirho).not.toBeNull();
		expect(resultChirho.station_chirho?.composite_chapters_chirho).toBeUndefined();
		expect(resultChirho.notes_chirho.composite_refused_chirho).toEqual([
			'JOL 2: breaks a rule for split chapters'
		]);
	});

	it('does not offer Joel 2 from parts on a recording not approved for the Hebrew count', () => {
		const resultChirho = buildDavarStationChirho(
			ENTRY_CHIRHO,
			[...JOEL_CHIRHO, ...MALACHI_CHIRHO],
			LANGUAGE_CHIRHO,
			'2026-11-13',
			new Set(),
			ALL_MEASURED_CHIRHO
		);
		expect(resultChirho.station_chirho?.composite_chapters_chirho).toBeUndefined();
	});

	it('does not offer lettered parts that do not start at A or skip a letter', () => {
		const resultChirho = builtChirho(
			['19_Psalms_008.mp3', '19_Psalms_009A.mp3', '19_Psalms_009C.mp3'],
			lengthsChirho([
				['19_Psalms_009A.mp3', 100],
				['19_Psalms_009C.mp3', 100]
			])
		);
		expect(resultChirho.station_chirho?.composite_chapters_chirho).toBeUndefined();
	});
});
