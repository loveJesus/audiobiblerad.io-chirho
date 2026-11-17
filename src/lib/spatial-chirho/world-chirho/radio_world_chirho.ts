// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import {
	BoxGeometry as BoxGeometryChirho,
	BufferGeometry as GeometryChirho,
	CylinderGeometry as CylinderGeometryChirho,
	Float32BufferAttribute as AttributeChirho,
	LineBasicMaterial as LineMaterialChirho,
	LineSegments as LinesChirho,
	PlaneGeometry as PlaneGeometryChirho,
	type Group as GroupChirho
} from 'three';
import type { RadioThemeIdChirho } from '$lib/themes-chirho/themes_chirho';
import { buildNatureWorldChirho } from './nature_world_chirho';
import { WorldResourcesChirho, noiseChirho, type WorldPoseChirho } from './world_resources_chirho';

export interface RadioWorldChirho {
	group_chirho: GroupChirho;
	sky_chirho: string;
	fog_chirho: string;
	animated_chirho: boolean;
	updateChirho(secondsChirho: number): void;
	disposeChirho(): void;
}

function buildCityChirho(resourcesChirho: WorldResourcesChirho): void {
	const boxChirho = resourcesChirho.geometryChirho(
		'box-chirho',
		() => new BoxGeometryChirho(1, 1, 1)
	);
	const pavementChirho = resourcesChirho.materialChirho({
		color: '#182434',
		metalness: 0.45,
		roughness: 0.26
	});
	resourcesChirho.meshChirho(boxChirho, pavementChirho, {
		position_chirho: [0, -0.6, 0],
		scale_chirho: [260, 1, 260]
	});
	const concreteChirho = resourcesChirho.materialChirho({
		color: '#273447',
		metalness: 0.22,
		roughness: 0.75
	});
	const cyanChirho = resourcesChirho.materialChirho({
		color: '#52ddf3',
		emissive: '#22a9bf',
		emissiveIntensity: 2,
		roughness: 0.3
	});
	const pinkChirho = resourcesChirho.materialChirho({
		color: '#ed6ac5',
		emissive: '#bc317e',
		emissiveIntensity: 2,
		roughness: 0.3
	});
	const windowChirho = resourcesChirho.materialChirho({
		color: '#a6ccd5',
		emissive: '#5f8999',
		emissiveIntensity: 0.6,
		roughness: 0.3
	});
	const windowsChirho: WorldPoseChirho[] = [];
	const buildingsChirho: WorldPoseChirho[] = [];
	for (let indexChirho = 0; indexChirho < 24; indexChirho++) {
		const angleChirho = (indexChirho / 24) * Math.PI * 2;
		const radiusChirho = 90 + noiseChirho(indexChirho + 25) * 10;
		const xChirho = Math.cos(angleChirho) * radiusChirho;
		const zChirho = Math.sin(angleChirho) * radiusChirho;
		const heightChirho = 24 + noiseChirho(indexChirho + 25) * 34;
		const onXChirho = Math.abs(xChirho) > Math.abs(zChirho);
		const sideChirho = Math.sign(onXChirho ? xChirho : zChirho);
		buildingsChirho.push({
			position_chirho: [xChirho, heightChirho / 2 - 0.3, zChirho],
			scale_chirho: [12, heightChirho, 12]
		});
		for (let floorChirho = 1; floorChirho < Math.floor(heightChirho / 2.4); floorChirho++) {
			for (let columnChirho = -2; columnChirho <= 2; columnChirho++) {
				if (noiseChirho(indexChirho * 100 + floorChirho * 7 + columnChirho) < 0.35) continue;
				windowsChirho.push({
					position_chirho: onXChirho
						? [xChirho - sideChirho * 6.03, floorChirho * 2.4, zChirho + columnChirho * 1.8]
						: [xChirho + columnChirho * 1.8, floorChirho * 2.4, zChirho - sideChirho * 6.03],
					scale_chirho: onXChirho ? [0.05, 1.15, 0.85] : [0.85, 1.15, 0.05]
				});
			}
		}
		resourcesChirho.meshChirho(boxChirho, indexChirho % 2 ? cyanChirho : pinkChirho, {
			position_chirho: onXChirho
				? [xChirho - sideChirho * 6.1, 8, zChirho]
				: [xChirho, 8, zChirho - sideChirho * 6.1],
			scale_chirho: onXChirho ? [0.15, 10, 0.5] : [0.5, 10, 0.15]
		});
	}
	const postChirho = resourcesChirho.geometryChirho(
		'lamp-post-chirho',
		() => new CylinderGeometryChirho(0.055, 0.08, 1, 10)
	);
	for (const sideChirho of [-1, 1]) {
		for (const zChirho of [-14, 0, 14]) {
			resourcesChirho.meshChirho(postChirho, concreteChirho, {
				position_chirho: [sideChirho * 11, 3, zChirho],
				scale_chirho: [1, 6, 1]
			});
			resourcesChirho.meshChirho(boxChirho, sideChirho < 0 ? cyanChirho : pinkChirho, {
				position_chirho: [sideChirho * 10.4, 6, zChirho],
				scale_chirho: [1.4, 0.06, 0.12]
			});
		}
	}

	resourcesChirho.batchChirho(boxChirho, concreteChirho, buildingsChirho);
	resourcesChirho.batchChirho(boxChirho, windowChirho, windowsChirho);
	const seamsChirho: WorldPoseChirho[] = [];
	for (let indexChirho = -12; indexChirho <= 12; indexChirho++)
		seamsChirho.push({
			position_chirho: [0, -0.085, indexChirho * 2.5],
			scale_chirho: [22, 0.015, 0.025]
		});
	resourcesChirho.batchChirho(boxChirho, concreteChirho, seamsChirho);
	resourcesChirho.meshChirho(boxChirho, concreteChirho, {
		position_chirho: [0, -0.18, -0.8],
		scale_chirho: [9, 0.35, 4]
	});
	for (const sideChirho of [-1, 1]) {
		resourcesChirho.meshChirho(boxChirho, sideChirho < 0 ? cyanChirho : pinkChirho, {
			position_chirho: [sideChirho * 4.48, -0.05, -0.8],
			scale_chirho: [0.035, 0.08, 4]
		});
	}
}

