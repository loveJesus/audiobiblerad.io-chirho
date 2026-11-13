<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

# Fleet milestone: language selection on the web radio

This follows [the local web landing report](26-11-13_16-50-web_landing-chirho.md). The catalogue seat landed the additive language contract and Davar data in `44e1b47`, then synchronized source documentation in `2198d56`. The coordinator's web integration accompanies this report.

The local web radio now offers **460 stations across 400 language tags**. Search accepts English and known native names; stations load one language at a time and the dial stays in that language. The original 29-station dial still opens immediately. Dynamic stations and their followed place survive reopening; failures preserve device memory, offer retry and allow built-in fallback. Required recording notices follow the selected station. No source audio is copied.

## Measured and reported

The coordinator directly measured zero type/Svelte errors or warnings, clean lint, **161 unit/component tests and 18 browser tests passing**, a successful production build and local-only Wrangler packaging. The browser suite checks first sound without language data, actual decoder playback, selection cancellation, repeated failed restore, interrupted restoration, explicit fallback, position continuity and narrow-screen keyboard use. Three rendered refinement passes are retained. The catalogue seat independently reviewed the integration; its three checked findings were corrected, with regression coverage for the failure paths.

Five real source streams were played by the integrated radio. Davar Hindi reached the browser playing event in 469.2 ms after selecting its recording and its clock advanced. The other observations and the tested artifact hash are recorded in `spec-chirho/evidence-chirho/language-radio-chirho/`. These are browser observations, not acoustic measurements or native-device evidence.

The catalogue seat reports 431 Davar stations in 389 languages with 349,722 addresses matched to publisher-listed filenames. It opened the first listed file of every station; it did not open every chapter. The screen and source record retain that distinction. The original built-in coverage remains measured chapter by chapter. Per-recording numbering, including fourth Joel chapters, remains in the catalogue lane.

Prepared files total 1,796,515 bytes, including 390 small catalogue files. The complete dry-run worker is 593,424 bytes (109.29 KiB gzipped). The package contains nine original sound effects and no Scripture audio. Credential-value comparisons and package leak scans were clean. No new dependencies or cloud resources were added.

## Ownership and next actions

The catalogue seat retains source data, measurement scripts and per-recording numbering work. The coordinator owns the picker, player, preferences, web routes, verification, progress database and fleet reporting. Progress row 8 records the source seat's reported 16:50–16:58 unit; row 7 records the web integration. The source code, tests and evidence are committed only by their owners.

Nothing is pushed or deployed. The existing owner decisions remain open: software licence and first publication, native versus wrapped packaging, permanent app identifier and the Bible Brain key request. No provider was contacted, no key requested, and DNS and stores remain untouched. Native use of Davar still requires clarification from its maker before relying on that host. There is no new owner decision in this milestone.
