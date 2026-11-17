// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import {
	BoxGeometry as BoxGeometryChirho,
	Color as ColorChirho,
	CylinderGeometry as CylinderGeometryChirho,
	Float32BufferAttribute as AttributeChirho,
	IcosahedronGeometry as RockGeometryChirho,
	PlaneGeometry as PlaneGeometryChirho,
	DataTexture as TextureChirho,
	RGBAFormat as FormatChirho,
	RepeatWrapping as RepeatChirho
} from 'three';
import { WorldResourcesChirho, noiseChirho, type WorldPoseChirho } from './world_resources_chirho';
import { createFoliageChirho } from './foliage_chirho';

function grainChirho(resourcesChirho: WorldResourcesChirho, repeatsChirho: number) {
	const pixelsChirho = new Uint8Array(64 * 64 * 4);
	for (let indexChirho = 0; indexChirho < 64 * 64; indexChirho++) {
		const valueChirho = 65 + noiseChirho(indexChirho) * 140;
		pixelsChirho.set([valueChirho, valueChirho, valueChirho, 255], indexChirho * 4);
	}
	const textureChirho = resourcesChirho.keepTextureChirho(
		new TextureChirho(pixelsChirho, 64, 64, FormatChirho)
	);
	textureChirho.wrapS = textureChirho.wrapT = RepeatChirho;
	textureChirho.repeat.set(repeatsChirho, repeatsChirho);
	textureChirho.needsUpdate = true;
	return textureChirho;
}

