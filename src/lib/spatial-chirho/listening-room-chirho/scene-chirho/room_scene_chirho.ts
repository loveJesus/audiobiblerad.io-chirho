// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import * as ThreeChirho from 'three';
import { RoomControlsChirho } from '../controls-chirho/room_controls_chirho';
import type { RadioSessionChirho } from '$lib/radio-chirho/radio_session_chirho';
import type { RadioSessionViewChirho } from '$lib/radio-chirho/radio_types_chirho';
import { disposeSceneObjectsChirho } from './dispose_scene_chirho';
import { createLavaMotionChirho } from './lamp_motion_chirho';
import { GLTFLoader as LoaderChirho } from 'three/addons/loaders/GLTFLoader.js';
import { RoomOrbitChirho } from './room_orbit_chirho';
import { RoomEnvironment as EnvironmentChirho } from 'three/addons/environments/RoomEnvironment.js';

import { readBoundedBytesChirho } from '$lib/site-chirho/bounded_response_chirho';
import '../controls-chirho/controls_chirho.css';

export interface ListeningRoomSceneChirho {
	readonly controls_chirho: RoomControlsChirho;
	activateChirho(activeChirho: boolean): void;
	motionChirho(enabledChirho: boolean): void;
	disposeChirho(): void;
}
export interface ListeningRoomOptionsChirho {
	host_chirho: HTMLElement;
	session_chirho: RadioSessionChirho;
	view_chirho: RadioSessionViewChirho;
	automatic_chirho: boolean;
	motion_chirho: boolean;
	signal_chirho: AbortSignal;
	on_ready_chirho(): void;
	on_failure_chirho(): void;
	on_motion_chirho(enabledChirho: boolean): void;
}

