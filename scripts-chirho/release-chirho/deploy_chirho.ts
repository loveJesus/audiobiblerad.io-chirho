// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { resolve as resolveChirho } from 'node:path';
import { spawnSync as spawnSyncChirho } from 'node:child_process';

// See spec-chirho/workflows-chirho/release_workflow_chirho.md.
// Default is a local package inspection. The owner-authorised publication uses --apply-chirho.
const applyChirho = process.argv.includes('--apply-chirho');
if (process.argv.slice(2).some((argumentChirho) => argumentChirho !== '--apply-chirho'))
	throw new Error('Unknown release argument');
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
