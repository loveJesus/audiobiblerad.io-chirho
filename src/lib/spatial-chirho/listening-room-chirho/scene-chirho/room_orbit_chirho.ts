// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import {
	Vector3 as VectorChirho,
	Spherical as SphericalChirho,
	MathUtils as MathChirho,
	type Camera as CameraChirho
} from 'three';

/** Elastic camera travel: input accumulates, while tanh approaches each limit smoothly. */
export class RoomOrbitChirho {
	private readonly homeChirho = new SphericalChirho();
	private readonly offsetChirho = new VectorChirho();
	private readonly shownChirho = new SphericalChirho();
	private horizontalChirho = 0;
	private verticalChirho = 0;
	private lastInputChirho = performance.now();
	private dragChirho: { id_chirho: number; x_chirho: number; y_chirho: number } | null = null;
	private readonly horizontalLimitChirho = MathChirho.degToRad(18);
	private readonly upLimitChirho = MathChirho.degToRad(14);
	private readonly downLimitChirho = MathChirho.degToRad(9);
	constructor(
		private readonly cameraChirho: CameraChirho,
		readonly target_chirho: VectorChirho,
		private readonly canvasChirho: HTMLCanvasElement
	) {
		this.homeChirho.setFromVector3(
			this.offsetChirho.copy(cameraChirho.position).sub(target_chirho)
		);
		canvasChirho.tabIndex = 0;
		canvasChirho.setAttribute('aria-label', 'Look around the listening room');
		canvasChirho.style.touchAction = 'pan-y pinch-zoom';
		canvasChirho.addEventListener('pointerdown', this.downChirho);
		canvasChirho.addEventListener('pointermove', this.moveChirho);
		canvasChirho.addEventListener('pointerup', this.upChirho);
		canvasChirho.addEventListener('pointercancel', this.upChirho);
		canvasChirho.addEventListener('keydown', this.keyChirho);
		this.updateChirho(0, false);
	}
	private downChirho = (eventChirho: PointerEvent): void => {
		if (this.dragChirho || (eventChirho.pointerType === 'mouse' && eventChirho.button !== 0))
			return;
		eventChirho.preventDefault();
		this.canvasChirho.focus({ preventScroll: true });
		this.canvasChirho.setPointerCapture(eventChirho.pointerId);
		this.dragChirho = {
			id_chirho: eventChirho.pointerId,
			x_chirho: eventChirho.clientX,
			y_chirho: eventChirho.clientY
		};
		this.lastInputChirho = performance.now();
	};
	private moveChirho = (eventChirho: PointerEvent): void => {
		if (!this.dragChirho || eventChirho.pointerId !== this.dragChirho.id_chirho) return;
		this.horizontalChirho = MathChirho.clamp(
			this.horizontalChirho - (eventChirho.clientX - this.dragChirho.x_chirho) * 0.0025,
			-this.horizontalLimitChirho * 6,
			this.horizontalLimitChirho * 6
		);
		this.verticalChirho = MathChirho.clamp(
			this.verticalChirho + (eventChirho.clientY - this.dragChirho.y_chirho) * 0.0025,
			-this.downLimitChirho * 6,
			this.upLimitChirho * 6
		);
		this.dragChirho.x_chirho = eventChirho.clientX;
		this.dragChirho.y_chirho = eventChirho.clientY;
		this.lastInputChirho = performance.now();
	};
	private upChirho = (eventChirho: PointerEvent): void => {
		if (this.dragChirho?.id_chirho === eventChirho.pointerId) {
			this.dragChirho = null;
			this.lastInputChirho = performance.now();
		}
	};
	private keyChirho = (eventChirho: KeyboardEvent): void => {
		const stepsChirho: Record<string, [number, number]> = {
			ArrowLeft: [0.045, 0],
			ArrowRight: [-0.045, 0],
			ArrowUp: [0, 0.035],
			ArrowDown: [0, -0.035],
			Home: [0, 0]
		};
		const stepChirho = stepsChirho[eventChirho.key];
		if (!stepChirho) return;
		eventChirho.preventDefault();
		if (eventChirho.key === 'Home') {
			this.horizontalChirho = 0;
			this.verticalChirho = 0;
		} else {
			this.horizontalChirho = MathChirho.clamp(
				this.horizontalChirho + stepChirho[0],
				-this.horizontalLimitChirho * 6,
				this.horizontalLimitChirho * 6
			);
			this.verticalChirho = MathChirho.clamp(
				this.verticalChirho + stepChirho[1],
				-this.downLimitChirho * 6,
				this.upLimitChirho * 6
			);
		}
		this.lastInputChirho = performance.now();
	};
	get horizontal_degrees_chirho(): number {
		return MathChirho.radToDeg(
			this.horizontalLimitChirho * Math.tanh(this.horizontalChirho / this.horizontalLimitChirho)
		);
	}
	get vertical_degrees_chirho(): number {
		const limitChirho = this.verticalChirho >= 0 ? this.upLimitChirho : this.downLimitChirho;
		return MathChirho.radToDeg(limitChirho * Math.tanh(this.verticalChirho / limitChirho));
	}
	get polar_chirho(): number {
		return this.shownChirho.phi;
	}
	updateChirho(elapsedChirho: number, returnChirho: boolean): void {
		if (returnChirho && !this.dragChirho && performance.now() - this.lastInputChirho > 800) {
			const decayChirho = Math.exp(-0.9 * Math.max(0, elapsedChirho));
			this.horizontalChirho *= decayChirho;
			this.verticalChirho *= decayChirho;
			if (Math.abs(this.horizontalChirho) < 0.0001) this.horizontalChirho = 0;
			if (Math.abs(this.verticalChirho) < 0.0001) this.verticalChirho = 0;
		}
		this.shownChirho.copy(this.homeChirho);
		this.shownChirho.theta += MathChirho.degToRad(this.horizontal_degrees_chirho);
		this.shownChirho.phi -= MathChirho.degToRad(this.vertical_degrees_chirho);
		this.cameraChirho.position
			.copy(this.offsetChirho.setFromSpherical(this.shownChirho))
			.add(this.target_chirho);
		this.cameraChirho.lookAt(this.target_chirho);
	}
	disposeChirho(): void {
		this.canvasChirho.removeEventListener('pointerdown', this.downChirho);
		this.canvasChirho.removeEventListener('pointermove', this.moveChirho);
		this.canvasChirho.removeEventListener('pointerup', this.upChirho);
		this.canvasChirho.removeEventListener('pointercancel', this.upChirho);
		this.canvasChirho.removeEventListener('keydown', this.keyChirho);
	}
}
