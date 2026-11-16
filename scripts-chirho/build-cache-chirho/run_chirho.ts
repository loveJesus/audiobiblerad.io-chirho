// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import {
	mkdirSync as mkdirSyncChirho,
	mkdtempSync as mkdtempSyncChirho,
	realpathSync as realpathSyncChirho,
	rmSync as rmSyncChirho,
	statSync as statSyncChirho
} from 'node:fs';
import { join as joinChirho } from 'node:path';
import {
	checkInternalCapacityChirho,
	childEnvironmentChirho,
	selectCacheChirho
} from './select_chirho';
import { runOwnedCommandChirho } from './owned_command_chirho';

// A single backend is pinned for this invocation; no automatic retry on disappearance.
// See spec-chirho/workflows-chirho/build_cache_workflow_chirho.md.
const [profileChirho, ...rawArgumentsChirho] = process.argv.slice(2);
if (!['build', 'dev', 'unit'].includes(profileChirho))
	throw new Error('Unknown web build profile.');
const argumentsChirho = rawArgumentsChirho.filter((valueChirho) => valueChirho !== '--');
const selectionChirho = selectCacheChirho(process.cwd());
const rootChirho = selectionChirho.cache_root_chirho;
const identityChirho = statSyncChirho(rootChirho);
function checkPinnedChirho(): void {
	checkInternalCapacityChirho(process.cwd());
	const currentChirho = statSyncChirho(rootChirho);
	if (
		currentChirho.dev !== identityChirho.dev ||
		currentChirho.ino !== identityChirho.ino ||
		realpathSyncChirho(rootChirho) !== rootChirho
	)
		throw new Error('Selected build cache disappeared or changed.');
}
function childDirectoryChirho(parentChirho: string, nameChirho: string): string {
	checkPinnedChirho();
	const pathChirho = joinChirho(parentChirho, nameChirho);
	try {
		mkdirSyncChirho(pathChirho);
	} catch (errorChirho) {
		if ((errorChirho as NodeJS.ErrnoException).code !== 'EEXIST') throw errorChirho;
	}
	if (
		statSyncChirho(pathChirho).dev !== identityChirho.dev ||
		realpathSyncChirho(pathChirho) !== pathChirho
	)
		throw new Error('Build cache child redirected to another location.');
	return pathChirho;
}
const viteRootChirho = childDirectoryChirho(rootChirho, 'vite-cache-chirho');
const cacheChirho = childDirectoryChirho(viteRootChirho, `${profileChirho}-chirho`);
const tempRootChirho = childDirectoryChirho(rootChirho, 'tmp-chirho');
const temporaryChirho = mkdtempSyncChirho(joinChirho(tempRootChirho, `${profileChirho}-chirho-`));
const receiptChirho = {
	...selectionChirho,
	profile_chirho: profileChirho,
	vite_cache_chirho: cacheChirho,
	job_temp_chirho: temporaryChirho
};
console.log(`build-cache-chirho: ${JSON.stringify(receiptChirho)}`);

try {
	if (argumentsChirho.includes('--cache-probe-chirho')) {
		if (argumentsChirho.length !== 1) throw new Error('Cache probe accepts no build arguments.');
		checkPinnedChirho();
	} else {
		checkPinnedChirho();
		const commandChirho = joinChirho(
			process.cwd(),
			'node_modules/.bin',
			profileChirho === 'unit' ? 'vitest' : 'vite'
		);
		process.exitCode = await runOwnedCommandChirho(
			commandChirho,
			profileChirho === 'unit'
				? argumentsChirho
				: [profileChirho === 'dev' ? 'dev' : 'build', ...argumentsChirho],
			childEnvironmentChirho(cacheChirho, temporaryChirho),
			checkPinnedChirho
		);
	}
} finally {
	// Remove only this invocation's disposable scratch, never another job's cache/output.
	try {
		checkPinnedChirho();
		rmSyncChirho(temporaryChirho, { recursive: true, force: true });
	} catch {
		/* A disappeared backend is left untouched; never recreate its mountpoint. */
	}
}
