// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Prepares the radio's sound effects for a build.
// See spec-chirho/workflows-chirho/radio_sounds_workflow_chirho.md.
//
// The purchased clips live in a private, ignored folder whose cut manifest pins each file's size
// and SHA-256. This copies exactly those eleven clips, checked before and after copying, into
// static/sounds-chirho/licensed-chirho/, and writes static/sounds-chirho/profile_chirho.json to
// name them. Both outputs must be ignored by Git: the purchase covers the clips inside the
// published radio, not in its public source. Without the private folder the profile names the
// open set kept in the repository, and nothing licensed is left behind.

import { createHash } from 'node:crypto';
import {
	existsSync,
	mkdirSync,
	readFileSync,
	readdirSync,
	renameSync,
	rmSync,
	writeFileSync
} from 'node:fs';
import { dirname, join, resolve, sep } from 'node:path';
import {
	OPEN_SOUND_PROFILE_CHIRHO,
	SOUND_PROFILE_PATH_CHIRHO,
	SOUND_PROFILE_SCHEMA_CHIRHO,
	parseSoundProfileChirho,
	type SoundClipChirho,
	type SoundProfileChirho
} from '../../src/lib/sounds-chirho/sound_profile_chirho';
import {
	SOUND_PEAK_LIMIT_CHIRHO,
	decodePcmWavChirho,
	peakOfChirho
} from '../../src/lib/sounds-chirho/wav_chirho';

export const CUT_MANIFEST_NAME_CHIRHO = 'cut_manifest_chirho.json';
/** Where the purchased clips are served from. The static folder serves each file at its own path. */
const LICENSED_SITE_DIR_CHIRHO = '/sounds-chirho/licensed-chirho';
const STAGING_NAME_CHIRHO = 'staging-chirho';
const RETIRED_NAME_CHIRHO = 'retired-chirho';
const ROLE_DIRS_CHIRHO: readonly string[] = ['tuning-chirho', 'interface-chirho'];
const MAX_CLIP_BYTES_CHIRHO = 2 * 1024 * 1024;

type ClipRoleChirho = 'tuning' | 'click' | 'knob';

/** The eleven clips a build may use, and the part each plays. */
const EXPECTED_CLIPS_CHIRHO: Readonly<Record<string, ClipRoleChirho>> = {
	radio_01_chirho: 'tuning',
	radio_02_chirho: 'tuning',
	radio_03_chirho: 'tuning',
	radio_04_chirho: 'tuning',
	radio_05_chirho: 'tuning',
	radio_06_chirho: 'tuning',
	radio_07_chirho: 'tuning',
	radio_08_chirho: 'tuning',
	radio_09_chirho: 'tuning',
	button_click_chirho: 'click',
	knob_turn_chirho: 'knob'
};

/**
 * Where a clip's useful sound begins. The knob recording is a whole turn: about a dozen detents
 * in 1.06 s. Its strongest detent begins at 0.90 s and only silence follows it, so one knob step
 * plays exactly one tick and ends by itself. Measured on the clip the manifest pins.
 */
const START_SECONDS_CHIRHO: Readonly<Record<string, number>> = { knob_turn_chirho: 0.9 };

interface CutClipChirho {
	readonly name_chirho: string;
	readonly role_chirho: ClipRoleChirho;
	/** Relative to the private folder, and to the licensed output folder. */
	readonly file_chirho: string;
	readonly sha256_chirho: string;
	readonly bytes_chirho: number;
}

export interface PrepareSoundsOptionsChirho {
	/** The private folder holding the cut manifest and its clips. It may be absent. */
	clips_dir_chirho: string;
	/** The site's static folder. */
	static_dir_chirho: string;
	/** Whether Git ignores this absolute path. Null outside a Git work tree. */
	is_ignored_chirho(pathChirho: string): boolean | null;
	/** Fail rather than fall back to the open set, for a release build. */
	require_licensed_chirho?: boolean;
}

export interface PrepareSoundsResultChirho {
	readonly source_chirho: 'licensed' | 'open';
	readonly files_chirho: number;
	readonly bytes_chirho: number;
	readonly profile_written_chirho: boolean;
}

function sitePathChirho(staticDirChirho: string, siteChirho: string): string {
	return join(staticDirChirho, ...siteChirho.split('/').filter(Boolean));
}

function sha256Chirho(bytesChirho: Uint8Array): string {
	return createHash('sha256').update(bytesChirho).digest('hex');
}

/** A recording the radio may play: readable 16-bit PCM, audible, and quiet in its own samples. */
function checkLevelChirho(bytesChirho: Uint8Array, labelChirho: string): void {
	let peakChirho: number;
	try {
		peakChirho = peakOfChirho(decodePcmWavChirho(bytesChirho));
	} catch (errorChirho) {
		throw new Error(`${labelChirho}: ${(errorChirho as Error).message}`, { cause: errorChirho });
	}
	if (peakChirho === 0) throw new Error(`${labelChirho} is silent`);
	if (peakChirho > SOUND_PEAK_LIMIT_CHIRHO)
		throw new Error(
			`${labelChirho} peaks at ${peakChirho.toFixed(3)} of full scale, above ${SOUND_PEAK_LIMIT_CHIRHO}`
		);
}

