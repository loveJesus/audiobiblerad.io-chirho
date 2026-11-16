// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Prepares the radio's sound effects before a build or a dev server starts.
// See spec-chirho/workflows-chirho/radio_sounds_workflow_chirho.md.
//
//   bun scripts-chirho/sounds-chirho/prepare_sounds_chirho.ts
//   bun scripts-chirho/sounds-chirho/prepare_sounds_chirho.ts --require-licensed-chirho
//   bun scripts-chirho/sounds-chirho/prepare_sounds_chirho.ts --clips-dir-chirho <folder>
//
// --require-licensed-chirho fails instead of falling back to the open set, for a release build.

import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	PRIVATE_CLIPS_PATH_CHIRHO,
	gitIgnoreCheckChirho,
	prepareSoundsChirho
} from './sound_preparer_chirho';

const REPO_DIR_CHIRHO = resolve(fileURLToPath(new URL('../..', import.meta.url)));

function flagValueChirho(nameChirho: string): string | undefined {
	const indexChirho = process.argv.indexOf(nameChirho);
	return indexChirho >= 0 ? process.argv[indexChirho + 1] : undefined;
}

try {
	const resultChirho = prepareSoundsChirho({
		clips_dir_chirho: resolve(
			flagValueChirho('--clips-dir-chirho') ?? join(REPO_DIR_CHIRHO, PRIVATE_CLIPS_PATH_CHIRHO)
		),
		static_dir_chirho: join(REPO_DIR_CHIRHO, 'static'),
		is_ignored_chirho: gitIgnoreCheckChirho(REPO_DIR_CHIRHO),
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
