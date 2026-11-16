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
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { prepareNativeSoundsChirho } from '../../../../scripts-chirho/native-chirho/prepare_native_sounds_chirho';
import { CUT_MANIFEST_NAME_CHIRHO } from '../../../../scripts-chirho/sounds-chirho/sound_preparer_chirho';
import { OPEN_SOUND_PROFILE_CHIRHO, parseSoundProfileChirho } from '../sound_profile_chirho';
import { encodePcmWavChirho } from '../wav_chirho';

const CUT_FILES_CHIRHO = [
	...Array.from(
		{ length: 9 },
		(_unusedChirho, indexChirho) =>
			`tuning-chirho/radio_${String(indexChirho + 1).padStart(2, '0')}_chirho.wav`
	),
	'interface-chirho/button_click_chirho.wav',
	'interface-chirho/knob_turn_chirho.wav'
];
const OPEN_URLS_CHIRHO = [
	...OPEN_SOUND_PROFILE_CHIRHO.tuning_chirho,
	...OPEN_SOUND_PROFILE_CHIRHO.click_chirho,
	...OPEN_SOUND_PROFILE_CHIRHO.knob_chirho
].map((clipChirho) => clipChirho.url_chirho);

let rootChirho = '';
let staticChirho = '';
let clipsChirho = '';
let assetsChirho = '';

const shaChirho = (bytesChirho: Uint8Array): string =>
	createHash('sha256').update(bytesChirho).digest('hex');

function toneChirho(levelChirho: number, pitchChirho: number): Uint8Array {
	return encodePcmWavChirho(
		Int16Array.from({ length: 1200 }, (_unusedChirho, indexChirho) =>
			Math.round(Math.sin(indexChirho * pitchChirho) * levelChirho * 32767)
		),
		22_050
	);
}

function writeChirho(pathChirho: string, bytesChirho: Uint8Array | string): void {
	mkdirSync(dirname(pathChirho), { recursive: true });
	writeFileSync(pathChirho, bytesChirho);
}

function stageChirho(requireChirho = false, ignoredChirho: boolean | null = true) {
	return prepareNativeSoundsChirho({
		clips_dir_chirho: clipsChirho,
		static_dir_chirho: staticChirho,
		assets_dir_chirho: assetsChirho,
		is_ignored_chirho: () => ignoredChirho,
		require_licensed_chirho: requireChirho
	});
}

/** The staged set, by path under sounds-chirho, with each file's SHA-256. */
function stagedChirho(): Record<string, string> {
	const filesChirho: Record<string, string> = {};
	const walkChirho = (folderChirho: string, prefixChirho: string): void => {
		for (const entryChirho of readdirSync(folderChirho, { withFileTypes: true })) {
			const pathChirho = join(folderChirho, entryChirho.name);
			if (entryChirho.isDirectory()) walkChirho(pathChirho, `${prefixChirho}${entryChirho.name}/`);
			else filesChirho[`${prefixChirho}${entryChirho.name}`] = shaChirho(readFileSync(pathChirho));
		}
	};
	const soundsChirho = join(assetsChirho, 'sounds-chirho');
	if (existsSync(soundsChirho)) walkChirho(soundsChirho, '');
	return filesChirho;
}

function stagedProfileChirho() {
	return parseSoundProfileChirho(
		JSON.parse(readFileSync(join(assetsChirho, 'sounds-chirho', 'profile_chirho.json'), 'utf8'))
	);
}

beforeEach(() => {
	rootChirho = mkdtempSync(join(tmpdir(), 'native-sounds-chirho-'));
	staticChirho = join(rootChirho, 'static');
	clipsChirho = join(rootChirho, 'clips');
	assetsChirho = join(rootChirho, 'native-assets-chirho');
	OPEN_URLS_CHIRHO.forEach((urlChirho, indexChirho) =>
		writeChirho(join(staticChirho, urlChirho), toneChirho(0.1, 0.05 + indexChirho / 200))
	);
	CUT_FILES_CHIRHO.forEach((fileChirho, indexChirho) =>
		writeChirho(join(clipsChirho, fileChirho), toneChirho(0.12, 0.02 + indexChirho / 100))
	);
	// An original recording beside the cuts must never reach a bundle.
	writeChirho(join(clipsChirho, 'originals', 'knob_turn_chirho.wav'), toneChirho(0.12, 0.3));
	writeChirho(
		join(clipsChirho, CUT_MANIFEST_NAME_CHIRHO),
		JSON.stringify({
			clips_chirho: CUT_FILES_CHIRHO.map((fileChirho) => {
				const bytesChirho = readFileSync(join(clipsChirho, fileChirho));
				return {
					name_chirho: fileChirho.split('/')[1].replace('.wav', ''),
					file_chirho: fileChirho,
					sha256_chirho: shaChirho(bytesChirho),
					bytes_chirho: bytesChirho.length
				};
			})
		})
	);
});
afterEach(() => {
	rmSync(rootChirho, { recursive: true, force: true });
});

