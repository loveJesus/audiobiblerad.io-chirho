// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import type { ChapterPlaybackChirho } from '$lib/catalogue-chirho/catalogue_chirho';

/**
 * A bounded chapter timeline; one file for ordinary chapters, at most four for composites.
 * Measured lengths define fixed logical boundaries. Small metadata differences map each
 * file proportionally inside those boundaries, never shifting the following parts.
 * See spec-chirho/workflows-chirho/tune_in_workflow_chirho.md.
 */
export class ChapterTrackChirho {
	constructor(private readonly playbackChirho: ChapterPlaybackChirho) {}

	get compositeChirho(): boolean {
		return this.playbackChirho.kind_chirho === 'composite';
	}

	get partCountChirho(): number {
		return this.playbackChirho.kind_chirho === 'composite'
			? this.playbackChirho.parts_chirho.length
			: 1;
	}

	urlChirho(indexChirho: number): string {
		return this.playbackChirho.kind_chirho === 'composite'
			? this.playbackChirho.parts_chirho[indexChirho].url_chirho
			: this.playbackChirho.url_chirho;
	}

	durationChirho(mediaDurationChirho: number): number {
		return this.playbackChirho.kind_chirho === 'composite'
			? this.playbackChirho.total_seconds_chirho
			: Number.isFinite(mediaDurationChirho)
				? Math.max(0, mediaDurationChirho)
				: 0;
	}

	startChirho(indexChirho: number): number {
		if (this.playbackChirho.kind_chirho === 'single') return 0;
		let secondsChirho = 0;
		for (let partChirho = 0; partChirho < indexChirho; partChirho += 1)
			secondsChirho += this.playbackChirho.parts_chirho[partChirho].duration_seconds_chirho;
		return secondsChirho;
	}

	partAtChirho(secondsChirho: number): number {
		if (this.playbackChirho.kind_chirho === 'single') return 0;
		let endChirho = 0;
		for (let indexChirho = 0; indexChirho < this.partCountChirho - 1; indexChirho += 1) {
			endChirho += this.playbackChirho.parts_chirho[indexChirho].duration_seconds_chirho;
			if (secondsChirho < endChirho) return indexChirho;
		}
		return this.partCountChirho - 1;
	}

	acceptsDurationChirho(indexChirho: number, mediaDurationChirho: number): boolean {
		if (!Number.isFinite(mediaDurationChirho) || mediaDurationChirho <= 0) return false;
		if (this.playbackChirho.kind_chirho === 'single') return true;
		const measuredChirho = this.playbackChirho.parts_chirho[indexChirho].duration_seconds_chirho;
		// Permit decoder rounding and small VBR estimates, not a replacement recording.
		return Math.abs(mediaDurationChirho - measuredChirho) <= Math.max(1, measuredChirho * 0.01);
	}

	mediaSecondsChirho(
		secondsChirho: number,
		indexChirho: number,
		mediaDurationChirho: number
	): number {
		const offsetChirho = secondsChirho - this.startChirho(indexChirho);
		const mappedChirho =
			this.playbackChirho.kind_chirho === 'composite'
				? (offsetChirho / this.playbackChirho.parts_chirho[indexChirho].duration_seconds_chirho) *
					mediaDurationChirho
				: offsetChirho;
		return Math.max(0, Math.min(Math.max(0, mediaDurationChirho - 0.05), mappedChirho));
	}

	chapterSecondsChirho(
		mediaSecondsChirho: number,
		indexChirho: number,
		mediaDurationChirho: number
	): number {
		const safeChirho = Number.isFinite(mediaSecondsChirho) ? Math.max(0, mediaSecondsChirho) : 0;
		if (this.playbackChirho.kind_chirho === 'single') return safeChirho;
		const measuredChirho = this.playbackChirho.parts_chirho[indexChirho].duration_seconds_chirho;
		const offsetChirho =
			Number.isFinite(mediaDurationChirho) && mediaDurationChirho > 0
				? Math.min(measuredChirho, (safeChirho / mediaDurationChirho) * measuredChirho)
				: 0;
		return this.startChirho(indexChirho) + offsetChirho;
	}
}
