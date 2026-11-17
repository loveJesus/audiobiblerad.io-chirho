// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { resolve as resolveChirho } from 'node:path';
import { existsSync as existsChirho, lstatSync as lstatChirho } from 'node:fs';

// Enumerate source before invoking formatters, so private evidence and build caches are never walked.
// See spec-chirho/workflows-chirho/release_workflow_chirho.md.
const listingChirho = Bun.spawnSync(['git', 'ls-files', '-co', '--exclude-standard', '-z']);
if (listingChirho.exitCode !== 0) throw new Error('Cannot enumerate project source for lint.');
const filesChirho = [
	...new Set(listingChirho.stdout.toString().split('\0').filter(Boolean))
].filter((fileChirho) => existsChirho(fileChirho) && lstatChirho(fileChirho).isFile());
if (filesChirho.length === 0) throw new Error('No project source was found for lint.');

for (const [toolChirho, argumentsChirho] of [
	['prettier', ['--check', '--ignore-unknown', ...filesChirho]],
	[
		'eslint',
		[
			'--no-warn-ignored',
			...filesChirho.filter((fileChirho) => /\.(?:[cm]?[jt]s|svelte)$/.test(fileChirho))
		]
	]
] as const) {
	const childChirho = Bun.spawn(
		[resolveChirho('node_modules/.bin', toolChirho), ...argumentsChirho],
		{ stdin: 'ignore', stdout: 'inherit', stderr: 'inherit' }
	);
	const statusChirho = await childChirho.exited;
	if (statusChirho !== 0) process.exit(statusChirho);
}
