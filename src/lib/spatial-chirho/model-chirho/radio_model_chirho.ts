// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import {
	BoxGeometry as BoxGeometryChirho,
	BufferGeometry as BufferGeometryChirho,
	CylinderGeometry as CylinderGeometryChirho,
	Group as GroupChirho,
	InstancedMesh as InstancedMeshChirho,
	LatheGeometry as LatheGeometryChirho,
	Mesh as MeshChirho,
	Object3D as Object3DChirho,
	TorusGeometry as TorusGeometryChirho,
	Vector2 as Vector2Chirho,
	type Material as MaterialChirho
} from 'three';
import { RoundedBoxGeometry as RoundedBoxGeometryChirho } from 'three/addons/geometries/RoundedBoxGeometry.js';
import type {
	RadioModelChirho,
	RadioModelOptionsChirho,
	SurfaceRectChirho
} from '../model_contract_chirho';
import { createRadioMaterialsChirho, type RadioMaterialsChirho } from './radio_materials_chirho';
import { buildRadioChassisChirho } from './radio_chassis_chirho';

type PositionChirho = readonly [number, number, number];
interface InstancePoseChirho {
	position_chirho: PositionChirho;
	scale_chirho?: PositionChirho;
	rotation_chirho?: PositionChirho;
}

/**
 * Physical receiver in face-pixel coordinates. Angles follow the native controls' clockwise
 * degree convention. See spec-chirho/workflows-chirho/experience-chirho/spatial_radio_workflow_chirho.md.
 */
