// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import {
	STATIONS_CHIRHO,
	findStationChirho,
	fetchingReaderChirho,
	loadLanguageListChirho,
	loadLanguageStationsChirho,
	type CatalogueReaderChirho,
	type LanguageEntryChirho,
	type StationChirho
} from '$lib/catalogue-chirho/catalogue_chirho';

const MAX_CATALOGUE_BYTES_CHIRHO = 128_000;
const REQUEST_TIMEOUT_MS_CHIRHO = 8_000;
const MAX_CACHED_LANGUAGES_CHIRHO = 3;

class MissingLanguageFileChirho extends Error {}

export function mergeLanguagesChirho(
	remoteChirho: readonly LanguageEntryChirho[]
): readonly LanguageEntryChirho[] {
	const entriesChirho = new Map(
		remoteChirho.map((entryChirho) => [entryChirho.code_chirho, entryChirho])
	);
	for (const stationChirho of STATIONS_CHIRHO) {
		const priorChirho = entriesChirho.get(stationChirho.language_code_chirho);
		entriesChirho.set(stationChirho.language_code_chirho, {
			code_chirho: stationChirho.language_code_chirho,
			name_chirho: stationChirho.language_name_chirho,
			english_chirho: stationChirho.language_english_chirho,
			station_count_chirho: (priorChirho?.station_count_chirho ?? 0) + 1,
			has_whole_bible_chirho: Boolean(
				priorChirho?.has_whole_bible_chirho || stationChirho.chapter_count_chirho === 1189
			)
		});
	}
	return [...entriesChirho.values()].sort((leftChirho, rightChirho) =>
		leftChirho.english_chirho.localeCompare(rightChirho.english_chirho)
	);
}

export function stationsInLanguageChirho(
	codeChirho: string,
	remoteChirho: readonly StationChirho[]
): readonly StationChirho[] {
	const stationsChirho = new Map(
		STATIONS_CHIRHO.filter(
			(stationChirho) => stationChirho.language_code_chirho === codeChirho
		).map((stationChirho) => [stationChirho.id_chirho, stationChirho])
	);
	for (const stationChirho of remoteChirho) {
		if (
			stationChirho.language_code_chirho === codeChirho &&
			!findStationChirho(stationChirho.id_chirho) &&
			!stationsChirho.has(stationChirho.id_chirho)
		)
			stationsChirho.set(stationChirho.id_chirho, stationChirho);
	}
	return [...stationsChirho.values()];
}

// Bounded reads and cancellation follow spec-chirho/workflows-chirho/language_workflow_chirho.md.
async function boundedResponseChirho(responseChirho: Response): Promise<Response> {
	if (!responseChirho.ok || !responseChirho.body) {
		await responseChirho.body?.cancel();
		throw new Error('Language data unavailable');
	}
	if (Number(responseChirho.headers.get('content-length')) > MAX_CATALOGUE_BYTES_CHIRHO) {
		await responseChirho.body.cancel();
		throw new Error('Language data too large');
	}
	const readerChirho = responseChirho.body.getReader();
	const chunksChirho: Uint8Array[] = [];
	let lengthChirho = 0;
	try {
		while (true) {
			const chunkChirho = await readerChirho.read();
			if (chunkChirho.done) break;
			lengthChirho += chunkChirho.value.byteLength;
			if (lengthChirho > MAX_CATALOGUE_BYTES_CHIRHO) {
				await readerChirho.cancel();
				throw new Error('Language data too large');
			}
			chunksChirho.push(chunkChirho.value);
		}
	} finally {
		readerChirho.releaseLock();
	}
	const bytesChirho = new Uint8Array(lengthChirho);
	let offsetChirho = 0;
	for (const chunkChirho of chunksChirho) {
		bytesChirho.set(chunkChirho, offsetChirho);
		offsetChirho += chunkChirho.byteLength;
	}
	return new Response(bytesChirho);
}

/** One index, one active selection, and at most three cached language files. Never reads audio. */
export class LanguageLibraryChirho {
	private readonly cacheChirho = new Map<string, readonly StationChirho[]>();
	private listChirho: readonly LanguageEntryChirho[] | undefined;
	private remoteCodesChirho: ReadonlySet<string> | undefined;
	private listRequestChirho: Promise<readonly LanguageEntryChirho[]> | undefined;
	private listControllerChirho: AbortController | undefined;
	private selectionControllerChirho: AbortController | undefined;
	private disposedChirho = false;

