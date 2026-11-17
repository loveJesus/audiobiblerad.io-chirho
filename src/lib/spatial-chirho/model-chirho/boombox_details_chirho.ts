// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import {
	BoxGeometry as BoxGeometryChirho,
	BufferGeometry as BufferGeometryChirho,
	Float32BufferAttribute as Float32BufferAttributeChirho,
	LatheGeometry as LatheGeometryChirho,
	Vector2 as Vector2Chirho,
	type Material as MaterialChirho
} from 'three';
import type { ChassisKitChirho } from './radio_chassis_chirho';
import type { RadioMaterialsChirho } from './radio_materials_chirho';

type PositionChirho = readonly [number, number, number];
interface BarChirho {
	position_chirho: PositionChirho;
	size_chirho: PositionChirho;
	angle_chirho?: number;
}

/**
 * A single stereo receiver surrounding the live, unobstructed z=0 instrument panel.
 * All geometry belongs to the model kit; all materials belong to its shared palette.
 * See spec-chirho/workflows-chirho/experience-chirho/spatial_radio_workflow_chirho.md.
 */
export function buildBoomboxDetailsChirho(
	widthChirho: number,
	heightChirho: number,
	depthChirho: number,
	paletteChirho: RadioMaterialsChirho,
	kitChirho: ChassisKitChirho
): void {
	const { roundedChirho, meshChirho, geometryChirho, cylinderChirho, ringChirho } = kitChirho;
	const bayWidthChirho = Math.max(widthChirho * 0.55, heightChirho * 0.55);
	const fullWidthChirho = widthChirho + bayWidthChirho * 2 + 16;
	const deckHeightChirho = widthChirho * 0.31 + 24;
	const bottomChirho = -heightChirho / 2 - deckHeightChirho - 16;
	const topChirho = heightChirho / 2 + 12;
	const caseHeightChirho = topChirho - bottomChirho;
	const caseCenterChirho = (topChirho + bottomChirho) / 2;
	const silverBarsChirho: BarChirho[] = [];
	const darkBarsChirho: BarChirho[] = [];
	const grilleBarsChirho: BarChirho[] = [];
	const amberBarsChirho: BarChirho[] = [];
	const unitChirho = geometryChirho('boombox-unit-chirho', () => new BoxGeometryChirho(1, 1, 1));

	// Repeated fine detail is a single indexed mesh per finish, without disposable instance buffers.
	function barsChirho(
		keyChirho: string,
		valuesChirho: BarChirho[],
		materialChirho: MaterialChirho
	) {
		if (!valuesChirho.length) return;
		const batchedChirho = geometryChirho(`boombox-bars-chirho:${keyChirho}`, () => {
			const positionsChirho: number[] = [];
			const normalsChirho: number[] = [];
			const indicesChirho: number[] = [];
			const sourcePositionsChirho = unitChirho.getAttribute('position');
			const sourceNormalsChirho = unitChirho.getAttribute('normal');
			const sourceIndexChirho = unitChirho.getIndex()!;
			for (const barChirho of valuesChirho) {
				const offsetChirho = positionsChirho.length / 3;
				const cosChirho = Math.cos(barChirho.angle_chirho ?? 0);
				const sinChirho = Math.sin(barChirho.angle_chirho ?? 0);
				for (let vertexChirho = 0; vertexChirho < sourcePositionsChirho.count; vertexChirho++) {
					const xChirho = sourcePositionsChirho.getX(vertexChirho) * barChirho.size_chirho[0];
					const yChirho = sourcePositionsChirho.getY(vertexChirho) * barChirho.size_chirho[1];
					positionsChirho.push(
						xChirho * cosChirho - yChirho * sinChirho + barChirho.position_chirho[0],
						xChirho * sinChirho + yChirho * cosChirho + barChirho.position_chirho[1],
						sourcePositionsChirho.getZ(vertexChirho) * barChirho.size_chirho[2] +
							barChirho.position_chirho[2]
					);
					const nxChirho = sourceNormalsChirho.getX(vertexChirho);
					const nyChirho = sourceNormalsChirho.getY(vertexChirho);
					normalsChirho.push(
						nxChirho * cosChirho - nyChirho * sinChirho,
						nxChirho * sinChirho + nyChirho * cosChirho,
						sourceNormalsChirho.getZ(vertexChirho)
					);
				}
				for (let indexChirho = 0; indexChirho < sourceIndexChirho.count; indexChirho++)
					indicesChirho.push(sourceIndexChirho.getX(indexChirho) + offsetChirho);
			}
			const resultChirho = new BufferGeometryChirho();
			resultChirho.setAttribute('position', new Float32BufferAttributeChirho(positionsChirho, 3));
			resultChirho.setAttribute('normal', new Float32BufferAttributeChirho(normalsChirho, 3));
			resultChirho.setIndex(indicesChirho);
			return resultChirho;
		});
		meshChirho(batchedChirho, materialChirho, [0, 0, 0]);
	}

	function screwChirho(xChirho: number, yChirho: number, zChirho = 9): void {
		meshChirho(cylinderChirho(3.1, 1.8), paletteChirho.metalChirho, [xChirho, yChirho, zChirho]);
		for (const angleChirho of [0.35, Math.PI / 2 + 0.35])
			darkBarsChirho.push({
				position_chirho: [xChirho, yChirho, zChirho + 1],
				size_chirho: [4.3, 0.7, 0.25],
				angle_chirho: angleChirho
			});
	}

	// The dark molded body and continuous aluminum front rails join both speaker bays.
	roundedChirho(
		fullWidthChirho,
		caseHeightChirho,
		depthChirho + 18,
		12,
		paletteChirho.rubberChirho,
		[0, caseCenterChirho, -depthChirho / 2 - 10]
	);
	roundedChirho(fullWidthChirho - 5, caseHeightChirho - 6, 8, 3, paletteChirho.faceChirho, [
		0,
		caseCenterChirho,
		-7
	]);
	// The existing live panel remains forward of this shared face plate.
	for (const yChirho of [topChirho - 4, bottomChirho + 4]) {
		roundedChirho(fullWidthChirho - 12, 8, 12, 2, paletteChirho.metalChirho, [0, yChirho, -1]);
		darkBarsChirho.push({
			position_chirho: [0, yChirho + (yChirho > 0 ? -7 : 7), 0],
			size_chirho: [fullWidthChirho - 18, 2.1, 3]
		});
	}
	for (const sideChirho of [-1, 1]) {
		const xChirho = sideChirho * (widthChirho / 2 + bayWidthChirho / 2 + 5);
		roundedChirho(bayWidthChirho - 10, caseHeightChirho - 30, 7, 2, paletteChirho.faceChirho, [
			xChirho,
			caseCenterChirho,
			0
		]);
		darkBarsChirho.push({
			position_chirho: [sideChirho * (widthChirho / 2 + 5), caseCenterChirho, 3],
			size_chirho: [3, caseHeightChirho - 20, 2]
		});
		// Closely spaced molded side fins read as ribbed ABS from an orbit.
		for (let ribChirho = 0; ribChirho < 36; ribChirho++) {
			const yChirho = bottomChirho + 20 + (ribChirho / 35) * (caseHeightChirho - 40);
			darkBarsChirho.push({
				position_chirho: [sideChirho * (fullWidthChirho / 2 + 0.5), yChirho, -depthChirho * 0.53],
				size_chirho: [2, 2.6, depthChirho * 0.83]
			});
		}
		for (const verticalChirho of [-1, 1])
			screwChirho(
				xChirho + sideChirho * (bayWidthChirho / 2 - 20),
				verticalChirho === 1 ? topChirho - 20 : bottomChirho + 21,
				6
			);

		const wooferRadiusChirho = bayWidthChirho * 0.425;
		const wooferYChirho = bottomChirho + wooferRadiusChirho + 39;
		buildSpeakerChirho(xChirho, wooferYChirho, wooferRadiusChirho, false);
		const tweeterRadiusChirho = bayWidthChirho * 0.16;
		const tweeterYChirho = topChirho - tweeterRadiusChirho - 35;
		buildSpeakerChirho(xChirho, tweeterYChirho, tweeterRadiusChirho, true);
		buildMeterChirho(
			xChirho,
			(wooferYChirho + wooferRadiusChirho + tweeterYChirho - tweeterRadiusChirho) / 2,
			bayWidthChirho * 0.58
		);
	}

	function buildSpeakerChirho(
		xChirho: number,
		yChirho: number,
		radiusChirho: number,
		tweeterChirho: boolean
	): void {
		meshChirho(cylinderChirho(radiusChirho + 9, 7), paletteChirho.knobChirho, [
			xChirho,
			yChirho,
			6
		]);
		meshChirho(ringChirho(radiusChirho + 7, 2.3), paletteChirho.metalChirho, [
			xChirho,
			yChirho,
			10
		]);
		meshChirho(cylinderChirho(radiusChirho, 3), paletteChirho.cavityChirho, [xChirho, yChirho, 10]);
		const coneChirho = geometryChirho(`boombox-cone-chirho:${radiusChirho}`, () => {
			const profileChirho = [
				[0, 17],
				[0.13, 17],
				[0.2, 15],
				[0.28, 11],
				[0.32, 7],
				[0.68, 13],
				[0.79, 17],
				[0.84, 19],
				[0.89, 18],
				[0.93, 13],
				[0.98, 12]
			];
			const resultChirho = new LatheGeometryChirho(
				profileChirho
					.reverse()
					.map(([rChirho, zChirho]) => new Vector2Chirho(rChirho * radiusChirho, zChirho)),
				64
			);
			resultChirho.rotateX(Math.PI / 2);
			return resultChirho;
		});
		meshChirho(coneChirho, paletteChirho.rubberChirho, [xChirho, yChirho, 0]);
		for (const fractionChirho of [0.34, 0.52, 0.68, 0.9])
			meshChirho(
				ringChirho(radiusChirho * fractionChirho, tweeterChirho ? 0.6 : 1),
				paletteChirho.knobChirho,
				[xChirho, yChirho, 15]
			);
		meshChirho(cylinderChirho(radiusChirho * 0.22, 2.5), paletteChirho.knobChirho, [
			xChirho,
			yChirho,
			18
		]);
		meshChirho(ringChirho(radiusChirho * 0.965, 2.5), paletteChirho.knobChirho, [
			xChirho,
			yChirho,
			24
		]);
		// Real crossed wires leave openings through which the cone and its concentric ridges show.
		const countChirho = tweeterChirho ? 16 : 36;
		for (let wireChirho = -countChirho; wireChirho <= countChirho; wireChirho++) {
			const offsetChirho = (wireChirho / (countChirho + 1)) * radiusChirho * 0.95;
			const spanChirho = 2 * Math.sqrt((radiusChirho * 0.95) ** 2 - offsetChirho ** 2);
			grilleBarsChirho.push({
				position_chirho: [xChirho, yChirho + offsetChirho, 23],
				size_chirho: [spanChirho, tweeterChirho ? 0.65 : 0.95, 0.8]
			});
			grilleBarsChirho.push({
				position_chirho: [xChirho + offsetChirho, yChirho, 23.6],
				size_chirho: [tweeterChirho ? 0.65 : 0.95, spanChirho, 0.8]
			});
		}
		for (let screwIndexChirho = 0; screwIndexChirho < 4; screwIndexChirho++) {
			const angleChirho = Math.PI / 4 + (screwIndexChirho * Math.PI) / 2;
			screwChirho(
				xChirho + Math.cos(angleChirho) * (radiusChirho + 4),
				yChirho + Math.sin(angleChirho) * (radiusChirho + 4),
				13
			);
		}
	}

	function buildMeterChirho(xChirho: number, yChirho: number, meterWidthChirho: number): void {
		const meterHeightChirho = Math.min(49, heightChirho * 0.07);
		roundedChirho(meterWidthChirho + 10, meterHeightChirho + 9, 5, 2, paletteChirho.metalChirho, [
			xChirho,
			yChirho,
			6
		]);
		roundedChirho(meterWidthChirho + 4, meterHeightChirho + 3, 5, 1, paletteChirho.knobChirho, [
			xChirho,
			yChirho,
			8
		]);
		roundedChirho(meterWidthChirho, meterHeightChirho, 2, 0.5, paletteChirho.secondaryChirho, [
			xChirho,
			yChirho,
			10
		]);
		for (let markChirho = 0; markChirho < 17; markChirho++) {
			const dxChirho = (markChirho / 16 - 0.5) * meterWidthChirho * 0.88;
			darkBarsChirho.push({
				position_chirho: [xChirho + dxChirho, yChirho + meterHeightChirho * 0.23, 11.2],
				size_chirho: [0.9, markChirho % 4 === 0 ? 8 : 4, 0.25]
			});
		}
		const needleChirho = roundedChirho(
			1.1,
			meterHeightChirho * 0.71,
			0.8,
			0.3,
			paletteChirho.cavityChirho,
			[xChirho - meterWidthChirho * 0.08, yChirho - 1, 12]
		);
		needleChirho.rotation.z = xChirho < 0 ? -0.42 : 0.3;
		meshChirho(cylinderChirho(2.3, 1), paletteChirho.knobChirho, [
			xChirho,
			yChirho - meterHeightChirho * 0.35,
			12
		]);
		amberBarsChirho.push({
			position_chirho: [xChirho, yChirho - meterHeightChirho / 2 + 1.5, 12],
			size_chirho: [meterWidthChirho - 5, 1, 1]
		});
	}

	// Both cassettes sit entirely below the measured HTML panel, including transport keys.
	const cassetteYChirho = -heightChirho / 2 - deckHeightChirho * 0.42 - 7;
	for (const sideChirho of [-1, 1]) {
		const xChirho = sideChirho * widthChirho * 0.247;
		const cassetteWidthChirho = widthChirho * 0.455;
		const cassetteHeightChirho = deckHeightChirho * 0.64;
		roundedChirho(
			cassetteWidthChirho + 8,
			cassetteHeightChirho + 10,
			8,
			2,
			paletteChirho.knobChirho,
			[xChirho, cassetteYChirho, 1]
		);
		roundedChirho(cassetteWidthChirho, cassetteHeightChirho, 8, 2, paletteChirho.metalChirho, [
			xChirho,
			cassetteYChirho,
			5
		]);
		roundedChirho(
			cassetteWidthChirho - 11,
			cassetteHeightChirho - 14,
			2,
			1,
			paletteChirho.knobChirho,
			[xChirho, cassetteYChirho, 10]
		);
		const windowWidthChirho = cassetteWidthChirho * 0.82;
		const windowHeightChirho = cassetteHeightChirho * 0.57;
		roundedChirho(windowWidthChirho + 4, windowHeightChirho + 4, 2, 1, paletteChirho.metalChirho, [
			xChirho,
			cassetteYChirho + 4,
			11
		]);
		roundedChirho(windowWidthChirho, windowHeightChirho, 2, 1, paletteChirho.cavityChirho, [
			xChirho,
			cassetteYChirho + 4,
			12
		]);
		for (const reelSideChirho of [-1, 1]) {
			const reelXChirho = xChirho + reelSideChirho * cassetteWidthChirho * 0.23;
			const reelRadiusChirho = cassetteHeightChirho * 0.22;
			meshChirho(cylinderChirho(reelRadiusChirho, 1.5), paletteChirho.rubberChirho, [
				reelXChirho,
				cassetteYChirho + 5,
				13.4
			]);
			for (const fractionChirho of [0.69, 0.78, 0.88, 0.98])
				meshChirho(ringChirho(reelRadiusChirho * fractionChirho, 0.45), paletteChirho.shellChirho, [
					reelXChirho,
					cassetteYChirho + 5,
					14.5
				]);
			meshChirho(cylinderChirho(reelRadiusChirho * 0.49, 1.5), paletteChirho.metalChirho, [
				reelXChirho,
				cassetteYChirho + 5,
				14.5
			]);
			meshChirho(cylinderChirho(reelRadiusChirho * 0.25, 2), paletteChirho.cavityChirho, [
				reelXChirho,
				cassetteYChirho + 5,
				15.5
			]);
			for (let spokeChirho = 0; spokeChirho < 6; spokeChirho++) {
				const angleChirho = (spokeChirho * Math.PI) / 3;
				silverBarsChirho.push({
					position_chirho: [
						reelXChirho + Math.cos(angleChirho) * reelRadiusChirho * 0.29,
						cassetteYChirho + 5 + Math.sin(angleChirho) * reelRadiusChirho * 0.29,
						17
					],
					size_chirho: [reelRadiusChirho * 0.18, 1.4, 1],
					angle_chirho: angleChirho
				});
			}
		}
		silverBarsChirho.push({
			position_chirho: [xChirho, cassetteYChirho + windowHeightChirho / 2 + 3, 14],
			size_chirho: [windowWidthChirho - 5, 0.9, 0.6]
		});
		// Tape path, head bridge, bottom door hinge and raised eject tab.
		darkBarsChirho.push({
			position_chirho: [xChirho, cassetteYChirho - 13, 16],
			size_chirho: [windowWidthChirho * 0.75, 1.3, 1]
		});
		roundedChirho(cassetteWidthChirho * 0.18, 8, 2, 0.7, paletteChirho.metalChirho, [
			xChirho,
			cassetteYChirho - 16,
			16
		]);
		roundedChirho(cassetteWidthChirho * 0.58, 3, 4, 1, paletteChirho.metalChirho, [
			xChirho,
			cassetteYChirho - cassetteHeightChirho / 2 - 2,
			10
		]);
		roundedChirho(24, 5, 8, 1.2, paletteChirho.knobChirho, [
			xChirho + cassetteWidthChirho * 0.32,
			cassetteYChirho + cassetteHeightChirho / 2 - 4,
			15
		]);
		const keyYChirho = bottomChirho + 22;
		const keyWidthChirho = cassetteWidthChirho / 6 - 3;
		for (let keyChirho = 0; keyChirho < 6; keyChirho++) {
			const keyXChirho = xChirho + (keyChirho - 2.5) * (keyWidthChirho + 3);
			roundedChirho(keyWidthChirho + 2, 18, 6, 1, paletteChirho.cavityChirho, [
				keyXChirho,
				keyYChirho,
				6
			]);
			roundedChirho(
				keyWidthChirho,
				15,
				12,
				1.3,
				keyChirho === 0 ? paletteChirho.knobChirho : paletteChirho.metalChirho,
				[keyXChirho, keyYChirho + (keyChirho === 2 ? -2 : 0), 12]
			);
			if (keyChirho === 0)
				meshChirho(cylinderChirho(2, 0.6), paletteChirho.secondaryChirho, [
					keyXChirho,
					keyYChirho,
					18.5
				]);
			else if (keyChirho === 5)
				for (const pauseSideChirho of [-1, 1])
					darkBarsChirho.push({
						position_chirho: [keyXChirho + pauseSideChirho * 2, keyYChirho, 18.5],
						size_chirho: [1.4, 6, 0.7]
					});
			else
				darkBarsChirho.push({
					position_chirho: [keyXChirho, keyYChirho, 18.5],
					size_chirho: [keyChirho === 1 ? 5 : 2, 5, 0.7],
					angle_chirho: keyChirho > 1 ? Math.PI / 4 : 0
				});
		}
	}

	// Wide hinged handle: open air under the grip, chrome straps, ribbed rubber in the hand.
	const handleHalfChirho = fullWidthChirho * 0.34;
	const handleYChirho = topChirho + 54;
	const handleZChirho = -depthChirho * 0.52;
	for (const sideChirho of [-1, 1]) {
		roundedChirho(31, 12, 34, 3, paletteChirho.knobChirho, [
			sideChirho * handleHalfChirho,
			topChirho + 2,
			handleZChirho
		]);
		roundedChirho(14, 52, 17, 4, paletteChirho.metalChirho, [
			sideChirho * handleHalfChirho,
			topChirho + 28,
			handleZChirho
		]);
		meshChirho(cylinderChirho(6, 3), paletteChirho.metalChirho, [
			sideChirho * handleHalfChirho,
			topChirho + 9,
			handleZChirho + 19
		]);
	}
	roundedChirho(handleHalfChirho * 2 + 14, 17, 20, 5, paletteChirho.metalChirho, [
		0,
		handleYChirho,
		handleZChirho
	]);
	roundedChirho(handleHalfChirho * 1.12, 20, 25, 6, paletteChirho.rubberChirho, [
		0,
		handleYChirho,
		handleZChirho
	]);
	for (let ribChirho = -24; ribChirho <= 24; ribChirho++)
		darkBarsChirho.push({
			position_chirho: [(ribChirho * handleHalfChirho) / 45, handleYChirho, handleZChirho + 13],
			size_chirho: [1.1, 16, 1.1]
		});

	// An angled, correctly joined three-section telescopic antenna with collar and ball tip.
	const aerialXChirho = fullWidthChirho * 0.42;
	const aerialZChirho = -depthChirho * 0.79;
	meshChirho(cylinderChirho(9, 15), paletteChirho.knobChirho, [
		aerialXChirho,
		topChirho,
		aerialZChirho
	]);
	const aerialAngleChirho = -1.03;
	const aerialLengthChirho = widthChirho * 0.65;
	for (let sectionChirho = 0; sectionChirho < 3; sectionChirho++) {
		const distanceChirho = ((sectionChirho + 0.5) * aerialLengthChirho) / 3;
		const aerialChirho = meshChirho(
			cylinderChirho(3.1 - sectionChirho * 0.7, aerialLengthChirho / 3 + 3),
			paletteChirho.metalChirho,
			[
				aerialXChirho + Math.sin(aerialAngleChirho) * distanceChirho,
				topChirho + Math.cos(aerialAngleChirho) * distanceChirho,
				aerialZChirho
			]
		);
		aerialChirho.rotation.set(-Math.PI / 2, aerialAngleChirho, 0);
	}
	meshChirho(cylinderChirho(3, 4), paletteChirho.metalChirho, [
		aerialXChirho + Math.sin(aerialAngleChirho) * aerialLengthChirho,
		topChirho + Math.cos(aerialAngleChirho) * aerialLengthChirho,
		aerialZChirho
	]);

	// Four stable rubber feet define the contact plane for the furnished world's table.
	for (const sideChirho of [-1, 1])
		for (const rearChirho of [false, true])
			roundedChirho(bayWidthChirho * 0.47, 16, 32, 4, paletteChirho.rubberChirho, [
				sideChirho * fullWidthChirho * 0.36,
				bottomChirho - 7,
				rearChirho ? -depthChirho + 8 : -25
			]);
	barsChirho('silver-chirho', silverBarsChirho, paletteChirho.metalChirho);
	barsChirho('dark-chirho', darkBarsChirho, paletteChirho.knobChirho);
	barsChirho('grille-chirho', grilleBarsChirho, paletteChirho.knobChirho);
	barsChirho('amber-chirho', amberBarsChirho, paletteChirho.secondaryChirho);
}
