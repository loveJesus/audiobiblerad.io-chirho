// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

export interface RadioSoundsChirho {
	startChirho(): void;
	stopChirho(): void;
	setEnabledChirho(enabledChirho: boolean): void;
	disposeChirho(): void;
}

// See spec-chirho/workflows-chirho/radio_sounds_workflow_chirho.md.
export function createRadioSoundsChirho(): RadioSoundsChirho {
	const audioChirho = new Audio();
	// Quiet gain is encoded in the PCM; per-element software volume is unavailable on iOS.
	audioChirho.volume = 1;
	audioChirho.loop = false;
	let enabledChirho = true;
	let lastVariantChirho = -1;
	let timeoutChirho: ReturnType<typeof setTimeout> | undefined;
	const stopChirho = (): void => {
		clearTimeout(timeoutChirho);
		timeoutChirho = undefined;
		audioChirho.pause();
		audioChirho.removeAttribute('src');
		audioChirho.load();
	};
	audioChirho.addEventListener('ended', stopChirho);
	return {
		startChirho() {
			stopChirho();
			if (!enabledChirho) return;
			const variantChirho =
				lastVariantChirho < 0
					? Math.floor(Math.random() * 9)
					: (lastVariantChirho + 1 + Math.floor(Math.random() * 8)) % 9;
			lastVariantChirho = variantChirho;
			audioChirho.src = `/sounds-chirho/radio_${String(variantChirho + 1).padStart(2, '0')}_chirho.wav`;
			void audioChirho.play().catch(() => {
				/* Optional effects must never block Scripture. */
			});
			timeoutChirho = setTimeout(stopChirho, 1500);
		},
		stopChirho,
		setEnabledChirho(valueChirho) {
			enabledChirho = valueChirho;
			if (!enabledChirho) stopChirho();
		},
		disposeChirho() {
			stopChirho();
			enabledChirho = false;
			audioChirho.removeEventListener('ended', stopChirho);
		}
	};
}
