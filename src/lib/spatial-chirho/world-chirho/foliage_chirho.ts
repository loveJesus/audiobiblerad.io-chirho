// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import {
	BufferGeometry as GeometryChirho,
	DataTexture as TextureChirho,
	Float32BufferAttribute as AttributeChirho,
	RGBAFormat as FormatChirho,
	SRGBColorSpace as ColorSpaceChirho,
	DoubleSide as DoubleSideChirho
} from 'three';
import { WorldResourcesChirho, noiseChirho } from './world_resources_chirho';

/** Crossed, layered needle sprays give each tree a volumetric broken silhouette, at bounded cost. */
export function createFoliageChirho(resourcesChirho: WorldResourcesChirho) {
	const sizeChirho = 128;
	const pixelsChirho = new Uint8Array(sizeChirho * sizeChirho * 4);
	for (let rowChirho = 0; rowChirho < sizeChirho; rowChirho++) {
		for (let columnChirho = 0; columnChirho < sizeChirho; columnChirho++) {
			const yChirho = rowChirho / (sizeChirho - 1);
			const xChirho = Math.abs((columnChirho / (sizeChirho - 1)) * 2 - 1);
			const edgeChirho = Math.pow(1 - yChirho, 0.75) * (0.72 + Math.sin(yChirho * 83) * 0.2);
			const noiseValueChirho = noiseChirho(rowChirho * sizeChirho + columnChirho);
			const alphaChirho =
				(xChirho < edgeChirho && noiseValueChirho > 0.2) || (xChirho < 0.025 && yChirho < 0.95)
					? 255
					: 0;
			pixelsChirho.set(
				[
					22 + noiseValueChirho * 18,
					48 + noiseValueChirho * 32,
					32 + noiseValueChirho * 17,
					alphaChirho
				],
				(rowChirho * sizeChirho + columnChirho) * 4
			);
		}
	}
	const textureChirho = resourcesChirho.keepTextureChirho(
		new TextureChirho(pixelsChirho, sizeChirho, sizeChirho, FormatChirho)
	);
	textureChirho.colorSpace = ColorSpaceChirho;
	textureChirho.needsUpdate = true;
	const geometryChirho = resourcesChirho.geometryChirho('foliage-chirho', () => {
		const positionsChirho: number[] = [];
		const uvChirho: number[] = [];
		for (let layerChirho = 0; layerChirho < 6; layerChirho++) {
			const yChirho = 0.17 + layerChirho * 0.115;
			const widthChirho = 0.2 * (1 - layerChirho * 0.14);
			const heightChirho = 0.37 - layerChirho * 0.025;
			for (let planeChirho = 0; planeChirho < 3; planeChirho++) {
				const angleChirho = (planeChirho * Math.PI) / 3 + layerChirho * 0.35;
				for (const [xChirho, verticalChirho] of [
					[-1, 0],
					[1, 0],
					[1, 1],
					[-1, 0],
					[1, 1],
					[-1, 1]
				]) {
					positionsChirho.push(
						xChirho * widthChirho * Math.cos(angleChirho),
						yChirho + verticalChirho * heightChirho,
						xChirho * widthChirho * Math.sin(angleChirho)
					);
					uvChirho.push((xChirho + 1) / 2, verticalChirho);
				}
			}
		}
		const resultChirho = new GeometryChirho();
		resultChirho.setAttribute('position', new AttributeChirho(positionsChirho, 3));
		resultChirho.setAttribute('uv', new AttributeChirho(uvChirho, 2));
		resultChirho.computeVertexNormals();
		return resultChirho;
	});
	const materialChirho = resourcesChirho.materialChirho({
		map: textureChirho,
		alphaTest: 0.48,
		side: DoubleSideChirho,
		roughness: 0.98
	});
	return { geometry_chirho: geometryChirho, material_chirho: materialChirho };
}
