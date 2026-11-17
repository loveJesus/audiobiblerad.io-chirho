// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

/** Bound a response while reading it, even when Content-Length is absent or incorrect. */
export async function readBoundedBytesChirho(
	responseChirho: Response,
	maximumBytesChirho: number
): Promise<Uint8Array<ArrayBuffer>> {
	if (!responseChirho.ok || !responseChirho.body) {
		await responseChirho.body?.cancel();
		throw new Error('Requested data unavailable');
	}
	if (Number(responseChirho.headers.get('content-length')) > maximumBytesChirho) {
		await responseChirho.body.cancel();
		throw new Error('Requested data too large');
	}
	const readerChirho = responseChirho.body.getReader();
	const chunksChirho: Uint8Array[] = [];
	let lengthChirho = 0;
	try {
		while (true) {
			const chunkChirho = await readerChirho.read();
			if (chunkChirho.done) break;
			lengthChirho += chunkChirho.value.byteLength;
			if (lengthChirho > maximumBytesChirho) {
				await readerChirho.cancel();
				throw new Error('Requested data too large');
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
	return bytesChirho;
}
