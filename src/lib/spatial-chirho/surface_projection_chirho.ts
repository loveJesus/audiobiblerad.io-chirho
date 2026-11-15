// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { Matrix4 as Matrix4Chirho, type Camera as CameraChirho } from 'three';

// The same camera projects geometry and real form controls; browser zoom stays native.
export function surfaceProjectionChirho(
	cameraChirho: CameraChirho,
	widthChirho: number,
	heightChirho: number,
	scaleChirho: number,
	viewportWidthChirho: number,
	viewportHeightChirho: number
): string {
	cameraChirho.updateMatrixWorld();
	const screenChirho = new Matrix4Chirho().set(
		viewportWidthChirho / 2,
		0,
		0,
		viewportWidthChirho / 2,
		0,
		-viewportHeightChirho / 2,
		0,
		viewportHeightChirho / 2,
		0,
		0,
		-1, // CSS depth increases toward the viewer; WebGL NDC depth increases away.
		0,
		0,
		0,
		0,
		1
	);
	screenChirho
		.multiply(cameraChirho.projectionMatrix)
		.multiply(cameraChirho.matrixWorldInverse)
		.multiply(new Matrix4Chirho().makeTranslation(0, 0, 0.045))
		.multiply(new Matrix4Chirho().makeScale(scaleChirho, -scaleChirho, scaleChirho))
		.multiply(new Matrix4Chirho().makeTranslation(-widthChirho / 2, -heightChirho / 2, 0));
	return `matrix3d(${screenChirho.elements.join(',')})`;
}
