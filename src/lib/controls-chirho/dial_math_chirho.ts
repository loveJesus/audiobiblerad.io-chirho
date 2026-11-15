// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

export interface DialOptionChirho {
	value_chirho: number;
	label_chirho: string;
}

export function dialAngleChirho(
	valueChirho: number,
	minChirho: number,
	maxChirho: number,
	arcChirho = 270
): number {
	if (maxChirho <= minChirho) return 0;
	return (
		(Math.max(0, Math.min(1, (valueChirho - minChirho) / (maxChirho - minChirho))) - 0.5) *
		arcChirho
	);
}

export function angleDeltaChirho(previousChirho: number, nextChirho: number): number {
	return ((nextChirho - previousChirho + 540) % 360) - 180;
}

export function nearestDialOptionChirho(
	optionsChirho: readonly DialOptionChirho[],
	valueChirho: number,
	directionChirho = 0
): number {
	let selectedChirho = optionsChirho[0]?.value_chirho ?? 0;
	for (const optionChirho of optionsChirho) {
		const distanceChirho = Math.abs(optionChirho.value_chirho - valueChirho);
		const priorDistanceChirho = Math.abs(selectedChirho - valueChirho);
		if (
			distanceChirho < priorDistanceChirho ||
			(distanceChirho === priorDistanceChirho &&
				(directionChirho > 0
					? optionChirho.value_chirho > selectedChirho
					: optionChirho.value_chirho < selectedChirho))
		)
			selectedChirho = optionChirho.value_chirho;
	}
	return selectedChirho;
}