/** Real bank, water, rocks, trees and distant relief create parallax on every side of the radio. */
export function buildNatureWorldChirho(
	resourcesChirho: WorldResourcesChirho,
	fjordChirho: boolean
): void {
	const rockChirho = resourcesChirho.geometryChirho(
		'rock-chirho',
		() => new RockGeometryChirho(1, 2)
	);
	const boxChirho = resourcesChirho.geometryChirho(
		'box-chirho',
		() => new BoxGeometryChirho(1, 1, 1)
	);
	const stoneChirho = resourcesChirho.materialChirho({
		color: fjordChirho ? '#637273' : '#676c62',
		roughness: 0.94,
		bumpMap: grainChirho(resourcesChirho, 2),
		bumpScale: 0.04
	});
	const darkStoneChirho = resourcesChirho.materialChirho({ color: '#343e3a', roughness: 0.85 });
	const mossChirho = resourcesChirho.materialChirho({ color: '#3b4932', roughness: 1 });
	const groundChirho = resourcesChirho.geometryChirho('bank-chirho', () => {
		const geometryChirho = new PlaneGeometryChirho(220, 220, 40, 40);
		geometryChirho.rotateX(-Math.PI / 2);
		const positionsChirho = geometryChirho.attributes.position;
		const colorsChirho: number[] = [];
		for (let indexChirho = 0; indexChirho < positionsChirho.count; indexChirho++) {
			const xChirho = positionsChirho.getX(indexChirho);
			const zChirho = positionsChirho.getZ(indexChirho);
			const shoreChirho = fjordChirho ? Math.abs(zChirho + 50) : Math.abs(xChirho - 13);
			const depthChirho = shoreChirho < (fjordChirho ? 50 : 7) ? -1.5 : -0.4;
			const heightChirho = depthChirho + Math.sin(xChirho * 0.38) * Math.cos(zChirho * 0.2) * 0.14;
			positionsChirho.setY(indexChirho, heightChirho);
			const colorChirho = new ColorChirho().setHSL(
				fjordChirho ? 0.18 : 0.23,
				0.09 + noiseChirho(indexChirho) * 0.1,
				0.19 + noiseChirho(indexChirho + 7) * 0.09
			);
			colorChirho.convertSRGBToLinear();
			colorsChirho.push(colorChirho.r, colorChirho.g, colorChirho.b);
		}
		geometryChirho.setAttribute('color', new AttributeChirho(colorsChirho, 3));
		geometryChirho.computeVertexNormals();
		return geometryChirho;
	});
	resourcesChirho.meshChirho(
		groundChirho,
		resourcesChirho.materialChirho({
			vertexColors: true,
			roughness: 0.97,
			bumpMap: grainChirho(resourcesChirho, 48),
			bumpScale: 0.09
		}),
		{ position_chirho: [0, 0, 0], scale_chirho: [1, 1, 1] }
	);
	const rocksChirho: WorldPoseChirho[] = [];
	const greenRocksChirho: WorldPoseChirho[] = [];
	for (let indexChirho = 0; indexChirho < 75; indexChirho++) {
		const alongChirho = (noiseChirho(indexChirho * 5 + 1) - 0.5) * 72;
		const xChirho = fjordChirho
			? alongChirho
			: (indexChirho % 2 ? 4.8 : 20.5) + noiseChirho(indexChirho + 2) * 3;
		const zChirho = fjordChirho ? -7 - noiseChirho(indexChirho + 4) * 4 : alongChirho;
		const radiusChirho = 0.25 + noiseChirho(indexChirho + 12) * 1.15;
		const poseChirho: WorldPoseChirho = {
			position_chirho: [xChirho, -0.25, zChirho],
			scale_chirho: [radiusChirho * 1.35, radiusChirho * 0.7, radiusChirho],
			rotation_chirho: [noiseChirho(indexChirho) * 0.6, noiseChirho(indexChirho + 1) * 6, 0.2]
		};
		(indexChirho % 4 ? rocksChirho : greenRocksChirho).push(poseChirho);
	}
	// Near stones break the foreground; the radio's own support remains unobstructed.
	for (let indexChirho = 0; indexChirho < 20; indexChirho++) {
		const xChirho = -10 + noiseChirho(indexChirho + 200) * 13;
		const zChirho = 5 + noiseChirho(indexChirho + 250) * 17;
		const radiusChirho = 0.15 + noiseChirho(indexChirho + 300) * 0.55;
		rocksChirho.push({
			position_chirho: [xChirho, -0.25, zChirho],
			scale_chirho: [radiusChirho, radiusChirho * 0.6, radiusChirho * 1.5]
		});
	}
	resourcesChirho.batchChirho(rockChirho, stoneChirho, rocksChirho);
	resourcesChirho.batchChirho(rockChirho, mossChirho, greenRocksChirho);

	const trunksChirho: WorldPoseChirho[] = [];
	const crownsChirho: WorldPoseChirho[] = [];
	for (let indexChirho = 0; indexChirho < 66; indexChirho++) {
		// Keep the supported camera orbit clear of tall scenery on every side.
		const angleChirho = (indexChirho / 66) * Math.PI * 2;
		const radiusChirho = 88 + noiseChirho(indexChirho + 10) * 14;
		const xChirho = Math.cos(angleChirho) * radiusChirho;
		const zChirho = Math.sin(angleChirho) * radiusChirho;
		const heightChirho = 18 + noiseChirho(indexChirho + 40) * 19;
		trunksChirho.push({
			position_chirho: [xChirho, heightChirho / 2 - 0.5, zChirho],
			scale_chirho: [0.18, heightChirho, 0.18]
		});
		crownsChirho.push({
			position_chirho: [xChirho, -0.5, zChirho],
			scale_chirho: [heightChirho, heightChirho, heightChirho],
			rotation_chirho: [0, indexChirho * 0.7, 0]
		});
	}
	resourcesChirho.batchChirho(
		resourcesChirho.geometryChirho('trunk-chirho', () => new CylinderGeometryChirho(0.7, 1, 1, 7)),
		resourcesChirho.materialChirho({ color: '#3a342b', roughness: 1 }),
		trunksChirho
	);
	const foliageChirho = createFoliageChirho(resourcesChirho);
	resourcesChirho.batchChirho(
		foliageChirho.geometry_chirho,
		foliageChirho.material_chirho,
		crownsChirho
	);

	const hillsChirho: WorldPoseChirho[] = [];
	for (let indexChirho = 0; indexChirho < 15; indexChirho++) {
		const angleChirho = (indexChirho / 15) * Math.PI * 2;
		const radiusChirho = 125 + noiseChirho(indexChirho + 80) * 10;
		hillsChirho.push({
			position_chirho: [
				Math.cos(angleChirho) * radiusChirho,
				-1,
				Math.sin(angleChirho) * radiusChirho
			],
			scale_chirho: [
				25 + noiseChirho(indexChirho) * 15,
				(fjordChirho ? 40 : 18) + noiseChirho(indexChirho + 15) * 14,
				25
			],
			rotation_chirho: [0, angleChirho, 0]
		});
	}
	resourcesChirho.batchChirho(rockChirho, darkStoneChirho, hillsChirho);
	if (fjordChirho) {
		const woodChirho = resourcesChirho.materialChirho({ color: '#594c3a', roughness: 0.85 });
		const planksChirho: WorldPoseChirho[] = [];
		for (let indexChirho = 0; indexChirho < 22; indexChirho++)
			planksChirho.push({
				position_chirho: [0, -0.07, (indexChirho - 12) * 0.46],
				scale_chirho: [13, 0.3, 0.42]
			});
		resourcesChirho.batchChirho(boxChirho, woodChirho, planksChirho);
		resourcesChirho.batchChirho(
			boxChirho,
			darkStoneChirho,
			[-1, 1].map((sideChirho) => ({
				position_chirho: [sideChirho * 5.8, -0.8, -2],
				scale_chirho: [0.35, 2, 12]
			}))
		);
	} else {
		resourcesChirho.meshChirho(rockChirho, stoneChirho, {
			position_chirho: [0, -0.55, -0.8],
			scale_chirho: [4.7, 0.55, 3.2]
		});
	}
}
