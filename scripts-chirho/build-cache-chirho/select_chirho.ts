// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { spawnSync as spawnSyncChirho } from 'node:child_process';
import { createHash as createHashChirho } from 'node:crypto';
import {
	existsSync as existsSyncChirho,
	mkdirSync as mkdirSyncChirho,
	realpathSync as realpathSyncChirho,
	statfsSync as statfsSyncChirho
} from 'node:fs';
import { homedir as homedirChirho, tmpdir as tmpdirChirho } from 'node:os';
import { isAbsolute as isAbsoluteChirho, join as joinChirho } from 'node:path';

// Selection and lifecycle: spec-chirho/workflows-chirho/build_cache_workflow_chirho.md.
export const PROJECT_CHIRHO = 'audiobibleradio-chirho';
export const MINIMUM_FREE_BYTES_CHIRHO = 512 * 1024 * 1024;
export const INTERNAL_FREE_BYTES_CHIRHO = 1024 * 1024 * 1024;

function availableBytesChirho(pathChirho: string): number {
	const capacityChirho = statfsSyncChirho(pathChirho);
	return capacityChirho.bavail * capacityChirho.bsize;
}

export function checkInternalCapacityChirho(
	worktreeChirho: string,
	readCapacityChirho: (pathChirho: string) => number = availableBytesChirho
): void {
	if (readCapacityChirho(worktreeChirho) < INTERNAL_FREE_BYTES_CHIRHO)
		throw new Error('Internal free space is below the web build floor; no job started or retried.');
}

export interface CacheSelectionChirho {
	backend_chirho: 'external_chirho' | 'local_chirho';
	cache_root_chirho: string;
	temp_root_chirho: string;
	reason_chirho: string;
	available_bytes_chirho: number;
}

export function selectCacheChirho(
	worktreeChirho: string,
	toolChirho = 'vite-chirho'
): CacheSelectionChirho {
	if (!/^[a-z0-9-]+-chirho$/.test(toolChirho)) throw new Error('Invalid build-cache profile.');
	const canonicalChirho = realpathSyncChirho(worktreeChirho);
	checkInternalCapacityChirho(canonicalChirho);
	const keyChirho = createHashChirho('sha256').update(canonicalChirho).digest('hex');
	const selectorChirho =
		process.env.RADIO_CACHE_SELECTOR_CHIRHO ??
		joinChirho(homedirChirho(), 'bin-chirho/build-cache-chirho');
	if (!isAbsoluteChirho(selectorChirho)) throw new Error('Cache selector must be absolute.');
	if (!existsSyncChirho(selectorChirho)) {
		// Portable clones/CI without the fleet selector use an isolated cache in this worktree.
		const capacityChirho = statfsSyncChirho(canonicalChirho);
		const availableChirho = capacityChirho.bavail * capacityChirho.bsize;
		if (availableChirho < MINIMUM_FREE_BYTES_CHIRHO)
			throw new Error('Insufficient local space for the web cache.');
		const rootChirho = joinChirho(
			canonicalChirho,
			'node_modules/.cache-chirho/build-chirho',
			...(toolChirho === 'vite-chirho' ? [] : [toolChirho])
		);
		mkdirSyncChirho(rootChirho, { recursive: true });
		if (realpathSyncChirho(rootChirho) !== rootChirho)
			throw new Error('Local cache must not redirect through a symlink.');
		return {
			backend_chirho: 'local_chirho',
			cache_root_chirho: rootChirho,
			temp_root_chirho: joinChirho(rootChirho, 'tmp-chirho'),
			reason_chirho: 'shared_selector_not_installed_chirho',
			available_bytes_chirho: availableChirho
		};
	}
	const responseChirho = spawnSyncChirho(
		selectorChirho,
		[
			'--project-chirho',
			PROJECT_CHIRHO,
			'--worktree-chirho',
			canonicalChirho,
			'--tool-chirho',
			toolChirho,
			'--min-free-bytes-chirho',
			String(MINIMUM_FREE_BYTES_CHIRHO)
		],
		{
			encoding: 'utf8',
			timeout: 10_000,
			maxBuffer: 65_536,
			env: { PATH: process.env.PATH, HOME: homedirChirho(), LC_ALL: 'C', TMPDIR: tmpdirChirho() }
		}
	);
	if (responseChirho.status !== 0) throw new Error('No safe suitable build cache was selected.');
	const valueChirho: unknown = JSON.parse(responseChirho.stdout);
	if (!valueChirho || typeof valueChirho !== 'object') throw new Error('Invalid cache selection.');
	const recordChirho = valueChirho as Record<string, unknown>;
	const rootChirho = recordChirho.cache_root_chirho;
	const tempChirho = recordChirho.temp_root_chirho;
	if (
		recordChirho.schema_chirho !== 'build-cache-v1-chirho' ||
		recordChirho.project_chirho !== PROJECT_CHIRHO ||
		recordChirho.tool_chirho !== toolChirho ||
		recordChirho.worktree_key_chirho !== keyChirho ||
		!['external_chirho', 'local_chirho'].includes(String(recordChirho.backend_chirho)) ||
		typeof rootChirho !== 'string' ||
		!isAbsoluteChirho(rootChirho) ||
		tempChirho !== joinChirho(rootChirho, 'tmp-chirho') ||
		typeof recordChirho.reason_chirho !== 'string' ||
		typeof recordChirho.available_bytes_chirho !== 'number' ||
		recordChirho.available_bytes_chirho < MINIMUM_FREE_BYTES_CHIRHO ||
		realpathSyncChirho(rootChirho) !== rootChirho
	)
		throw new Error('Cache selection does not belong to this worktree/profile.');
	return recordChirho as unknown as CacheSelectionChirho;
}

export function childEnvironmentChirho(cacheChirho: string, tempChirho: string): NodeJS.ProcessEnv {
	// Compiler/browser scratch on the unencrypted drive must not inherit provider credentials.
	const environmentChirho: NodeJS.ProcessEnv = {};
	const allowedChirho = new Set([
		'PATH',
		'HOME',
		'SHELL',
		'USER',
		'LOGNAME',
		'LANG',
		'TERM',
		'COLORTERM',
		'NO_COLOR',
		'FORCE_COLOR',
		'CI',
		'NODE_ENV',
		'TZ',
		'PLAYWRIGHT_BROWSERS_PATH',
		'PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD',
		'SSL_CERT_FILE',
		'SSL_CERT_DIR',
		'NODE_EXTRA_CA_CERTS'
	]);
	for (const [keyChirho, valueChirho] of Object.entries(process.env)) {
		if (allowedChirho.has(keyChirho) || /^(LC_|PUBLIC_|VITE_)/.test(keyChirho))
			environmentChirho[keyChirho] = valueChirho;
	}
	return {
		...environmentChirho,
		RADIO_VITE_CACHE_CHIRHO: cacheChirho,
		TMPDIR: tempChirho,
		TMP: tempChirho,
		TEMP: tempChirho
	};
}
