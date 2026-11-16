// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import {
	existsSync as existsChirho,
	mkdirSync as mkdirChirho,
	mkdtempSync as temporaryDirectoryChirho,
	readdirSync as entriesChirho,
	realpathSync as realpathChirho,
	rmSync as removeChirho,
	statSync as statChirho,
	statfsSync as capacityChirho
} from 'node:fs';
import { homedir as homeChirho, tmpdir as systemTemporaryChirho } from 'node:os';
import { join as joinChirho, resolve as resolveChirho } from 'node:path';
import {
	selectCacheChirho,
	childEnvironmentChirho,
	checkInternalCapacityChirho
} from '../../build-cache-chirho/select_chirho';
import { runOwnedCommandChirho } from '../../build-cache-chirho/owned_command_chirho';

// Select and pin compiler output at normal entry. Signing/runtime scratch stays on the local disk.
// See workflows-chirho/experience-chirho/native_players_workflow_chirho.md.
const rootChirho = realpathChirho(new URL('../../../', import.meta.url).pathname);
const selectionChirho = selectCacheChirho(rootChirho, 'android-gradle-chirho');
const identityChirho = statChirho(selectionChirho.cache_root_chirho);
const checkChirho = (): void => {
	checkInternalCapacityChirho(rootChirho);
	const currentChirho = statChirho(selectionChirho.cache_root_chirho);
	if (
		currentChirho.dev !== identityChirho.dev ||
		currentChirho.ino !== identityChirho.ino ||
		realpathChirho(selectionChirho.cache_root_chirho) !== selectionChirho.cache_root_chirho
	)
		throw new Error('Native build cache disappeared or changed; no retry.');
};
console.log(`native-cache-chirho: ${JSON.stringify(selectionChirho)}`);
const argumentsChirho = process.argv.slice(2);
if (argumentsChirho.includes('--cache-probe-chirho')) {
	if (argumentsChirho.length !== 1) throw new Error('Cache probe accepts no build arguments.');
	checkChirho();
} else {
	for (const pathChirho of [rootChirho, selectionChirho.cache_root_chirho]) {
		const freeChirho = capacityChirho(pathChirho);
		if (freeChirho.bavail * freeChirho.bsize < 4 * 1024 ** 3)
			throw new Error('Native build needs 4 GiB free before starting.');
	}
	const childDirectoryChirho = (nameChirho: string): string => {
		checkChirho();
		const pathChirho = joinChirho(selectionChirho.cache_root_chirho, nameChirho);
		mkdirChirho(pathChirho, { recursive: true });
		if (
			realpathChirho(pathChirho) !== pathChirho ||
			statChirho(pathChirho).dev !== identityChirho.dev
		)
			throw new Error('Native cache child redirected.');
		return pathChirho;
	};
	const readOnlyCacheChirho = joinChirho(homeChirho(), '.gradle/caches');
	const gradleVersionChirho = '9.8.2';
	const distributionRootChirho = joinChirho(
		homeChirho(),
		'.gradle/wrapper/dists',
		`gradle-${gradleVersionChirho}-bin`
	);
	const candidatesChirho = [
		process.env.GRADLE_CHIRHO ?? 'gradle',
		...(existsChirho(distributionRootChirho)
			? entriesChirho(distributionRootChirho).map((entryChirho) =>
					joinChirho(
						distributionRootChirho,
						entryChirho,
						`gradle-${gradleVersionChirho}`,
						'bin/gradle'
					)
				)
			: [])
	];
	// JAVA_HOME is a toolchain path, not a secret, so it alone joins the filtered environment, and
	// only after its java answers as a JDK of version 17 or newer.
	const javaVersionChirho = (homeChirho: string): number => {
		try {
			const probeChirho = Bun.spawnSync([joinChirho(homeChirho, 'bin/java'), '-version'], {
				stdout: 'pipe',
				stderr: 'pipe'
			});
			const textChirho = new TextDecoder().decode(probeChirho.stderr);
			return probeChirho.exitCode === 0 ? Number(/version "(\d+)/.exec(textChirho)?.[1] ?? 0) : 0;
		} catch {
			return 0;
		}
	};
	const javaCandidatesChirho = [process.env.JAVA_HOME ?? ''];
	try {
		javaCandidatesChirho.push(
			new TextDecoder()
				.decode(
					Bun.spawnSync(['/usr/libexec/java_home', '-v', '17+'], { stdout: 'pipe', stderr: 'pipe' })
						.stdout
				)
				.trim()
		);
	} catch {
		/* No macOS java_home: only JAVA_HOME can name the JDK. */
	}
	const javaHomeChirho = javaCandidatesChirho.find(
		(homeChirho) => homeChirho && existsChirho(homeChirho) && javaVersionChirho(homeChirho) >= 17
	);
	if (!javaHomeChirho)
		throw new Error('A JDK 17 or newer is required; set JAVA_HOME. No JDK download was started.');
	// Runtime and signing scratch stays on internal storage, whatever TMPDIR the caller had: it may
	// point at the external cache. On this Mac that is /private/tmp on the worktree's own device, as
	// for the Apple build; a clone elsewhere keeps its system location unless it shares the external
	// cache's device. Each run gets its own folder, removed when the run ends.
	const temporaryRootChirho = realpathChirho(
		process.platform === 'darwin' ? '/private/tmp' : systemTemporaryChirho()
	);
	if (
		process.platform === 'darwin' &&
		statChirho(temporaryRootChirho).dev !== statChirho(rootChirho).dev
	)
		throw new Error('Native temporary storage must be on the internal worktree device.');
	if (
		selectionChirho.backend_chirho === 'external_chirho' &&
		statChirho(temporaryRootChirho).dev === identityChirho.dev
	)
		throw new Error('Native temporary storage must not be on the external build cache.');
	const temporaryChirho = temporaryDirectoryChirho(
		joinChirho(temporaryRootChirho, 'radio-gradle-chirho-')
	);
	try {
		const safeEnvironmentChirho: NodeJS.ProcessEnv = {
			...childEnvironmentChirho(selectionChirho.cache_root_chirho, temporaryChirho),
			JAVA_HOME: javaHomeChirho
		};
		delete safeEnvironmentChirho.RADIO_VITE_CACHE_CHIRHO;
		const gradleChirho = candidatesChirho.find((candidateChirho) => {
			// A candidate that does not exist is passed over, never an error.
			try {
				const probeChirho = Bun.spawnSync([candidateChirho, '--version'], {
					env: safeEnvironmentChirho,
					stdout: 'pipe',
					stderr: 'pipe'
				});
				return (
					probeChirho.exitCode === 0 &&
					new TextDecoder().decode(probeChirho.stdout).includes(`Gradle ${gradleVersionChirho}\n`)
				);
			} catch {
				return false;
			}
		});
		if (!gradleChirho)
			throw new Error(
				`Install Gradle ${gradleVersionChirho}; this entry does not download or substitute a toolchain.`
			);
		const sdkChirho = resolveChirho(
			process.env.ANDROID_HOME ?? joinChirho(homeChirho(), 'Library/Android/sdk')
		);
		if (!existsChirho(joinChirho(sdkChirho, 'platforms/android-36')))
			throw new Error('Android API 36 SDK is required; no SDK download was started.');
		for (const commandChirho of [
			['bun', 'scripts-chirho/native-chirho/export_catalogue_chirho.ts', '--check-chirho'],
			[
				'bun',
				'scripts-chirho/native-chirho/android-chirho/export_parity_chirho.ts',
				'--check-chirho'
			],
			[
				'bun',
				'scripts-chirho/native-chirho/prepare_native_sounds_chirho.ts',
				...(argumentsChirho.includes('--require-licensed-chirho')
					? ['--require-licensed-chirho']
					: [])
			]
		]) {
			const preparationChirho = Bun.spawnSync(commandChirho, {
				cwd: rootChirho,
				env: safeEnvironmentChirho,
				stdout: 'inherit',
				stderr: 'inherit'
			});
			if (preparationChirho.exitCode !== 0) throw new Error('Native inputs were not prepared.');
		}
		const environmentChirho = {
			...safeEnvironmentChirho,
			ANDROID_HOME: sdkChirho,
			ANDROID_SDK_ROOT: sdkChirho,
			GRADLE_USER_HOME: childDirectoryChirho('gradle-user-chirho'),
			// Gradle reads <this>/modules-2 as a read-only dependency cache and never writes to it. A
			// clone without one downloads into its own isolated Gradle home instead.
			...(existsChirho(joinChirho(readOnlyCacheChirho, 'modules-2'))
				? { GRADLE_RO_DEP_CACHE: readOnlyCacheChirho }
				: {}),
			RADIO_NATIVE_BUILD_ROOT_CHIRHO: childDirectoryChirho('build-output-chirho')
		};
		const tasksChirho = argumentsChirho.filter(
			(argumentChirho) => argumentChirho !== '--require-licensed-chirho'
		);
		process.exitCode = await runOwnedCommandChirho(
			gradleChirho,
			[
				'--no-daemon',
				'--max-workers=2',
				'--console=plain',
				'--warning-mode=all',
				'--project-cache-dir',
				childDirectoryChirho('project-cache-chirho'),
				...(tasksChirho.length
					? tasksChirho
					: [':app-chirho:testDebugUnitTest', ':app-chirho:lintDebug', ':app-chirho:assembleDebug'])
			],
			environmentChirho,
			checkChirho,
			joinChirho(rootChirho, 'apps-chirho/android-chirho')
		);
	} finally {
		removeChirho(temporaryChirho, { recursive: true, force: true });
	}
}
