<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

# Web publication

```mermaid
flowchart TD
    authority_chirho[Owner authorises this domain's publication] --> preflight_chirho[Read exact account, Worker, registrar, DNS and DNSSEC]
    preflight_chirho --> preserve_chirho[Keep private DNS preimages and prior verified output locally]
    preserve_chirho --> gates_chirho[Fresh check, lint, unit and browser gates using isolated build cache]
    gates_chirho --> inspect_chirho[Dry-run deploy; inspect complete package, credits and credential absence]
    inspect_chirho --> source_chirho[Commit explicit release inputs; scan and push source]
    source_chirho --> deploy_chirho[Deploy only the configured project Worker and custom domains]
    deploy_chirho --> dns_chirho[Read back bindings; delegate only this domain to its Free zone]
    dns_chirho --> verify_chirho[Observe DNS and TLS; compare hosted assets and exercise real playback]
    verify_chirho --> record_chirho[Save bounded result, deployment version and remaining limits]
    record_chirho --> finish_chirho[Commit and scan/push the receipt; one coordinator reports]
```

`scripts-chirho/release-chirho/deploy_chirho.ts` packages locally by default. The explicit `--apply-chirho` flag deploys the current prepared output with the repository's Wrangler configuration. Only Cloudflare authentication and ordinary operating-system variables reach Wrangler; the explicit non-secret bindings file prevents automatic loading of the private provider environment there. Source scans and complete package inspection precede publication.

`verify_live_playback_chirho.ts --production-chirho --languages-chirho` accepts only HTTPS on `audiobiblerad.io`. Set `RADIO_PREVIEW_URL_CHIRHO=https://audiobiblerad.io/`. It exercises real upstream streams, records browser playback/progress and keeps no Scripture media. This is bounded browser evidence, not acoustic, spoken-content, full-library or physical-device validation.

Keep exact API preimages and the previous prepared directory in the ignored private release directory on the internal disk. Read back each external mutation. Reconcile an uncertain response before another mutation; never recreate a zone or replay an upload merely because its first response was delayed. Roll back a subsequent release to a retained verified Worker version and matching asset set. Registrar rollback uses the retained prior nameservers; it also requires propagation, so it is not an instant rollback.