/** The manifest must name exactly the eleven expected clips, each at its expected path. */
function readCutManifestChirho(manifestPathChirho: string): CutClipChirho[] {
	const documentChirho = JSON.parse(readFileSync(manifestPathChirho, 'utf8')) as {
		clips_chirho?: unknown;
	};
	if (!Array.isArray(documentChirho.clips_chirho))
		throw new Error('the cut manifest lists no clips');
	const clipsChirho: CutClipChirho[] = [];
	for (const entryChirho of documentChirho.clips_chirho as Record<string, unknown>[]) {
		const {
			name_chirho: nameChirho,
			file_chirho: fileChirho,
			sha256_chirho: shaChirho,
			bytes_chirho: bytesChirho
		} = entryChirho ?? {};
		const roleChirho =
			typeof nameChirho === 'string' && Object.hasOwn(EXPECTED_CLIPS_CHIRHO, nameChirho)
				? EXPECTED_CLIPS_CHIRHO[nameChirho]
				: undefined;
		if (!roleChirho || clipsChirho.some((clipChirho) => clipChirho.name_chirho === nameChirho))
			throw new Error(
				`the cut manifest names an unexpected or repeated clip: ${String(nameChirho)}`
			);
		const folderChirho = roleChirho === 'tuning' ? 'tuning-chirho' : 'interface-chirho';
		if (fileChirho !== `${folderChirho}/${nameChirho}.wav`)
			throw new Error(`clip ${nameChirho} is not at ${folderChirho}/${nameChirho}.wav`);
		if (typeof shaChirho !== 'string' || !/^[0-9a-f]{64}$/.test(shaChirho))
			throw new Error(`clip ${nameChirho} has no SHA-256`);
		if (
			typeof bytesChirho !== 'number' ||
			!Number.isInteger(bytesChirho) ||
			bytesChirho <= 44 ||
			bytesChirho > MAX_CLIP_BYTES_CHIRHO
		)
			throw new Error(`clip ${nameChirho} has no believable size`);
		clipsChirho.push({
			name_chirho: nameChirho as string,
			role_chirho: roleChirho,
			file_chirho: fileChirho,
			sha256_chirho: shaChirho,
			bytes_chirho: bytesChirho
		});
	}
	const missingChirho = Object.keys(EXPECTED_CLIPS_CHIRHO).filter(
		(nameChirho) => !clipsChirho.some((clipChirho) => clipChirho.name_chirho === nameChirho)
	);
	if (missingChirho.length) throw new Error(`the cut manifest lacks ${missingChirho.join(', ')}`);
	return clipsChirho.sort((leftChirho, rightChirho) =>
		leftChirho.name_chirho.localeCompare(rightChirho.name_chirho)
	);
}

function verifyBytesChirho(
	bytesChirho: Uint8Array,
	clipChirho: CutClipChirho,
	labelChirho: string
): void {
	if (
		bytesChirho.length !== clipChirho.bytes_chirho ||
		sha256Chirho(bytesChirho) !== clipChirho.sha256_chirho
	)
		throw new Error(`${labelChirho} ${clipChirho.file_chirho} does not match the cut manifest`);
}

function licensedProfileChirho(clipsChirho: readonly CutClipChirho[]): SoundProfileChirho {
	const clipForChirho = (clipChirho: CutClipChirho): SoundClipChirho => {
		const urlChirho = `${LICENSED_SITE_DIR_CHIRHO}/${clipChirho.file_chirho}`;
		const startChirho = START_SECONDS_CHIRHO[clipChirho.name_chirho];
		return startChirho === undefined
			? { url_chirho: urlChirho }
			: { url_chirho: urlChirho, start_seconds_chirho: startChirho };
	};
	const roleChirho = (wantedChirho: ClipRoleChirho): SoundClipChirho[] =>
		clipsChirho.filter((clipChirho) => clipChirho.role_chirho === wantedChirho).map(clipForChirho);
	return {
		schema_chirho: SOUND_PROFILE_SCHEMA_CHIRHO,
		source_chirho: 'licensed',
		tuning_chirho: roleChirho('tuning'),
		click_chirho: roleChirho('click'),
		knob_chirho: roleChirho('knob')
	};
}

function writeProfileChirho(staticDirChirho: string, profileChirho: SoundProfileChirho): void {
	if (!parseSoundProfileChirho(profileChirho))
		throw new Error("the prepared profile would fail the page's own check");
	const pathChirho = sitePathChirho(staticDirChirho, SOUND_PROFILE_PATH_CHIRHO);
	mkdirSync(dirname(pathChirho), { recursive: true });
	writeFileSync(pathChirho, `${JSON.stringify(profileChirho, null, '\t')}\n`);
}

