// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Stages the radio's sound effects for the native apps, before a native build and never during one.
// See spec-chirho/workflows-chirho/radio_sounds_workflow_chirho.md.
//
//   bun scripts-chirho/native-chirho/prepare_native_sounds_chirho.ts
//   bun scripts-chirho/native-chirho/prepare_native_sounds_chirho.ts --require-licensed-chirho
//   bun scripts-chirho/native-chirho/prepare_native_sounds_chirho.ts --clips-dir-chirho <folder>
//
// It writes one complete set to apps-chirho/shared-chirho/native-assets-chirho/sounds-chirho/:
// profile_chirho.json and exactly the files it names, each at the profile's own path relative to
// native-assets-chirho. The web build's preparer chooses and checks the set, so native and web play
// the same clips: the purchased cuts when the private folder holds them, the open set otherwise.
// Git must ignore the whole folder, because purchased bytes never enter public source.

import { createHash } from 'node:crypto';
import {
	existsSync,
	mkdirSync,
	readFileSync,
	readdirSync,
	renameSync,
	rmSync,
	statSync,
	writeFileSync
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	OPEN_SOUND_PROFILE_CHIRHO,
	SOUND_PROFILE_PATH_CHIRHO,
	parseSoundProfileChirho
} from '../../src/lib/sounds-chirho/sound_profile_chirho';
import {
	PRIVATE_CLIPS_PATH_CHIRHO,
	gitIgnoreCheckChirho,
	prepareSoundsChirho
} from '../sounds-chirho/sound_preparer_chirho';

/** Where native builds find their assets, from the repository root. Git ignores all of it. */
export const NATIVE_ASSETS_PATH_CHIRHO = 'apps-chirho/shared-chirho/native-assets-chirho';
const SOUNDS_DIR_CHIRHO = 'sounds-chirho';
const WORK_NAME_CHIRHO = '.work-chirho';
const STAGING_NAME_CHIRHO = '.staging-chirho';
const RETIRED_NAME_CHIRHO = '.retired-chirho';
const LOCK_NAME_CHIRHO = '.prepare-lock-chirho';

export interface PrepareNativeSoundsOptionsChirho {
	/** The private folder of prepared cuts, as for the web build. It may be absent. */
	clips_dir_chirho: string;
	/** The web app's static folder, which holds the open set. */
	static_dir_chirho: string;
	/** The native assets folder; the set is staged in its sounds-chirho folder. */
	assets_dir_chirho: string;
	/** Whether Git ignores this absolute path. Null outside a Git work tree. */
	is_ignored_chirho(pathChirho: string): boolean | null;
	/** Fail rather than fall back to the open set, for a release build. */
	require_licensed_chirho?: boolean;
}

export interface PrepareNativeSoundsResultChirho {
	readonly source_chirho: 'licensed' | 'open';
	/** Recordings in the set, not counting the profile. */
	readonly files_chirho: number;
	readonly bytes_chirho: number;
	/** False when the staged set already held exactly these bytes, so nothing was replaced. */
	readonly changed_chirho: boolean;
}

const sha256Chirho = (bytesChirho: Uint8Array): string =>
	createHash('sha256').update(bytesChirho).digest('hex');

/** A site path such as /sounds-chirho/x.wav, as a file under the given folder. */
const siteFileChirho = (rootChirho: string, siteChirho: string): string =>
	join(rootChirho, ...siteChirho.split('/').filter(Boolean));

/** Every file under a folder, by forward-slash path relative to it, with its SHA-256. */
function inventoryChirho(dirChirho: string): Map<string, string> {
	const filesChirho = new Map<string, string>();
	const walkChirho = (folderChirho: string, prefixChirho: string): void => {
		for (const nameChirho of readdirSync(folderChirho)) {
			const pathChirho = join(folderChirho, nameChirho);
			if (statSync(pathChirho).isDirectory())
				walkChirho(pathChirho, `${prefixChirho}${nameChirho}/`);
			else filesChirho.set(`${prefixChirho}${nameChirho}`, sha256Chirho(readFileSync(pathChirho)));
		}
	};
	if (existsSync(dirChirho)) walkChirho(dirChirho, '');
	return filesChirho;
}

const sameChirho = (leftChirho: Map<string, string>, rightChirho: Map<string, string>): boolean =>
	leftChirho.size === rightChirho.size &&
	[...leftChirho].every(([pathChirho, shaChirho]) => rightChirho.get(pathChirho) === shaChirho);

