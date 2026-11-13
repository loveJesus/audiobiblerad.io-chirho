// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

const MAX_TIMING_BYTES_CHIRHO = 64_000;

// Optional data in spec-chirho/workflows-chirho/tune_in_workflow_chirho.md.
// A malfunctioning source must not turn a small optional timing lookup into an unbounded download.
export async function readBoundedTimingsChirho(responseChirho: Response): Promise<unknown> {
	if (!responseChirho.ok || !responseChirho.body) throw new Error('Timings unavailable');
	if (Number(responseChirho.headers.get('content-length')) > MAX_TIMING_BYTES_CHIRHO) {
		await responseChirho.body.cancel();
		throw new Error('Timings too large');
	}
	const readerChirho = responseChirho.body.getReader();
	const decoderChirho = new TextDecoder();
	const chunksChirho: string[] = [];
	let bytesChirho = 0;
	try {
		while (true) {
			const chunkChirho = await readerChirho.read();
			if (chunkChirho.done) break;
			bytesChirho += chunkChirho.value.byteLength;
			if (bytesChirho > MAX_TIMING_BYTES_CHIRHO) {
				await readerChirho.cancel();
				throw new Error('Timings too large');
			}
			chunksChirho.push(decoderChirho.decode(chunkChirho.value, { stream: true }));
		}
		chunksChirho.push(decoderChirho.decode());
		return JSON.parse(chunksChirho.join(''));
	} finally {
		readerChirho.releaseLock();
	}
}
