// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { describe, expect, it } from 'vitest';
import { PerspectiveCamera as CameraChirho, Vector3 as Vector3Chirho } from 'three';
import { surfaceProjectionChirho } from './surface_projection_chirho';

describe('native controls on the actual camera plane', () => {
	it('keeps a raised control in front of its parent for browser hit testing', () => {
		const cameraChirho = new CameraChirho(34, 1.4, 0.1, 100);
		cameraChirho.position.set(4, 2, 18);
		cameraChirho.lookAt(0, 0, 0);
		const matrixChirho = surfaceProjectionChirho(cameraChirho, 568, 800, 6 / 568, 1280, 900)
			.slice(9, -1)
			.split(',')
			.map(Number);
		const depthChirho = (zChirho: number) =>
			(matrixChirho[2] * 284 +
				matrixChirho[6] * 400 +
				matrixChirho[10] * zChirho +
				matrixChirho[14]) /
			(matrixChirho[3] * 284 +
				matrixChirho[7] * 400 +
				matrixChirho[11] * zChirho +
				matrixChirho[15]);
		expect(depthChirho(24)).toBeGreaterThan(depthChirho(0));
	});
	for (const viewportChirho of [
		{ width_chirho: 1280, height_chirho: 900 },
		{ width_chirho: 390, height_chirho: 844 }
	]) {
		it(`matches the geometry projection at ${viewportChirho.width_chirho}px, including the angled face`, () => {
			const cameraChirho = new CameraChirho(
				34,
				viewportChirho.width_chirho / viewportChirho.height_chirho,
				0.1,
				100
			);
			cameraChirho.position.set(4, 2, 18);
			cameraChirho.lookAt(0, 0, 0);
			cameraChirho.updateMatrixWorld();
			const widthChirho = 568,
				heightChirho = 800,
				scaleChirho = 6 / widthChirho;
			const cssChirho = surfaceProjectionChirho(
				cameraChirho,
				widthChirho,
				heightChirho,
				scaleChirho,
				viewportChirho.width_chirho,
				viewportChirho.height_chirho
			);
			const matrixChirho = cssChirho.slice(9, -1).split(',').map(Number);
			for (const pointChirho of [
				{ x_chirho: 0, y_chirho: 0 },
				{ x_chirho: 284, y_chirho: 400 },
				{ x_chirho: 568, y_chirho: 800 }
			]) {
				const divisorChirho =
					matrixChirho[3] * pointChirho.x_chirho +
					matrixChirho[7] * pointChirho.y_chirho +
					matrixChirho[15];
				const xChirho =
					(matrixChirho[0] * pointChirho.x_chirho +
						matrixChirho[4] * pointChirho.y_chirho +
						matrixChirho[12]) /
					divisorChirho;
				const yChirho =
					(matrixChirho[1] * pointChirho.x_chirho +
						matrixChirho[5] * pointChirho.y_chirho +
						matrixChirho[13]) /
					divisorChirho;
				const projectedChirho = new Vector3Chirho(
					(pointChirho.x_chirho - widthChirho / 2) * scaleChirho,
					(heightChirho / 2 - pointChirho.y_chirho) * scaleChirho,
					0.045
				).project(cameraChirho);
				expect(xChirho).toBeCloseTo(((projectedChirho.x + 1) * viewportChirho.width_chirho) / 2, 6);
				expect(yChirho).toBeCloseTo(
					((1 - projectedChirho.y) * viewportChirho.height_chirho) / 2,
					6
				);
			}
		});
	}
});
