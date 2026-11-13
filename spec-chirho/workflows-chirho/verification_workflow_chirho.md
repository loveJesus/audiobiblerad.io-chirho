<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

# Local verification and landing

```mermaid
flowchart TD
    brief_chirho[Read project rules, owner brief, active checklist and Git state] --> scope_chirho[Agree paths and keep private inputs ignored]
    scope_chirho --> implement_chirho[Implement a real playable vertical]
    implement_chirho --> focus_chirho[Exercise changed playback and failure behavior]
    focus_chirho --> stable_chirho[Freeze the catalogue checkpoint for broad checks]
    stable_chirho --> check_chirho[Type and Svelte checks: zero errors and warnings]
    stable_chirho --> lint_chirho[Prettier and ESLint]
    stable_chirho --> unit_chirho[Unit and component behavior]
    stable_chirho --> browser_chirho[Build the worker and run browser decoder tests]
    browser_chirho --> routes_chirho[Verify catalogue HTTP headers and recording credits on the built worker]
    check_chirho --> proof_chirho[Combine scoped verification evidence]
    lint_chirho --> proof_chirho
    unit_chirho --> proof_chirho
    routes_chirho --> proof_chirho
    proof_chirho --> live_chirho[Optional bounded real-source stream probe, no audio saved]
    live_chirho --> inspect_chirho[Inspect shipped inventory, bytes, sound reproducibility and credential-value absence]
    inspect_chirho --> review_chirho[Review findings and rerun only affected checks]
    review_chirho --> record_chirho[Update public-safe tasklists, workflow notes and progress rows]
    record_chirho --> commit_chirho[Commit explicit owned paths locally]
    commit_chirho --> scan_chirho[Scan outgoing Git history with gitleaks]
    scan_chirho --> report_chirho[One coordinator reports the bounded fleet milestone]
    report_chirho --> release_chirho{Owner has chosen licence and authorized first publication?}
    release_chirho -- no --> local_chirho[Retain verified local source; nothing is published]
    release_chirho -- yes --> future_chirho[Separate source-publication step, then separate hosting and store gates]
```

`generate_worker_types_chirho.ts` gives each invocation a process-specific scratch configuration, so concurrent check and build processes cannot unlink each other's input. Two simultaneous `bun run gen:check` calls are part of its measured repair evidence. Generated binding types remain unchanged.

The player tests have been made to fail under deliberate violations of cancellation, reading-place continuity, recovery rollback and the recovery limit. The exact failures and restored source hash are recorded in the web evidence. The browser suite also covers a delayed JavaScript load, native pause-before-ended ordering, partial source coverage, a denied device store, and real decoder playback with original fixture bytes.

Language tests additionally cover lazy catalogue reads, size/time/cache bounds, merge behavior, stale language responses, dynamic station persistence, restore failure, explicit fallback and narrow-screen keyboard return. The language evidence retains three rendered refinement passes.

The optional live probe records four real upstream streams and checks that each media clock advances, that only Scripture remains active after loading, and that the media is unmuted. It measures navigation and gestures to the browser playing event. It does not establish acoustic latency, correct language perception, physical-device background behavior, store acceptance, a deployment or a release.

The build inventory includes the app, its small catalogue JSON shards and nine original short WAV effects. Source Scripture is streamed, never packaged. Compare configured credential values against the complete built payload without printing the values, then scan local commits before any publication. Private owner words, credentials and unsent outreach stay outside version control.
