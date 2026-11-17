// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { describe, expect, it, vi } from 'vitest';
import { readBoundedBytesChirho } from './bounded_response_chirho';

describe('bounded downloads', () => {
	it('cancels an oversized body even when the server understates its length', async () => {
		const cancelChirho = vi.fn();
		let readsChirho = 0;
		const bodyChirho = new ReadableStream<Uint8Array>({
			pull(controllerChirho) {
				readsChirho++;
				controllerChirho.enqueue(new Uint8Array(4));
			},
			cancel: cancelChirho
		});
		await expect(
			readBoundedBytesChirho(new Response(bodyChirho, { headers: { 'content-length': '1' } }), 6)
		).rejects.toThrow('too large');
		expect(cancelChirho).toHaveBeenCalledOnce();
		expect(readsChirho).toBeLessThanOrEqual(3);
		expect(bodyChirho.locked).toBe(false);
	});
	it('accepts exactly the limit without relying on a length header', async () => {
		const expectedChirho = new Uint8Array([1, 2, 3, 4]);
		expect(await readBoundedBytesChirho(new Response(expectedChirho), 4)).toEqual(expectedChirho);
	});
	it('rejects an oversized header before reading and propagates a failed stream', async () => {
		const cancelChirho = vi.fn();
		const bodyChirho = new ReadableStream<Uint8Array>({ cancel: cancelChirho });
		await expect(
			readBoundedBytesChirho(new Response(bodyChirho, { headers: { 'content-length': '99' } }), 4)
		).rejects.toThrow('too large');
		expect(cancelChirho).toHaveBeenCalledOnce();
		const failedChirho = new ReadableStream<Uint8Array>({
			start(controllerChirho) {
				controllerChirho.error(new Error('connection ended'));
			}
		});
		await expect(readBoundedBytesChirho(new Response(failedChirho), 4)).rejects.toThrow(
			'connection ended'
		);
		expect(failedChirho.locked).toBe(false);
	});
});
