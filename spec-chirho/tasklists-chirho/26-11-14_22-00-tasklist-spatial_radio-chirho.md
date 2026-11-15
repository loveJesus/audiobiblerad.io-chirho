<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

# Optional spatial radio, supplied effects and first tap

The owner asked for photorealistic radios with real depth, a camera that can orbit by dragging, an optional high-detail view alongside the present lightweight form, automatic selection when a device handles it, and a toggle on the radio. Keep iOS, Android and Watch in the architecture. He explicitly invited Claude/Claude2 to help. He also confirmed that the six supplied WAVs were purchased from Splice, expects tuning/click/knob feedback, and wants PRESS HERE much more noticeable.

The published checkpoint is `f69c789`, tagged and pushed as `published-radio-widget-2026-11-14-chirho`. This work builds on the same audio controller; changing presentation must preserve the exact media element, listening position and On/Off intent. No new production, provider or store action is inferred from the implementation work.

Placement and lanes: Root owns the scene renderer, control-surface integration, radio/session wiring, dependencies, build entry, tests, records and the progress DB. A GPT-6 Astra modeling helper owns only `src/lib/spatial-chirho/model-chirho/`. Claude owns sound preparation/runtime under `scripts-chirho/sounds-chirho/` and `src/lib/sounds-chirho/`, keeping all supplied recording bytes out of public Git. Claude2 owns pure view-selection/preferences helpers under `src/lib/spatial-chirho/capability-chirho/` and the supplied-effects licence note. Helpers do not write the DB, package files, existing radio components or each other's paths.

- [x] Commit/push and tag the current live radio/widget before new work.
- [x] Agree geometry/control and capability contracts; verify stable dependencies, source terms and current resource capacity.
- [x] Build genuine beveled receiver geometry, raised controls, lighting/materials and orbitable scenes, with three rendered refinement passes.
- [x] Project the existing native form controls onto the receiver, keep camera gestures separate, and retain lightweight keyboard/touch access.
- [x] Prefer 3D when actual rendering is smooth, honor manual choice and accessibility/data hints, and fall back safely on load/context/performance failure. Bound GPU work and dispose all scene resources.
- [x] Use the purchased Splice clips for tuning/click/knob roles as part of the app, excluding originals and reusable licensed clips from public source; retain an open-source fallback and accurate licence notices.
- [x] Make the On cue prominent and readable across all models and reduced-motion settings.
- [x] Verify playback continuity, real controls, orbit depth, automatic/manual/failure paths, phone layouts and native/watch separation; run appropriate broad gates and inspect the package.
- [ ] Commit and push the reviewable result and record the source landing.

Core scope is the web presentation and sound upgrade. The existing native packaging decision and platform builds remain distinct. Watch uses the lightweight control model; optional graphics cannot become an audio or availability dependency. Physical-device results must be attributed separately from browser emulation.

Verification: 276 unit/component tests, 43 Chromium browser tests, six focused WebKit tests and check 0/0 pass. Five actual upstream streams advanced while the optional 3D view was in use. The prepared asset inventory is 456 files / 3,846,715 bytes, including eleven licensed app cuts / 414,760 bytes; Wrangler dry-run passed with the licensed-set requirement. Whole-tree lint is clean. The explicit-path source landing and outgoing scan are the closing steps. A real lazy-iframe navigation race and preview storage interference were corrected; ten focused repeat cases pass. Evidence is in `spec-chirho/evidence-chirho/spatial-radio-chirho/`. No deployment or new message to the widget recipient is included.
