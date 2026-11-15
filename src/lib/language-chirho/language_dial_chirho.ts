// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import type { LanguageEntryChirho } from '$lib/catalogue-chirho/catalogue_chirho';

/** A small prefix table: no chapter data or dense global-station array is loaded. */
export class LanguageDialChirho {
	readonly offsetsChirho = new Map<string, number>();
	readonly totalChirho: number;
	private readonly entriesChirho: Array<{
		code_chirho: string;
		start_chirho: number;
		count_chirho: number;
	}>;
	constructor(languagesChirho: readonly LanguageEntryChirho[]) {
		let offsetChirho = 0;
		this.entriesChirho = languagesChirho.map((languageChirho) => {
			const entryChirho = {
				code_chirho: languageChirho.code_chirho,
				start_chirho: offsetChirho,
				count_chirho: languageChirho.station_count_chirho
			};
			this.offsetsChirho.set(entryChirho.code_chirho, offsetChirho);
			offsetChirho += entryChirho.count_chirho;
			return entryChirho;
		});
		this.totalChirho = offsetChirho;
	}
	targetChirho(valueChirho: number): { code_chirho: string; station_index_chirho: number } | null {
		if (!Number.isFinite(valueChirho) || this.totalChirho === 0) return null;
		const indexChirho = Math.max(0, Math.min(this.totalChirho - 1, Math.round(valueChirho)));
		let lowChirho = 0,
			highChirho = this.entriesChirho.length - 1;
		while (lowChirho <= highChirho) {
			const middleChirho = (lowChirho + highChirho) >>> 1;
			const entryChirho = this.entriesChirho[middleChirho];
			if (indexChirho < entryChirho.start_chirho) highChirho = middleChirho - 1;
			else if (indexChirho >= entryChirho.start_chirho + entryChirho.count_chirho)
				lowChirho = middleChirho + 1;
			else
				return {
					code_chirho: entryChirho.code_chirho,
					station_index_chirho: indexChirho - entryChirho.start_chirho
				};
		}
		return null;
	}
}
