// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { createHash } from 'node:crypto';
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	readdirSync,
	rmSync,
	writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
	CUT_MANIFEST_NAME_CHIRHO,
	prepareSoundsChirho
} from '../../../../scripts-chirho/sounds-chirho/sound_preparer_chirho';
import { OPEN_SOUND_PROFILE_CHIRHO, parseSoundProfileChirho } from '../sound_profile_chirho';
import { encodePcmWavChirho } from '../wav_chirho';

const CLIP_FILES_CHIRHO = [
	...Array.from(
		{ length: 9 },
		(_unusedChirho, indexChirho) =>
			`tuning-chirho/radio_${String(indexChirho + 1).padStart(2, '0')}_chirho.wav`
	),
	'interface-chirho/button_click_chirho.wav',
	'interface-chirho/knob_turn_chirho.wav'
];

let rootChirho = '';
let staticChirho = '';
let clipsChirho = '';

/** A short tone at the given share of full scale. */
function toneChirho(levelChirho: number, pitchChirho: number): Uint8Array {
	return encodePcmWavChirho(
		Int16Array.from({ length: 1200 }, (_unusedChirho, indexChirho) =>
			Math.round(Math.sin(indexChirho * pitchChirho) * levelChirho * 32767)
		),
		22_050
	);
}

function writeChirho(pathChirho: string, bytesChirho: Uint8Array): void {
	mkdirSync(dirname(pathChirho), { recursive: true });
	writeFileSync(pathChirho, bytesChirho);
}

function writeManifestChirho(entriesChirho: Record<string, unknown>[]): void {
	writeFileSync(
		join(clipsChirho, CUT_MANIFEST_NAME_CHIRHO),
		JSON.stringify({ clips_chirho: entriesChirho })
	);
}

function manifestEntryChirho(fileChirho: string): Record<string, unknown> {
	const bytesChirho = readFileSync(join(clipsChirho, fileChirho));
	return {
		name_chirho: fileChirho.split('/')[1].replace('.wav', ''),
		file_chirho: fileChirho,
		sha256_chirho: createHash('sha256').update(bytesChirho).digest('hex'),
		bytes_chirho: bytesChirho.length
	};
}

function prepareChirho(ignoredChirho: boolean | null = true, requireChirho = false) {
	return prepareSoundsChirho({
		clips_dir_chirho: clipsChirho,
		static_dir_chirho: staticChirho,
		is_ignored_chirho: () => ignoredChirho,
		require_licensed_chirho: requireChirho
	});
}

function licensedFilesChirho(): string[] {
	const licensedChirho = join(staticChirho, 'sounds-chirho', 'licensed-chirho');
	if (!existsSync(licensedChirho)) return [];
	return readdirSync(licensedChirho, { recursive: true, withFileTypes: true })
		.filter((entryChirho) => entryChirho.isFile())
		.map((entryChirho) => relative(licensedChirho, join(entryChirho.parentPath, entryChirho.name)))
		.sort();
}

const profilePathChirho = (): string => join(staticChirho, 'sounds-chirho', 'profile_chirho.json');

beforeEach(() => {
	rootChirho = mkdtempSync(join(tmpdir(), 'radio-sounds-chirho-'));
	staticChirho = join(rootChirho, 'static');
	clipsChirho = join(rootChirho, 'clips');
	const { tuning_chirho, click_chirho, knob_chirho } = OPEN_SOUND_PROFILE_CHIRHO;
	for (const { url_chirho: urlChirho } of [...tuning_chirho, ...click_chirho, ...knob_chirho])
		writeChirho(join(staticChirho, urlChirho), toneChirho(0.1, 0.05));
	CLIP_FILES_CHIRHO.forEach((fileChirho, indexChirho) =>
		writeChirho(join(clipsChirho, fileChirho), toneChirho(0.12, 0.02 + indexChirho / 100))
	);
	// Neither an unlisted clip nor an original recording beside the cuts may ever be copied.
	writeChirho(join(clipsChirho, 'tuning-chirho', 'extra_chirho.wav'), toneChirho(0.1, 0.3));
	writeChirho(join(rootChirho, 'originals', 'fm_tuning_chirho.wav'), toneChirho(0.5, 0.3));
	writeManifestChirho(CLIP_FILES_CHIRHO.map(manifestEntryChirho));
});
afterEach(() => {
	rmSync(rootChirho, { recursive: true, force: true });
});

