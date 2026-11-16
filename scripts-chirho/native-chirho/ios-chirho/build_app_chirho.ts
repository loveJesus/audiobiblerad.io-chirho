// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import {
	mkdirSync as mkdirSyncChirho,
	mkdtempSync as mkdtempSyncChirho,
	readdirSync as readdirSyncChirho,
	realpathSync as realpathSyncChirho,
	rmSync as rmSyncChirho,
	statSync as statSyncChirho,
	statfsSync as statfsSyncChirho
} from 'node:fs';
import { dirname as dirnameChirho, join as joinChirho, resolve as resolveChirho } from 'node:path';
import { fileURLToPath as fileURLToPathChirho } from 'node:url';
import { childEnvironmentChirho, selectCacheChirho } from '../../build-cache-chirho/select_chirho';
import { runOwnedCommandChirho } from '../../build-cache-chirho/owned_command_chirho';

// The unsigned simulator build entry. No simulator is booted and no account is provisioned.
// See spec-chirho/workflows-chirho/experience-chirho/native_players_workflow_chirho.md.
const rootChirho = resolveChirho(dirnameChirho(fileURLToPathChirho(import.meta.url)), '../../..');
const [targetChirho, ...optionsChirho] = process.argv.slice(2);
if (
	!['phone', 'watch'].includes(targetChirho) ||
	optionsChirho.some(
		(optionChirho) => !['--cache-probe-chirho', '--require-licensed-chirho'].includes(optionChirho)
	)
)
	throw new Error(
		'Usage: build_app_chirho.ts phone|watch [--require-licensed-chirho] [--cache-probe-chirho]'
	);
const selectionChirho = selectCacheChirho(rootChirho, 'xcode-simulator-chirho');
const cacheChirho = selectionChirho.cache_root_chirho;
const identityChirho = statSyncChirho(cacheChirho);
function availableChirho(pathChirho: string): number {
	const valueChirho = statfsSyncChirho(pathChirho);
	return valueChirho.bavail * valueChirho.bsize;
}
if (Math.min(availableChirho(rootChirho), availableChirho(cacheChirho)) < 4 * 1024 ** 3)
	throw new Error('Native build admission needs 4 GiB free on internal and selected storage.');
function checkBackendChirho(): void {
	const currentChirho = statSyncChirho(cacheChirho);
	if (
		currentChirho.dev !== identityChirho.dev ||
		currentChirho.ino !== identityChirho.ino ||
		realpathSyncChirho(cacheChirho) !== cacheChirho
	)
		throw new Error('Pinned native cache lost; no retry.');
}
function checkPinnedChirho(): void {
	checkBackendChirho();
	if (availableChirho(rootChirho) < 1024 ** 3 || availableChirho(cacheChirho) < 512 * 1024 ** 2)
		throw new Error('Native runtime disk floor lost; no retry.');
}
const derivedChirho = joinChirho(cacheChirho, 'derived-data-chirho');
// Xcode is macOS-only. Ignore a caller's external TMPDIR and keep build scratch on Data.
const temporaryRootChirho = realpathSyncChirho('/private/tmp');
if (statSyncChirho(temporaryRootChirho).dev !== statSyncChirho(rootChirho).dev)
	throw new Error('Native temporary storage must be on the internal worktree device.');
const environmentChirho = childEnvironmentChirho(cacheChirho, temporaryRootChirho);
delete environmentChirho.RADIO_VITE_CACHE_CHIRHO;
console.log(
	`native-build-chirho: ${JSON.stringify({ ...selectionChirho, derived_data_chirho: derivedChirho, target_chirho: targetChirho })}`
);

if (optionsChirho.includes('--cache-probe-chirho')) {
	checkPinnedChirho();
} else {
	// The same cache/profile has one build writer; a failed or abandoned lock is reported, not stolen.
	const lockChirho = joinChirho(cacheChirho, 'app-build-lock-chirho');
	const temporaryChirho = mkdtempSyncChirho(joinChirho(temporaryRootChirho, 'radio-xcode-chirho-'));
	let ownsLockChirho = false;
	Object.assign(environmentChirho, {
		TMPDIR: temporaryChirho,
		TMP: temporaryChirho,
		TEMP: temporaryChirho
	});
	try {
		checkPinnedChirho();
		mkdirSyncChirho(lockChirho);
		ownsLockChirho = true;
		for (const argumentsChirho of [
			[
				joinChirho(rootChirho, 'scripts-chirho/native-chirho/export_catalogue_chirho.ts'),
				'--check-chirho'
			],
			[
				joinChirho(rootChirho, 'scripts-chirho/native-chirho/prepare_native_sounds_chirho.ts'),
				...(optionsChirho.includes('--require-licensed-chirho')
					? ['--require-licensed-chirho']
					: [])
			]
		]) {
			const codeChirho = await runOwnedCommandChirho(
				process.execPath,
				argumentsChirho,
				environmentChirho,
				checkPinnedChirho,
				rootChirho
			);
			if (codeChirho !== 0) throw new Error('Native pre-build input preparation failed.');
		}
		const assetEntriesChirho = readdirSyncChirho(
			joinChirho(rootChirho, 'apps-chirho/shared-chirho/native-assets-chirho')
		);
		if (assetEntriesChirho.length !== 1 || assetEntriesChirho[0] !== 'sounds-chirho')
			throw new Error('Native asset folder contains unprepared or unrelated entries.');
		process.exitCode = await runOwnedCommandChirho(
			'xcodebuild',
			[
				'-project',
				joinChirho(rootChirho, 'apps-chirho/ios-chirho/AudioBibleRadioChirho.xcodeproj'),
				'-scheme',
				targetChirho === 'phone' ? 'RadioPhoneChirho' : 'RadioWatchChirho',
				'-configuration',
				'Debug',
				'-destination',
				targetChirho === 'phone'
					? 'generic/platform=iOS Simulator'
					: 'generic/platform=watchOS Simulator',
				'-derivedDataPath',
				derivedChirho,
				'-jobs',
				'2',
				'-disableAutomaticPackageResolution',
				'-skipPackageUpdates',
				'-packageCachePath',
				joinChirho(cacheChirho, 'package-cache-chirho'),
				'-clonedSourcePackagesDirPath',
				joinChirho(cacheChirho, 'package-checkouts-chirho'),
				'CODE_SIGNING_ALLOWED=NO',
				'CODE_SIGNING_REQUIRED=NO',
				'build'
			],
			environmentChirho,
			checkPinnedChirho,
			rootChirho
		);
	} finally {
		rmSyncChirho(temporaryChirho, { recursive: true, force: true });
		try {
			checkBackendChirho();
			if (ownsLockChirho) rmSyncChirho(lockChirho, { recursive: true });
		} catch {
			/* A missing backend is never recreated for cleanup. */
		}
	}
}
