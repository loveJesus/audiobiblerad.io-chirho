// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Asking a host whether a file is there, politely: few requests at a time, a pause between
// them, a plain client name, and patience with a host that is briefly unwell.
// Part of spec-chirho/workflows-chirho/catalogue_workflow_chirho.md.

/** A plain name. It says what the client does and nothing about who runs it. */
const CLIENT_NAME_CHIRHO = 'catalogue-availability-check/0.1';
const REQUEST_TIMEOUT_MS_CHIRHO = 30_000;
const RETRY_WAITS_MS_CHIRHO = [1_000, 4_000, 12_000];
/** Smaller than any spoken chapter; larger than an error page served with a 200. */
const SMALLEST_AUDIO_BYTES_CHIRHO = 4_096;

export type ProbeVerdictChirho = 'present' | 'absent' | 'unverified';

export interface ProbeResultChirho {
	readonly verdict_chirho: ProbeVerdictChirho;
	/** The HTTP status, or 0 when the request never got an answer. */
	readonly status_chirho: number;
	readonly bytes_chirho: number;
	readonly note_chirho: string;
}

export function sleepChirho(millisecondsChirho: number): Promise<void> {
	return new Promise((resolveChirho) => setTimeout(resolveChirho, millisecondsChirho));
}

function shouldRetryChirho(statusChirho: number): boolean {
	return statusChirho === 0 || statusChirho === 429 || statusChirho >= 500;
}

/** One request with retries. Returns the last response, or nothing when none ever arrived. */
export async function requestChirho(
	urlChirho: string,
	methodChirho: 'HEAD' | 'GET'
): Promise<Response | null> {
	for (let attemptChirho = 0; ; attemptChirho += 1) {
		let responseChirho: Response | null;
		try {
			responseChirho = await fetch(urlChirho, {
				method: methodChirho,
				headers: { 'user-agent': CLIENT_NAME_CHIRHO },
				redirect: 'follow',
				signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS_CHIRHO)
			});
		} catch {
			responseChirho = null;
		}
		const waitChirho = RETRY_WAITS_MS_CHIRHO[attemptChirho];
		if (!shouldRetryChirho(responseChirho?.status ?? 0) || waitChirho === undefined) {
			return responseChirho;
		}
		await responseChirho?.body?.cancel();
		await sleepChirho(waitChirho);
	}
}

/**
 * Is there audio at this address? Asks for the headers only.
 *
 * - present: 200, an audio content type, and a believable size.
 * - absent: 404, or 403 (a storage bucket answers 403 for a file it does not have).
 * - unverified: anything else. The caller must not treat this as absent.
 */
export async function probeAudioChirho(urlChirho: string): Promise<ProbeResultChirho> {
	const responseChirho = await requestChirho(urlChirho, 'HEAD');
	if (!responseChirho) {
		return {
			verdict_chirho: 'unverified',
			status_chirho: 0,
			bytes_chirho: 0,
			note_chirho: 'no answer'
		};
	}
	const statusChirho = responseChirho.status;
	const typeChirho = responseChirho.headers.get('content-type') ?? '';
	const bytesChirho = Number(responseChirho.headers.get('content-length') ?? '0');

	if (statusChirho === 404 || statusChirho === 403) {
		return {
			verdict_chirho: 'absent',
			status_chirho: statusChirho,
			bytes_chirho: 0,
			note_chirho: ''
		};
	}
	if (statusChirho !== 200) {
		return {
			verdict_chirho: 'unverified',
			status_chirho: statusChirho,
			bytes_chirho: 0,
			note_chirho: `status ${statusChirho}`
		};
	}
	if (!typeChirho.startsWith('audio/') || !(bytesChirho >= SMALLEST_AUDIO_BYTES_CHIRHO)) {
		return {
			verdict_chirho: 'unverified',
			status_chirho: statusChirho,
			bytes_chirho: bytesChirho,
			note_chirho: `200 but type "${typeChirho}" and ${bytesChirho} bytes`
		};
	}
	return {
		verdict_chirho: 'present',
		status_chirho: statusChirho,
		bytes_chirho: bytesChirho,
		note_chirho: ''
	};
}

/**
 * Run a task for every item, a few at a time, pausing after each so a host is never flooded.
 * Results come back in the order of the items.
 */
export async function mapPolitelyChirho<ItemChirho, ResultChirho>(
	itemsChirho: readonly ItemChirho[],
	workersChirho: number,
	pauseMsChirho: number,
	taskChirho: (itemChirho: ItemChirho) => Promise<ResultChirho>,
	onProgressChirho?: (doneChirho: number) => void
): Promise<ResultChirho[]> {
	const resultsChirho = new Array<ResultChirho>(itemsChirho.length);
	let nextIndexChirho = 0;
	let doneChirho = 0;
	async function workChirho(): Promise<void> {
		while (nextIndexChirho < itemsChirho.length) {
			const indexChirho = nextIndexChirho;
			nextIndexChirho += 1;
			resultsChirho[indexChirho] = await taskChirho(itemsChirho[indexChirho]);
			doneChirho += 1;
			onProgressChirho?.(doneChirho);
			await sleepChirho(pauseMsChirho);
		}
	}
	await Promise.all(Array.from({ length: Math.max(1, workersChirho) }, () => workChirho()));
	return resultsChirho;
}

/** The file names a plain folder listing links to. Sub-folders and sort links are left out. */
export async function readListingNamesChirho(folderUrlChirho: string): Promise<Set<string> | null> {
	const responseChirho = await requestChirho(folderUrlChirho, 'GET');
	if (!responseChirho || responseChirho.status !== 200) return null;
	const htmlChirho = await responseChirho.text();
	const namesChirho = new Set<string>();
	for (const matchChirho of htmlChirho.matchAll(/<a\s+href="([^"?#/][^"?#/]*)"/gi)) {
		namesChirho.add(decodeURIComponent(matchChirho[1]));
	}
	return namesChirho;
}
