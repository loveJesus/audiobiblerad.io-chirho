// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { resolve as resolveChirho } from 'node:path';
import { spawnSync as spawnSyncChirho } from 'node:child_process';
import { readFileSync as readFileChirho, existsSync as existsChirho } from 'node:fs';
import { parseSoundProfileChirho } from '../../src/lib/sounds-chirho/sound_profile_chirho';

// See spec-chirho/workflows-chirho/release_workflow_chirho.md.
// Default is a local package inspection. The owner-authorised publication uses --apply-chirho.
const applyChirho = process.argv.includes('--apply-chirho');
const requireLicensedChirho = process.argv.includes('--require-licensed-chirho');
if (
	process.argv
		.slice(2)
		.some(
			(argumentChirho) => !['--apply-chirho', '--require-licensed-chirho'].includes(argumentChirho)
		)
)
	throw new Error('Unknown release argument');
if (requireLicensedChirho) {
	const profileChirho = parseSoundProfileChirho(
		JSON.parse(readFileChirho('.svelte-kit/cloudflare/sounds-chirho/profile_chirho.json', 'utf8'))
	);
	if (profileChirho?.source_chirho !== 'licensed')
		throw new Error('This release requires the prepared licensed effects');
	for (const clipChirho of [
		...profileChirho.tuning_chirho,
		...profileChirho.click_chirho,
		...profileChirho.knob_chirho
	])
		if (!existsChirho('.svelte-kit/cloudflare' + clipChirho.url_chirho))
			throw new Error('A licensed app effect is absent from the prepared release');
}
const environmentChirho: Record<string, string> = {};
for (const keyChirho of ['PATH', 'HOME', 'TMPDIR', 'LANG', 'LC_ALL', 'TERM', 'CI']) {
	const valueChirho = process.env[keyChirho];
	if (valueChirho) environmentChirho[keyChirho] = valueChirho;
}
if (applyChirho) {
	for (const [destinationChirho, sourceChirho] of [
		['CLOUDFLARE_API_KEY', 'CLOUDFLARE_GLOBAL_API_KEY_CHIRHO'],
		['CLOUDFLARE_EMAIL', 'CLOUDFLARE_GLOBAL_API_EMAIL_CHIRHO'],
		['CLOUDFLARE_ACCOUNT_ID', 'CLOUDFLARE_GLOBAL_API_MAIN_ACCOUNT_ID_CHIRHO']
	]) {
		const valueChirho = process.env[sourceChirho];
		if (!valueChirho) throw new Error(`Missing ${sourceChirho}`);
		environmentChirho[destinationChirho] = valueChirho;
	}
}
environmentChirho.WRANGLER_SEND_METRICS = 'false';
const commandChirho = [
	resolveChirho('node_modules/wrangler/wrangler-dist/cli.js'),
	'deploy',
	'--env-file',
	'./wrangler-bindings-chirho.env',
	'--outdir',
	'.wrangler/web-release-chirho'
];
if (!applyChirho) commandChirho.push('--dry-run');
const childChirho = spawnSyncChirho('node', commandChirho, {
	env: environmentChirho,
	stdio: ['ignore', 'inherit', 'inherit']
});
if (childChirho.error) throw childChirho.error;
process.exit(childChirho.status ?? 1);