describe('sound preparer', () => {
	it('copies exactly the eleven listed clips, byte for byte, and names them in the profile', () => {
		expect(prepareChirho()).toMatchObject({ source_chirho: 'licensed', files_chirho: 11 });
		expect(prepareChirho()).toMatchObject({ source_chirho: 'licensed', files_chirho: 11 });
		expect(licensedFilesChirho()).toEqual([...CLIP_FILES_CHIRHO].sort());
		for (const fileChirho of CLIP_FILES_CHIRHO)
			expect(
				readFileSync(join(staticChirho, 'sounds-chirho', 'licensed-chirho', fileChirho)).equals(
					readFileSync(join(clipsChirho, fileChirho))
				)
			).toBe(true);
		const profileChirho = parseSoundProfileChirho(
			JSON.parse(readFileSync(profilePathChirho(), 'utf8'))
		);
		expect(profileChirho?.source_chirho).toBe('licensed');
		expect(profileChirho?.tuning_chirho).toHaveLength(9);
		expect(profileChirho?.knob_chirho).toEqual([
			{
				url_chirho: '/sounds-chirho/licensed-chirho/interface-chirho/knob_turn_chirho.wav',
				start_seconds_chirho: 0.9
			}
		]);
	});

	it('refuses a clip that differs from its manifest, keeping the last good copies', () => {
		prepareChirho();
		const goodChirho = readFileSync(
			join(staticChirho, 'sounds-chirho', 'licensed-chirho', CLIP_FILES_CHIRHO[4])
		);
		const changedChirho = readFileSync(join(clipsChirho, CLIP_FILES_CHIRHO[4]));
		changedChirho[60] ^= 1;
		writeFileSync(join(clipsChirho, CLIP_FILES_CHIRHO[4]), changedChirho);
		expect(() => prepareChirho()).toThrow(/does not match the cut manifest/);
		expect(licensedFilesChirho()).toEqual([...CLIP_FILES_CHIRHO].sort());
		expect(
			readFileSync(
				join(staticChirho, 'sounds-chirho', 'licensed-chirho', CLIP_FILES_CHIRHO[4])
			).equals(goodChirho)
		).toBe(true);
	});

	it('refuses a manifest naming an unexpected clip or a path outside its folder, before copying', () => {
		const entriesChirho = CLIP_FILES_CHIRHO.map(manifestEntryChirho);
		writeManifestChirho([
			...entriesChirho,
			{ ...entriesChirho[0], name_chirho: 'fm_tuning_chirho' }
		]);
		expect(() => prepareChirho()).toThrow(/unexpected or repeated/);
		writeManifestChirho([
			{ ...entriesChirho[0], file_chirho: '../originals/fm_tuning_chirho.wav' },
			...entriesChirho.slice(1)
		]);
		expect(() => prepareChirho()).toThrow(/is not at/);
		writeManifestChirho(entriesChirho.slice(1));
		expect(() => prepareChirho()).toThrow(/lacks radio_01_chirho/);
		expect(licensedFilesChirho()).toEqual([]);
		expect(existsSync(profilePathChirho())).toBe(false);
	});

	it('refuses a clip louder than the effect limit, even when its manifest matches', () => {
		writeChirho(join(clipsChirho, CLIP_FILES_CHIRHO[0]), toneChirho(0.5, 0.02));
		writeManifestChirho(CLIP_FILES_CHIRHO.map(manifestEntryChirho));
		expect(() => prepareChirho()).toThrow(/peaks at/);
		expect(licensedFilesChirho()).toEqual([]);
	});

	it('copies nothing while Git would not ignore the outputs', () => {
		expect(() => prepareChirho(false)).toThrow(/Git does not ignore/);
		expect(licensedFilesChirho()).toEqual([]);
		expect(existsSync(profilePathChirho())).toBe(false);
	});

	it('names the open set and removes old purchased copies when the private folder is absent', () => {
		prepareChirho();
		rmSync(clipsChirho, { recursive: true });
		expect(prepareChirho()).toMatchObject({ source_chirho: 'open', profile_written_chirho: true });
		expect(licensedFilesChirho()).toEqual([]);
		expect(JSON.parse(readFileSync(profilePathChirho(), 'utf8'))).toEqual(
			OPEN_SOUND_PROFILE_CHIRHO
		);
	});

	it('fails a release build rather than falling back, and leaves an unignored profile alone', () => {
		rmSync(clipsChirho, { recursive: true });
		expect(() => prepareChirho(true, true)).toThrow(/requires them/);
		expect(prepareChirho(false)).toMatchObject({
			source_chirho: 'open',
			profile_written_chirho: false
		});
		expect(existsSync(profilePathChirho())).toBe(false);
	});

	it('refuses to prepare anything while an open sound is missing', () => {
		rmSync(join(staticChirho, OPEN_SOUND_PROFILE_CHIRHO.knob_chirho[0].url_chirho));
		expect(() => prepareChirho()).toThrow(/is missing/);
		expect(licensedFilesChirho()).toEqual([]);
	});
});
