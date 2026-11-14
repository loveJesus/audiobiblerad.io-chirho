<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

# Publish the web radio

The owner's "i think publish it" resumes the previously paused deployment to `audiobiblerad.io`. Scope is the existing SvelteKit web app, its configured Cloudflare account/Worker and this domain's necessary registrar/DNS connection. Preserve unrelated DNS, existing account resources and the original verified local output. Native/store, provider signup/key requests, outreach, paid-plan changes and unrelated domains remain outside scope.

Placement: keep the app's root Worker configuration; release helpers live in `scripts-chirho/release-chirho/` if reusable code is needed. Exact account/registrar responses, credentials-free preimages and rollback output stay in the ignored private release directory. Public evidence contains only this deployment's non-private receipt and verification.

- [x] Read the actual account/Worker/zone and registrar/DNS state; verify exact domain and account ownership, preserve preimages, and prepare the smallest routing change. The registrar holds only apex parking A and www CNAME records; public DS is absent. The exact project zone was created on the Free plan; no mail or unrelated records exist to migrate.
- [x] Preserve the old verified output, stop only the owned local preview if needed, add durable release configuration and run fresh appropriate gates with the external-first cache. Retained and read back 417 previous files (1,838,285 bytes); fresh build/check/lint, 195 unit/component and 21 browser tests pass. The package has 417 prepared files (1,838,281 bytes), 62 configured credential values absent, clean package scans and only the nine original WAVs.
- [ ] Inspect and scan the complete deploy package; commit the reviewable owned release inputs and scan/push source.
- [ ] Deploy the project Worker, connect this domain with readback after every external mutation, and observe zone/certificate readiness without duplicate creates.
- [ ] Verify HTTPS on the public domain, emitted asset identity, catalogue/credits, navigation and real browser playback. Retain any propagation or physical-device limits honestly.
- [ ] Update current status/workflows/progress, save one consolidated fleet report, commit/push the closing receipt and verify the final repository state.
