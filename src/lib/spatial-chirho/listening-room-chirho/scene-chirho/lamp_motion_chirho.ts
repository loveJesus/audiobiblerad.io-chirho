// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import * as ThreeChirho from 'three';
import { MarchingCubes as WaxFieldChirho } from 'three/addons/objects/MarchingCubes.js';
export interface LavaMotionChirho {
	updateChirho(secondsChirho: number): void;
	disposeChirho(): void;
	readonly vertices_chirho: number;
	readonly phase_chirho: number;
}
/** Fixed voxel/poly budget; no new geometry, timers or resource growth per frame. */
export function createLavaMotionChirho(
	sceneChirho: ThreeChirho.Scene,
	assetChirho: ThreeChirho.Object3D
): LavaMotionChirho {
	assetChirho.updateMatrixWorld(true);
	const glassChirho = assetChirho.getObjectByName('lava_lamp_glass_chirho');
	if (!glassChirho) throw new Error('The room has no lava lamp vessel');
	const boundsChirho = new ThreeChirho.Box3().setFromObject(glassChirho);
	const sizeChirho = boundsChirho.getSize(new ThreeChirho.Vector3());
	const centerChirho = boundsChirho.getCenter(new ThreeChirho.Vector3());
	const anchorChirho = assetChirho.getObjectByName('lava_interior_chirho');
	if (anchorChirho) anchorChirho.getWorldPosition(centerChirho);
	const heightChirho = Number(anchorChirho?.userData.height_world_chirho) || sizeChirho.y * 0.84;
	const maxRadiusChirho =
		(Number(anchorChirho?.userData.maximum_radius_world_chirho) || sizeChirho.x * 0.5) * 0.94;
	const anchorScaleChirho =
		anchorChirho?.getWorldScale(new ThreeChirho.Vector3()) ?? new ThreeChirho.Vector3(1, 1, 1);
	const rawProfileChirho: number[] = Array.isArray(
		anchorChirho?.userData.profile_anchor_local_chirho
	)
		? anchorChirho!.userData.profile_anchor_local_chirho
		: [];
	const profileChirho = rawProfileChirho.map(
		(valueChirho, indexChirho) =>
			valueChirho * (indexChirho % 2 ? anchorScaleChirho.x : anchorScaleChirho.y)
	);
	const radiusAtChirho = (localYChirho: number): number => {
		for (let indexChirho = 0; indexChirho + 3 < profileChirho.length; indexChirho += 2) {
			const lowYChirho = profileChirho[indexChirho],
				highYChirho = profileChirho[indexChirho + 2];
			if (localYChirho >= lowYChirho && localYChirho <= highYChirho) {
				const fractionChirho = (localYChirho - lowYChirho) / (highYChirho - lowYChirho);
				return Math.max(
					0.025,
					profileChirho[indexChirho + 1] +
						fractionChirho * (profileChirho[indexChirho + 3] - profileChirho[indexChirho + 1]) -
						0.018 * anchorScaleChirho.x
				);
			}
		}
		const fractionChirho = ThreeChirho.MathUtils.clamp(localYChirho / heightChirho + 0.5, 0, 1);
		return maxRadiusChirho * (1 - 0.62 * fractionChirho);
	};
	assetChirho.getObjectByName('lamp_wax_chirho')?.traverse((objectChirho) => {
		if (objectChirho instanceof ThreeChirho.Mesh) objectChirho.visible = false;
	});
	const materialChirho = new ThreeChirho.MeshPhysicalMaterial({
		color: '#ff5a36',
		emissive: '#ff351b',
		emissiveIntensity: 1.0,
		roughness: 0.3,
		metalness: 0,
		clearcoat: 0.25,
		clearcoatRoughness: 0.2
	});
	const fieldChirho = new WaxFieldChirho(24, materialChirho, false, false, 8000);
	fieldChirho.name = 'live_lava_wax_chirho';
	fieldChirho.isolation = 65;
	fieldChirho.position.copy(centerChirho);
	fieldChirho.scale.set(maxRadiusChirho, heightChirho * 0.5, maxRadiusChirho);
	fieldChirho.frustumCulled = false;
	sceneChirho.add(fieldChirho);
	const canvasChirho = document.createElement('canvas');
	canvasChirho.width = canvasChirho.height = 64;
	const contextChirho = canvasChirho.getContext('2d')!;
	const gradientChirho = contextChirho.createRadialGradient(32, 32, 1, 32, 32, 32);
	gradientChirho.addColorStop(0, 'rgba(255,130,65,.65)');
	gradientChirho.addColorStop(0.3, 'rgba(255,70,25,.28)');
	gradientChirho.addColorStop(1, 'rgba(255,40,12,0)');
	contextChirho.fillStyle = gradientChirho;
	contextChirho.fillRect(0, 0, 64, 64);
	const textureChirho = new ThreeChirho.CanvasTexture(canvasChirho);
	textureChirho.colorSpace = ThreeChirho.SRGBColorSpace;
	const glowMaterialChirho = new ThreeChirho.SpriteMaterial({
		map: textureChirho,
		transparent: true,
		opacity: 0.55,
		blending: ThreeChirho.AdditiveBlending,
		depthWrite: false
	});
	const glowChirho = new ThreeChirho.Sprite(glowMaterialChirho);
	glowChirho.name = 'lava_glow_chirho';
	glowChirho.position.copy(centerChirho);
	glowChirho.scale.set(maxRadiusChirho * 4, heightChirho * 1.25, 1);
	sceneChirho.add(glowChirho);
	let lightChirho: ThreeChirho.PointLight | undefined;
	assetChirho.traverse((objectChirho) => {
		if (objectChirho instanceof ThreeChirho.PointLight && objectChirho.name.includes('lava'))
			lightChirho = objectChirho;
	});
	const ownsLightChirho = !lightChirho;
	if (!lightChirho) {
		lightChirho = new ThreeChirho.PointLight('#ff4a20', 18, 6, 2);
		sceneChirho.add(lightChirho);
	}
	lightChirho.color.set('#ff4a20');
	lightChirho.intensity = 18;
	lightChirho.distance = 6;
	const localLightPositionChirho = centerChirho.clone();
	lightChirho.parent?.worldToLocal(localLightPositionChirho);
	lightChirho.position.copy(localLightPositionChirho);
	let phaseChirho = 0;
	let disposedChirho = false;
	const updateChirho = (secondsChirho: number) => {
		if (disposedChirho) return;
		phaseChirho = secondsChirho / 19;
		const liftChirho = 0.5 - 0.5 * Math.cos(phaseChirho * Math.PI * 2);
		fieldChirho.reset();
		fieldChirho.addBall(0.5, 0.095, 0.5, 1.15, 12);
		fieldChirho.addBall(
			0.5 + 0.055 * Math.sin(phaseChirho * 4),
			0.22 + 0.55 * liftChirho,
			0.5,
			0.95 - 0.2 * liftChirho,
			12
		);
		fieldChirho.addBall(
			0.5 - 0.075 * Math.sin(phaseChirho * 3),
			0.75 - 0.4 * liftChirho,
			0.5,
			0.65,
			12
		);
		fieldChirho.update();
		const positionsChirho = fieldChirho.geometry.getAttribute(
			'position'
		) as ThreeChirho.BufferAttribute;
		const normalsChirho = fieldChirho.geometry.getAttribute(
			'normal'
		) as ThreeChirho.BufferAttribute;
		const normalChirho = new ThreeChirho.Vector3();
		for (let indexChirho = 0; indexChirho < fieldChirho.count; indexChirho++) {
			let xChirho = positionsChirho.getX(indexChirho) * 2.4,
				zChirho = positionsChirho.getZ(indexChirho) * 2.4;
			const yChirho = positionsChirho.getY(indexChirho);
			const radiusChirho = radiusAtChirho(yChirho * heightChirho * 0.5) * 0.94;
			const distanceChirho = Math.hypot(xChirho, zChirho);
			if (distanceChirho > 0.94) {
				xChirho *= 0.94 / distanceChirho;
				zChirho *= 0.94 / distanceChirho;
			}
			// Keep the field's smooth gradient normals after radial shaping.
			const radialScaleChirho = (2.4 * radiusChirho) / maxRadiusChirho;
			normalChirho
				.set(
					normalsChirho.getX(indexChirho) / radialScaleChirho,
					normalsChirho.getY(indexChirho),
					normalsChirho.getZ(indexChirho) / radialScaleChirho
				)
				.normalize();
			normalsChirho.setXYZ(indexChirho, normalChirho.x, normalChirho.y, normalChirho.z);
			positionsChirho.setXYZ(
				indexChirho,
				(xChirho * radiusChirho) / maxRadiusChirho,
				yChirho,
				(zChirho * radiusChirho) / maxRadiusChirho
			);
		}
		positionsChirho.needsUpdate = true;
		normalsChirho.needsUpdate = true;
	};
	updateChirho(2);
	return {
		updateChirho,
		get vertices_chirho() {
			return fieldChirho.count;
		},
		get phase_chirho() {
			return phaseChirho;
		},
		disposeChirho() {
			if (disposedChirho) return;
			disposedChirho = true;
			sceneChirho.remove(fieldChirho, glowChirho);
			if (ownsLightChirho && lightChirho) sceneChirho.remove(lightChirho);
			fieldChirho.geometry.dispose();
			materialChirho.dispose();
			glowMaterialChirho.dispose();
			textureChirho.dispose();
		}
	};
}
