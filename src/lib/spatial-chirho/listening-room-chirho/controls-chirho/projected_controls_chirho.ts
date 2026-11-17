// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import type * as ThreeChirho from 'three';

export class ProjectedControlsChirho {
	readonly root_chirho = document.createElement('div');
	private readonly mountsChirho: {
		name_chirho: string;
		element_chirho: HTMLElement;
		anchor_chirho: ThreeChirho.Object3D | null;
		width_chirho: number;
		height_chirho: number;
		depth_chirho: number;
	}[] = [];
	private matrixChirho: ThreeChirho.Matrix4 | null = null;
	private planeChirho: ThreeChirho.Matrix4 | null = null;
	private flatChirho = false;
	constructor(
		private assetChirho: ThreeChirho.Object3D | null,
		private readonly hostChirho: HTMLElement
	) {
		this.root_chirho.className = 'room-controls-chirho';
		hostChirho.appendChild(this.root_chirho);
		this.setFlatChirho(!assetChirho);
	}
	addChirho(
		nameChirho: string,
		contentChirho: Node & Pick<HTMLElement, 'getAttribute'>
	): HTMLElement {
		const anchorChirho = this.assetChirho?.getObjectByName(nameChirho) ?? null;
		if (this.assetChirho && !anchorChirho)
			throw new Error(`Missing live control anchor: ${nameChirho}`);
		const widthChirho = anchorChirho ? Number(anchorChirho.userData.width_chirho) * 100 : 100;
		const heightChirho = anchorChirho ? Number(anchorChirho.userData.height_chirho) * 100 : 100;
		if (!(widthChirho > 0 && heightChirho > 0)) throw new Error('Invalid control plane size');
		const elementChirho = document.createElement('div');
		elementChirho.className = 'room-control-plane-chirho';
		elementChirho.dataset.labelChirho = contentChirho.getAttribute('aria-label') ?? '';
		if (
			nameChirho === 'live_language_display_chirho' ||
			nameChirho === 'live_notepad_credit_chirho'
		)
			elementChirho.classList.add('room-wide-plane-chirho');
		elementChirho.style.width = `${widthChirho}px`;
		elementChirho.style.height = `${heightChirho}px`;
		elementChirho.appendChild(contentChirho);
		this.root_chirho.appendChild(elementChirho);
		this.mountsChirho.push({
			name_chirho: nameChirho,
			element_chirho: elementChirho,
			anchor_chirho: anchorChirho,
			width_chirho: widthChirho,
			height_chirho: heightChirho,
			depth_chirho:
				nameChirho === 'live_language_display_chirho'
					? -0.248
					: nameChirho === 'live_book_display_chirho' ||
						  nameChirho === 'live_chapter_display_chirho'
						? -0.09
						: nameChirho === 'live_notepad_credit_chirho'
							? 0
							: -0.04
		});
		return elementChirho;
	}
	attachChirho(
		assetChirho: ThreeChirho.Object3D,
		createMatrixChirho: () => ThreeChirho.Matrix4
	): void {
		this.matrixChirho = createMatrixChirho();
		this.planeChirho = createMatrixChirho();
		const anchorsChirho = this.mountsChirho.map((mountChirho) => {
			const anchorChirho = assetChirho.getObjectByName(mountChirho.name_chirho);
			if (
				!anchorChirho ||
				!(Number(anchorChirho.userData.width_chirho) > 0) ||
				!(Number(anchorChirho.userData.height_chirho) > 0)
			)
				throw new Error(`Missing or invalid live control anchor: ${mountChirho.name_chirho}`);
			return anchorChirho;
		});
		this.assetChirho = assetChirho;
		this.mountsChirho.forEach((mountChirho, indexChirho) => {
			mountChirho.anchor_chirho = anchorsChirho[indexChirho];
			mountChirho.width_chirho = Number(anchorsChirho[indexChirho].userData.width_chirho) * 100;
			mountChirho.height_chirho = Number(anchorsChirho[indexChirho].userData.height_chirho) * 100;
			mountChirho.element_chirho.style.width = `${mountChirho.width_chirho}px`;
			mountChirho.element_chirho.style.height = `${mountChirho.height_chirho}px`;
		});
	}
	setFlatChirho(flatChirho: boolean): void {
		this.flatChirho = flatChirho;
		this.root_chirho.classList.toggle('room-flat-chirho', flatChirho);
		this.hostChirho.classList.toggle('room-simple-host-chirho', flatChirho);
	}
	projectChirho(cameraChirho: ThreeChirho.Camera, widthChirho: number, heightChirho: number): void {
		const matrixChirho = this.matrixChirho,
			planeChirho = this.planeChirho;
		if (this.flatChirho || !matrixChirho || !planeChirho) return;
		cameraChirho.updateMatrixWorld();
		for (const mountChirho of this.mountsChirho) {
			if (!mountChirho.anchor_chirho) continue;
			mountChirho.anchor_chirho.updateWorldMatrix(true, false);
			matrixChirho
				.set(
					widthChirho / 2,
					0,
					0,
					widthChirho / 2,
					0,
					-heightChirho / 2,
					0,
					heightChirho / 2,
					0,
					0,
					-1,
					0,
					0,
					0,
					0,
					1
				)
				.multiply(cameraChirho.projectionMatrix)
				.multiply(cameraChirho.matrixWorldInverse)
				.multiply(mountChirho.anchor_chirho.matrixWorld)
				// Exported front anchors are Rx90; the paper anchor is identity. Normalize both.
				.multiply(planeChirho.makeRotationX(-Math.PI / 2))
				.multiply(planeChirho.makeTranslation(0, 0, mountChirho.depth_chirho))
				.multiply(planeChirho.makeScale(0.01, -0.01, 0.01))
				.multiply(
					planeChirho.makeTranslation(
						-mountChirho.width_chirho / 2,
						-mountChirho.height_chirho / 2,
						0.8
					)
				);
			mountChirho.element_chirho.style.transform = `matrix3d(${matrixChirho.elements.join(',')})`;
		}
	}
	get editing_chirho(): boolean {
		return this.root_chirho.contains(document.activeElement);
	}
	disposeChirho(): void {
		this.root_chirho.remove();
	}
}