/** Built only inside the lazy scene. Owns finite meshes, weather and complete teardown. */
export function createRadioWorldChirho(themeChirho: RadioThemeIdChirho): RadioWorldChirho {
	const resourcesChirho = new WorldResourcesChirho();
	resourcesChirho.groupChirho.name = 'radio-world-chirho';
	const natureChirho = themeChirho === 'field' || themeChirho === 'digital';
	if (natureChirho) buildNatureWorldChirho(resourcesChirho, themeChirho === 'digital');
	else if (themeChirho === 'cyberpunk') buildCityChirho(resourcesChirho);
	else {
		const floorChirho = resourcesChirho.geometryChirho(
			'floor-chirho',
			() => new CylinderGeometryChirho(55, 55, 1, 64)
		);
		resourcesChirho.meshChirho(
			floorChirho,
			resourcesChirho.materialChirho({ color: '#c2b6a1', roughness: 0.85 }),
			{ position_chirho: [0, -1.2, 0], scale_chirho: [1, 1, 1] }
		);
		resourcesChirho.meshChirho(
			resourcesChirho.geometryChirho(
				'table-chirho',
				() => new CylinderGeometryChirho(6.4, 6.4, 0.5, 64)
			),
			resourcesChirho.materialChirho({ color: '#ded4bf', roughness: 0.62 }),
			{ position_chirho: [0, -0.35, -0.7], scale_chirho: [1, 1, 0.75] }
		);
	}

	let waterChirho: PlaneGeometryChirho | undefined;
	if (themeChirho !== 'minimal') {
		const fjordChirho = themeChirho === 'digital';
		const cityChirho = themeChirho === 'cyberpunk';
		waterChirho = resourcesChirho.geometryChirho('water-chirho', () => {
			const geometryChirho = new PlaneGeometryChirho(
				cityChirho ? 5 : fjordChirho ? 190 : 14,
				cityChirho ? 32 : 220,
				32,
				56
			);
			geometryChirho.rotateX(-Math.PI / 2);
			return geometryChirho;
		}) as PlaneGeometryChirho;
		const meshChirho = resourcesChirho.meshChirho(
			waterChirho,
			resourcesChirho.materialChirho({
				color: cityChirho ? '#183346' : fjordChirho ? '#2b555d' : '#395c55',
				metalness: cityChirho ? 0.75 : 0.4,
				roughness: cityChirho ? 0.15 : 0.28
			}),
			{
				position_chirho: cityChirho
					? [6.7, -0.065, 0]
					: fjordChirho
						? [0, -0.3, -80]
						: [13, -0.3, 0],
				scale_chirho: [1, 1, 1]
			}
		);
		meshChirho.castShadow = false;
	}
	const rainPositionsChirho = new Float32Array(180 * 6);
	const rainGeometryChirho = resourcesChirho.geometryChirho(
		'rain-chirho',
		() => new GeometryChirho()
	);
	rainGeometryChirho.setAttribute('position', new AttributeChirho(rainPositionsChirho, 3));
	const rainChirho = new LinesChirho(
		rainGeometryChirho,
		resourcesChirho.keepMaterialChirho(
			new LineMaterialChirho({
				color: themeChirho === 'cyberpunk' ? '#91afcd' : '#b5ced0',
				transparent: true,
				opacity: 0.22,
				depthWrite: false
			})
		)
	);
	rainChirho.visible = themeChirho !== 'minimal';
	rainChirho.frustumCulled = false;
	resourcesChirho.groupChirho.add(rainChirho);
	let disposedChirho = false;
	return {
		group_chirho: resourcesChirho.groupChirho,
		sky_chirho:
			themeChirho === 'cyberpunk'
				? '#101524'
				: themeChirho === 'field'
					? '#89978d'
					: themeChirho === 'digital'
						? '#9cbbc3'
						: '#e2d8c6',
		fog_chirho:
			themeChirho === 'cyberpunk'
				? '#192437'
				: themeChirho === 'field'
					? '#89978d'
					: themeChirho === 'digital'
						? '#9cbbc3'
						: '#e2d8c6',
		animated_chirho: themeChirho !== 'minimal',
		updateChirho(secondsChirho) {
			if (disposedChirho || !Number.isFinite(secondsChirho)) return;
			if (waterChirho) {
				const positionsChirho = waterChirho.attributes.position;
				for (let indexChirho = 0; indexChirho < positionsChirho.count; indexChirho++) {
					const xChirho = positionsChirho.getX(indexChirho);
					const zChirho = positionsChirho.getZ(indexChirho);
					positionsChirho.setY(
						indexChirho,
						Math.sin(xChirho * 1.4 + secondsChirho) *
							Math.cos(zChirho * 0.8 - secondsChirho * 0.7) *
							0.025
					);
				}
				positionsChirho.needsUpdate = true;
				waterChirho.computeVertexNormals();
			}
			for (let indexChirho = 0; indexChirho < 180; indexChirho++) {
				const xChirho = (noiseChirho(indexChirho + 450) - 0.5) * 36;
				const yChirho = 16 - ((secondsChirho * 9 + noiseChirho(indexChirho + 650) * 18) % 18);
				const zChirho = (noiseChirho(indexChirho + 750) - 0.5) * 36;
				rainPositionsChirho.set(
					[xChirho, yChirho, zChirho, xChirho + 0.04, yChirho + 0.55, zChirho - 0.02],
					indexChirho * 6
				);
			}
			rainGeometryChirho.attributes.position.needsUpdate = true;
		},
		disposeChirho() {
			if (disposedChirho) return;
			disposedChirho = true;
			resourcesChirho.disposeChirho();
		}
	};
}
