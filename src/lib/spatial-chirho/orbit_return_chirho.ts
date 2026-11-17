// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { Vector3 as VectorChirho } from 'three';

/** A weighted 45-degree viewing cone. See spatial_radio_workflow_chirho.md. */
export class OrbitReturnChirho {
	private readonly homeChirho = new VectorChirho(0, 0, 1);
	private readonly offsetChirho = new VectorChirho();
	private readonly axisChirho = new VectorChirho();
	private readonly directionChirho = new VectorChirho();
	private angleChirho = 0;
	readonly limitChirho = Math.PI / 4;

	setHomeChirho(positionChirho: VectorChirho, targetChirho: VectorChirho): void {
		this.homeChirho.copy(positionChirho).sub(targetChirho).normalize();
		this.angleChirho = 0;
	}

	get resistanceChirho(): number {
		return 0.18 + 0.82 * (1 - Math.min(1, this.angleChirho / this.limitChirho) ** 2);
	}

	updateChirho(
		positionChirho: VectorChirho,
		targetChirho: VectorChirho,
		idleSecondsChirho: number,
		elapsedSecondsChirho: number,
		returnChirho: boolean
	): boolean {
		this.offsetChirho.copy(positionChirho).sub(targetChirho);
		const distanceChirho = this.offsetChirho.length();
		if (!Number.isFinite(distanceChirho) || distanceChirho <= 0) return false;
		this.directionChirho.copy(this.offsetChirho).normalize();
		this.angleChirho = Math.acos(
			Math.max(-1, Math.min(1, this.directionChirho.dot(this.homeChirho)))
		);
		this.axisChirho.crossVectors(this.homeChirho, this.directionChirho);
		if (this.axisChirho.lengthSq() < 1e-12) {
			if (this.angleChirho < 0.002) return false;
			this.axisChirho.crossVectors(this.homeChirho, new VectorChirho(0, 1, 0));
			if (this.axisChirho.lengthSq() < 1e-12) this.axisChirho.set(1, 0, 0);
		}
		this.axisChirho.normalize();
		let nextAngleChirho = Math.min(this.limitChirho, this.angleChirho);
		const movingChirho = returnChirho && nextAngleChirho > 0.002;
		if (returnChirho && idleSecondsChirho > 0.8) {
			nextAngleChirho *= Math.exp(-0.95 * Math.max(0, elapsedSecondsChirho));
			if (nextAngleChirho < 0.002) nextAngleChirho = 0;
		}
		this.offsetChirho
			.copy(this.homeChirho)
			.applyAxisAngle(this.axisChirho, nextAngleChirho)
			.multiplyScalar(distanceChirho);
		positionChirho.copy(targetChirho).add(this.offsetChirho);
		this.angleChirho = nextAngleChirho;
		return movingChirho;
	}
}
