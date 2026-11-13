// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { describe, expect, it } from 'vitest';
import { readIndexFilesChirho, type IndexFileChirho } from './index_files_chirho';

function fileWithChirho(filesChirho: unknown): IndexFileChirho {
	return {
		station_id_chirho: 'fixture-station',
		files_chirho: filesChirho as IndexFileChirho['files_chirho']
	};
}

describe('reading an index of chapter addresses', () => {
	it('reads back the addresses a builder wrote', () => {
		const filesChirho = readIndexFilesChirho(
			fileWithChirho({
				RUT: ['https://audio.example/ruth-1.mp3', 'https://audio.example/ruth-2.mp3'],
				JUD: ['https://audio.example/jude.mp3']
			}),
			'fixture-station'
		);
		expect(filesChirho).toEqual({
			RUT: ['https://audio.example/ruth-1.mp3', 'https://audio.example/ruth-2.mp3'],
			JUD: ['https://audio.example/jude.mp3']
		});
	});

	it('keeps each address at its own chapter when one is missing or unusable', () => {
		const filesChirho = readIndexFilesChirho(
			fileWithChirho({
				RUT: [
					null,
					'http://audio.example/not-secure.mp3',
					'not an address',
					'https://audio.example/ruth-4.mp3'
				]
			}),
			'fixture-station'
		);
		expect(filesChirho).toEqual({ RUT: [null, null, null, 'https://audio.example/ruth-4.mp3'] });
	});

	it('drops books that do not exist, books with no usable address, and chapters past the end', () => {
		const filesChirho = readIndexFilesChirho(
			fileWithChirho({
				XXX: ['https://audio.example/x.mp3'],
				OBA: [null, 7],
				PHM: 'https://audio.example/philemon.mp3',
				// Jude has one chapter: a second address has nowhere to go.
				JUD: ['https://audio.example/jude.mp3', 'https://audio.example/jude-2.mp3']
			}),
			'fixture-station'
		);
		expect(filesChirho).toEqual({ JUD: ['https://audio.example/jude.mp3'] });
	});

	it('gives no addresses from a file written for another station, or from a broken one', () => {
		const anotherChirho = fileWithChirho({ JUD: ['https://audio.example/jude.mp3'] });
		expect(readIndexFilesChirho(anotherChirho, 'someone-else')).toEqual({});
		for (const brokenChirho of [null, 'nothing', 7, []]) {
			expect(readIndexFilesChirho(fileWithChirho(brokenChirho), 'fixture-station')).toEqual({});
		}
	});
});
