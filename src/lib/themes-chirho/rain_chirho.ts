// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Light rain for a radio's setting: one canvas and a few dozen strokes a frame. It is drawn
// behind the page, stops while the tab is hidden, and never starts for someone who has asked
// their device for less motion.

const MAX_DROPS_CHIRHO = 140;
/** Scene area, in CSS pixels, that earns one drop. */
const AREA_PER_DROP_CHIRHO = 9000;
const FRAME_MS_CHIRHO = 1000 / 30;
/** Rain is soft by nature, so a dense screen does not get a denser canvas. */
const MAX_PIXEL_SCALE_CHIRHO = 1.5;
/** Sideways travel for each unit of fall. Negative leans the rain to the left. */
const SLANT_CHIRHO = -0.22;

interface RainDropChirho {
	x_chirho: number;
	y_chirho: number;
	length_chirho: number;
	speed_chirho: number;
	alpha_chirho: number;
	width_chirho: number;
}

function newDropChirho(
	widthChirho: number,
	heightChirho: number,
	anywhereChirho: boolean
): RainDropChirho {
	const nearnessChirho = Math.random();
	return {
		// Wide enough on the right that the lean still covers the whole scene.
		x_chirho: Math.random() * (widthChirho - heightChirho * SLANT_CHIRHO),
		y_chirho: anywhereChirho ? Math.random() * heightChirho : -Math.random() * heightChirho * 0.2,
		length_chirho: 10 + nearnessChirho * 22,
		speed_chirho: 520 + nearnessChirho * 620,
		alpha_chirho: 0.1 + nearnessChirho * 0.25,
		width_chirho: 0.7 + nearnessChirho * 0.8
	};
}

/**
 * Starts rain on the canvas and returns the function that stops it. The colour is read once from
 * --radio-rain-chirho, so start it again after the skin changes.
 */
export function runRainChirho(canvasChirho: HTMLCanvasElement): () => void {
	const contextChirho = canvasChirho.getContext('2d');
	if (!contextChirho) return () => undefined;
	const calmChirho = window.matchMedia('(prefers-reduced-motion: reduce)');
	const colourChirho =
		getComputedStyle(canvasChirho).getPropertyValue('--radio-rain-chirho').trim() || '#ffffff';
	let dropsChirho: RainDropChirho[] = [];
	let widthChirho = 0;
	let heightChirho = 0;
	let scaleChirho = 1;
	let frameChirho = 0;
	let lastChirho = 0;

	const resizeChirho = (): void => {
		scaleChirho = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_SCALE_CHIRHO);
		widthChirho = canvasChirho.clientWidth;
		heightChirho = canvasChirho.clientHeight;
		canvasChirho.width = Math.round(widthChirho * scaleChirho);
		canvasChirho.height = Math.round(heightChirho * scaleChirho);
		dropsChirho = Array.from(
			{
				length: Math.min(
					MAX_DROPS_CHIRHO,
					Math.round((widthChirho * heightChirho) / AREA_PER_DROP_CHIRHO)
				)
			},
			() => newDropChirho(widthChirho, heightChirho, true)
		);
	};
	const drawChirho = (nowChirho: number): void => {
		frameChirho = window.requestAnimationFrame(drawChirho);
		if (nowChirho - lastChirho < FRAME_MS_CHIRHO) return;
		// A long gap means the tab slept: move as if one frame passed, not the whole gap.
		const secondsChirho = Math.min(0.1, (nowChirho - lastChirho) / 1000);
		lastChirho = nowChirho;
		contextChirho.setTransform(scaleChirho, 0, 0, scaleChirho, 0, 0);
		contextChirho.clearRect(0, 0, widthChirho, heightChirho);
		contextChirho.strokeStyle = colourChirho;
		contextChirho.lineCap = 'round';
		for (const dropChirho of dropsChirho) {
			dropChirho.y_chirho += dropChirho.speed_chirho * secondsChirho;
			dropChirho.x_chirho += dropChirho.speed_chirho * secondsChirho * SLANT_CHIRHO;
			if (dropChirho.y_chirho - dropChirho.length_chirho > heightChirho)
				Object.assign(dropChirho, newDropChirho(widthChirho, heightChirho, false));
			contextChirho.globalAlpha = dropChirho.alpha_chirho;
			contextChirho.lineWidth = dropChirho.width_chirho;
			contextChirho.beginPath();
			contextChirho.moveTo(dropChirho.x_chirho, dropChirho.y_chirho);
			contextChirho.lineTo(
				dropChirho.x_chirho - dropChirho.length_chirho * SLANT_CHIRHO,
				dropChirho.y_chirho - dropChirho.length_chirho
			);
			contextChirho.stroke();
		}
	};
	const stopChirho = (): void => {
		window.cancelAnimationFrame(frameChirho);
		frameChirho = 0;
	};
	const reviewChirho = (): void => {
		stopChirho();
		if (calmChirho.matches || document.hidden) {
			contextChirho.setTransform(1, 0, 0, 1, 0, 0);
			contextChirho.clearRect(0, 0, canvasChirho.width, canvasChirho.height);
			return;
		}
		lastChirho = performance.now();
		frameChirho = window.requestAnimationFrame(drawChirho);
	};

	const observerChirho = new ResizeObserver(resizeChirho);
	observerChirho.observe(canvasChirho);
	resizeChirho();
	document.addEventListener('visibilitychange', reviewChirho);
	calmChirho.addEventListener('change', reviewChirho);
	reviewChirho();

	return () => {
		stopChirho();
		observerChirho.disconnect();
		document.removeEventListener('visibilitychange', reviewChirho);
		calmChirho.removeEventListener('change', reviewChirho);
	};
}
