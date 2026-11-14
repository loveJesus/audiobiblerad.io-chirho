// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { strict as assertChirho } from 'node:assert';
import { spawn as spawnChirho, spawnSync as spawnSyncChirho } from 'node:child_process';
import {
	chmodSync as chmodSyncChirho,
	existsSync as existsSyncChirho,
	mkdirSync as mkdirSyncChirho,
	mkdtempSync as mkdtempSyncChirho,
	readFileSync as readFileSyncChirho,
	realpathSync as realpathSyncChirho,
	renameSync as renameSyncChirho,
	rmSync as rmSyncChirho,
	writeFileSync as writeFileSyncChirho
} from 'node:fs';
import { tmpdir as tmpdirChirho } from 'node:os';
import { join as joinChirho, resolve as resolveChirho } from 'node:path';
import { checkInternalCapacityChirho, childEnvironmentChirho } from './select_chirho';

// Tiny synthetic controls only; never disconnect or chmod a shared live volume.
const rootChirho = realpathSyncChirho(
	mkdtempSyncChirho(joinChirho(tmpdirChirho(), 'radio-cache-controls-chirho-'))
);
const runnerChirho = resolveChirho('scripts-chirho/build-cache-chirho/run_chirho.ts');
const selectorChirho = joinChirho(rootChirho, 'selector-chirho.js');
const cacheChirho = joinChirho(rootChirho, 'cache-chirho');
const outcomesChirho: Record<string, boolean> = {};
mkdirSyncChirho(cacheChirho);
mkdirSyncChirho(joinChirho(rootChirho, 'node_modules/.bin'), { recursive: true });
writeFileSyncChirho(
	selectorChirho,
	`#!/usr/bin/env node
const cryptoChirho = require('node:crypto');
const fsChirho = require('node:fs');
const argsChirho = process.argv.slice(2);
const worktreeChirho = fsChirho.realpathSync(argsChirho[argsChirho.indexOf('--worktree-chirho') + 1]);
console.log(JSON.stringify({ schema_chirho: 'build-cache-v1-chirho', project_chirho: 'audiobibleradio-chirho', tool_chirho: 'vite-chirho', worktree_key_chirho: cryptoChirho.createHash('sha256').update(worktreeChirho).digest('hex'), backend_chirho: 'external_chirho', cache_root_chirho: ${JSON.stringify(cacheChirho)}, temp_root_chirho: ${JSON.stringify(joinChirho(cacheChirho, 'tmp-chirho'))}, reason_chirho: 'synthetic_control_chirho', available_bytes_chirho: 2147483648 }));
`
);
chmodSyncChirho(selectorChirho, 0o700);
const binaryChirho = joinChirho(rootChirho, 'node_modules/.bin/vitest');
writeFileSyncChirho(
	binaryChirho,
	`#!/usr/bin/env node
const fsChirho = require('node:fs');
fsChirho.writeFileSync('started-chirho.json', JSON.stringify({ pid_chirho: process.pid, secret_present_chirho: Boolean(process.env.FAKE_SECRET_CHIRHO), temp_chirho: process.env.TMPDIR, cache_chirho: process.env.RADIO_VITE_CACHE_CHIRHO }));
if (process.argv.includes('--wait-chirho')) setInterval(() => {}, 500);
else process.exit(process.argv.includes('--fail-chirho') ? 42 : 0);
`
);
chmodSyncChirho(binaryChirho, 0o700);
const environmentChirho = {
	...process.env,
	RADIO_CACHE_SELECTOR_CHIRHO: selectorChirho,
	FAKE_SECRET_CHIRHO: 'fixture'
};
try {
	assertChirho.throws(() => checkInternalCapacityChirho(rootChirho, () => 0));
	outcomesChirho.insufficient_internal_space_refuses_admission_chirho = true;
	const ordinaryChirho = spawnSyncChirho(process.execPath, [runnerChirho, 'unit'], {
		cwd: rootChirho,
		env: environmentChirho,
		encoding: 'utf8',
		timeout: 10000
	});
	assertChirho.equal(ordinaryChirho.status, 0, ordinaryChirho.stderr);
	const startedChirho = JSON.parse(
		readFileSyncChirho(joinChirho(rootChirho, 'started-chirho.json'), 'utf8')
	);
	assertChirho.equal(startedChirho.secret_present_chirho, false);
	assertChirho.ok(startedChirho.cache_chirho.startsWith(cacheChirho));
	assertChirho.ok(startedChirho.temp_chirho.startsWith(cacheChirho));
	assertChirho.equal(existsSyncChirho(startedChirho.temp_chirho), false);
	outcomesChirho.cache_and_temp_reach_child_without_credentials_chirho = true;
	outcomesChirho.completed_job_scratch_is_removed_chirho = true;
	const failedChirho = spawnSyncChirho(process.execPath, [runnerChirho, 'unit', '--fail-chirho'], {
		cwd: rootChirho,
		env: environmentChirho,
		encoding: 'utf8',
		timeout: 10000
	});
	assertChirho.equal(failedChirho.status, 42);
	outcomesChirho.child_failure_propagates_without_retry_chirho = true;
	const portableChirho = spawnSyncChirho(process.execPath, [runnerChirho, 'unit'], {
		cwd: rootChirho,
		env: {
			...environmentChirho,
			RADIO_CACHE_SELECTOR_CHIRHO: joinChirho(rootChirho, 'not-installed-chirho')
		},
		encoding: 'utf8',
		timeout: 10000
	});
	assertChirho.equal(portableChirho.status, 0, portableChirho.stderr);
	assertChirho.ok(portableChirho.stdout.includes('shared_selector_not_installed_chirho'));
	outcomesChirho.portable_clone_without_shared_selector_runs_locally_chirho = true;
	rmSyncChirho(joinChirho(rootChirho, 'started-chirho.json'));
	const activeChirho = spawnChirho(process.execPath, [runnerChirho, 'unit', '--wait-chirho'], {
		cwd: rootChirho,
		env: environmentChirho,
		stdio: 'pipe'
	});
	const exitedChirho = new Promise<number | null>((resolveExitChirho) =>
		activeChirho.once('exit', resolveExitChirho)
	);
	const deadlineChirho = Date.now() + 5000;
	try {
		while (!existsSyncChirho(joinChirho(rootChirho, 'started-chirho.json'))) {
			if (Date.now() > deadlineChirho) throw new Error('Fixture child did not start.');
			await new Promise((resolveWaitChirho) => setTimeout(resolveWaitChirho, 25));
		}
		const childChirho = JSON.parse(
			readFileSyncChirho(joinChirho(rootChirho, 'started-chirho.json'), 'utf8')
		);
		renameSyncChirho(cacheChirho, `${cacheChirho}-unavailable-chirho`);
		const codeChirho = await Promise.race([
			exitedChirho,
			new Promise<never>((_resolveChirho, rejectChirho) =>
				setTimeout(() => rejectChirho(new Error('Lost-cache child did not stop.')), 5000).unref()
			)
		]);
		assertChirho.equal(codeChirho, 1);
		assertChirho.equal(existsSyncChirho(cacheChirho), false);
		assertChirho.throws(() => process.kill(childChirho.pid_chirho, 0));
		outcomesChirho.disappearing_backend_stops_owned_child_chirho = true;
		outcomesChirho.no_mountpoint_recreation_or_automatic_fallback_chirho = true;
	} finally {
		activeChirho.kill('SIGTERM');
	}
	process.env.FAKE_SECRET_CHIRHO = 'fixture';
	try {
		assertChirho.equal(
			childEnvironmentChirho('/cache-chirho', '/temp-chirho').FAKE_SECRET_CHIRHO,
			undefined
		);
	} finally {
		delete process.env.FAKE_SECRET_CHIRHO;
	}
	console.log(
		JSON.stringify({
			synthetic_controls_chirho: outcomesChirho,
			outcomes_chirho: Object.keys(outcomesChirho).length
		})
	);
} finally {
	rmSyncChirho(rootChirho, { recursive: true, force: true });
}