	constructor(private readonly fetchChirho: typeof fetch = fetch) {}

	private async readChirho<ValueChirho>(
		controllerChirho: AbortController,
		loadChirho: (readerChirho: CatalogueReaderChirho) => Promise<ValueChirho>
	): Promise<ValueChirho> {
		if (this.disposedChirho) throw new Error('Language library closed');
		const timeoutChirho = setTimeout(() => controllerChirho.abort(), REQUEST_TIMEOUT_MS_CHIRHO);
		try {
			// Native browser fetch must not receive this library instance as its receiver.
			const fetchChirho = this.fetchChirho;
			const valueChirho = await loadChirho(
				fetchingReaderChirho(async (inputChirho, initChirho) => {
					const responseChirho = await fetchChirho(inputChirho, {
						...initChirho,
						signal: controllerChirho.signal,
						referrerPolicy: 'no-referrer'
					});
					if (responseChirho.status === 404) {
						await responseChirho.body?.cancel();
						throw new MissingLanguageFileChirho('No additional language file');
					}
					return boundedResponseChirho(responseChirho);
				})
			);
			if (controllerChirho.signal.aborted || this.disposedChirho)
				throw new Error('Language request cancelled');
			return valueChirho;
		} finally {
			clearTimeout(timeoutChirho);
		}
	}

	loadListChirho(): Promise<readonly LanguageEntryChirho[]> {
		if (this.listChirho) return Promise.resolve(this.listChirho);
		if (this.listRequestChirho) return this.listRequestChirho;
		this.listControllerChirho = new AbortController();
		this.listRequestChirho = this.readChirho(this.listControllerChirho, loadLanguageListChirho)
			.then((entriesChirho) => {
				if (entriesChirho.length === 0) throw new Error('No languages returned');
				this.remoteCodesChirho = new Set(
					entriesChirho.map((entryChirho) => entryChirho.code_chirho)
				);
				this.listChirho = mergeLanguagesChirho(entriesChirho.slice(0, 1000));
				return this.listChirho;
			})
			.finally(() => {
				this.listRequestChirho = undefined;
			});
		return this.listRequestChirho;
	}

	async loadStationsChirho(codeChirho: string): Promise<readonly StationChirho[]> {
		this.cancelSelectionChirho();
		if (this.remoteCodesChirho && !this.remoteCodesChirho.has(codeChirho)) {
			const builtInsChirho = stationsInLanguageChirho(codeChirho, []);
			if (builtInsChirho.length === 0) throw new Error('No recordings returned');
			return builtInsChirho;
		}
		const cachedChirho = this.cacheChirho.get(codeChirho);
		if (cachedChirho) {
			this.cacheChirho.delete(codeChirho);
			this.cacheChirho.set(codeChirho, cachedChirho);
			return cachedChirho;
		}
		const controllerChirho = new AbortController();
		this.selectionControllerChirho = controllerChirho;
		let remoteChirho: readonly StationChirho[];
		try {
			remoteChirho = await this.readChirho(controllerChirho, (readerChirho) =>
				loadLanguageStationsChirho(codeChirho, readerChirho)
			);
		} catch (errorChirho) {
			if (!(errorChirho instanceof MissingLanguageFileChirho) || controllerChirho.signal.aborted)
				throw errorChirho;
			remoteChirho = [];
		}
		const stationsChirho = stationsInLanguageChirho(codeChirho, remoteChirho);
		if (stationsChirho.length === 0) throw new Error('No recordings returned');
		if (this.cacheChirho.size >= MAX_CACHED_LANGUAGES_CHIRHO)
			this.cacheChirho.delete(this.cacheChirho.keys().next().value!);
		this.cacheChirho.set(codeChirho, stationsChirho);
		return stationsChirho;
	}

	cancelSelectionChirho(): void {
		this.selectionControllerChirho?.abort();
		this.selectionControllerChirho = undefined;
	}

	disposeChirho(): void {
		this.disposedChirho = true;
		this.cancelSelectionChirho();
		this.listControllerChirho?.abort();
		this.cacheChirho.clear();
	}
}
