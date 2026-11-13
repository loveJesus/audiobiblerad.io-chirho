// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

export interface PositionChirho {
	seconds_chirho: number;
	duration_chirho: number;
	verse_chirho: number | null;
	verse_fraction_chirho: number;
}

export function capturePositionChirho(
	secondsChirho: number,
	durationChirho: number,
	timingsChirho: readonly number[] | null
): PositionChirho {
	const safeSecondsChirho = Number.isFinite(secondsChirho) ? Math.max(0, secondsChirho) : 0;
	const safeDurationChirho = Number.isFinite(durationChirho) ? Math.max(0, durationChirho) : 0;
	let verseIndexChirho = -1;
	if (timingsChirho) {
		for (let indexChirho = 0; indexChirho < timingsChirho.length; indexChirho += 1) {
			if (timingsChirho[indexChirho] > safeSecondsChirho) break;
			verseIndexChirho = indexChirho;
		}
	}
	const startChirho = verseIndexChirho >= 0 ? timingsChirho![verseIndexChirho] : 0;
	const endChirho =
		verseIndexChirho >= 0 ? (timingsChirho![verseIndexChirho + 1] ?? safeDurationChirho) : 0;
	return {
		seconds_chirho: safeSecondsChirho,
		duration_chirho: safeDurationChirho,
		verse_chirho: verseIndexChirho >= 0 ? verseIndexChirho + 1 : null,
		verse_fraction_chirho:
			endChirho > startChirho
				? Math.min(1, (safeSecondsChirho - startChirho) / (endChirho - startChirho))
				: 0
	};
}

// See spec-chirho/workflows-chirho/tune_in_workflow_chirho.md.
export function mapPositionChirho(
	positionChirho: PositionChirho,
	durationChirho: number,
	timingsChirho: readonly number[] | null
): { seconds_chirho: number; mode_chirho: 'verse' | 'fraction' | 'start' } {
	const safeDurationChirho = Number.isFinite(durationChirho) ? Math.max(0, durationChirho) : 0;
	const indexChirho = positionChirho.verse_chirho === null ? -1 : positionChirho.verse_chirho - 1;
	if (timingsChirho && indexChirho >= 0 && indexChirho < timingsChirho.length) {
		const startChirho = timingsChirho[indexChirho];
		const endChirho = timingsChirho[indexChirho + 1] ?? safeDurationChirho;
		const secondsChirho =
			startChirho +
			Math.max(0, endChirho - startChirho - 0.1) * positionChirho.verse_fraction_chirho;
		return {
			seconds_chirho: Math.min(Math.max(0, safeDurationChirho - 0.1), secondsChirho),
			mode_chirho: 'verse'
		};
	}
	if (positionChirho.duration_chirho > 0 && safeDurationChirho > 0) {
		return {
			seconds_chirho: Math.min(
				Math.max(0, safeDurationChirho - 0.1),
				Math.max(
					0,
					(positionChirho.seconds_chirho / positionChirho.duration_chirho) * safeDurationChirho
				)
			),
			mode_chirho: 'fraction'
		};
	}
	return { seconds_chirho: 0, mode_chirho: 'start' };
}
