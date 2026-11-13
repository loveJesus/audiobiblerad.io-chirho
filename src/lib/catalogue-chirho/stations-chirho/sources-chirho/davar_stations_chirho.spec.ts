// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { describe, expect, it } from 'vitest';
import { resolveChapterChirho } from '../../locate-chirho/locate_chirho';
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
