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

`verify_live_playback_chirho.ts --production-chirho --languages-chirho` accepts only HTTPS on `audiobiblerad.io`. Set `RADIO_PREVIEW_URL_CHIRHO=https://audiobiblerad.io/`. The alternative `--workers-dev-chirho` flag accepts only the project's exact Workers subdomain. The probe exercises real upstream streams, checks visible recording credits and source/licence links, records browser playback/progress and keeps no Scripture media. Same-origin tuning sounds are excluded from Scripture measurements on HTTPS as well as HTTP. This is bounded browser evidence, not acoustic, spoken-content, full-library or physical-device validation.

`scripts-chirho/release-chirho/verify_hosted_chirho.ts` first checks the home page's release identity, so a stale parking-DNS path stops before an asset sweep. It then compares every deployable prepared asset against the production HTTPS response, four requests at a time, and checks the catalogue's exact data/headers, recording credits and private-path rejection. `--workers-dev-chirho` selects only this project's configured Workers subdomain for an initial verification while registrar delegation propagates. Neither mode requests a Scripture host.

During a nameserver migration, old delegation caches may continue querying the former provider. Keep this domain's answers consistent while those caches expire. In the first publication, public certificate-validation TXT values were mirrored temporarily and retired after issuance; former parking A answers were aligned with verified authoritative Cloudflare edges, preserving the existing www CNAME. Cloudflare's managed DNS is canonical. Never use those copied edge addresses as permanent origin configuration, and read both providers' current state before any later DNS change.

Keep exact API preimages and the previous prepared directory in the ignored private release directory on the internal disk. Read back each external mutation. Reconcile an uncertain response before another mutation; never recreate a zone or replay an upload merely because its first response was delayed. Roll back a subsequent release to a retained verified Worker version and matching asset set. Registrar rollback uses the retained prior nameservers; it also requires propagation, so it is not an instant rollback.
