// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import {
	readdir as readdirChirho,
	readFile as readFileChirho,
	mkdir as mkdirChirho,
	writeFile as writeFileChirho
} from 'node:fs/promises';
import { createHash as createHashChirho } from 'node:crypto';
import { format as formatChirho } from 'prettier';
import { CATALOGUE_CHIRHO } from '../../src/lib/catalogue-chirho/catalogue_chirho';

// See spec-chirho/workflows-chirho/release_workflow_chirho.md.
// Only this project's own assets are fetched: four requests at a time, no source Scripture.
const workersDevChirho = process.argv.includes('--workers-dev-chirho');
const roomReleaseChirho = process.argv.includes('--room-chirho');
const spatialReleaseChirho = process.argv.includes('--spatial-chirho');
const widgetReleaseChirho =
	roomReleaseChirho || spatialReleaseChirho || process.argv.includes('--widget-chirho');
if (
	process.argv
		.slice(2)
		.some(
			(argumentChirho) =>
				!['--workers-dev-chirho', '--widget-chirho', '--spatial-chirho', '--room-chirho'].includes(
					argumentChirho
				)
		)
)
	throw new Error('Unknown hosted-verification argument');
const originChirho = workersDevChirho
	? 'https://audiobiblerad-io-chirho.lovejesus.workers.dev'
	: 'https://audiobiblerad.io';
const rootChirho = '.svelte-kit/cloudflare';
const evidenceChirho = roomReleaseChirho
	? 'spec-chirho/evidence-chirho/listening-room-release-chirho'
	: spatialReleaseChirho
		? 'spec-chirho/evidence-chirho/spatial-radio-chirho'
		: widgetReleaseChirho
			? 'spec-chirho/evidence-chirho/widget-release-chirho'
			: 'spec-chirho/evidence-chirho/web-release-chirho';
async function saveEvidenceChirho(resultChirho: unknown): Promise<void> {
	await mkdirChirho(evidenceChirho, { recursive: true });
	await writeFileChirho(
		`${evidenceChirho}/http_${workersDevChirho ? 'workers_dev' : 'production'}_chirho.json`,
		await formatChirho(JSON.stringify(resultChirho), { parser: 'json', useTabs: true })
	);
}
async function filesChirho(directoryChirho: string): Promise<string[]> {
	const pathsChirho: string[] = [];
	for (const entryChirho of await readdirChirho(directoryChirho, { withFileTypes: true })) {
		const pathChirho = `${directoryChirho}/${entryChirho.name}`;
		if (entryChirho.isDirectory()) pathsChirho.push(...(await filesChirho(pathChirho)));
		else pathsChirho.push(pathChirho);
	}
	return pathsChirho.sort();
}
const pathsChirho = (await filesChirho(rootChirho))
	.map((pathChirho) => pathChirho.slice(rootChirho.length))
	.filter(
		(pathChirho) =>
			!['/.assetsignore', '/_worker.js', '/_headers', '/_routes.json', '/_redirects'].includes(
				pathChirho
			)
	);
const homeResponseChirho = await fetch(`${originChirho}/`, {
	redirect: 'error',
	signal: AbortSignal.timeout(15000)
});
const homeTextChirho = await homeResponseChirho.text();
const homeValidChirho =
	homeResponseChirho.status === 200 &&
	homeTextChirho.includes('Audio Bible Radio') &&
	pathsChirho
		.filter((pathChirho) => pathChirho.startsWith('/_app/immutable/entry/'))
		.every((entryChirho) => homeTextChirho.includes(entryChirho.slice(1)));