describe('native sound staging', () => {
	it('stages the profile and exactly the eleven purchased files it names, at its own paths', () => {
		expect(stageChirho()).toMatchObject({
			source_chirho: 'licensed',
			files_chirho: 11,
			changed_chirho: true
		});
		const profileChirho = stagedProfileChirho();
		expect(profileChirho?.source_chirho).toBe('licensed');
		const namedChirho = [
			...(profileChirho?.tuning_chirho ?? []),
			...(profileChirho?.click_chirho ?? []),
			...(profileChirho?.knob_chirho ?? [])
		].map((clipChirho) => clipChirho.url_chirho);
		expect(Object.keys(stagedChirho()).sort()).toEqual(
			[
				'profile_chirho.json',
				...namedChirho.map((urlChirho) => urlChirho.slice('/sounds-chirho/'.length))
			].sort()
		);
		for (const fileChirho of CUT_FILES_CHIRHO)
			expect(
				readFileSync(join(assetsChirho, 'sounds-chirho', 'licensed-chirho', fileChirho)).equals(
					readFileSync(join(clipsChirho, fileChirho))
				)
			).toBe(true);
		// No work, staging, retired or lock file is left beside the set.
		expect(readdirSync(assetsChirho)).toEqual(['sounds-chirho']);
	});

	it('falls back to the open set with no purchased file left behind', () => {
		stageChirho();
		rmSync(clipsChirho, { recursive: true });
		expect(stageChirho()).toMatchObject({
			source_chirho: 'open',
			files_chirho: 11,
			changed_chirho: true
		});
		expect(stagedProfileChirho()).toEqual(OPEN_SOUND_PROFILE_CHIRHO);
		expect(Object.keys(stagedChirho()).sort()).toEqual(
			[
				'profile_chirho.json',
				...OPEN_URLS_CHIRHO.map((urlChirho) => urlChirho.slice('/sounds-chirho/'.length))
			].sort()
		);
		for (const urlChirho of OPEN_URLS_CHIRHO)
			expect(
				readFileSync(join(assetsChirho, urlChirho)).equals(
					readFileSync(join(staticChirho, urlChirho))
				)
			).toBe(true);
	});

	it('fails a release build without the private cuts and leaves the staged set as it was', () => {
		stageChirho();
		const beforeChirho = stagedChirho();
		rmSync(clipsChirho, { recursive: true });
		expect(() => stageChirho(true)).toThrow(/requires them/);
		expect(stagedChirho()).toEqual(beforeChirho);
		expect(readdirSync(assetsChirho)).toEqual(['sounds-chirho']);
	});

	it('keeps the last good set when a cut no longer matches its manifest', () => {
		stageChirho();
		const beforeChirho = stagedChirho();
		const changedChirho = readFileSync(join(clipsChirho, CUT_FILES_CHIRHO[10]));
		changedChirho[60] ^= 1;
		writeFileSync(join(clipsChirho, CUT_FILES_CHIRHO[10]), changedChirho);
		expect(() => stageChirho()).toThrow(/does not match the cut manifest/);
		expect(stagedChirho()).toEqual(beforeChirho);
	});

	it('stages nothing while Git would not ignore the folder', () => {
		expect(() => stageChirho(false, false)).toThrow(/Git does not ignore/);
		expect(existsSync(assetsChirho)).toBe(false);
	});

	it('leaves an identical set untouched and replaces a changed one whole, stray files included', () => {
		stageChirho();
		expect(stageChirho()).toMatchObject({ changed_chirho: false });
		writeChirho(
			join(assetsChirho, 'sounds-chirho', 'licensed-chirho', 'stale_chirho.wav'),
			toneChirho(0.1, 0.2)
		);
		expect(stageChirho()).toMatchObject({ changed_chirho: true });
		expect(Object.keys(stagedChirho())).not.toContain('licensed-chirho/stale_chirho.wav');
		expect(Object.keys(stagedChirho())).toHaveLength(12);
	});

	it('stops while a live preparation holds the folder, and takes over a lock left by one that has gone', () => {
		writeChirho(join(assetsChirho, '.prepare-lock-chirho'), String(process.pid));
		expect(() => stageChirho()).toThrow(/another preparation/);
		expect(existsSync(join(assetsChirho, 'sounds-chirho'))).toBe(false);
		writeChirho(join(assetsChirho, '.prepare-lock-chirho'), '2147480000');
		expect(stageChirho()).toMatchObject({ source_chirho: 'licensed', changed_chirho: true });
		expect(readdirSync(assetsChirho)).toEqual(['sounds-chirho']);
	});
});