export function createRadioModelChirho(
	optionsChirho: RadioModelOptionsChirho,
	sharedMaterialsChirho?: RadioMaterialsChirho
): RadioModelChirho {
	const groupChirho = new GroupChirho();
	groupChirho.name = 'radio-model-chirho';
	const widthChirho = Math.max(200, optionsChirho.width_chirho);
	const heightChirho = Math.max(200, optionsChirho.height_chirho);
	const fieldChirho = optionsChirho.theme_chirho === 'field';
	const cyberChirho = optionsChirho.theme_chirho === 'cyberpunk';
	const minimalChirho = optionsChirho.theme_chirho === 'minimal';
	const depthChirho =
		widthChirho * (fieldChirho ? 0.45 : minimalChirho ? 0.18 : cyberChirho ? 0.35 : 0.3);
	// A scene keeps one palette while layout changes; only standalone models own their palette.
	const paletteChirho =
		sharedMaterialsChirho ?? createRadioMaterialsChirho(optionsChirho.theme_chirho);
	const geometriesChirho = new Map<string, BufferGeometryChirho>();
	const instancesChirho: InstancedMeshChirho[] = [];
	let disposedChirho = false;

	function geometryChirho(
		keyChirho: string,
		makeChirho: () => BufferGeometryChirho
	): BufferGeometryChirho {
		let resultChirho = geometriesChirho.get(keyChirho);
		if (!resultChirho) {
			resultChirho = makeChirho();
			geometriesChirho.set(keyChirho, resultChirho);
		}
		return resultChirho;
	}

	function meshChirho(
		geometryValueChirho: BufferGeometryChirho,
		materialChirho: MaterialChirho,
		positionChirho: PositionChirho,
		parentChirho: GroupChirho = groupChirho
	): MeshChirho {
		const resultChirho = new MeshChirho(geometryValueChirho, materialChirho);
		resultChirho.position.set(...positionChirho);
		resultChirho.castShadow = true;
		resultChirho.receiveShadow = true;
		parentChirho.add(resultChirho);
		return resultChirho;
	}

	function roundedChirho(
		widthValueChirho: number,
		heightValueChirho: number,
		depthValueChirho: number,
		radiusChirho: number,
		materialChirho: MaterialChirho,
		positionChirho: PositionChirho,
		parentChirho: GroupChirho = groupChirho
	): MeshChirho {
		const boundedRadiusChirho = Math.max(
			0.05,
			Math.min(radiusChirho, widthValueChirho / 2, heightValueChirho / 2, depthValueChirho / 2)
		);
		return meshChirho(
			geometryChirho(
				`round-chirho:${widthValueChirho}:${heightValueChirho}:${depthValueChirho}:${boundedRadiusChirho}`,
				() =>
					new RoundedBoxGeometryChirho(
						widthValueChirho,
						heightValueChirho,
						depthValueChirho,
						2,
						boundedRadiusChirho
					)
			),
			materialChirho,
			positionChirho,
			parentChirho
		);
	}

	function cylinderChirho(radiusChirho: number, depthValueChirho: number): BufferGeometryChirho {
		return geometryChirho(`cylinder-chirho:${radiusChirho}:${depthValueChirho}`, () => {
			const resultChirho = new CylinderGeometryChirho(
				radiusChirho,
				radiusChirho,
				depthValueChirho,
				48
			);
			resultChirho.rotateX(Math.PI / 2);
			return resultChirho;
		});
	}

	function ringChirho(radiusChirho: number, tubeChirho: number): BufferGeometryChirho {
		return geometryChirho(
			`ring-chirho:${radiusChirho}:${tubeChirho}`,
			() => new TorusGeometryChirho(radiusChirho, tubeChirho, 6, 48)
		);
	}

	function knobCapChirho(radiusChirho: number): BufferGeometryChirho {
		return geometryChirho(`knob-cap-chirho:${radiusChirho}`, () => {
			const profileChirho = [
				[0, 0],
				[0.85, 0],
				[0.97, 0.7],
				[1, 1.5],
				[0.97, 2.7],
				[0.9, 3.6],
				[0.72, 4.15],
				[0.35, 4.5],
				[0, 4.6]
			];
			const resultChirho = new LatheGeometryChirho(
				profileChirho.map(
					([radiusPartChirho, depthPartChirho]) =>
						new Vector2Chirho(radiusPartChirho * radiusChirho, depthPartChirho)
				),
				48
			);
			resultChirho.rotateX(Math.PI / 2);
			return resultChirho;
		});
	}

	function repeatChirho(
		geometryValueChirho: BufferGeometryChirho,
		materialChirho: MaterialChirho,
		posesChirho: InstancePoseChirho[],
		parentChirho: GroupChirho = groupChirho
	): void {
		if (!posesChirho.length) return;
		const resultChirho = new InstancedMeshChirho(
			geometryValueChirho,
			materialChirho,
			posesChirho.length
		);
		const transformChirho = new Object3DChirho();
		for (const [indexChirho, poseChirho] of posesChirho.entries()) {
			transformChirho.position.set(...poseChirho.position_chirho);
			transformChirho.scale.set(...(poseChirho.scale_chirho ?? [1, 1, 1]));
			transformChirho.rotation.set(...(poseChirho.rotation_chirho ?? [0, 0, 0]));
			transformChirho.updateMatrix();
			resultChirho.setMatrixAt(indexChirho, transformChirho.matrix);
		}
		resultChirho.instanceMatrix.needsUpdate = true;
		resultChirho.castShadow = true;
		resultChirho.receiveShadow = true;
		parentChirho.add(resultChirho);
		instancesChirho.push(resultChirho);
	}

	const unitBoxChirho = geometryChirho('unit-box-chirho', () => new BoxGeometryChirho(1, 1, 1));
	function centerChirho(rectChirho: SurfaceRectChirho): [number, number] {
		return [
			rectChirho.x_chirho + rectChirho.width_chirho / 2 - widthChirho / 2,
			heightChirho / 2 - rectChirho.y_chirho - rectChirho.height_chirho / 2
		];
	}

	buildRadioChassisChirho(
		optionsChirho.theme_chirho,
		widthChirho,
		heightChirho,
		depthChirho,
		paletteChirho,
		{
			roundedChirho,
			meshChirho,
			geometryChirho,
			cylinderChirho,
			ringChirho
		}
	);

	// The case seam remains visible from either side, even at grazing camera angles.
	for (const sideChirho of [-1, 1]) {
		roundedChirho(5, heightChirho - 32, 4, 1.5, paletteChirho.metalChirho, [
			sideChirho * (widthChirho / 2 - 3),
			0,
			-depthChirho * 0.79
		]);
	}

	const screwsChirho: InstancePoseChirho[] = [];
	const slotsChirho: InstancePoseChirho[] = [];
	for (const sideChirho of [-1, 1]) {
		for (const verticalChirho of [-1, 1]) {
			const xChirho = sideChirho * (widthChirho / 2 - 17);
			const yChirho = verticalChirho * (heightChirho / 2 - 17);
			for (const rearChirho of optionsChirho.theme_chirho === 'digital' ? [] : [false, true]) {
				const zChirho = rearChirho ? -depthChirho - 11.4 : 0;
				screwsChirho.push({ position_chirho: [xChirho, yChirho, zChirho] });
				slotsChirho.push({
					position_chirho: [xChirho, yChirho, zChirho + (rearChirho ? -1.1 : 1.1)],
					scale_chirho: [5, 0.9, 0.3],
					rotation_chirho: [0, 0, sideChirho * verticalChirho * 0.45]
				});
			}
		}
	}
	repeatChirho(cylinderChirho(fieldChirho ? 4.4 : 3.4, 2), paletteChirho.metalChirho, screwsChirho);
	repeatChirho(unitBoxChirho, paletteChirho.cavityChirho, slotsChirho);

	if (fieldChirho) {
		// Small chips occur at exposed edges only; the control legends keep a quiet painted field.
		const chipsChirho: InstancePoseChirho[] = [];
		for (const sideChirho of [-1, 1]) {
			for (let indexChirho = 0; indexChirho < 16; indexChirho += 1) {
				const fractionChirho = ((indexChirho * 47 + 13) % 101) / 101;
				chipsChirho.push({
					position_chirho: [
						sideChirho * (widthChirho / 2 - 10.5),
						(fractionChirho - 0.5) * (heightChirho - 38),
						-0.8
					],
					scale_chirho: [0.65 + (indexChirho % 3) * 0.3, 1.5 + (indexChirho % 5) * 1.25, 0.18],
					rotation_chirho: [0, 0, ((indexChirho % 3) - 1) * 0.17]
				});
			}
		}
		repeatChirho(unitBoxChirho, paletteChirho.metalChirho, chipsChirho);
	}

	function frameChirho(rectChirho: SurfaceRectChirho, screenChirho: boolean): void {
		const [xChirho, yChirho] = centerChirho(rectChirho);
		roundedChirho(
			rectChirho.width_chirho + 9,
			rectChirho.height_chirho + 9,
			7,
			3,
			paletteChirho.metalChirho,
			[xChirho, yChirho, -0.7]
		);
		roundedChirho(
			rectChirho.width_chirho + 4,
			rectChirho.height_chirho + 4,
			4,
			1.8,
			paletteChirho.rubberChirho,
			[xChirho, yChirho, 1]
		);
		roundedChirho(
			rectChirho.width_chirho - 2,
			rectChirho.height_chirho - 2,
			2,
			0.8,
			screenChirho ? paletteChirho.screenChirho : paletteChirho.cavityChirho,
			[xChirho, yChirho, 2.3]
		);
		// A real bevel around the glass, with a restrained colored lower lip.
		roundedChirho(
			Math.max(4, rectChirho.width_chirho - 20),
			1.3,
			1.4,
			0.5,
			paletteChirho.accentChirho,
			[xChirho, yChirho - rectChirho.height_chirho / 2 + 1, 3]
		);
	}
	frameChirho(optionsChirho.display_chirho, true);
	frameChirho(optionsChirho.dial_chirho, false);

	// The measured speaker anchor avoids guessing where live status and publisher credits end.
	if (optionsChirho.speaker_chirho) {
		const speakerChirho = optionsChirho.speaker_chirho;
		const [speakerXChirho, speakerYChirho] = centerChirho(speakerChirho);
		roundedChirho(
			speakerChirho.width_chirho + 4,
			speakerChirho.height_chirho + 4,
			4,
			1.6,
			paletteChirho.metalChirho,
			[speakerXChirho, speakerYChirho, -0.5]
		);
		roundedChirho(
			speakerChirho.width_chirho,
			speakerChirho.height_chirho,
			3,
			1.2,
			paletteChirho.cavityChirho,
			[speakerXChirho, speakerYChirho, 1]
		);
		const wiresChirho: InstancePoseChirho[] = [];
		const columnsChirho = Math.max(1, Math.min(160, Math.floor(speakerChirho.width_chirho / 5)));
		const rowsChirho = Math.max(1, Math.min(40, Math.floor(speakerChirho.height_chirho / 5)));
		for (let columnChirho = 0; columnChirho <= columnsChirho; columnChirho += 1) {
			wiresChirho.push({
				position_chirho: [
					speakerXChirho + (columnChirho / columnsChirho - 0.5) * (speakerChirho.width_chirho - 3),
					speakerYChirho,
					3.3
				],
				scale_chirho: [0.9, speakerChirho.height_chirho - 2, 1.4]
			});
		}
		for (let rowChirho = 0; rowChirho <= rowsChirho; rowChirho += 1) {
			wiresChirho.push({
				position_chirho: [
					speakerXChirho,
					speakerYChirho + (rowChirho / rowsChirho - 0.5) * (speakerChirho.height_chirho - 3),
					3.7
				],
				scale_chirho: [speakerChirho.width_chirho - 2, 1, 1.4]
			});
		}
		repeatChirho(
			unitBoxChirho,
			fieldChirho ? paletteChirho.shellChirho : paletteChirho.metalChirho,
			wiresChirho
		);
	}

	function knobChirho(rectChirho: SurfaceRectChirho, nameChirho: string): GroupChirho {
		const [xChirho, yChirho] = centerChirho(rectChirho);
		const radiusChirho = Math.min(rectChirho.width_chirho, rectChirho.height_chirho) / 2;
		meshChirho(cylinderChirho(radiusChirho + 5, 3), paletteChirho.rubberChirho, [
			xChirho,
			yChirho,
			0.8
		]);
		meshChirho(ringChirho(radiusChirho + 3, 1.2), paletteChirho.metalChirho, [xChirho, yChirho, 3]);
		const rotorChirho = new GroupChirho();
		rotorChirho.name = nameChirho;
		rotorChirho.position.set(xChirho, yChirho, 0);
		groupChirho.add(rotorChirho);
		meshChirho(
			cylinderChirho(radiusChirho * 0.94, 20),
			paletteChirho.knobChirho,
			[0, 0, 12],
			rotorChirho
		);
		meshChirho(
			ringChirho(radiusChirho * 0.91, fieldChirho ? 1.25 : 2.1),
			paletteChirho.metalChirho,
			[0, 0, 23],
			rotorChirho
		);
		meshChirho(
			knobCapChirho(radiusChirho * 0.88),
			paletteChirho.knobChirho,
			[0, 0, 22],
			rotorChirho
		);
		meshChirho(
			cylinderChirho(radiusChirho * 0.72, optionsChirho.theme_chirho === 'digital' ? 1.6 : 0.8),
			optionsChirho.theme_chirho === 'digital'
				? paletteChirho.metalChirho
				: paletteChirho.knobChirho,
			[0, 0, optionsChirho.theme_chirho === 'digital' ? 28 : 26],
			rotorChirho
		);
		const ribsChirho: InstancePoseChirho[] = [];
		for (let indexChirho = 0; indexChirho < 40; indexChirho += 1) {
			const angleChirho = (indexChirho / 40) * Math.PI * 2;
			ribsChirho.push({
				position_chirho: [
					Math.sin(angleChirho) * radiusChirho * 0.94,
					Math.cos(angleChirho) * radiusChirho * 0.94,
					12
				],
				scale_chirho: [1.6, 2, 17],
				rotation_chirho: [0, 0, -angleChirho]
			});
		}
		repeatChirho(unitBoxChirho, paletteChirho.knobChirho, ribsChirho, rotorChirho);
		roundedChirho(
			3,
			radiusChirho * 0.35,
			1.5,
			0.6,
			paletteChirho.accentChirho,
			[0, radiusChirho * 0.61, optionsChirho.theme_chirho === 'digital' ? 29.2 : 27.1],
			rotorChirho
		);
		return rotorChirho;
	}
	const bookChirho = knobChirho(optionsChirho.book_chirho, 'book-rotor-chirho');
	const chapterChirho = knobChirho(optionsChirho.chapter_chirho, 'chapter-rotor-chirho');
	const [powerXChirho, powerYChirho] = centerChirho(optionsChirho.power_chirho);
	const powerRadiusChirho =
		Math.min(optionsChirho.power_chirho.width_chirho, optionsChirho.power_chirho.height_chirho) / 2;
	meshChirho(cylinderChirho(powerRadiusChirho + 4, 3), paletteChirho.rubberChirho, [
		powerXChirho,
		powerYChirho,
		1
	]);
	meshChirho(ringChirho(powerRadiusChirho, 2), paletteChirho.metalChirho, [
		powerXChirho,
		powerYChirho,
		4
	]);
	meshChirho(cylinderChirho(powerRadiusChirho - 3, 8), paletteChirho.knobChirho, [
		powerXChirho,
		powerYChirho,
		6
	]);
	meshChirho(ringChirho(powerRadiusChirho - 6, 1.1), paletteChirho.powerChirho, [
		powerXChirho,
		powerYChirho,
		10.2
	]);

	// Vents have a dark recess and projecting upper lip, instanced on both case sides.
	const ventsChirho: InstancePoseChirho[] = [];
	const louversChirho: InstancePoseChirho[] = [];
	for (const sideChirho of [-1, 1]) {
		for (let indexChirho = 0; indexChirho < 16; indexChirho += 1) {
			const yChirho = (indexChirho - 7.5) * 10;
			ventsChirho.push({
				position_chirho: [sideChirho * (widthChirho / 2 + 0.2), yChirho, -depthChirho * 0.49 - 8],
				scale_chirho: [1, 5, depthChirho * 0.44]
			});
			louversChirho.push({
				position_chirho: [sideChirho * (widthChirho / 2 + 1), yChirho + 3, -depthChirho * 0.49 - 8],
				scale_chirho: [2, 1, depthChirho * 0.46]
			});
		}
	}
	repeatChirho(unitBoxChirho, paletteChirho.cavityChirho, ventsChirho);
	repeatChirho(unitBoxChirho, paletteChirho.shellChirho, louversChirho);

	if (!cyberChirho && optionsChirho.theme_chirho !== 'digital') {
		// A carry handle is built as a U, leaving open air underneath its leather/rubber grip.
		const handleHalfChirho = widthChirho * (fieldChirho ? 0.29 : 0.25);
		const handleZChirho = -depthChirho * 0.48;
		for (const sideChirho of [-1, 1]) {
			roundedChirho(28, 8, 25, 3, paletteChirho.metalChirho, [
				sideChirho * handleHalfChirho,
				heightChirho / 2 + 1,
				handleZChirho
			]);
			roundedChirho(
				12,
				40,
				16,
				5,
				fieldChirho ? paletteChirho.shellChirho : paletteChirho.metalChirho,
				[sideChirho * handleHalfChirho, heightChirho / 2 + 19, handleZChirho]
			);
		}
		roundedChirho(
			handleHalfChirho * 2 + 12,
			15,
			17,
			6,
			fieldChirho ? paletteChirho.shellChirho : paletteChirho.metalChirho,
			[0, heightChirho / 2 + 39, handleZChirho]
		);
		roundedChirho(handleHalfChirho * 1.5, 18, 22, 7, paletteChirho.rubberChirho, [
			0,
			heightChirho / 2 + 38,
			handleZChirho
		]);
		const gripRibsChirho: InstancePoseChirho[] = [];
		for (let indexChirho = -7; indexChirho <= 7; indexChirho += 1) {
			gripRibsChirho.push({
				position_chirho: [
					(indexChirho * handleHalfChirho) / 12,
					heightChirho / 2 + 39,
					handleZChirho + 11.1
				],
				scale_chirho: [1, 10, 0.6]
			});
		}
		repeatChirho(unitBoxChirho, paletteChirho.knobChirho, gripRibsChirho);
	}

	for (const sideChirho of [-1, 1]) {
		for (const rearChirho of optionsChirho.theme_chirho === 'digital' ? [] : [false, true]) {
			roundedChirho(widthChirho * 0.13, 15, 23, 5, paletteChirho.rubberChirho, [
				sideChirho * widthChirho * 0.31,
				-heightChirho / 2 - 5,
				rearChirho ? -depthChirho + 14 : -23
			]);
		}
		if (fieldChirho || cyberChirho) {
			for (const verticalChirho of [-1, 1]) {
				roundedChirho(24, 65, depthChirho + 13, 10, paletteChirho.rubberChirho, [
					sideChirho * (widthChirho / 2 - 4),
					verticalChirho * (heightChirho / 2 - 36),
					-depthChirho / 2 - 5
				]);
				roundedChirho(
					4,
					35,
					3,
					1.3,
					fieldChirho ? paletteChirho.metalChirho : paletteChirho.secondaryChirho,
					[sideChirho * (widthChirho / 2 - 5), verticalChirho * (heightChirho / 2 - 36), 3]
				);
			}
		}
	}

	// Rear speaker grille and service door give the orbit a finished reverse side.
	const rearZChirho = -depthChirho - 11.6;
	roundedChirho(widthChirho * 0.72, heightChirho * 0.31, 2, 0.8, paletteChirho.cavityChirho, [
		0,
		heightChirho * 0.14,
		rearZChirho
	]);
	const rearBarsChirho: InstancePoseChirho[] = [];
	for (let indexChirho = 0; indexChirho < 23; indexChirho += 1) {
		rearBarsChirho.push({
			position_chirho: [
				0,
				heightChirho * 0.14 + (indexChirho - 11) * heightChirho * 0.013,
				rearZChirho - 2
			],
			scale_chirho: [widthChirho * 0.7, heightChirho * 0.006, 3]
		});
	}
	repeatChirho(unitBoxChirho, paletteChirho.shellChirho, rearBarsChirho);
	roundedChirho(widthChirho * 0.61, heightChirho * 0.17, 4, 1.8, paletteChirho.rubberChirho, [
		0,
		-heightChirho * 0.27,
		rearZChirho - 1
	]);
	roundedChirho(widthChirho * 0.59, heightChirho * 0.15, 4, 1.8, paletteChirho.shellChirho, [
		0,
		-heightChirho * 0.27,
		rearZChirho - 3
	]);
	roundedChirho(28, 5, 2, 0.8, paletteChirho.cavityChirho, [
		0,
		-heightChirho * 0.21,
		rearZChirho - 5.5
	]);
	for (const xChirho of [-widthChirho * 0.18, -widthChirho * 0.1]) {
		meshChirho(ringChirho(6, 2), paletteChirho.metalChirho, [
			xChirho,
			-heightChirho * 0.08,
			rearZChirho - 2
		]);
		meshChirho(cylinderChirho(4.5, 1), paletteChirho.cavityChirho, [
			xChirho,
			-heightChirho * 0.08,
			rearZChirho - 1.5
		]);
	}

	return {
		group_chirho: groupChirho,
		setStateChirho(stateChirho) {
			if (disposedChirho) return;
			bookChirho.rotation.z =
				(-(Number.isFinite(stateChirho.book_angle_chirho) ? stateChirho.book_angle_chirho : 0) *
					Math.PI) /
				180;
			chapterChirho.rotation.z =
				(-(Number.isFinite(stateChirho.chapter_angle_chirho)
					? stateChirho.chapter_angle_chirho
					: 0) *
					Math.PI) /
				180;
			paletteChirho.powerChirho.emissiveIntensity = stateChirho.powered_chirho ? 1.5 : 0.025;
			paletteChirho.screenChirho.emissiveIntensity = stateChirho.powered_chirho ? 0.36 : 0.12;
		},
		disposeChirho() {
			if (disposedChirho) return;
			disposedChirho = true;
			for (const instanceChirho of instancesChirho) instanceChirho.dispose();
			for (const ownedGeometryChirho of geometriesChirho.values()) ownedGeometryChirho.dispose();
			if (!sharedMaterialsChirho) paletteChirho.disposeChirho();
			groupChirho.clear();
			groupChirho.removeFromParent();
		}
	};
}