if (!homeValidChirho) {
	await saveEvidenceChirho({
		measured_on_chirho: new Date().toISOString(),
		outcome_chirho: 'FAIL',
		origin_chirho: originChirho,
		phase_chirho: 'home_identity_before_asset_sweep',
		status_chirho: homeResponseChirho.status,
		asset_count_chirho: 0,
		detail_chirho:
			'The selected DNS path does not serve this prepared release. Stopped before fetching assets.'
	});
	throw new Error('Hosted identity preflight failed; inspect DNS before the asset sweep');
}
const resultsChirho: Array<{
	path_chirho: string;
	status_chirho: number;
	bytes_chirho: number;
	sha256_chirho: string;
	matches_chirho: boolean;
}> = [];
let cursorChirho = 0;
async function verifyAssetsChirho(): Promise<void> {
	while (cursorChirho < pathsChirho.length) {
		const pathChirho = pathsChirho[cursorChirho++];
		const expectedChirho = await readFileChirho(`${rootChirho}${pathChirho}`);
		const responseChirho = await fetch(`${originChirho}${pathChirho}`, {
			redirect: 'error',
			signal: AbortSignal.timeout(15000)
		});
		const bytesChirho = Buffer.from(await responseChirho.arrayBuffer());
		resultsChirho.push({
			path_chirho: pathChirho,
			status_chirho: responseChirho.status,
			bytes_chirho: bytesChirho.length,
			sha256_chirho: createHashChirho('sha256').update(bytesChirho).digest('hex'),
			matches_chirho: responseChirho.status === 200 && bytesChirho.equals(expectedChirho)
		});
	}
}
await Promise.all(Array.from({ length: 4 }, () => verifyAssetsChirho()));
const routesChirho: Array<{ path_chirho: string; status_chirho: number; valid_chirho: boolean }> = [
	{ path_chirho: '/', status_chirho: homeResponseChirho.status, valid_chirho: homeValidChirho }
];
for (const pathChirho of [
	'/credits-chirho',
	'/catalogue-chirho',
	...(widgetReleaseChirho ? ['/embed-chirho', '/widget-chirho', '/llms.txt'] : []),
	'/_worker.js',
	'/.env',
	'/workspace-chirho/private-chirho/26-11-13-owner-words-chirho.md'
]) {
	const responseChirho = await fetch(`${originChirho}${pathChirho}`, {
		redirect: 'error',
		signal: AbortSignal.timeout(15000)
	});
	const textChirho = await responseChirho.text();
	const publicRouteChirho = [
		'/',
		'/credits-chirho',
		'/catalogue-chirho',
		'/embed-chirho',
		'/widget-chirho',
		'/llms.txt'
	].includes(pathChirho);
	let validChirho = responseChirho.status === (publicRouteChirho ? 200 : 404);
	if (pathChirho === '/catalogue-chirho')
		validChirho &&=
			textChirho === JSON.stringify(CATALOGUE_CHIRHO) &&
			responseChirho.headers.get('content-type')?.includes('application/json') === true &&
			responseChirho.headers.get('access-control-allow-origin') === '*';
	if (pathChirho === '/credits-chirho')
		validChirho &&= textChirho.includes('CC0') && textChirho.includes('Creative Commons');
	if (pathChirho === '/embed-chirho')
		validChirho &&=
			responseChirho.headers.get('content-security-policy')?.includes('frame-ancestors *') ===
				true &&
			!responseChirho.headers.has('x-frame-options') &&
			textChirho.includes('data-radio-widget-chirho');
	if (pathChirho === '/llms.txt')
		validChirho &&=
			responseChirho.headers.get('content-type')?.includes('text/plain') === true &&
			responseChirho.headers.get('access-control-allow-origin') === '*' &&
			textChirho.includes('https://audiobiblerad.io/embed-chirho');
	if (pathChirho === '/widget-chirho')
		validChirho &&= textChirho.includes('https://audiobiblerad.io/llms.txt');
	routesChirho.push({
		path_chirho: pathChirho,
		status_chirho: responseChirho.status,
		valid_chirho: validChirho
	});
}
const failuresChirho = resultsChirho.filter((entryChirho) => !entryChirho.matches_chirho);
const outcomeChirho =
	failuresChirho.length === 0 && routesChirho.every((entryChirho) => entryChirho.valid_chirho)
		? 'PASS'
		: 'FAIL';
const resultChirho = {
	measured_on_chirho: new Date().toISOString(),
	outcome_chirho: outcomeChirho,
	origin_chirho: originChirho,
	scope_chirho:
		'Byte comparison of every deployable prepared asset against HTTPS with normal certificate validation, plus home/credits/catalogue headers and private-path negatives. Four requests at a time. No Scripture host requested.',
	asset_count_chirho: resultsChirho.length,
	asset_bytes_chirho: resultsChirho.reduce(
		(sumChirho, entryChirho) => sumChirho + entryChirho.bytes_chirho,
		0
	),
	asset_mismatch_count_chirho: failuresChirho.length,
	routes_chirho: routesChirho,
	assets_chirho: resultsChirho
		.sort((leftChirho, rightChirho) =>
			leftChirho.path_chirho.localeCompare(rightChirho.path_chirho)
		)
		.map(
			(entryChirho) =>
				`${entryChirho.path_chirho}\t${entryChirho.status_chirho}\t${entryChirho.bytes_chirho}\t${entryChirho.sha256_chirho}\t${entryChirho.matches_chirho}`
		)
};
await saveEvidenceChirho(resultChirho);
console.log(JSON.stringify({ ...resultChirho, assets_chirho: undefined }));
if (outcomeChirho !== 'PASS')
	throw new Error('Hosted asset or route verification failed; inspect the saved evidence');