/** Detailed-room view only; the existing experience owns Scripture, memory and system controls. */
export async function createListeningRoomChirho(
	optionsChirho: ListeningRoomOptionsChirho
): Promise<ListeningRoomSceneChirho> {
	optionsChirho.signal_chirho.throwIfAborted();
	const hostChirho = optionsChirho.host_chirho;
	const automaticChirho = optionsChirho.automatic_chirho;
	const rendererChirho = new ThreeChirho.WebGLRenderer({
		antialias: true,
		alpha: false,
		preserveDrawingBuffer: false
	});
	rendererChirho.setPixelRatio(Math.min(devicePixelRatio, 1.25));
	rendererChirho.outputColorSpace = ThreeChirho.SRGBColorSpace;
	rendererChirho.toneMapping = ThreeChirho.ACESFilmicToneMapping;
	rendererChirho.toneMappingExposure = 0.75;
	rendererChirho.shadowMap.enabled = false;
	rendererChirho.shadowMap.type = ThreeChirho.PCFSoftShadowMap;
	const sceneChirho = new ThreeChirho.Scene();
	let disposedChirho = false;
	let frameChirho = 0;
	let controlsChirho: RoomOrbitChirho | undefined;
	let radioControlsChirho: RoomControlsChirho | undefined;
	let lavaChirho: ReturnType<typeof createLavaMotionChirho> | undefined;
	let observerChirho: ResizeObserver | undefined;
	let intersectionChirho: IntersectionObserver | undefined;
	let reflectionChirho: ThreeChirho.WebGLRenderTarget | undefined;
	const retiredMaterialsChirho: ThreeChirho.Material[] = [];
	const reducedChirho = matchMedia('(prefers-reduced-motion: reduce)');
	let motionEnabledChirho = optionsChirho.motion_chirho;
	const reducedChangedChirho = () => {
		if (reducedChirho.matches) {
			motionEnabledChirho = false;
			optionsChirho.on_motion_chirho(false);
		}
	};
	const lostChirho = (eventChirho: Event) => {
		if (!disposedChirho) {
			eventChirho.preventDefault();
			optionsChirho.on_failure_chirho();
		}
	};
	const disposeChirho = () => {
		if (disposedChirho) return;
		disposedChirho = true;
		cancelAnimationFrame(frameChirho);
		observerChirho?.disconnect();
		intersectionChirho?.disconnect();
		radioControlsChirho?.disposeChirho();
		controlsChirho?.disposeChirho();
		lavaChirho?.disposeChirho();
		reducedChirho.removeEventListener('change', reducedChangedChirho);
		optionsChirho.signal_chirho.removeEventListener('abort', disposeChirho);
		rendererChirho.domElement.removeEventListener('webglcontextlost', lostChirho);
		disposeSceneObjectsChirho(sceneChirho, retiredMaterialsChirho);
		reflectionChirho?.dispose();
		rendererChirho.dispose();
		rendererChirho.forceContextLoss();
		rendererChirho.domElement.remove();
	};
	optionsChirho.signal_chirho.addEventListener('abort', disposeChirho, { once: true });
	try {
		sceneChirho.background = new ThreeChirho.Color('#15202a');
		const generatorChirho = new ThreeChirho.PMREMGenerator(rendererChirho);
		const environmentChirho = new EnvironmentChirho();
		try {
			reflectionChirho = generatorChirho.fromScene(environmentChirho, 0.06);
		} finally {
			environmentChirho.dispose();
			generatorChirho.dispose();
		}
		sceneChirho.environment = reflectionChirho.texture;
		sceneChirho.environmentIntensity = 0.22;
		const responseChirho = await fetch('/scenes-chirho/listening-room-chirho/room_chirho.glb', {
			signal: optionsChirho.signal_chirho,
			credentials: 'omit'
		});
		const bytesChirho = await readBoundedBytesChirho(responseChirho, 24 * 1024 * 1024);
		if (disposedChirho) throw new Error('Room model cancelled');
		const loadedChirho = await new LoaderChirho().parseAsync(
			bytesChirho.buffer,
			'/scenes-chirho/listening-room-chirho/'
		);
		if (disposedChirho || optionsChirho.signal_chirho.aborted) {
			disposeSceneObjectsChirho(loadedChirho.scene);
			throw new Error('Room model cancelled');
		}
		sceneChirho.add(loadedChirho.scene);
		// glTF punctual lighting needs a live-render exposure fit; preserve the source asset unchanged.
		loadedChirho.scene.traverse((objectChirho) => {
			if (objectChirho instanceof ThreeChirho.Light) objectChirho.intensity *= 0.005;
		});
		sceneChirho.add(new ThreeChirho.HemisphereLight('#c2d3ed', '#30221b', 0.4));
		loadedChirho.scene.traverse((objectChirho) => {
			if (
				objectChirho instanceof ThreeChirho.Mesh &&
				/window_glass_pane|lava_lamp_glass|cassette_plexiglass_window/.test(objectChirho.name)
			) {
				retiredMaterialsChirho.push(
					...(Array.isArray(objectChirho.material)
						? objectChirho.material
						: [objectChirho.material])
				);
				objectChirho.material = new ThreeChirho.MeshPhysicalMaterial({
					color: '#dae3e8',
					metalness: 0,
					roughness: 0.04,
					transparent: true,
					opacity: objectChirho.name.includes('lava')
						? 0.09
						: objectChirho.name.includes('cassette')
							? 0.035
							: 0.045,
					side: ThreeChirho.DoubleSide,
					depthWrite: false
				});
			}
		});
		const importedCameraChirho = loadedChirho.cameras.find(
			(entryChirho) => entryChirho instanceof ThreeChirho.PerspectiveCamera
		);
		const cameraChirho =
			importedCameraChirho instanceof ThreeChirho.PerspectiveCamera
				? importedCameraChirho
				: new ThreeChirho.PerspectiveCamera(40, 1, 0.1, 200);
		if (!importedCameraChirho) cameraChirho.position.set(3.8, 7, 17.4);
		controlsChirho = new RoomOrbitChirho(
			cameraChirho,
			new ThreeChirho.Vector3(-0.1, 3.85, -0.1),
			rendererChirho.domElement
		);
		let lastFrameChirho = 0;
		let renderedAtChirho = 0;
		let activeChirho = false;
		let intersectingChirho = true;
		let readyChirho = false;
		let warmupSecondsChirho = 0;
		const samplesChirho: number[] = [];
		lavaChirho = createLavaMotionChirho(sceneChirho, loadedChirho.scene);
		let motionSecondsChirho = 2;
		reducedChirho.addEventListener('change', reducedChangedChirho);
		const rainRootChirho = loadedChirho.scene.getObjectByName('window_rain_chirho');
		rainRootChirho?.traverse((objectChirho) => {
			if (objectChirho.name.includes('streak')) objectChirho.visible = false;
		});
		const rainGeometryChirho = new ThreeChirho.CylinderGeometry(0.004, 0.004, 0.17, 3);
		const rainMaterialChirho = new ThreeChirho.MeshBasicMaterial({
			color: '#b5d6e8',
			transparent: true,
			opacity: 0.42,
			depthWrite: false
		});
		const rainChirho = new ThreeChirho.InstancedMesh(rainGeometryChirho, rainMaterialChirho, 110);
		const rainDataChirho = Array.from({ length: 110 }, (unusedChirho, indexChirho) => ({
			xChirho: -4.8 + (((indexChirho * 73) % 109) / 109) * 11.1,
			yChirho: (((indexChirho * 47) % 109) / 109) * 6.3,
			speedChirho: 0.65 + (indexChirho % 7) * 0.13
		}));
		const transformChirho = new ThreeChirho.Object3D();
		sceneChirho.add(rainChirho);
		rendererChirho.domElement.className = 'listening-room-canvas-chirho';
		rendererChirho.domElement.style.opacity = '0';
		rendererChirho.domElement.style.pointerEvents = 'none';
		hostChirho.appendChild(rendererChirho.domElement);
		radioControlsChirho = new RoomControlsChirho(
			loadedChirho.scene,
			hostChirho,
			optionsChirho.session_chirho,
			optionsChirho.view_chirho
		);
		radioControlsChirho.projection_chirho.attachChirho(
			loadedChirho.scene,
			() => new ThreeChirho.Matrix4()
		);
		radioControlsChirho.projection_chirho.root_chirho.style.visibility = 'hidden';
		radioControlsChirho.projection_chirho.root_chirho.inert = true;
		const setActiveChirho = (nextChirho: boolean) => {
			activeChirho = nextChirho;
			rendererChirho.domElement.style.opacity = nextChirho ? '1' : '0';
			rendererChirho.domElement.style.pointerEvents = nextChirho ? 'auto' : 'none';
			radioControlsChirho!.projection_chirho.root_chirho.style.visibility = nextChirho
				? ''
				: 'hidden';
			radioControlsChirho!.projection_chirho.root_chirho.inert = !nextChirho;
			radioControlsChirho!.setActiveChirho(nextChirho);
			lastFrameChirho = 0;
		};
		const fallbackChirho = () => {
			disposeChirho();
			optionsChirho.on_failure_chirho();
		};
		rendererChirho.domElement.addEventListener('webglcontextlost', lostChirho);
		const resizeChirho = () => {
			if (disposedChirho) return;
			try {
				const boundsChirho = hostChirho.getBoundingClientRect();
				rendererChirho.setSize(boundsChirho.width, boundsChirho.height, false);
				cameraChirho.aspect = boundsChirho.width / Math.max(1, boundsChirho.height);
				cameraChirho.updateProjectionMatrix();
			} catch {
				fallbackChirho();
			}
		};
		observerChirho = new ResizeObserver(resizeChirho);
		observerChirho.observe(hostChirho);
		resizeChirho();
		if (disposedChirho) throw new Error('Room resize failed');
		if (typeof IntersectionObserver !== 'undefined') {
			intersectionChirho = new IntersectionObserver((entriesChirho) => {
				intersectingChirho = entriesChirho[0]?.isIntersecting ?? true;
			});
			intersectionChirho.observe(hostChirho);
		}
		const renderChirho = (timeChirho: number) => {
			if (disposedChirho) return;
			frameChirho = requestAnimationFrame(renderChirho);
			if (document.hidden || !intersectingChirho || (readyChirho && !activeChirho)) {
				lastFrameChirho = 0;
				return;
			}
			if (timeChirho - renderedAtChirho < 42) return;
			const elapsedChirho = lastFrameChirho ? (timeChirho - lastFrameChirho) / 1000 : 0;
			lastFrameChirho = timeChirho;
			renderedAtChirho = timeChirho;
			if (!readyChirho) warmupSecondsChirho += elapsedChirho;
			if (!readyChirho && warmupSecondsChirho > 5) {
				fallbackChirho();
				return;
			}
			try {
				if (automaticChirho && elapsedChirho > 0 && samplesChirho.length < 30) {
					samplesChirho.push(elapsedChirho);
					if (samplesChirho.length === 30) {
						const sortedChirho = [...samplesChirho].sort(
							(leftChirho, rightChirho) => leftChirho - rightChirho
						);
						if (
							sortedChirho[15] > 0.075 ||
							samplesChirho.filter((sampleChirho) => sampleChirho > 0.12).length >= 6
						) {
							fallbackChirho();
							return;
						}
					}
				}
				controlsChirho!.updateChirho(
					elapsedChirho,
					!reducedChirho.matches && !radioControlsChirho!.projection_chirho.editing_chirho
				);
				if (motionEnabledChirho) {
					motionSecondsChirho += Math.max(0, elapsedChirho);
					lavaChirho!.updateChirho(motionSecondsChirho);
				}

				rainDataChirho.forEach((dropChirho, indexChirho) => {
					const secondsChirho = motionSecondsChirho;
					transformChirho.position.set(
						dropChirho.xChirho,
						2.1 +
							((((dropChirho.yChirho - secondsChirho * dropChirho.speedChirho) % 6.3) + 6.3) % 6.3),
						-2.88
					);
					transformChirho.rotation.z = -0.06;
					transformChirho.updateMatrix();
					rainChirho.setMatrixAt(indexChirho, transformChirho.matrix);
				});
				rainChirho.instanceMatrix.needsUpdate = true;
				rendererChirho.render(sceneChirho, cameraChirho);
				radioControlsChirho!.projection_chirho.projectChirho(
					cameraChirho,
					hostChirho.clientWidth,
					hostChirho.clientHeight
				);
				if (!readyChirho && (!automaticChirho || samplesChirho.length === 30)) {
					readyChirho = true;
					optionsChirho.on_ready_chirho();
				}
			} catch {
				fallbackChirho();
			}
		};
		frameChirho = requestAnimationFrame(renderChirho);
		return {
			controls_chirho: radioControlsChirho,
			activateChirho: setActiveChirho,
			motionChirho(enabledChirho) {
				motionEnabledChirho = enabledChirho;
			},
			disposeChirho
		};
	} catch (errorChirho) {
		disposeChirho();
		throw errorChirho;
	}
}