function aliveChirho(pidChirho: number): boolean {
	if (!Number.isInteger(pidChirho) || pidChirho <= 0) return false;
	try {
		process.kill(pidChirho, 0);
		return true;
	} catch (errorChirho) {
		return (errorChirho as { code?: string }).code === 'EPERM';
	}
}

/** One preparation at a time. A lock left by a process that is gone is taken over. */
function lockChirho(assetsDirChirho: string): () => void {
	const lockPathChirho = join(assetsDirChirho, LOCK_NAME_CHIRHO);
	for (let attemptChirho = 0; attemptChirho < 2; attemptChirho += 1) {
		try {
			writeFileSync(lockPathChirho, String(process.pid), { flag: 'wx' });
			return () => rmSync(lockPathChirho, { force: true });
		} catch (errorChirho) {
			if ((errorChirho as { code?: string }).code !== 'EEXIST') throw errorChirho;
			const holderChirho = Number(readFileSync(lockPathChirho, 'utf8'));
			if (aliveChirho(holderChirho))
				throw new Error(
					`another preparation (process ${holderChirho}) is staging ${assetsDirChirho}`,
					{ cause: errorChirho }
				);
			rmSync(lockPathChirho, { force: true });
		}
	}
	throw new Error(`could not lock ${assetsDirChirho}`);
}

