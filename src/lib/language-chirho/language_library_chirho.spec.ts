// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { STATIONS_CHIRHO, resolveChapterChirho } from '$lib/catalogue-chirho/catalogue_chirho';
import {
	LanguageLibraryChirho,
	mergeLanguagesChirho,
	stationsInLanguageChirho
} from './language_library_chirho';

const librariesChirho: LanguageLibraryChirho[] = [];
function fixtureChirho() {
	const fetchChirho = vi.fn<typeof fetch>(
		async (inputChirho) => new Response(readFileSync(`static${String(inputChirho)}`))
	);
	const libraryChirho = new LanguageLibraryChirho(fetchChirho);
	librariesChirho.push(libraryChirho);
	return { library_chirho: libraryChirho, fetch_chirho: fetchChirho };
}
afterEach(() => {
	for (const libraryChirho of librariesChirho.splice(0)) libraryChirho.disposeChirho();
	vi.useRealTimers();
});

describe('on-demand language catalogue', () => {
	it('cancels an unsuccessful HTTP response without downloading its error body', async () => {
		const fixtureValueChirho = fixtureChirho();
		let cancelledChirho = false;
		fixtureValueChirho.fetch_chirho.mockResolvedValueOnce(
			new Response(
				new ReadableStream({
					cancel() {
						cancelledChirho = true;
					}
				}),
				{ status: 503 }
			)
		);
		await expect(fixtureValueChirho.library_chirho.loadStationsChirho('hi')).rejects.toThrow(
			'unavailable'
		);
		expect(cancelledChirho).toBe(true);
	});
	it('restores built-in-only languages without needing the language index, while retaining real failures', async () => {
		const fixtureValueChirho = fixtureChirho();
		fixtureValueChirho.fetch_chirho.mockResolvedValueOnce(new Response('No file', { status: 404 }));
		const spanishChirho = await fixtureValueChirho.library_chirho.loadStationsChirho('es');
		expect(spanishChirho.length).toBeGreaterThan(0);
		expect(
			spanishChirho.every((stationChirho) => stationChirho.language_code_chirho === 'es')
		).toBe(true);
		fixtureValueChirho.fetch_chirho.mockResolvedValueOnce(
			new Response('Unavailable', { status: 503 })
		);
		await expect(fixtureValueChirho.library_chirho.loadStationsChirho('de')).rejects.toThrow(
			'unavailable'
		);
		fixtureValueChirho.fetch_chirho.mockResolvedValueOnce(new Response('No file', { status: 404 }));
		await expect(fixtureValueChirho.library_chirho.loadStationsChirho('zz')).rejects.toThrow(
			'No recordings'
		);
	});
	it('starts without a request and merges languages and recordings without duplicate codes', async () => {
		const fixtureValueChirho = fixtureChirho();
		expect(fixtureValueChirho.fetch_chirho).not.toHaveBeenCalled();
		const languagesChirho = await fixtureValueChirho.library_chirho.loadListChirho();
		expect(new Set(languagesChirho.map((entryChirho) => entryChirho.code_chirho)).size).toBe(
			languagesChirho.length
		);
		const hindiChirho = languagesChirho.find((entryChirho) => entryChirho.code_chirho === 'hi')!;
		const stationsChirho = await fixtureValueChirho.library_chirho.loadStationsChirho('hi');
		expect(hindiChirho.station_count_chirho).toBe(stationsChirho.length);
		expect(stationsChirho.some((stationChirho) => stationChirho.source_id_chirho === 'davar')).toBe(
			true
		);
		expect(stationsChirho.some((stationChirho) => stationChirho.source_id_chirho !== 'davar')).toBe(
			true
		);
		for (const stationChirho of stationsChirho) {
			expect(stationChirho.credit_chirho.length).toBeGreaterThan(0);
			expect(resolveChapterChirho(stationChirho, 'GEN', 1)).not.toBeNull();
		}
		expect(
			fixtureValueChirho.fetch_chirho.mock.calls.every(([inputChirho]) =>
				String(inputChirho).startsWith('/catalogue-chirho/')
			)
		).toBe(true);
	});

	it('does not let a loaded recording impersonate a built-in station', () => {
		const builtInChirho = STATIONS_CHIRHO[0];
		expect(
			stationsInLanguageChirho('zz', [{ ...builtInChirho, language_code_chirho: 'zz' }])
		).toEqual([]);
		expect(mergeLanguagesChirho([]).length).toBeGreaterThan(0);
	});

	it('keeps only three language files and refetches an evicted language', async () => {
		const fixtureValueChirho = fixtureChirho();
		for (const codeChirho of ['hi', 'sw', 'fa', 'ru'])
			await fixtureValueChirho.library_chirho.loadStationsChirho(codeChirho);
		await fixtureValueChirho.library_chirho.loadStationsChirho('ru');
		expect(fixtureValueChirho.fetch_chirho).toHaveBeenCalledTimes(4);
		await fixtureValueChirho.library_chirho.loadStationsChirho('hi');
		expect(fixtureValueChirho.fetch_chirho).toHaveBeenCalledTimes(5);
	});

	it('cancels a superseded selection and rejects even if its fetcher ignores abort', async () => {
		const fixtureValueChirho = fixtureChirho();
		let finishChirho!: (responseChirho: Response) => void;
		let signalChirho: AbortSignal | null | undefined;
		fixtureValueChirho.fetch_chirho.mockImplementationOnce((_inputChirho, initChirho) => {
			signalChirho = initChirho?.signal;
			return new Promise((resolveChirho) => {
				finishChirho = resolveChirho;
			});
		});
		const firstChirho = fixtureValueChirho.library_chirho.loadStationsChirho('hi');
		const failedChirho = expect(firstChirho).rejects.toThrow('cancelled');
		await fixtureValueChirho.library_chirho.loadStationsChirho('sw');
		expect(signalChirho?.aborted).toBe(true);
		finishChirho(new Response(readFileSync('static/catalogue-chirho/languages-chirho/h/hi.json')));
		await failedChirho;
		await fixtureValueChirho.library_chirho.loadStationsChirho('hi');
		expect(fixtureValueChirho.fetch_chirho).toHaveBeenCalledTimes(3);
	});

	it('does not cache a failed read and allows retry', async () => {
		const fixtureValueChirho = fixtureChirho();
		fixtureValueChirho.fetch_chirho.mockRejectedValueOnce(new TypeError('offline'));
		await expect(fixtureValueChirho.library_chirho.loadStationsChirho('hi')).rejects.toThrow(
			'offline'
		);
		expect(
			(await fixtureValueChirho.library_chirho.loadStationsChirho('hi')).length
		).toBeGreaterThan(0);
	});

	it.each([true, false])(
		'caps bytes before JSON parsing, including unadvertised streaming bodies (%s)',
		async (advertisedChirho) => {
			const fixtureValueChirho = fixtureChirho();
			let cancelledChirho = false;
			const streamChirho = new ReadableStream<Uint8Array>({
				pull(controllerChirho) {
					controllerChirho.enqueue(new Uint8Array(65_000));
				},
				cancel() {
					cancelledChirho = true;
				}
			});
			fixtureValueChirho.fetch_chirho.mockResolvedValueOnce(
				new Response(streamChirho, {
					headers: advertisedChirho ? { 'content-length': '999999' } : {}
				})
			);
			await expect(fixtureValueChirho.library_chirho.loadListChirho()).rejects.toThrow('too large');
			expect(cancelledChirho).toBe(true);
		}
	);

	it('aborts a request that does not finish within eight seconds', async () => {
		vi.useFakeTimers();
		const fixtureValueChirho = fixtureChirho();
		fixtureValueChirho.fetch_chirho.mockImplementationOnce(
			(_inputChirho, initChirho) =>
				new Promise((_resolveChirho, rejectChirho) => {
					initChirho?.signal?.addEventListener('abort', () => rejectChirho(new Error('aborted')));
				})
		);
		const rejectionChirho = expect(
			fixtureValueChirho.library_chirho.loadListChirho()
		).rejects.toThrow('aborted');
		await vi.advanceTimersByTimeAsync(8000);
		await rejectionChirho;
	});
});
