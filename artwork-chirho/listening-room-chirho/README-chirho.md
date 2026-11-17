<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

# Audio Bible Radio listening-room artwork

Editable procedural source for the silver-and-black cassette stereo and Christian listening room. Geometry, pen-stroke cassette lettering and thirteen embedded surface maps are generated locally by the Python sources. The two original input images supply the distant city and framed poster. No room-reference photograph, stock mesh, external texture download, purchased audio, font file, private receipt or redundant blend is included.

## Build

Validated authoring toolchain: Blender 5.2.2 LTS with bundled glTF exporter 5.2.40 and bundled NumPy. Other Blender versions may produce different geometry or fail the strict export comparison. The portable recipe was executed from the repository on 2026-11-17: export and support assertions passed, with all seven normalized light records and forty material/texture records matching the retained baseline. The reproduced model has the same 217,684 triangles, 539 meshes and 15 embedded images. Export byte identity is not promised.

From this directory, run the installed Blender executable in the background:

```sh
blender --background --factory-startup --threads 2 --python-exit-code 1 --python create_stereo_room_chirho.py -- --output-chirho ./output-chirho
```

`--output-chirho` is optional; its default is `output-chirho` beside the recipe. Relative explicit output paths resolve from the invoking directory. Inputs and helper resolve relative to `__file__`, independently of the working directory. Use a fresh output directory for retained work. The recipe saves a blend, exports the GLB and writes inventory/support/parity JSON plus generated PNGs in the selected output folder. It does not render, download assets or call a provider. Allocate a bounded local CPU2 slot with sufficient disk/memory; stop on any failed assertion.

`export_baseline_chirho.json` contains the normalized seven-light and forty-material records from the retained source candidate, with texture-content SHA256 references. Export temporarily uses Blender's EEVEE direct-energy path and then restores Cycles. Post-export verification requires exact baseline light/material equality; texture indices are resolved to image hashes and samplers. No warning suppression is used. The saved blend retains Cycles settings.

## Inputs and provenance

- `inputs-chirho/city_night_chirho.png`: original text-only Codex built-in image generation for this project; no third-party reference image. 1672×941. SHA256 `a02f607cd1458a60c4ef163a2226669f78bd02490104a0c753a23de0a8cc2c80`.
- `inputs-chirho/be_still_poster_chirho.png`: original text-only Codex built-in image generation for this project. Cream-paper landscape/cross poster with “BE STILL”, “and know that I am God” and “Psalm 46:10”; no artist branding. 1024×1536. SHA256 `b3cc02455dd554839fbd9bf63a1f0e4dbf927b2b97a2466b269c857a4ffc77f9`.

The managed image tool did not report an exact model identity. Embedded image provenance metadata is retained. “Songs of Praise” sleeve artwork, room decoration and the two handwritten cassette labels are procedural geometry; the latter use original hand-plotted centerlines. Other geometric lettering uses Blender's built-in font. No installed third-party font file is read or redistributed. These statements describe provenance, not a legal determination or additional licence grant.

## Generated asset and runtime

The verified source candidate contains 217,684 triangles, 539 meshes, 40 materials and 15 embedded images. Reproduction byte identity is not promised. Blender Z-up becomes glTF Y-up; radio front faces glTF +Z, tabletop is Y1.29 and floor Y−7. Runtime code owns live controls, camera constraints, rain and wax animation. The GLB alone contains no audio/session behavior or runtime animation. Punctual lights omit Blender emitter radius; source-radius extras remain available to the runtime.

The Python recipe/helper and two inputs are the preferred editable construction source. A generated blend is useful locally but redundant in the source package and may contain local path references; review generated artifacts before publication.
