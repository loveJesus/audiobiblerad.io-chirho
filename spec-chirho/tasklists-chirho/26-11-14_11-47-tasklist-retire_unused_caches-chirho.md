<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

# Retire unused internal web caches

Authority: owner root1464, relayed in AICEO DM4512. This project may retire at most 1 GiB of confirmed-unused internal cold caches now. No build, download, rendering, source/worktree move or public/runtime action is authorised by this unit.

- [x] Inspect Git/worktree state, internal device allocation and active consumers; identify exact disposable optimizer leaves.
- [x] At the declared quiet boundary, recheck no consumers, preserve pin/dependency receipts, and measure Data availability with one consistent probe immediately before deletion.
- [x] Cold-retire only old `node_modules/.vite` and this worktree's account-local fallback optimizer leaf; preserve namespace configuration and external warm cache.
- [x] Measure the same Data probe afterward, verify paths absent and retained pins/preview/dependencies intact, and save one exact result/proposal privately.
- [x] Close the progress unit, commit owned records locally and return one scoped actual result to AICEO. No push or deployment.

The regeneration basis is the committed Vite configuration, cache adapter and lockfile. The external cache has already passed the normal-entry checks. LOCAL fallback may rebuild cold when needed. `.svelte-kit`, all `.wrangler` state/tmp/package bytes, dependency installation, source/history, credentials, databases, original media and evidence are excluded. No larger safe scope is proposed; protected active/accepted outputs are not sacrificed to increase this project's small contribution.

Actual batch, 2026-11-14 16:49:41 UTC: cold-retired 55,517,184 allocated path bytes (about 53 MiB), all on internal Data device 16777231. The old worktree optimizer accounted for 35,827,712 bytes and the fallback optimizer leaf 19,689,472 bytes. `lsof` found no open consumers immediately before retirement. Both exact paths are now absent; the fallback namespace marker and external warm cache remain.

The same `os.statvfs` Data probe measured 6,242,762,752 bytes available immediately before and 6,298,509,312 immediately after, an observed increase of 55,746,560 bytes. This shared-volume change is not assigned exclusively to this batch. Allocation is the sum of `st_blocks * 512`, deduplicated by device/inode within the batch; snapshots/clones/links can share or delay actual reclaim.

All 420 retained prepared-worker/package files have the same inventory hash. Lockfile, build configuration, credentials and the serving Wrangler/esbuild/workerd dependency identities are unchanged. The active preview still returns 200. No build, download, render, process kill, offload, backup copy, push, deployment or DNS change occurred. Exact paths and before/after proofs are in the ignored private retirement result, supplied once to AICEO. No larger safe owned internal retirement scope was identified.
