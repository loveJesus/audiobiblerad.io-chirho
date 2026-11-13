<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

# Audio Bible Radio: complete chapters across files

Previous consolidated report: `26-11-13_17-28-language_radio-chirho.md`. This is a substantive playback milestone after the numbering correction, not a release or deployment. The coordinator compiles and sends this report for the whole fleet.

## Working locally

The radio still offers 460 stations across 400 language tags. The catalogue seat corrected the 59 explicitly reviewed Joel numbering cases (`82f2faf`), added the compatible opt-in composite contract (`599fa1e`), measured 122 component files in two bounded browser batches (`f8954cf`, `cd70c01`), and emitted exactly 61 composite chapters (`96b87a1`). Source follow-up `7bbe3f8` describes the completed web player and remaining verification honestly. No library sweep or audio copy was made.

The coordinator's player in this landing uses one continuous chapter position across ordered files. It restores directly into a later part, seeks both ways, carries chapter fraction between stations, continues parts without tuning effects, and advances the chapter only after its final file. Pause, stale events, later-file failure and repeated retry preserve position. The screen offers the recovered chapters and counts them through the new helpers. An independent review identified an interruption on later VBR duration refinement; it was corrected and covered. A full browser run also caught a final pause-clock save race; the controller was fixed while retaining the exact offline-recovery assertion.

## Executed evidence

- The actual prior reader at `1948e93` and current reader/resolvers were executed across all 460 stations and 546,940 canonical positions. All 368,557 ordinary addresses, station metadata, legacy navigation, language flags and both ambiguous numbering exceptions remain exact. Only 61 opt-in chapters were added, with every emitted duration matched to the saved reading. Old readers retain ordinary stations and expose no component as a whole chapter.
- Final coordinator gates: check 0 errors and 0 warnings, lint clean, 195 unit tests in 20 files, 21 built-worker browser tests, local build and dry run clean. Two deliberate playback regressions made their tests fail, then source was restored. Earlier formatting and browser reds and their corrections are retained in the verification notes.
- The catalogue seat independently executed 51 focused player tests and reviewed the controller/timeline. That was before the coordinator's final single-file duration and pause-clock refinements; it is not represented as full browser or device acceptance.
- One real French Joel 2 was exercised through the built local worker, with a deliberate seek near the first file's end. Both source clocks advanced and automatic continuation reached the second file while retaining Joel 2. About 389 ms from tap to the first playing event, 58.5 ms from first-file ended to second-file playing. Both source addresses answered 206; no additional audio address was opened, and no audio was saved. This does not establish full-chapter or spoken-content correctness.
- Prepared output: 417 files, 1,838,285 bytes, 41,770 bytes above the language landing. The worker is 595,047 bytes, reported as 109.57 KiB gzipped. No Scripture audio is bundled; only the nine generated radio sounds. All 62 configured credential values had zero matches in the prepared and local dry-run output; package scanning is clean. Pre-landing full history scanning covered 23 commits without leaks; the landing is scanned separately.

Detailed evidence: `spec-chirho/evidence-chirho/composite-review-chirho/`. Workflow: `spec-chirho/workflows-chirho/tune_in_workflow_chirho.md`. Closing plan: `spec-chirho/tasklists-chirho/26-11-13_18-29-tasklist-composite_playback-chirho.md`. Progress database remains coordinator-only; source units retain producer attribution.

## Remaining work and boundaries

The web path is working locally. Physical iOS, Apple Watch and Android background, interruption and headset behavior remain unverified. Non-Chromium first-duration estimates, each complete composite chapter, and spoken content still need checking. All 349,663 ordinary Davar chapter addresses were matched to listed files, not individually opened; the initial 431 first-file probes and the bounded 122 component measurements do not imply a full availability sweep. The Joel classification remains an inference from filenames and the cited versification crosswalk; the two exceptions and wider Malachi content are still labelled.

The original owner choices remain open: software licence before first push, native versus wrapped apps, app identifier, and the Bible Brain key request. Voice preferences, draft translations and hosting copies of openly licensed recordings remain separate options, not blockers to the current web radio. Davar native use still requires the owner's provider conversation. No new provider, key, contact, spend, cloud resource, DNS, store, push or deployment action was taken.

Source lane is quiet; the coordinator closes the local landing. A single local preview reuses the tested worker. Disk availability was 18 GiB at the final web check; no native build was attempted and no unrelated cleanup occurred. The temporary 424 KB extraction used for prior-reader review is retired, with commit and evidence retained.
