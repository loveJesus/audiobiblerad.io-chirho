<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

# External-first web build cache

Authority: owner root1461, relayed by AICEO DM 4458. Deployment remains paused after the owner's "actually one second". This unit is local cache adaptation only: no push, deployment, DNS, provider, release or spending action.

Placement: `scripts-chirho/build-cache-chirho/` owns the selector adapter and child-process lifecycle. Normal `build`, `dev` and `test:unit` commands pass through it. `vite.config.ts` consumes only the selected Vite cache directory. Framework-required `.svelte-kit` configuration, the tested worker output, local Wrangler state and credentials remain in their current locations. Existing cache bytes are not migrated or purged.

- [x] Inspect active consumers, existing outputs and the shared selector contract; verify real external selection.
- [x] Route Vite cache and compiler/test scratch through a per-invocation pinned, isolated selection; keep secret values out of child environment and external cache receipts.
- [x] Prove normal entry selection on the real mounted drive and simulated missing/read-only storage without disconnecting it; verify safe child failure if a selected cache disappears.
- [x] Run actual normal unit tests with external and local cache selections, preserving the existing worker output and preview. Do not replay the paused production build.
- [x] Run appropriate checks, save one adoption result with exact paths and limitations, commit owned paths locally, and report once through AICEO.

Observed scope before adaptation: Vite cache approximately 34 MB, `.svelte-kit` 5.8 MB and local `.wrangler` state 34 MB. The preview on 4173 consumes the existing tested worker. Only Vite caches and per-job scratch are eligible for the external cold switch; protected outputs and state stay local. No transfer above 1 GiB is proposed.

Outcome: seven synthetic controls pass. The normal build entry's selection probe chose real external storage and actual shared-selector LOCAL fallback when its mount check was simulated as missing/read-only or its external namespace write denied. The normal dev entry also chose external storage in probe mode. Actual normal focused unit runs passed the same two site tests on external and simulated-missing LOCAL storage. Check reports 0 errors and 0 warnings, lint and strict standalone adapter type checking pass. Production build/dev serving, full unit/browser suites and physical drive removal were not replayed.

All 420 prepared-worker and local dry-run files retained inventory hash `0a5ad4ca67d1445aec5211e2f5500ad39b51ec5f1c47a970156da49886f0da4f`; the old preview answered 200. Compiler cache inventories were approximately 19.2 MB on each backend and contained zero matches against 62 configured credential values. No cache bytes were migrated or purged. The initial synthetic control rejected a noncanonical temporary path correctly; the fixture was canonicalised and all seven controls then passed. A standalone TypeScript invocation first required the installed compiler's `--ignoreConfig` option, after which strict checking passed; no type diagnostic was suppressed.

The private adoption receipt retains exact account-local paths, raw normal-entry outputs and source commit without publishing private workspace details. Internal-space pressure was observed and is guarded by a 1 GiB admission/running-job floor; selected-cache admission additionally requires 512 MiB. Deployment, DNS and publication remain paused and untouched by this local-only unit.
