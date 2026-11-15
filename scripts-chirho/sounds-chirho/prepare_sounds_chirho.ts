// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Prepares the radio's sound effects before a build or a dev server starts.
// See spec-chirho/workflows-chirho/radio_sounds_workflow_chirho.md.
//
//   bun scripts-chirho/sounds-chirho/prepare_sounds_chirho.ts
//   bun scripts-chirho/sounds-chirho/prepare_sounds_chirho.ts --require-licensed-chirho
//   bun scripts-chirho/sounds-chirho/prepare_sounds_chirho.ts --clips-dir-chirho <folder>
//
// --require-licensed-chirho fails instead of falling back to the open set, for a release build.

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareSoundsChirho } from './sound_preparer_chirho';

const REPO_DIR_CHIRHO = resolve(fileURLToPath(new URL('../..', import.meta.url)));
/** The private folder of prepared cuts. Ignored by Git, and absent in a copy of the source. */
const DEFAULT_CLIPS_DIR_CHIRHO = join(
	REPO_DIR_CHIRHO,
	'workspace-chirho/private-chirho/audio-assets-chirho/26-11-14-radio_clips-chirho'
);

function flagValueChirho(nameChirho: string): string | undefined {
	const indexChirho = process.argv.indexOf(nameChirho);
	return indexChirho >= 0 ? process.argv[indexChirho + 1] : undefined;
}

const probeChirho = spawnSync(
	'git',
	['-C', REPO_DIR_CHIRHO, 'rev-parse', '--is-inside-work-tree'],
	{
		encoding: 'utf8'
	}
);
// A checkout whose git cannot run cannot prove what it ignores, so it is treated as ignoring nothing.
const gitStateChirho: 'tree' | 'none' | 'unknown' = probeChirho.error
	? existsSync(join(REPO_DIR_CHIRHO, '.git'))
		? 'unknown'
		: 'none'
	: probeChirho.status === 0 && probeChirho.stdout.trim() === 'true'
		? 'tree'
		: 'none';

function isIgnoredChirho(pathChirho: string): boolean | null {
	if (gitStateChirho === 'none') return null;
	if (gitStateChirho === 'unknown') return false;
	// Exit 0: ignored. Exit 1: not ignored, or tracked. Anything else counts as not ignored.
	return (
		spawnSync('git', [
			'-C',
			REPO_DIR_CHIRHO,
			'check-ignore',
			'-q',
			relative(REPO_DIR_CHIRHO, pathChirho)
		]).status === 0
	);
}

try {
	const resultChirho = prepareSoundsChirho({
		clips_dir_chirho: resolve(flagValueChirho('--clips-dir-chirho') ?? DEFAULT_CLIPS_DIR_CHIRHO),
		static_dir_chirho: join(REPO_DIR_CHIRHO, 'static'),
		is_ignored_chirho: isIgnoredChirho,
		require_licensed_chirho: process.argv.includes('--require-licensed-chirho')
	});
	console.log(
		resultChirho.source_chirho === 'licensed'
			? `radio sounds: purchased set, ${resultChirho.files_chirho} clips (${resultChirho.bytes_chirho} bytes) verified and prepared`
			: `radio sounds: open set${resultChirho.profile_written_chirho ? '' : '; profile not written because Git does not ignore it'}`
	);
} catch (errorChirho) {
	console.error(`radio sounds: stopped. ${(errorChirho as Error).message}`);
	process.exitCode = 1;
}