/** Every file the open set names is in the repository, readable and quiet. */
function checkOpenSetChirho(staticDirChirho: string): void {
	const { tuning_chirho, click_chirho, knob_chirho } = OPEN_SOUND_PROFILE_CHIRHO;
	for (const clipChirho of [...tuning_chirho, ...click_chirho, ...knob_chirho]) {
		const pathChirho = sitePathChirho(staticDirChirho, clipChirho.url_chirho);
		if (!existsSync(pathChirho))
			throw new Error(
				`the open sound ${clipChirho.url_chirho} is missing; ` +
					'bun scripts-chirho/sounds-chirho/generate_interface_sounds_chirho.ts writes the interface pair'
			);
		checkLevelChirho(readFileSync(pathChirho), `open sound ${clipChirho.url_chirho}`);
	}
}

/** Copies the verified purchased clips and names them, or names the open set when they are absent. */
export function prepareSoundsChirho(
	optionsChirho: PrepareSoundsOptionsChirho
): PrepareSoundsResultChirho {
	const staticDirChirho = optionsChirho.static_dir_chirho;
	const licensedDirChirho = sitePathChirho(staticDirChirho, LICENSED_SITE_DIR_CHIRHO);
	const profilePathChirho = sitePathChirho(staticDirChirho, SOUND_PROFILE_PATH_CHIRHO);
	const manifestPathChirho = join(optionsChirho.clips_dir_chirho, CUT_MANIFEST_NAME_CHIRHO);
	// The open set is the page's own fallback, so it must be whole in every build.
	checkOpenSetChirho(staticDirChirho);

	if (!existsSync(manifestPathChirho)) {
		if (optionsChirho.require_licensed_chirho)
			throw new Error(
				`no private clips at ${optionsChirho.clips_dir_chirho}; this build requires them`
			);
		rmSync(licensedDirChirho, { recursive: true, force: true });
		const writableChirho = optionsChirho.is_ignored_chirho(profilePathChirho) !== false;
		if (writableChirho) writeProfileChirho(staticDirChirho, OPEN_SOUND_PROFILE_CHIRHO);
		return {
			source_chirho: 'open',
			files_chirho: 0,
			bytes_chirho: 0,
			profile_written_chirho: writableChirho
		};
	}

	// Before any byte is copied: both outputs must be ignored, or the purchase could reach public Git.
	for (const pathChirho of [
		join(licensedDirChirho, 'tuning-chirho', 'radio_01_chirho.wav'),
		profilePathChirho
	])
		if (optionsChirho.is_ignored_chirho(pathChirho) === false)
			throw new Error(
				`Git does not ignore ${pathChirho}; purchased clips stay out of public source, so nothing was copied`
			);

	const clipsChirho = readCutManifestChirho(manifestPathChirho);
	const clipsDirChirho = resolve(optionsChirho.clips_dir_chirho);
	const stagingDirChirho = join(licensedDirChirho, STAGING_NAME_CHIRHO);
	const retiredDirChirho = join(licensedDirChirho, RETIRED_NAME_CHIRHO);
	let bytesChirho = 0;
	rmSync(stagingDirChirho, { recursive: true, force: true });
	try {
		for (const clipChirho of clipsChirho) {
			const sourceChirho = resolve(clipsDirChirho, clipChirho.file_chirho);
			if (!sourceChirho.startsWith(clipsDirChirho + sep))
				throw new Error(`clip ${clipChirho.file_chirho} lies outside the private folder`);
			if (!existsSync(sourceChirho))
				throw new Error(`private clip ${clipChirho.file_chirho} is missing`);
			const contentChirho = readFileSync(sourceChirho);
			verifyBytesChirho(contentChirho, clipChirho, 'private clip');
			checkLevelChirho(contentChirho, `private clip ${clipChirho.file_chirho}`);
			const targetChirho = join(stagingDirChirho, ...clipChirho.file_chirho.split('/'));
			mkdirSync(dirname(targetChirho), { recursive: true });
			writeFileSync(targetChirho, contentChirho);
			verifyBytesChirho(readFileSync(targetChirho), clipChirho, 'copied clip');
			bytesChirho += contentChirho.length;
		}
		// Only now, with every copy read back, the new folders replace the old.
		rmSync(retiredDirChirho, { recursive: true, force: true });
		mkdirSync(retiredDirChirho, { recursive: true });
		for (const roleDirChirho of ROLE_DIRS_CHIRHO) {
			const finalDirChirho = join(licensedDirChirho, roleDirChirho);
			if (existsSync(finalDirChirho))
				renameSync(finalDirChirho, join(retiredDirChirho, roleDirChirho));
			renameSync(join(stagingDirChirho, roleDirChirho), finalDirChirho);
		}
	} finally {
		rmSync(stagingDirChirho, { recursive: true, force: true });
		rmSync(retiredDirChirho, { recursive: true, force: true });
	}
	// Nothing but the two role folders stays in the licensed folder.
	for (const entryChirho of readdirSync(licensedDirChirho))
		if (!ROLE_DIRS_CHIRHO.includes(entryChirho))
			rmSync(join(licensedDirChirho, entryChirho), { recursive: true, force: true });
	writeProfileChirho(staticDirChirho, licensedProfileChirho(clipsChirho));
	return {
		source_chirho: 'licensed',
		files_chirho: clipsChirho.length,
		bytes_chirho: bytesChirho,
		profile_written_chirho: true
	};
}
