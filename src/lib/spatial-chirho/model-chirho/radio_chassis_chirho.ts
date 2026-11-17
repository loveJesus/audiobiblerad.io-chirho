// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import {
	ExtrudeGeometry as ExtrudeGeometryChirho,
	Shape as ShapeChirho,
	type BufferGeometry as GeometryChirho,
	type Material as MaterialChirho,
	type Mesh as MeshChirho
} from 'three';
import { buildBoomboxDetailsChirho } from './boombox_details_chirho';
import type { RadioMaterialsChirho } from './radio_materials_chirho';
import type { RadioThemeIdChirho } from '$lib/themes-chirho/themes_chirho';

type PositionChirho = readonly [number, number, number];
export interface ChassisKitChirho {
	roundedChirho(
		widthChirho: number,
		heightChirho: number,
		depthChirho: number,
		radiusChirho: number,
		materialChirho: MaterialChirho,
		positionChirho: PositionChirho
	): MeshChirho;
	meshChirho(
		geometryChirho: GeometryChirho,
		materialChirho: MaterialChirho,
		positionChirho: PositionChirho
	): MeshChirho;
	geometryChirho(keyChirho: string, makeChirho: () => GeometryChirho): GeometryChirho;
	cylinderChirho(radiusChirho: number, depthChirho: number): GeometryChirho;
	ringChirho(radiusChirho: number, tubeChirho: number): GeometryChirho;
}

/** Distinct case construction; the shared live control plane remains at z=0. See spatial_radio_workflow_chirho.md. */
export function buildRadioChassisChirho(
	themeChirho: RadioThemeIdChirho,
	widthChirho: number,
	heightChirho: number,
	depthChirho: number,
	paletteChirho: RadioMaterialsChirho,
	kitChirho: ChassisKitChirho
): void {
	const { roundedChirho, meshChirho, geometryChirho } = kitChirho;
	if (themeChirho === 'cyberpunk') {
		// A beveled octagonal wedge with projecting equipment wings, rather than a rounded box.
		const shapeChirho = new ShapeChirho();
		const cornerChirho = widthChirho * 0.12;
		const pointsChirho = [
			[-widthChirho / 2 + cornerChirho, -heightChirho / 2],
			[widthChirho / 2 - cornerChirho, -heightChirho / 2],
			[widthChirho / 2 + 15, -heightChirho / 2 + cornerChirho],
			[widthChirho / 2 + 15, heightChirho / 2 - cornerChirho],
			[widthChirho / 2 - cornerChirho, heightChirho / 2 + 10],
			[-widthChirho / 2 + cornerChirho, heightChirho / 2 + 10],
			[-widthChirho / 2 - 15, heightChirho / 2 - cornerChirho],
			[-widthChirho / 2 - 15, -heightChirho / 2 + cornerChirho]
		];
		pointsChirho.forEach(([xChirho, yChirho], indexChirho) => {
			if (indexChirho === 0) shapeChirho.moveTo(xChirho, yChirho);
			else shapeChirho.lineTo(xChirho, yChirho);
		});
		shapeChirho.closePath();
		meshChirho(
			geometryChirho(
				'cyber-chassis-chirho',
				() =>
					new ExtrudeGeometryChirho(shapeChirho, {
						depth: depthChirho,
						bevelEnabled: true,
						bevelSegments: 2,
						steps: 1,
						bevelSize: 6,
						bevelThickness: 6
					})
			),
			paletteChirho.shellChirho,
			[0, 0, -depthChirho - 12]
		);
		for (const sideChirho of [-1, 1]) {
			const wingChirho = roundedChirho(
				widthChirho * 0.15,
				heightChirho * 0.55,
				depthChirho * 0.8,
				6,
				paletteChirho.metalChirho,
				[sideChirho * widthChirho * 0.6, heightChirho * 0.04, -depthChirho * 0.58]
			);
			wingChirho.rotation.z = sideChirho * -0.16;
			for (let stripChirho = 0; stripChirho < 5; stripChirho++)
				roundedChirho(
					4,
					heightChirho * 0.35,
					3,
					1,
					stripChirho % 2 ? paletteChirho.accentChirho : paletteChirho.secondaryChirho,
					[
						sideChirho * (widthChirho * 0.56 + stripChirho * 8),
						heightChirho * 0.04,
						-depthChirho * 0.16
					]
				);
		}
	} else {
		roundedChirho(
			widthChirho,
			heightChirho,
			depthChirho,
			themeChirho === 'field' ? 5 : themeChirho === 'digital' ? 9 : 22,
			paletteChirho.shellChirho,
			[0, 0, -depthChirho / 2 - 8]
		);
	}
	roundedChirho(widthChirho - 10, heightChirho - 10, 5, 2, paletteChirho.rubberChirho, [0, 0, -7]);
	roundedChirho(widthChirho - 16, heightChirho - 16, 6, 2.7, paletteChirho.faceChirho, [0, 0, -4]);
	roundedChirho(widthChirho - 20, heightChirho - 20, 5, 2, paletteChirho.knobChirho, [
		0,
		0,
		-depthChirho - 8
	]);

	if (themeChirho === 'digital') {
		buildBoomboxDetailsChirho(widthChirho, heightChirho, depthChirho, paletteChirho, kitChirho);
	}

	if (themeChirho === 'field') {
		// Deep steel equipment case in a protective open cage, with side carrying handles.
		for (const sideChirho of [-1, 1]) {
			for (const verticalChirho of [-1, 1])
				roundedChirho(widthChirho + 35, 12, 16, 4, paletteChirho.metalChirho, [
					0,
					verticalChirho * (heightChirho / 2 + 10),
					sideChirho === 1 ? 7 : -depthChirho - 20
				]);
			for (const xChirho of [sideChirho * (widthChirho / 2 + 10)]) {
				roundedChirho(14, heightChirho + 30, 18, 4, paletteChirho.shellChirho, [
					xChirho,
					0,
					-depthChirho - 17
				]);
				for (const yChirho of [-heightChirho * 0.19, heightChirho * 0.19])
					roundedChirho(35, 12, depthChirho + 40, 4, paletteChirho.metalChirho, [
						xChirho,
						yChirho,
						-depthChirho / 2 - 7
					]);
				roundedChirho(14, heightChirho * 0.38, 18, 5, paletteChirho.rubberChirho, [
					sideChirho * (widthChirho / 2 + 33),
					0,
					-depthChirho * 0.22
				]);
			}
		}
	}
}
