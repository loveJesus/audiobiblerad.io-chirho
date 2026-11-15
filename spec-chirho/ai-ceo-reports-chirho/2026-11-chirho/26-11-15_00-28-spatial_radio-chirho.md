<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

# Optional 3D radio and interface effects: source landing

Preceding report: [widget publication](../26-11-14_21-20-widget_publication-chirho.md). This is a source milestone, not a new hosted release.

## What landed

Source `b12f2398f88fd6671184e1b9cfb1ca8f6169584d` is pushed on `main_chirho`, with annotated tag `spatial-radio-ready-2026-11-15-chirho`. GitHub readback matches. The outgoing-history gitleaks scan is clean. The earlier published checkpoint remains `f69c789`, tagged `published-radio-widget-2026-11-14-chirho`.

The receiver has an optional real 3D case, raised rotating controls, lit materials and a camera that pivots by dragging. Its existing native controls and player stay mounted. The on-radio switch and stored choice select simple or 3D; automatic selection waits until Scripture starts and controls are idle, then judges actual rendered frames. Slow or unavailable graphics and context loss return to simple without replacing the media element. Vertical touch swipes and the wheel still scroll. Only the view choice is stored, with no device fingerprint.

The supplied Splice purchase was confirmed by the owner. Eleven short processed app effects are prepared locally and excluded from public Git; presses, knob steps and tuning are wired into the interface. A public clone has eleven deterministic CC0 sounds instead. The On cue is brighter, stationary and directly tappable. A browser-ended-event race between click and knob feedback was reproduced and fixed. The widget configurator now gives each URL its own lazy frame and uses bounded temporary preferences, preserving a real widget's saved state.

## Evidence and limits

- Producer check: 0 errors, 0 warnings; whole-tree lint clean; 276 unit/component tests in 32 files.
- Final complete built-worker Chromium run: 43 tests pass. The prepared build was reused instead of rebuilding for that final run. Two previously unstable configurator/locale cases also pass five consecutive runs each.
- Six focused desktop WebKit tests pass: actual orbit/native controls, real context loss, unavailable renderer, narrow-screen On, prepared effects and wheel scrolling. These precede the final preview-only correction; Chromium covers that correction.
- Five real upstream streams advance with 3D in use, without media interception or saved Scripture. First explicit On to Chromium's playing event was 235.5 ms in this one local-preview sample. That is not acoustic latency or physical-device proof.
- Three rendered refinement passes; all four models inspected at desktop and 390-pixel widths, plus the physical rear. The final capture set had no horizontal overflow or page errors.
- Prepared assets: 456 files, 3,846,715 bytes, including eleven purchased cuts totaling 414,760 bytes. Worker dry-run: 631.86 KiB, 120.41 KiB gzip. The licensed-set requirement passed. A local copy of the exact worker and every asset was hash-verified after copying; existing release and rollback packages are preserved.

Public verification and failure history: `spec-chirho/evidence-chirho/spatial-radio-chirho/`. Earlier failed gates are retained in the record, including the lazy-frame race that survived an initial green suite and the later timing/test-wait corrections. No claim of independent execution acceptance is made for the full feature. Claude2 performed a bounded source review and found the scrolling and interrupted-warm-up issues; root fixed and executed the relevant behavior tests.

## Ownership and next step

Root owns integration, scene lifetime, records and source landing; the GPT-6 Astra helper contributed geometry, Claude the sound runtime/preparer, and Claude2 capability/preferences and licence notices plus read-only review. All were landed by explicit path with attribution. Progress unit 27 is closed.

The existing public radio/widget release remains hosted. No new Worker deployment, DNS change, provider contact, spend, store/native resource or recipient message was performed for this source unit. The concrete web upgrade is ready for the owner's separate release go. Physical iOS/Android, lock-screen behavior and native Watch packaging remain separate work; Watch retains the lightweight control model.