/** Stages the set the web build would play, checked, read back, and swapped in whole. */
export function prepareNativeSoundsChirho(
	optionsChirho: PrepareNativeSoundsOptionsChirho
): PrepareNativeSoundsResultChirho {
	const assetsDirChirho = resolve(optionsChirho.assets_dir_chirho);
	const finalDirChirho = join(assetsDirChirho, SOUNDS_DIR_CHIRHO);
	const workDirChirho = join(assetsDirChirho, WORK_NAME_CHIRHO);
	const workStaticChirho = join(workDirChirho, 'static');
	const stagingDirChirho = join(assetsDirChirho, STAGING_NAME_CHIRHO);
	const stagedSoundsChirho = join(stagingDirChirho, SOUNDS_DIR_CHIRHO);
	const retiredDirChirho = join(assetsDirChirho, RETIRED_NAME_CHIRHO);
	// Before anything is written: Git must ignore every place a purchased byte could land.
	for (const pathChirho of [
		siteFileChirho(assetsDirChirho, SOUND_PROFILE_PATH_CHIRHO),
		join(finalDirChirho, 'licensed-chirho', 'tuning-chirho', 'radio_01_chirho.wav'),
		join(
			workStaticChirho,
			SOUNDS_DIR_CHIRHO,
			'licensed-chirho',
			'tuning-chirho',
			'radio_01_chirho.wav'
		),
		join(stagedSoundsChirho, 'licensed-chirho', 'tuning-chirho', 'radio_01_chirho.wav')
	])
		if (optionsChirho.is_ignored_chirho(pathChirho) === false)
			throw new Error(
				`Git does not ignore ${pathChirho}; purchased clips stay out of public source, so nothing was staged`
			);
	mkdirSync(assetsDirChirho, { recursive: true });
	const unlockChirho = lockChirho(assetsDirChirho);
	try {
		for (const dirChirho of [workDirChirho, stagingDirChirho, retiredDirChirho])
			rmSync(dirChirho, { recursive: true, force: true });
		// The shared preparer checks the open set where it prepares, so the work folder starts with it.
		const { tuning_chirho, click_chirho, knob_chirho } = OPEN_SOUND_PROFILE_CHIRHO;
		for (const { url_chirho: urlChirho } of [...tuning_chirho, ...click_chirho, ...knob_chirho]) {
			const fromChirho = siteFileChirho(optionsChirho.static_dir_chirho, urlChirho);
			if (!existsSync(fromChirho)) continue; // The preparer names whatever is missing.
			const toChirho = siteFileChirho(workStaticChirho, urlChirho);
			mkdirSync(dirname(toChirho), { recursive: true });
			writeFileSync(toChirho, readFileSync(fromChirho));
		}
		const preparedChirho = prepareSoundsChirho({
			clips_dir_chirho: optionsChirho.clips_dir_chirho,
			static_dir_chirho: workStaticChirho,
			is_ignored_chirho: optionsChirho.is_ignored_chirho,
			require_licensed_chirho: optionsChirho.require_licensed_chirho
		});
		const profileBytesChirho = readFileSync(
			siteFileChirho(workStaticChirho, SOUND_PROFILE_PATH_CHIRHO)
		);
		const profileChirho = parseSoundProfileChirho(JSON.parse(profileBytesChirho.toString('utf8')));
		if (!profileChirho || profileChirho.source_chirho !== preparedChirho.source_chirho)
			throw new Error("the prepared profile fails the app's own check");
		const urlsChirho = [
			...new Set(
				[
					...profileChirho.tuning_chirho,
					...profileChirho.click_chirho,
					...profileChirho.knob_chirho
				].map((clipChirho) => clipChirho.url_chirho)
			)
		];
		// Stage exactly the profile and the files it names, reading every copy back.
		const expectedChirho = new Map<string, string>();
		let bytesChirho = 0;
		for (const [siteChirho, contentChirho] of [
			[SOUND_PROFILE_PATH_CHIRHO, profileBytesChirho],
			...urlsChirho.map((urlChirho) => [
				urlChirho,
				readFileSync(siteFileChirho(workStaticChirho, urlChirho))
			])
		] as [string, Buffer][]) {
			const targetChirho = siteFileChirho(stagingDirChirho, siteChirho);
			mkdirSync(dirname(targetChirho), { recursive: true });
			writeFileSync(targetChirho, contentChirho);
			const shaChirho = sha256Chirho(contentChirho);
			if (sha256Chirho(readFileSync(targetChirho)) !== shaChirho)
				throw new Error(`the staged copy of ${siteChirho} did not read back`);
			expectedChirho.set(siteChirho.split('/').filter(Boolean).slice(1).join('/'), shaChirho);
			if (siteChirho !== SOUND_PROFILE_PATH_CHIRHO) bytesChirho += contentChirho.length;
		}
		if (!sameChirho(inventoryChirho(stagedSoundsChirho), expectedChirho))
			throw new Error('the staged set holds something its profile does not name');
		// An identical set stays as it is, so a build sees no change. Otherwise the whole folder is
		// replaced: the old one moves aside, the new one takes its place, and the old one is deleted.
		const changedChirho = !sameChirho(inventoryChirho(finalDirChirho), expectedChirho);
		if (changedChirho) {
			mkdirSync(retiredDirChirho, { recursive: true });
			if (existsSync(finalDirChirho))
				renameSync(finalDirChirho, join(retiredDirChirho, SOUNDS_DIR_CHIRHO));
			renameSync(stagedSoundsChirho, finalDirChirho);
		}
		return {
			source_chirho: profileChirho.source_chirho,
			files_chirho: urlsChirho.length,
			bytes_chirho: bytesChirho,
			changed_chirho: changedChirho
		};
	} finally {
		for (const dirChirho of [workDirChirho, stagingDirChirho, retiredDirChirho])
			rmSync(dirChirho, { recursive: true, force: true });
		unlockChirho();
	}
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	const repoDirChirho = resolve(fileURLToPath(new URL('../..', import.meta.url)));
	const clipsFlagChirho = process.argv.indexOf('--clips-dir-chirho');
	try {
		const resultChirho = prepareNativeSoundsChirho({
			clips_dir_chirho: resolve(
				clipsFlagChirho >= 0
					? process.argv[clipsFlagChirho + 1]
					: join(repoDirChirho, PRIVATE_CLIPS_PATH_CHIRHO)
			),
			static_dir_chirho: join(repoDirChirho, 'static'),
			assets_dir_chirho: join(repoDirChirho, NATIVE_ASSETS_PATH_CHIRHO),
			is_ignored_chirho: gitIgnoreCheckChirho(repoDirChirho),
			require_licensed_chirho: process.argv.includes('--require-licensed-chirho')
		});
		console.log(
			`native sounds: ${resultChirho.source_chirho === 'licensed' ? 'purchased' : 'open'} set, ` +
				`${resultChirho.files_chirho} clips (${resultChirho.bytes_chirho} bytes) and their profile ` +
				`${resultChirho.changed_chirho ? 'staged' : 'already staged, unchanged'} in ` +
				`${NATIVE_ASSETS_PATH_CHIRHO}/${SOUNDS_DIR_CHIRHO}`
		);
	} catch (errorChirho) {
		console.error(`native sounds: stopped. ${(errorChirho as Error).message}`);
		process.exitCode = 1;
	}
}
