// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { describe, expect, it } from 'vitest';
import { Vector3 as VectorChirho } from 'three';
import { OrbitReturnChirho } from './orbit_return_chirho';

describe('weighted camera orbit', () => {
	it('keeps every viewing direction in the cone and preserves the chosen distance', () => {
		const targetChirho = new VectorChirho(1, 2, 3);
		const homeChirho = new VectorChirho(0, 0, 1);
		const orbitChirho = new OrbitReturnChirho();
		orbitChirho.setHomeChirho(targetChirho.clone().add(homeChirho), targetChirho);
		for (const directionChirho of [
			new VectorChirho(1, 1, 0),
			new VectorChirho(0, 0, -1),
			new VectorChirho(-2, -1, -3)
		]) {
			const positionChirho = targetChirho
				.clone()
				.add(directionChirho.normalize().multiplyScalar(12));
			orbitChirho.updateChirho(positionChirho, targetChirho, 0, 0, false);
			expect(positionChirho.distanceTo(targetChirho)).toBeCloseTo(12);
			expect(positionChirho.clone().sub(targetChirho).angleTo(homeChirho)).toBeLessThanOrEqual(
				orbitChirho.limitChirho + 1e-8
			);
		}
	});
	it('gently returns after release, while an interaction or reduced motion can leave it still', () => {
		const orbitChirho = new OrbitReturnChirho();
		const targetChirho = new VectorChirho();
		const homeChirho = new VectorChirho(0, 0, 10);
		orbitChirho.setHomeChirho(homeChirho, targetChirho);
		const positionChirho = new VectorChirho(5, 0, 10);
		const heldChirho = positionChirho.clone();
		orbitChirho.updateChirho(positionChirho, targetChirho, 20, 0.02, false);
		expect(positionChirho.distanceTo(heldChirho)).toBeLessThan(1e-8);
		for (let frameChirho = 0; frameChirho < 500; frameChirho++) {
			const beforeChirho = positionChirho.angleTo(homeChirho);
			orbitChirho.updateChirho(positionChirho, targetChirho, 1 + frameChirho / 60, 1 / 60, true);
			expect(positionChirho.angleTo(homeChirho)).toBeLessThanOrEqual(beforeChirho + 1e-8);
		}
		expect(positionChirho.angleTo(homeChirho)).toBeLessThan(0.003);
	});
	it('increases resistance toward the edge', () => {
		const orbitChirho = new OrbitReturnChirho();
		const targetChirho = new VectorChirho();
		orbitChirho.setHomeChirho(new VectorChirho(0, 0, 10), targetChirho);
		const centralChirho = orbitChirho.resistanceChirho;
		orbitChirho.updateChirho(new VectorChirho(10, 0, 10), targetChirho, 0, 0, false);
		expect(orbitChirho.resistanceChirho).toBeLessThan(centralChirho);
	});
	it('returns at the same gentle rate when rendered frames arrive less often', () => {
		const targetChirho = new VectorChirho();
		const homeChirho = new VectorChirho(0, 0, 10);
		const simulateChirho = (intervalChirho: number, framesChirho: number) => {
			const orbitChirho = new OrbitReturnChirho();
			orbitChirho.setHomeChirho(homeChirho, targetChirho);
			const positionChirho = new VectorChirho(5, 0, 10);
			for (let frameChirho = 0; frameChirho < framesChirho; frameChirho++)
				orbitChirho.updateChirho(positionChirho, targetChirho, 2, intervalChirho, true);
			return positionChirho.angleTo(homeChirho);
		};
		expect(simulateChirho(0.2, 5)).toBeCloseTo(simulateChirho(0.02, 50), 8);
		expect(simulateChirho(1, 1)).toBeCloseTo(simulateChirho(0.02, 50), 8);
	});
});
