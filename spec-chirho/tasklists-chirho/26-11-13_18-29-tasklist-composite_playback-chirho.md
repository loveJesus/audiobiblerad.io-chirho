<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

# Complete chapter playback across files

Source ownership stays with the catalogue seat. The coordinator owns the player, screen, language library, tests, this tasklist, its evidence and progress database. No new dependency is needed.

Placement decision: put the bounded part timeline and whole-chapter/file position conversion in `src/lib/player-chirho/chapter_track_chirho.ts`, beside `playback_position_chirho.ts`. Keep media request identity, pause intent, recovery and followed-place ownership in `radio_player_chirho.ts`. The screen uses the catalogue's offered-chapter helpers; the language library continues returning validated stations. Neither inspects source-specific filenames.

- [x] Review Batch A's six durations and provenance; authorize only the remaining 116 exact metadata attempts, sequential and paced, under the same timeout/unload/refusal rules (broker 34103).
- [x] Review Batch B, then authorize validated catalogue emission for at most the 61 agreed chapters. Preserve every legacy address, coverage entry and station field.
- [x] Compare the real old/new loaders and resolvers: only the 61 new opt-in chapters may be added; previous helpers remain identical and older readers retain every ordinary chapter.
- [x] Implement one whole-chapter timeline over the existing single Scripture audio element. Restore directly into the right part; transition only after a part ends, without tuning effects or chapter advance before the final part.
- [x] Prove seek both ways, resume in a later part, fraction carry, exactly-once continuation, pause and cancellation during transitions, metadata drift bounds, and saved-place preservation on later-part failure. Use generated audio fixtures, not a source-library sweep.
- [x] Expose the offered chapters and accurate chapter counts in the screen, update the workflow and evidence, run appropriate whole-tree gates and commit explicit owned paths.

For drift, measured part lengths define the logical timeline. Metadata for the active file must be finite and plausibly close to its recorded length before playback is committed; a substantial mismatch stops with retry rather than silently shifting every following boundary. The implementation must record and test its exact tolerance and mapping rule. Single-file timing behavior stays unchanged.

Batch B does not authorize data generation until its result is reviewed. After the contract review and Batch A, the coordinator starts player code against generated fixtures while the source seat measures Batch B. Real data remains gated by its own comparison. This plan changes no licence, hosting, source-copying, native, provider-contact, push or deployment boundary.

Completed against source data `96b87a1`, source docs `7bbe3f8`. Final gates: check 0 errors and 0 warnings, whole-tree lint clean, 195 unit tests in 20 files, 21 browser tests, successful local worker build and dry run. Full pre-landing history scan: 23 commits, no leaks. Prepared-output scan and all 62 configured credential comparisons: clean. Two deliberate regression mutations turned red and were restored. One initial browser pause/save race and formatting reds are retained with their fixes in `spec-chirho/evidence-chirho/composite-review-chirho/verification_notes_chirho.md`.

The live French Joel 2 check used only its two real source files, without saving audio: about 389 ms to first playing and 58.5 ms from first-file ended to second-file playing. This is browser-event evidence; complete chapters, spoken content, physical devices and background/headset behavior remain unverified. The temporary extracted prior catalogue is retired after review; its Git commit and execution evidence are retained.
